const moment = require("moment");
const Post = use("App/Models/Post");

class WhereChain {
  showPost(body) {
    const query = Post.query();

    if (body.id) {
      query.where("id", body.id);
    }

    if (body.data_inicial) {
      body.data_inicial = moment.utc(body.data_inicial, "DD-MM-YYYY");
      query.andWhere("updated_at", ">=", body.data_inicial);
    }

    if (body.data_final) {
      body.data_final = moment
        .utc(body.data_final, "DD-MM-YYYY")
        .add(23, "h")
        .add(59, "m")
        .add(59, "s");
      query.andWhere("updated_at", "<=", body.data_final);
    }

    return query;
  }
}

module.exports = WhereChain;
