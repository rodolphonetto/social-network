const moment = require("moment");
const Post = use("App/Models/Post");

class WhereChain {
  showPost(body) {
    if (body.data_inicial) {
      body.data_inicial = moment.utc(body.data_inicial, "DD-MM-YYYY");
    }

    if (body.data_final) {
      body.data_final = moment
        .utc(body.data_final, "DD-MM-YYYY")
        .add(23, "h")
        .add(59, "m")
        .add(59, "s");
    }

    let paramsToChain = {
      id: body.id || null,
      data_inicial: body.data_inicial || null,
      data_final: body.data_final || null
    };

    const query = Post.query();

    Object.keys(paramsToChain).forEach(key => {
      if (paramsToChain[key] && key == "id") {
        query.where("id", paramsToChain[key]);
      } else if (paramsToChain[key] && key == "data_inicial") {
        query.andWhere("updated_at", ">=", paramsToChain[key]);
      } else if (paramsToChain[key] && key == "data_final") {
        query.andWhere("updated_at", "<=", paramsToChain[key]);
      }
    });

    return query;
  }
}

module.exports = WhereChain;
