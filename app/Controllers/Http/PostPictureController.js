"use strict";

const PostPicture = use("App/Models/PostPicture");
const Post = use("App/Models/Post");

const UploadService = use("App/Services/UploadService");

class PostPictureController {
  async store({ params, request }) {
    const { id } = params;
    const post = await Post.findOrFail(id);

    const image = request.file("imagem", {
      types: ["image"],
      size: "2mb"
    });

    const uploadService = new UploadService();
    await uploadService.uploadPostImage(image, post);

    const post_pictures = await PostPicture.query()
      .where("post_id", post.id)
      .fetch();
    return post_pictures;
  }
}

module.exports = PostPictureController;
