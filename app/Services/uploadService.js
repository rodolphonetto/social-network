const { resolve } = require("path");

class UploadService {
  async uploadPostImage(image, post) {
    if (image.move) {
      await image.move(resolve("./public/uploads"), {
        name: `${Date.now()}-${image.clientName}`
      });

      if (!image.moved()) {
        return image.errors();
      }
      try {
        await post.images().create({ pic_name: image.fileName });
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
      } catch (err) {
        console.log(err);
      }
    }
  }
  async uploadUserAvatar(profile_pic) {
    try {
      const name = `${Date.now()}-${profile_pic.clientName}`;
      await profile_pic.move(resolve("./public/uploads"), {
        name: name
      });

      if (!profile_pic.moved()) {
        return profile_pic.errors();
      }
      return name;
    } catch (err) {
      console.log(err);
    }
  }
}

module.exports = UploadService;
