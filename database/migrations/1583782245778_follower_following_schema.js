"use strict";

const Schema = use("Schema");

class Follower_Followings extends Schema {
  up() {
    this.create("follower_followings", table => {
      table.increments();
      table
        .integer("follower_id")
        .unsigned()
        .references("id")
        .inTable("users")
        .onUpdate("CASCADE")
        .onDelete("CASCADE");
      table
        .integer("following_id")
        .unsigned()
        .references("id")
        .inTable("users")
        .onUpdate("CASCADE")
        .onDelete("CASCADE");
    });
  }

  down() {
    this.drop("follower_followings");
  }
}

module.exports = Follower_Followings;
