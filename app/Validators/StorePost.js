"use strict";

class StorePost {
  get rules() {
    return {
      content: "required"
    };
  }
  get messages() {
    return {
      "content.required": "Não é possivel fazer posts em branco."
    };
  }
}

module.exports = StorePost;
