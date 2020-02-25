"use strict";

const Model = use("Model");

class Post extends Model {
  user() {
    return this.belongsTo("App/Models/User");
  }

  images() {
    return this.hasMany("App/Models/PostPicture");
  }
}

module.exports = Post;
