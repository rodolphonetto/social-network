"use strict";

const Schema = use("Schema");

class FollowSchema extends Schema {
  up() {
    this.create("follows", table => {
      table.increments();
      table
        .integer("follower_id")
        .unsigned()
        .references("id")
        .inTable("users")
        .onUpdate("CASCADE")
        .onDelete("CASCADE");
      table
        .integer("followed_id")
        .unsigned()
        .references("id")
        .inTable("users")
        .onUpdate("CASCADE")
        .onDelete("CASCADE");
      table.timestamps();
    });
  }

  down() {
    this.drop("follows");
  }
}

module.exports = FollowSchema;
