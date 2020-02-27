"use strict";
const fs = require("fs");
const Helpers = use("Helpers");
const Factory = use("Factory");
const { resolve } = require("path");
const removeFile = Helpers.promisify(fs.unlink);
const testFile = Helpers.appRoot("test/download.jpg");
const testFile2 = Helpers.appRoot("test/download2.jpg");
const Database = use("Database");

const Post = use("App/Models/Post");
const PostPicture = use("App/Models/PostPicture");

const { test, trait } = use("Test/Suite")("Post Picture");
trait("Test/ApiClient");
trait("Auth/Client");
trait("DatabaseTransactions");

test("Authorized user can add a pic to a post", async ({ client, assert }) => {
  const post = await Factory.model("App/Models/Post").create();
  const response = await client
    .post(`/post_pics/add/${post.id}`)
    .loginVia(await post.user().first())
    .attach("imagem", testFile)
    .end();
  const postPic = await Database.select("pic_name").from("post_pictures");
  removeFile(resolve(`./public/uploads/${postPic[0].pic_name}`));
  response.assertStatus(200);
  const post_pictures = await Database.select("*").from("post_pictures");
  assert.equal(response.body.pic_name, post_pictures.pic_name);
});

test("Authorized user can add multiple pics to a post", async ({
  client,
  assert
}) => {
  const post = await Factory.model("App/Models/Post").create();
  const response = await client
    .post(`/post_pics/add/${post.id}`)
    .loginVia(await post.user().first())
    .attach("imagem", testFile)
    .attach("imagem", testFile2)
    .end();
  const postPic = await Database.select("pic_name").from("post_pictures");
  postPic.forEach(pic => {
    removeFile(resolve(`./public/uploads/${pic.pic_name}`));
  });
  response.assertStatus(200);
  const post_pictures = await Database.select("*").from("post_pictures");
  post_pictures.forEach((pic, index) => {
    assert.equal(response.body[index].pic_name, pic.pic_name);
  });
});

test("Authorized user can delete pics from a posts", async ({
  client,
  assert
}) => {
  await Factory.model("App/Models/PostPicture").create();
  const post_pic = await PostPicture.firstOrFail();
  const post = await Post.firstOrFail();
  const response = await client
    .delete(`/post_pics/delete/${post.id}/${post_pic.id}`)
    .loginVia(await post.user().first())
    .end();
  response.assertStatus(200);
  assert.equal(await PostPicture.getCount(), 0);
});

test("Unauthorized users can't add pics to posts", async ({ client }) => {
  const post = await Factory.model("App/Models/Post").create();
  const response = await client
    .post(`/post_pics/add/${post.id}`)
    .attach("imagem", testFile)
    .end();
  response.assertStatus(401);
});

test("Authorized users can´t delete pics from other users", async ({
  client
}) => {
  await Factory.model("App/Models/PostPicture").create();
  const post_pic = await PostPicture.firstOrFail();
  const post = await Post.firstOrFail();
  const notOwner = await Factory.model("App/Models/User").create();
  const response = await client
    .delete(`/post_pics/delete/${post.id}/${post_pic.id}`)
    .loginVia(notOwner)
    .end();
  response.assertStatus(403);
});
