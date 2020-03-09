// "use strict";

// const Factory = use("Factory");

// const { test, trait } = use("Test/Suite")("Follow Users");
// trait("Test/ApiClient");
// trait("Auth/Client");
// trait("DatabaseTransactions");

// const Follow = use("App/Models/Follow");

// test("Authorized user can follow another user", async ({ client }) => {
//   const user = await Factory.model("App/Models/User").create();
//   const followedUser = await Factory.model("App/Models/User").create();
//   const response = await client
//     .post("/follow/new")
//     .loginVia(user)
//     .send({ follower_id: user.id, followed_id: followedUser.id })
//     .end();
//   response.assertStatus(200);
// });
