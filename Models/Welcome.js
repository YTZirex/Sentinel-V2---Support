const { model, Schema } = require("mongoose");

let welcomeSchema = new Schema({
  guild: String,
  channel: String,
  message: String,
  role: String,
});

module.exports = model("Welcome", welcomeSchema);
