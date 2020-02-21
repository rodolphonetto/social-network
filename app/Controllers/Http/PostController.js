"use strict";

const Post = use("App/Models/Post");

const UploadService = use("App/Services/UploadService");

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

    const image = request.file("imagem", {
      types: ["image"],
      size: "2mb"
    });

    const uploadService = new UploadService();
    await uploadService.uploadFile(image, id);

    try {
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
