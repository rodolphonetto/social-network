"use strict";
const Helpers = use("Helpers");

const testFile = Helpers.appRoot("test/download.jpg");

const { test, trait } = use("Test/Suite")("Post");
trait("Test/ApiClient");
trait("Auth/Client");
trait("DatabaseTransactions");

const Factory = use("Factory");

const Post = use("App/Models/Post");

test("Can access a single post", async ({ client, assert }) => {
  const post = await Factory.model("App/Models/Post").create();
  const user = await Factory.model("App/Models/User").create();
  const response = await client
    .get(`/posts/${post.id}`)
    .loginVia(user)
    .send()
    .end();
  response.assertStatus(200);
  assert.equal(response.body[0].content, post.$attributes.content);
});

test("Can access multiple posts", async ({ client, assert }) => {
  const post = await Factory.model("App/Models/Post").createMany(3);
  const user = await Factory.model("App/Models/User").create();
  const response = await client
    .get(`/posts`)
    .loginVia(user)
    .send()
    .end();
  response.assertStatus(200);
  assert.equal(response.body[1].content, post[1].$attributes.content);
});

test("Authorized users can create posts", async ({ client }) => {
  const user = await Factory.model("App/Models/User").create();
  const response = await client
    .post("/posts/new")
    .loginVia(user)
    .send({
      user_id: 2,
      content: "Teste de postagem",
      imagem: testFile
    })
    .end();
  response.assertStatus(200);
  const post = await Post.firstOrFail();
  response.assertJSON(post.$attributes);
});

test("Can´t create posts with invalid fields", async ({ client }) => {
  const user = await Factory.model("App/Models/User").create();
  let response = await client
    .post("/posts/new")
    .loginVia(user)
    .send({ content: "" })
    .end();
  response.assertStatus(400);
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
  const post = await Factory.model("App/Models/Post").create();
  const response = await client
    .delete(`posts/delete/${post.id}`)
    .send()
    .end();
  response.assertStatus(401);
});

test("Authorized users can update posts", async ({ client }) => {
  const post = await Factory.model("App/Models/Post").create();
  const response = await client
    .put(`posts/update/${post.id}`)
    .loginVia(await post.user().first())
    .send({
      content: "Teste de alteração de post"
    })
    .end();
  response.assertStatus(200);
  const updatedPost = await Post.firstOrFail();
  response.assertJSON(updatedPost.$attributes);
});

test("Post can't be updated by a user who did not create it", async ({
  client
}) => {
  const post = await Factory.model("App/Models/Post").create();
  const notOwner = await Factory.model("App/Models/User").create();
  const response = await client
    .put(`posts/update/${post.id}`)
    .loginVia(notOwner)
    .send({
      content: "Teste de alteração de post"
    })
    .end();
  response.assertStatus(403);
});

test("Can´t update posts with invalid fields", async ({ client }) => {
  const post = await Factory.model("App/Models/Post").create();
  let response = await client
    .put("/posts/update/${post.id}")
    .loginVia(await post.user().first())
    .send({ content: "" })
    .end();
  response.assertStatus(400);
});

test("Unauthorized users can´t update posts", async ({ client }) => {
  const post = await Factory.model("App/Models/Post").create();
  const response = await client
    .put(`posts/update/${post.id}`)
    .send({
      content: "Teste de alteração de post"
    })
    .end();
  response.assertStatus(401);
});
