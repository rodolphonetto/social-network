"use strict";

const Follow = use("App/Models/Follow");

class FollowController {
  async store({ request, response, auth }) {
    try {
      const { id } = auth.user;
      const data = request.only(["followed_id"]);
      const follow = await Follow.create({ ...data, follower_id: id });

      const completeFollow = await Follow.query()
        .select("id", "follower_id", "followed_id")
        .with("user_follower", builder => {
          builder.select(["id", "username"]);
        })
        .with("user_followed", builder => {
          builder.select(["id", "username"]);
        })
        .where("follows.id", follow.id)
        .fetch();

      return completeFollow;
    } catch (err) {
      console.log(err);
      response.internalServerError("Erro ao executar operação");
    }
  }

  async destroy({ params, request, response }) {}
}

module.exports = FollowController;
