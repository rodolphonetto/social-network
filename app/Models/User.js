"use strict";

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use("Model");

const Hash = use("Hash");

class User extends Model {
  static boot() {
    super.boot();

    this.addHook("beforeSave", async userInstance => {
      if (userInstance.dirty.password) {
        userInstance.password = await Hash.make(userInstance.password);
      }
    });
  }

  followers() {
    return this.belongsToMany(
      "App/Models/User",
      "user_id",
      "follower_id"
    ).pivotTable("followers");
  }

  following() {
    return this.belongsToMany(
      "App/Models/User",
      "follower_id",
      "user_id"
    ).pivotTable("followers");
  }

  posts() {
    return this.hasMany("App/Models/Post");
  }

  tokens() {
    return this.hasMany("App/Models/Token");
  }

  static get hidden() {
    return ["password"];
  }
}

module.exports = User;
