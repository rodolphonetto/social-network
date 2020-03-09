"use strict";

const Model = use("Model");

class Follow extends Model {
  user_follower() {
    return this.belongsTo("App/Models/User");
  }
  user_followed() {
    return this.belongsTo("App/Models/User");
  }
}

module.exports = Follow;
