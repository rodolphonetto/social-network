"use strict";

const { test, trait } = use("Test/Suite")("Post");

trait("Test/ApiClient");
const Post = use("App/Models/Post");

test("Can create posts", async ({ client }) => {
  const response = await client
    .post("/posts/new")
    .send({
      author: 5,
      content: "Teste de postagem"
    })
    .end();
  response.assertStatus(200);
  const post = await Post.firstOrFail();
  response.assertJSON({ post: post.toJSON });
});
