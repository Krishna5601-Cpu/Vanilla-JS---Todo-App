// Simple "namespace" to avoid global mess
(function () {
  const STORAGE_KEY = "todo-fire-list-v1";

  /** @type {Array<{id:string,text:string,dueDate:string|null,completed:boolean,createdAt:number}>} */
  let todos = [];
  let currentFilter = "all"; // 'all' | 'active' | 'completed'
  let currentSort = "created_desc";

  // DOM refs
  const form = document.getElementById("todo-form");
  const inputText = document.getElementById("todo-text");
  const inputDate = document.getElementById("todo-date");
  const listEl = document.getElementById("todo-list");
  const counterEl = document.getElementById("task-counter");
  const filterButtons = document.querySelectorAll(".chip[data-filter]");
  const sortSelect = document.getElementById("sort-select");

  // ---------- Local Storage ----------

  function loadTodos() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        todos = [];
        return;
      }
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        todos = parsed;
      } else {
        todos = [];
      }
    } catch (err) {
      console.error("Failed to load todos:", err);
      todos = [];
    }
  }

  function saveTodos() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch (err) {
      console.error("Failed to save todos:", err);
    }
  }

  // ---------- Helpers ----------

  function createId() {
    return Date.now().toString(36) + Math.random().toString(16).slice(2);
  }

  function formatDateDisplay(isoDateString) {
    if (!isoDateString) return "No due date";
    // isoDateString is 'YYYY-MM-DD'
    const [year, month, day] = isoDateString.split("-");
    if (!year || !month || !day) return "No due date";
    return `${day}/${month}/${year}`;
  }

  function updateCounter() {
    const total = todos.length;
    const active = todos.filter((t) => !t.completed).length;
    if (total === 0) {
      counterEl.textContent = "No tasks yet";
    } else if (active === 0) {
      counterEl.textContent = `${total} tasks · all done 🎉`;
    } else {
      counterEl.textContent = `${active} active · ${total} total`;
    }
  }

  function getFilteredAndSortedTodos() {
    let filtered = todos;

    if (currentFilter === "active") {
      filtered = todos.filter((t) => !t.completed);
    } else if (currentFilter === "completed") {
      filtered = todos.filter((t) => t.completed);
    }

    const sorted = [...filtered];

    sorted.sort((a, b) => {
      switch (currentSort) {
        case "created_asc":
          return a.createdAt - b.createdAt;
        case "created_desc":
          return b.createdAt - a.createdAt;
        case "date_asc": {
          const da = a.dueDate || "";
          const db = b.dueDate || "";
          if (!da && !db) return 0;
          if (!da) return 1; // tasks without date go last
          if (!db) return -1;
          return da.localeCompare(db);
        }
        case "date_desc": {
          const da = a.dueDate || "";
          const db = b.dueDate || "";
          if (!da && !db) return 0;
          if (!da) return 1;
          if (!db) return -1;
          return db.localeCompare(da);
        }
        default:
          return 0;
      }
    });

    return sorted;
  }

  // ---------- Rendering ----------

  function renderTodos() {
    const items = getFilteredAndSortedTodos();

    listEl.innerHTML = "";

    if (items.length === 0) {
      const emptyDiv = document.createElement("div");
      emptyDiv.className = "empty-state";
      emptyDiv.textContent =
        "No tasks here yet. Add something and crush it. 💪";
      listEl.appendChild(emptyDiv);
      updateCounter();
      return;
    }

    const fragment = document.createDocumentFragment();

    items.forEach((todo) => {
      const li = document.createElement("li");
      li.className = "todo-item";
      li.dataset.id = todo.id;

      // Checkbox
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "todo-checkbox";
      checkbox.checked = todo.completed;
      checkbox.setAttribute("aria-label", "Toggle task completion");

      // Main info
      const main = document.createElement("div");
      main.className = "todo-main";

      const textSpan = document.createElement("span");
      textSpan.className = "todo-text" + (todo.completed ? " completed" : "");
      textSpan.textContent = todo.text;

      const metaDiv = document.createElement("div");
      metaDiv.className = "todo-meta";

      const dueSpan = document.createElement("span");
      dueSpan.className = "meta-badge";
      dueSpan.textContent = formatDateDisplay(todo.dueDate);

      const createdSpan = document.createElement("span");
      createdSpan.textContent =
        "Added " + new Date(todo.createdAt).toLocaleString();

      metaDiv.appendChild(dueSpan);
      metaDiv.appendChild(createdSpan);

      main.appendChild(textSpan);
      main.appendChild(metaDiv);

      // Delete button
      const delBtn = document.createElement("button");
      delBtn.className = "btn btn-danger";
      delBtn.type = "button";
      delBtn.textContent = "Delete";

      li.appendChild(checkbox);
      li.appendChild(main);
      li.appendChild(delBtn);

      fragment.appendChild(li);
    });

    listEl.appendChild(fragment);
    updateCounter();
  }

  // ---------- Event Handlers ----------

  function handleFormSubmit(event) {
    event.preventDefault();
    const text = inputText.value.trim();
    const date = inputDate.value ? inputDate.value : null;

    if (!text) return;

    const todo = {
      id: createId(),
      text,
      dueDate: date,
      completed: false,
      createdAt: Date.now(),
    };

    todos.push(todo);
    saveTodos();

    // Reset inputs
    inputText.value = "";
    // keep last chosen date OR clear? Let's keep as-is, feels practical.
    // inputDate.value = "";

    renderTodos();
    inputText.focus();
  }

  function handleListClick(event) {
    const target = event.target;
    const li = target.closest(".todo-item");
    if (!li) return;

    const id = li.dataset.id;
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;

    if (target.classList.contains("todo-checkbox")) {
      todo.completed = target.checked;
      saveTodos();
      renderTodos();
    } else if (target.classList.contains("btn-danger")) {
      const index = todos.findIndex((t) => t.id === id);
      if (index !== -1) {
        todos.splice(index, 1);
        saveTodos();
        renderTodos();
      }
    }
  }

  function handleFilterClick(event) {
    const btn = event.target.closest(".chip[data-filter]");
    if (!btn) return;
    const filter = btn.dataset.filter;
    if (!filter || filter === currentFilter) return;

    currentFilter = filter;

    filterButtons.forEach((b) => b.classList.remove("chip-active"));
    btn.classList.add("chip-active");

    renderTodos();
  }

  function handleSortChange() {
    currentSort = sortSelect.value;
    renderTodos();
  }

  // ---------- Init ----------

  function init() {
    loadTodos();
    renderTodos();

    form.addEventListener("submit", handleFormSubmit);
    listEl.addEventListener("click", handleListClick);
    filterButtons.forEach((btn) =>
      btn.addEventListener("click", handleFilterClick),
    );
    sortSelect.addEventListener("change", handleSortChange);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
