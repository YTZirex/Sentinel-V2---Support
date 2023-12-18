const { model, Schema } = require("mongoose");

let maxPermSchema = new Schema({
  user: String,
  maxPerm: Boolean,
});

module.exports = model("maxPerm", maxPermSchema);
