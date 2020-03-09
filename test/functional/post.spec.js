"use strict";
const fs = require("fs");
const Helpers = use("Helpers");
const Database = use("Database");
const { resolve } = require("path");
const removeFile = Helpers.promisify(fs.unlink);
const testFile = Helpers.appRoot("test/download.jpg");
const testFile2 = Helpers.appRoot("test/download2.jpg");

const Factory = use("Factory");

const Post = use("App/Models/Post");

const { test, trait } = use("Test/Suite")("Post");
trait("Test/ApiClient");
trait("Auth/Client");
trait("DatabaseTransactions");

test("Can access a single post", async ({ client, assert }) => {
  const post = await Factory.model("App/Models/Post").create();
  const user = await Factory.model("App/Models/User").create();
  const response = await client
    .get(`/post`)
    .loginVia(user)
    .send({ id: post.id })
    .end();
  response.assertStatus(200);
  assert.equal(response.body[0].content, post.$attributes.content);
});

test("Can access a single post by Id and date", async ({ client, assert }) => {
  const post = await Factory.model("App/Models/Post").create();
  const user = await Factory.model("App/Models/User").create();
  const response = await client
    .get(`/post`)
    .loginVia(user)
    .send({ id: post.id, data_inicial: "01/01/1991", data_final: "31/12/2900" })
    .end();
  response.assertStatus(200);
  assert.equal(response.body[0].content, post.content);
});

test("Can access multiple posts", async ({ client, assert }) => {
  const posts = await Factory.model("App/Models/Post").createMany(3);
  const user = await Factory.model("App/Models/User").create();
  const response = await client
    .get(`/posts`)
    .loginVia(user)
    .send()
    .end();
  response.assertStatus(200);
  const postsOrder = posts.sort((a, b) => a.id - b.id);
  assert.equal(response.body[1].content, postsOrder[1].content);
});

test("Authorized users can create posts", async ({ client, assert }) => {
  const user = await Factory.model("App/Models/User").create();
  const response = await client
    .post("/posts/new")
    .loginVia(user)
    .field("content", "Teste de postagem")
    .attach("imagem", testFile)
    .end();
  const postPic = await Database.select("pic_name").from("post_pictures");
  removeFile(resolve(`./public/uploads/${postPic[0].pic_name}`));
  response.assertStatus(200);
  const post = await Post.query()
    .select("id", "content", "updated_at", "user_id")
    .with("images", builder => {
      builder.select(["id", "pic_name", "post_id"]);
    })
    .with("user", builder => {
      builder.select(["id", "first_name", "last_name"]);
    })
    .fetch();
  response.assertJSON(post.toJSON());
});

test("Authorized users can create posts with multiple pictures", async ({
  client
}) => {
  const user = await Factory.model("App/Models/User").create();
  const response = await client
    .post("/posts/new")
    .loginVia(user)
    .field("user_id", 2)
    .field("content", "Teste de postagem")
    .attach("imagem", testFile)
    .attach("imagem", testFile2)
    .end();
  const postPic = await Database.select("pic_name").from("post_pictures");
  postPic.forEach(pic => {
    removeFile(resolve(`./public/uploads/${pic.pic_name}`));
  });
  response.assertStatus(200);
  const post = await Post.query()
    .select("id", "content", "updated_at", "user_id")
    .with("images", builder => {
      builder.select(["id", "pic_name", "post_id"]);
    })
    .with("user", builder => {
      builder.select(["id", "first_name", "last_name"]);
    })
    .fetch();
  response.assertJSON(post.toJSON());
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

test("Authorized users can´t create posts with invalid imagem field", async ({
  client,
  assert
}) => {
  const user = await Factory.model("App/Models/User").create();
  const response = await client
    .post("/posts/new")
    .loginVia(user)
    .field("content", "Teste de postagem")
    .field("imagem", "Teste de postagem")
    .end();
  response.assertStatus(500);
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

test("Authorized users can't delete post with invalid id", async ({
  client
}) => {
  const user = await Factory.model("App/Models/User").create();
  const response = await client
    .delete(`posts/delete/test`)
    .loginVia(user)
    .send()
    .end();
  response.assertStatus(500);
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

test("Authorized users can update posts", async ({ client, assert }) => {
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
  assert.equal(response.body.content, updatedPost.content);
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
