const { model, Schema } = require("mongoose");

let blacklistSchema = new Schema({
  user: String,
  blacklisted: Boolean,
  blacklistReason: String,
  author: String
});

module.exports = model("Blacklist", blacklistSchema);
