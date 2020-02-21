"use strict";

const PostPicture = use("App/Models/PostPicture");

const UploadService = use("App/Services/UploadService");

class PostPictureController {
  async store({ params, request }) {
    const { id } = params;

    const image = request.file("imagem", {
      types: ["image"],
      size: "2mb"
    });

    const uploadService = new UploadService();
    const post = await uploadService.uploadFile(image, id);

    const post_pictures = await PostPicture.query()
      .where("post_id", post)
      .fetch();
    return post_pictures;
  }
}

module.exports = PostPictureController;
