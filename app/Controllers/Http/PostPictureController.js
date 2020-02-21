"use strict";
const { resolve } = require("path");

const Post = use("App/Models/Post");
const PostPicture = use("App/Models/PostPicture");

class PostPictureController {
  async store({ params, request }) {
    const { id } = params;
    const post = await Post.findOrFail(id);

    const image = request.file("imagem", {
      types: ["image"],
      size: "2mb"
    });

    if (image.move) {
      await image.move(resolve("./public/uploads"), {
        name: `${Date.now()}-${image.clientName}`
      });

      if (!image.moved()) {
        return image.errors();
      }
      await post.images().create({ pic_name: image.fileName });
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
          .map(img => post.images().create({ pic_name: img.fileName }))
      );
    }
    const post_pictures = await PostPicture.query()
      .where("post_id", post.id)
      .fetch();
    return post_pictures;
  }
}

module.exports = PostPictureController;
