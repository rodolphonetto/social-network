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
      author: 2,
      content: "Teste de postagem"
    })
    .end();
  response.assertStatus(200);
  const post = await Post.firstOrFail();
  response.assertJSON(post.$attributes);
});

test("Unauthorized user can´t creat posts", async ({ client }) => {
  const response = await client
    .post("/posts/new")
    .send({
      content: "Teste de postagem"
    })
    .end();
  response.assertStatus(401);
});

test("Authorized users can delete posts", async ({ client, assert }) => {
  const user = await Factory.model("App/Models/User").create();
  const post = await Post.create({
    author: 2,
    content: "Teste de postagem"
  });
  const response = await client
    .delete(`posts/delete/${post.id}`)
    .loginVia(user)
    .send()
    .end();
  response.assertStatus(200);
  assert.equal(await Post.getCount(), 0);
});

test("Unauthorized users can´t delete posts", async ({ client, assert }) => {
  const post = await Post.create({
    author: 2,
    content: "Teste de postagem"
  });
  const response = await client
    .delete(`posts/delete/${post.id}`)
    .send()
    .end();
  response.assertStatus(401);
});
