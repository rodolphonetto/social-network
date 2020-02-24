"use strict";

const Model = use("Model");

class Post extends Model {
  static formatDates(field, value) {
    if (field === "dob") {
      return value.format("YYYY-MM-DD");
    }
    return super.formatDates(field, value);
  }

  user() {
    return this.belongsTo("App/Models/User");
  }

  images() {
    return this.hasMany("App/Models/PostPicture");
  }
}

module.exports = Post;
