"use strict";

const Factory = use("Factory");

Factory.blueprint("App/Models/User", faker => {
  return {
    username: faker.username(),
    first_name: faker.first(),
    last_name: faker.last(),
    email: faker.email(),
    profile_pic: faker.avatar({ protocol: "https" }),
    password: "123123"
  };
});
