// ===== STATE =====
let todos = [];

// ===== DOM ELEMENTS =====
const todoTitle = document.querySelector("#titleInput");
const todoDescript = document.querySelector("#descInput");
const todoDate = document.querySelector("#dateInput");
const addButton = document.querySelector("#addBtn");
const todoListContainer = document.querySelector("#todoList");

// ===== ID GENERATOR =====
function generateId() {
  return "todo_" + Math.random().toString(36).slice(2, 9);
}

// ===== ADD TODO =====
function addTodo() {
  const title = todoTitle.value.trim();
  const description = todoDescript.value.trim();
  const dueDate = todoDate.value;

  if (!title) {
    alert("Todo title is required");
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

  renderTodos();
}

// ===== RENDER TODOS =====
function renderTodos() {
  todoListContainer.innerHTML = "";

  todos.forEach((todo) => {
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
      title.style.textDecoration = "line-through";
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

// ===== EVENT DELEGATION =====
todoListContainer.addEventListener("click", (e) => {
  // DELETE TODO
  if (e.target.classList.contains("delete-btn")) {
    const id = e.target.dataset.id;
    todos = todos.filter((todo) => todo.id !== id);
    renderTodos();
  }

  // TOGGLE COMPLETE
  if (e.target.classList.contains("toggle-checkbox")) {
    const id = e.target.dataset.id;

    todos = todos.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo,
    );

    renderTodos();
  }
});

// ===== BUTTON LISTENER =====
addButton.addEventListener("click", addTodo);
