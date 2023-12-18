const { model, Schema } = require("mongoose");

let warnsListSchema = new Schema({
  user: String,
  warns: {
    type: Map,
    of: new Schema({
      reason: String,
      author: String,
    }),
    default: new Map(),
  },
});

module.exports = model("warnsList", warnsListSchema);
