const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find((user) => user.username === username);
  if (!user) {
    return response.status(404).json({
      error: "User not found",
    });
  }
  request.user = user;
  return next();
}

function checkIfUsernameAlreadyExists(username) {
  const usernameExists = users.some((user) => user.username === username);
  return usernameExists;
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;
  const usernameExists = checkIfUsernameAlreadyExists(username);
  if (usernameExists) {
    return response.status(400).send({
      error: "Username already exists",
    });
  }
  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };
  users.push(user);
  return response.json(user).status(201);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const user = request.user;
  response.json(user.todos).status(200);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const user = request.user;
  const { title, deadline } = request.body;
  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };
  user.todos.push(todo);
  return response.status(201).json(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const user = request.user;
  const { title, deadline } = request.body;
  const id = request.params.id;
  const todo = user.todos.find((todo) => todo.id === id);
  if (!todo) {
    response.status(404).json({
      error: "Todo not found",
    });
  }
  todo.title = title;
  todo.deadline = new Date(deadline);
  return response.json(todo).status(200);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const id = request.params.id;
  const user = request.user;
  const todo = user.todos.find((todo) => todo.id === id);
  if (!todo) {
    response.status(404).json({
      error: "Todo not found",
    });
  }
  todo.done = true;
  return response.json(todo).status(200);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const id = request.params.id;
  const user = request.user;
  const todoIndex = user.todos.findIndex((todo) => todo.id === id);
  if (todoIndex === -1) {
    response.status(404).json({
      error: "Todo not found",
    });
  }
  user.todos.splice(todoIndex, 1);
  return response.status(204).send();
});

module.exports = app;
