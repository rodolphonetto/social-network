const { resolve } = require("path");
const Post = use("App/Models/Post");

class UploadService {
  async uploadFile(image, id) {
    const post = await Post.findOrFail(id);
    if (image.move) {
      await image.move(resolve("./public/uploads"), {
        name: `${Date.now()}-${image.clientName}`
      });

      if (!image.moved()) {
        return image.errors();
      }
      try {
        await post.images().create({ pic_name: image.fileName });
        return post.id;
      } catch (err) {
        console.log(err);
      }
    } else {
      await image.moveAll(resolve("./public/uploads"), file => ({
        name: `${Date.now()}-${file.clientName}`
      }));

      if (!image.movedAll()) {
        return image.errors();
      }

      try {
        await Promise.all(
          image
            .movedList()
            .map(img => post.images().create({ pic_name: img.fileName }))
        );
        return post.id;
      } catch (err) {
        console.log(err);
      }
    }
  }
}

module.exports = UploadService;
