"use strict";
const fs = require("fs");
const Helpers = use("Helpers");
const Factory = use("Factory");
const { resolve } = require("path");
const removeFile = Helpers.promisify(fs.unlink);
const testFile = Helpers.appRoot("test/download.jpg");
const Database = use("Database");

const { test, trait } = use("Test/Suite")("Post Picture");
trait("Test/ApiClient");
trait("Auth/Client");
trait("DatabaseTransactions");

test("Authorized user can add a pic to a post", async ({ client }) => {
  const post = await Factory.model("App/Models/Post").create();
  const user = await Factory.model("App/Models/User").create();
  const response = await client
    .post(`/post_pics/add/${post.id}`)
    .loginVia(user)
    .field("post_id", post.id)
    .attach("imagem", testFile)
    .end();
  response.assertStatus(200);
  response.assertJSON(post.$attributes);
  const postPic = await Database.select("pic_name").from("post_pictures");
  removeFile(resolve(`./public/uploads/${postPic[0].pic_name}`));
});
