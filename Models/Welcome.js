const { model, Schema } = require("mongoose");

let welcomeSchema = new Schema({
  guild: String,
  enabled: Boolean, 
  channel: String,
  message: String,
  role: String,
});

module.exports = model("Welcome", welcomeSchema);
