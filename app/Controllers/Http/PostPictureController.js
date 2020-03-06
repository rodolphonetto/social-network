"use strict";

const PostPicture = use("App/Models/PostPicture");
const Post = use("App/Models/Post");

const UploadService = use("App/Services/uploadService");

class PostPictureController {
  async store({ params, request, response, auth }) {
    const { id } = params;
    const post = await Post.findOrFail(id);

    const image = request.file("imagem", {
      types: ["image"],
      size: "2mb"
    });

    const uploadService = new UploadService();
    await uploadService.uploadPostImage(image, post);
    if (post.user_id !== auth.user.id) {
      response
        .status(403)
        .send("Você não pode adicionar imagens a um post que não é seu.");
    }

    const post_pictures = await PostPicture.query()
      .where("post_id", post.id)
      .fetch();
    return post_pictures;
  }

  async destroy({ params, response, auth }) {
    const { post_id, pic_id } = params;

    const post = await Post.findOrFail(post_id);
    if (post.user_id !== auth.user.id) {
      response
        .status(403)
        .send("Você não pode excluir imagens de um post que não é seu.");
    }
    const post_pic = await PostPicture.findOrFail(pic_id);
    await post_pic.delete();
    response.send("Post excluido com sucesso");
  }
}

module.exports = PostPictureController;
