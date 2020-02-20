"use strict";
const { resolve } = require("path");

const Post = use("App/Models/Post");

class PostPictureController {
  async store({ request, response, auth }) {
    const data = request.only(["post_id"]);
    const post = await Post.findOrFail(data.post_id);

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

    return post;
  }
}

module.exports = PostPictureController;
