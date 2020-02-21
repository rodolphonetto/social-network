"use strict";

const Post = use("App/Models/Post");

const { resolve } = require("path");

class PostController {
  async index({ response }) {
    try {
      const posts = await Post.query()
        .select("id", "content", "updated_at", "user_id")
        .with("images", builder => {
          builder.select(["id", "pic_name", "post_id"]);
        })
        .with("user", builder => {
          builder.select(["id", "first_name", "last_name"]);
        })
        .fetch();
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
    const postCreated = await Post.findOrFail(post.id);
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
        await postCreated.images().create({ pic_name: image.fileName });
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
            .map(img => postCreated.images().create({ pic_name: img.fileName }))
        );
      }

      const completePost = await Post.query()
        .select("id", "content", "updated_at", "user_id")
        .with("images", builder => {
          builder.select(["id", "pic_name", "post_id"]);
        })
        .with("user", builder => {
          builder.select(["id", "first_name", "last_name"]);
        })
        .where("id", post.id)
        .fetch();
      return completePost.toJSON();
    } catch (err) {
      response.internalServerError("Erro ao executar operação");
    }
  }

  async show({ params, response }) {
    const { id } = params;
    try {
      const post = await Post.query()
        .select("id", "content", "updated_at", "user_id")
        .with("images", builder => {
          builder.select(["id", "pic_name", "post_id"]);
        })
        .with("user", builder => {
          builder.select(["id", "first_name", "last_name"]);
        })
        .where("posts.id", id)
        .fetch();

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
