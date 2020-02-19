"use strict";

const Route = use("Route");

// Users
Route.post("/register", "UserController.create");
Route.get("/login", "SessionController.create");

// Posts
Route.get("/posts", "PostController.index").middleware("auth");
Route.get("/posts/:id", "PostController.show").middleware("auth");
Route.post("/posts/new", "PostController.store").middleware("auth");
Route.delete("/posts/delete/:id", "PostController.destroy").middleware("auth");
