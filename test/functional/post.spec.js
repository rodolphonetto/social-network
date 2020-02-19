"use strict";

const { test, trait } = use("Test/Suite")("Post");
trait("Test/ApiClient");
trait("Auth/Client");
trait("DatabaseTransactions");

const Factory = use("Factory");

const Post = use("App/Models/Post");

test("Authorized users can create posts", async ({ client }) => {
  const user = await Factory.model("App/Models/User").create();
  const response = await client
    .post("/posts/new")
    .loginVia(user)
    .send({
      user_id: 2,
      content: "Teste de postagem"
    })
    .end();
  response.assertStatus(200);
  const post = await Post.firstOrFail();
  response.assertJSON(post.$attributes);
});

test("Unauthorized user can´t create posts", async ({ client }) => {
  const response = await client
    .post("/posts/new")
    .send({
      content: "Teste de postagem"
    })
    .end();
  response.assertStatus(401);
});

test("Authorized users can delete posts", async ({ client, assert }) => {
  const post = await Factory.model("App/Models/Post").create();
  const response = await client
    .delete(`posts/delete/${post.id}`)
    .loginVia(await post.user().first())
    .send()
    .end();
  response.assertStatus(200);
  assert.equal(await Post.getCount(), 0);
});

test("Post can't be deleted by a user who did not create it", async ({
  client
}) => {
  const post = await Factory.model("App/Models/Post").create();
  const notOwner = await Factory.model("App/Models/User").create();
  const response = await client
    .delete(`posts/delete/${post.id}`)
    .loginVia(notOwner)
    .send()
    .end();
  response.assertStatus(403);
});

test("Unauthorized users can´t delete posts", async ({ client }) => {
  const post = await Post.create({
    user_id: 2,
    content: "Teste de postagem"
  });
  const response = await client
    .delete(`posts/delete/${post.id}`)
    .send()
    .end();
  response.assertStatus(401);
});
