"use strict";

const Post = use("App/Models/Post");
const UploadService = use("App/Services/uploadService");
const WhereChain = use("App/Services/Posts/whereChain");

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
    } catch (err) {
      response.internalServerError("Erro ao executar operação");
    }
  }

  async store({ request, response, auth }) {
    try {
      const { id } = auth.user;

      const data = request.only(["content"]);

      const post = await Post.create({ ...data, user_id: id });

      const image = request.file("imagem", {
        types: ["image"],
        size: "2mb"
      });

      const uploadService = new UploadService();
      await uploadService.uploadPostImage(image, post);

      const completePost = await Post.query()
        .select("id", "content", "updated_at", "user_id")
        .with("images", builder => {
          builder.select(["id", "pic_name", "post_id"]);
        })
        .with("user", builder => {
          builder.select(["id", "first_name", "last_name"]);
        })
        .where("posts.id", post.id)
        .fetch();

      return completePost;
    } catch (err) {
      response.internalServerError("Erro ao executar operação");
    }
  }

  async show({ request, response }) {
    const body = request.only(["id", "data_inicial", "data_final"]);

    const whereChain = new WhereChain();
    const query = whereChain.showPost(body);

    try {
      const post = await query
        .with("images", builder => {
          builder.select(["id", "pic_name", "post_id"]);
        })
        .with("user", builder => {
          builder.select(["id", "first_name", "last_name"]);
        })
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
