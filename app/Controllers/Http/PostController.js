"use strict";

const Post = use("App/Models/Post");

const { resolve } = require("path");
const Database = use("Database");

class PostController {
  async index({ response }) {
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
        .leftJoin("users as users", "posts.user_id", "users.id")
        .leftJoin("post_pictures as images", "posts.id", "images.post_id");

      return posts;
    } catch {
      response.internalServerError("Erro ao executar operação");
    }
  }

  async store({ request, response, auth }) {
    const { id } = auth.user;

    const data = request.only(["content"]);

    const post = await Post.create({ ...data, user_id: id });

    // Upload imagens
    const postId = await Post.findOrFail(post.id);
    const image = request.file("imagem", {
      types: ["image"],
      size: "2mb"
    });
    try {
      if (image.move) {
        await image.move(resolve("./public/uploads"), {
          name: `${Date.now()}-${image.clientName}`
        });

        if (!image.moved()) {
          return image.errors();
        }
        await postId.images().create({ pic_name: image.fileName });
      } else {
        await image.moveAll(resolve("./public/uploads"), file => ({
          name: `${Date.now()}-${file.clientName}`
        }));

        if (!image.movedAll()) {
          return image.errors();
        }

        await Promise.all(
          image
            .movedList()
            .map(img => postId.images().create({ pic_name: img.fileName }))
        );
      }

      return post;
    } catch {
      response.internalServerError("Erro ao executar operação");
    }
  }

  async show({ params, response }) {
    const { id } = params;
    try {
      const post = await Database.select(
        "posts.id",
        "posts.content",
        "users.first_name",
        "users.last_name",
        "posts.created_at",
        "images.pic_name"
      )
        .from("posts as posts")
        .leftJoin("users as users", "posts.user_id", "users.id")
        .leftJoin("post_pictures as images", "posts.id", "images.post_id")
        .where("posts.id", id);

      return post;
    } catch (err) {
      response.internalServerError("Erro ao executar operação");
    }
  }

  async update({ params, request, response, auth }) {
    const { id } = params;
    const data = request.only(["content"]);

    const post = await Post.findOrFail(id);

    if (post.user_id !== auth.user.id) {
      return response
        .status(403)
        .send("Você não pode alterar o post de outra pessoa");
    }

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
