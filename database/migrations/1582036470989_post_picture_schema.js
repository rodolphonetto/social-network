"use strict";

const Schema = use("Schema");

class PostPictureSchema extends Schema {
  up() {
    this.create("post_pictures", table => {
      table.increments();
      table
        .integer("post_id")
        .unsigned()
        .references("id")
        .inTable("posts")
        .onUpdate("CASCADE")
        .onDelete("CASCADE");
      table.string("pic_name");
      table.timestamps();
    });
  }

  down() {
    this.drop("post_pictures");
  }
}

module.exports = PostPictureSchema;
