"use strict";

const Post = use("App/Models/Post");

const { resolve } = require("path");
const Database = use("Database");

class PostController {
  async index() {
    try {
      const posts = await Database.select(
        "posts.id",
        "posts.content",
        "users.first_name",
        "users.last_name",
        "posts.created_at",
        "images.pic_name"
      )
        .from("posts as posts")
        .innerJoin("users as users", "posts.author", "users.id")
        .innerJoin("post_pictures as images", "posts.id", "images.post_id");

      return posts;
    } catch {
      response.internalServerError("Erro ao executar operação");
    }
  }

  async store({ request, auth }) {
    try {
      const { id } = auth.user;

      const data = request.only(["content"]);

      const post = await Post.create({ ...data, user_id: id });

      if (request.file.image) {
        // Upload imagens
        const postId = await Post.findOrFail(post.id);
        const images = request.file("image", {
          types: ["image"],
          size: "2mb"
        });

        await images.moveAll(resolve("./public/uploads"), file => ({
          name: `${Date.now()}-${file.clientName}`
        }));

        if (!images.movedAll()) {
          return images.errors();
        }
        await Promise.all(
          images
            .movedList()
            .map(image => postId.images().create({ pic_name: image.fileName }))
        );
      }

      return post;
    } catch {
      response.internalServerError("Erro ao executar operação");
    }
  }

  async show({ params }) {
    try {
      const { id } = params;
      const post = await Database.select(
        "posts.id",
        "posts.content",
        "users.first_name",
        "users.last_name",
        "posts.created_at",
        "images.pic_name"
      )
        .from("posts as posts")
        .innerJoin("users as users", "posts.author", "users.id")
        .innerJoin("post_pictures as images", "posts.id", "images.post_id")
        .where("id", id);

      return post;
    } catch {
      response.internalServerError("Erro ao executar operação");
    }
  }

  async update({ params, request, auth }) {
    const { id } = params;
    const data = request.only(["content"]);

    const post = await Post.findOrFail(id);

    post.merge(data);
    await post.save();

    return post;
  }

  async destroy({ params, response, auth }) {
    try {
      const { id } = params;
      const post = await Post.findOrFail(id);

      if (post.user_id !== auth.user.id) {
        return response
          .status(403)
          .send("Você não pode excluir o post de outra pessoa");
      }

      await post.delete();
      response.send("Post excluido com sucesso");
    } catch (err) {
      response.internalServerError("Erro ao executar operação");
    }
  }
}

module.exports = PostController;
