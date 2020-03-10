"use strict";

const Route = use("Route");

// Users
Route.post("/register", "UserController.create");
Route.get("/login", "SessionController.create");
// follow
Route.post("/follow/new", "UserController.newFollow").middleware("auth");
Route.get("/profile", "UserController.show").middleware("auth");

// Posts
Route.get("/posts", "PostController.index");
Route.get("/post", "PostController.show").middleware("auth");
Route.post("/posts/new", "PostController.store")
  .middleware("auth")
  .validator("StorePost");
Route.put("/posts/update/:id", "PostController.update")
  .middleware("auth")
  .validator("StorePost");
Route.delete("/posts/delete/:id", "PostController.destroy").middleware("auth");

// Post Pics
Route.post("/post_pics/add/:id", "PostPictureController.store").middleware(
  "auth"
);
Route.delete(
  "post_pics/delete/:post_id/:pic_id",
  "PostPictureController.destroy"
).middleware("auth");
