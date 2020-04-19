"use strict";

const fs = use("fs");
const pdf = use("html-pdf");
const Helpers = use("Helpers");

const PostPicture = use("App/Models/PostPicture");
const Post = use("App/Models/Post");

const UploadService = use("App/Services/uploadService");

class PostPictureController {
  async store({ params, request, response, auth }) {
    const { id } = params;
    const post = await Post.findOrFail(id);

    const image = request.file("imagem", {
      types: ["image"],
      size: "2mb",
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

    try {
      const post = await Post.findOrFail(post_id);
      if (post.user_id !== auth.user.id) {
        response
          .status(403)
          .send("Você não pode excluir imagens de um post que não é seu.");
      }
      await post.images().where("id", pic_id).delete();
      response.send("Post excluido com sucesso");
    } catch (err) {
      console.log(err);
    }
  }

  async convertPDF({ params, response, auth }) {
    const html = fs.readFileSync(Helpers.publicPath("teste.html"), "utf8");
    const options = { format: "Letter" };

    const pdfPromise = new Promise((resolve, reject) => {
      pdf
        .create(html, options)
        .toFile(Helpers.publicPath("teste.pdf"), function (err, res) {
          if (err) return reject(err);
          resolve(res);
        });
    });
    const fileCreated = await pdfPromise;

    response.ok(`http://localhost:3333/${fileCreated.filename}`);
  }
}

module.exports = PostPictureController;
