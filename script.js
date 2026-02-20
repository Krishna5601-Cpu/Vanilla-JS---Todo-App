/************************************************
 * STATE
 ************************************************/

let todos = [];
let currentFilter = "all";

/************************************************
 * DOM ELEMENTS
 ************************************************/

const todoTitle = document.querySelector("#titleInput");
const todoDescript = document.querySelector("#descInput");
const todoDate = document.querySelector("#dateInput");
const addButton = document.querySelector("#addBtn");
const todoListContainer = document.querySelector("#todoList");
const filterSelect = document.querySelector("#filterSelect");
const themeToggle = document.querySelector("#themeToggle");

/************************************************
 * STORAGE (localStorage)
 ************************************************/

function loadTodos() {
  const storedTodos = localStorage.getItem("todos");

  if (storedTodos) {
    todos = JSON.parse(storedTodos);
  }
}

function saveTodos() {
  localStorage.setItem("todos", JSON.stringify(todos));
}

/************************************************
 * HELPERS
 ************************************************/

function updateUI() {
  saveTodos();
  renderTodos();
}

function generateId() {
  return "todo_" + Math.random().toString(36).slice(2, 9);
}

/************************************************
 * CORE LOGIC
 ************************************************/

// ADD TODO
function addTodo() {
  const title = todoTitle.value.trim();
  const description = todoDescript.value.trim();
  const dueDate = todoDate.value;

  if (!title) {
    alert("Title is required");
    return;
  }

  const newTodo = {
    id: generateId(),
    title,
    description,
    completed: false,
    dueDate,
  };

  todos.push(newTodo);

  todoTitle.value = "";
  todoDescript.value = "";
  todoDate.value = "";

  updateUI();

  
  setTimeout(() => {
    const lastTodo = todoListContainer.lastElementChild;

    if (lastTodo) {
      lastTodo.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, 50);

  // focus back to input
  todoTitle.focus();
}

// RENDER TODOS
function renderTodos() {
  todoListContainer.innerHTML = "";

  let filteredTodos = todos;

  if (currentFilter === "completed") {
    filteredTodos = todos.filter((todo) => todo.completed);
  }

  if (currentFilter === "pending") {
    filteredTodos = todos.filter((todo) => !todo.completed);
  }

  if (filteredTodos.length === 0) {
    todoListContainer.innerHTML = `<p class="empty-state">📝 No tasks yet — add your first todo!</p>`;
    return;
  }

  filteredTodos.forEach((todo) => {
    const li = document.createElement("li");
    li.className = "todo-item";

    const card = document.createElement("div");
    card.className = "todo-card";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.completed;
    checkbox.className = "toggle-checkbox";
    checkbox.dataset.id = todo.id;

    const title = document.createElement("h3");
    title.textContent = todo.title;

    if (todo.completed) {
      card.classList.add("completed");
    }

    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.className = "delete-btn";
    delBtn.dataset.id = todo.id;

    card.append(checkbox, title, delBtn);
    li.appendChild(card);
    todoListContainer.appendChild(li);
  });
}

/************************************************
 * EVENT LISTENERS
 ************************************************/

// Filter dropdown
filterSelect.addEventListener("change", (e) => {
  currentFilter = e.target.value;
  renderTodos();
});

// Event delegation (delete + toggle)
todoListContainer.addEventListener("click", (e) => {
  // DELETE
  if (e.target.classList.contains("delete-btn")) {
    const id = e.target.dataset.id;

    todos = todos.filter((todo) => todo.id !== id);

    updateUI();
  }

  // TOGGLE COMPLETE
  if (e.target.classList.contains("toggle-checkbox")) {
    const id = e.target.dataset.id;

    todos = todos.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo,
    );

    updateUI();
  }
});

// Add button
addButton.addEventListener("click", addTodo);

/************************************************
 * THEME TOGGLE
 ************************************************/

function loadTheme() {
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "dark") {
    document.body.classList.add("dark");
    themeToggle.textContent = "☀️ Light Mode";
  }
}

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");

  const isDark = document.body.classList.contains("dark");

  localStorage.setItem("theme", isDark ? "dark" : "light");

  themeToggle.textContent = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";
});

todoTitle.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    addTodo();
  }
});

/************************************************
 * APP INITIALIZATION
 ************************************************/
loadTodos();
loadTheme();
renderTodos();
