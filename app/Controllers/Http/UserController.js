"use strict";

const User = use("App/Models/User");
const { resolve } = require("path");

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

    const name = `${Date.now()}-${profile_pic.clientName}`;
    await profile_pic.move(resolve("./public/uploads"), {
      name: name
    });

    if (!profile_pic.moved()) {
      return profile_pic.errors();
    }

    const user = await User.create({
      ...data,
      profile_pic: profile_pic.fileName
    });

    return user;
  }

  async show({ params, request, response }) {}

  async update({ params, request, response }) {}

  async destroy({ params, request, response }) {}
}

module.exports = UserController;
