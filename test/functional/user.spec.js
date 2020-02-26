"use strict";

const Helpers = use("Helpers");
const { resolve } = require("path");
const Factory = use("Factory");
const fs = require("fs");
const removeFile = Helpers.promisify(fs.unlink);

const User = use("App/Models/User");
const testFile = Helpers.appRoot("test/download.jpg");

const { test, trait } = use("Test/Suite")("User");
trait("Test/ApiClient");
trait("Auth/Client");
trait("DatabaseTransactions");

test("Should create an User", async ({ client, assert }) => {
  const response = await client
    .post("/register")
    .field("username", "rodolphoteste")
    .field("password", "123123")
    .field("first_name", "rodolpho")
    .field("last_name", "netto")
    .field("email", "rodolpho.netto@gmail.com")
    .attach("profile_pic", testFile)
    .end();
  const user = await User.firstOrFail();
  removeFile(resolve(`./public/uploads/${user.profile_pic}`));
  response.assertStatus(200);
  assert.equal(response.body.profile_pic, user.profile_pic);
});

test("Should login and receive a token", async ({ client, assert }) => {
  const createdUser = await client
    .post("/register")
    .field("username", "rodolphoteste")
    .field("password", "123123")
    .field("first_name", "rodolpho")
    .field("last_name", "netto")
    .field("email", "rodolpho.netto@gmail.com")
    .attach("profile_pic", testFile)
    .end();
  const user = await User.findBy("username", createdUser.body.username);
  const response = await client
    .get("/login")
    .send({ username: "rodolphoteste", password: "123123" })
    .end();
  removeFile(resolve(`./public/uploads/${user.profile_pic}`));
  response.assertStatus(200);
  assert.isOk(response.body.token);
});
