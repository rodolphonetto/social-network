"use strict";

const User = use("App/Models/User");
const UploadService = use("App/Services/uploadService");

class UserController {
  async index({ request, response }) {}

  async create({ request }) {
    const data = request.only([
      "username",
      "password",
      "first_name",
      "last_name",
      "email",
      "profile_pic"
    ]);

    // upload image
    const profile_pic = request.file("profile_pic", {
      types: ["image"],
      size: "2mb"
    });

    const uploadService = new UploadService();
    const uploadedProfilePic = await uploadService.uploadUserAvatar(
      profile_pic
    );

    const user = await User.create({
      ...data,
      profile_pic: uploadedProfilePic
    });

    return user;
  }

  async show({ params, request, response }) {}

  async update({ params, request, response }) {}

  async destroy({ params, request, response }) {}
}

module.exports = UserController;
