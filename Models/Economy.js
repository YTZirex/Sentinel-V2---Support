const { model, Schema } = require("mongoose");

let economySchema = new Schema({
  user: String,
  names: String,
  dateOfBirth: String,
  gender: String,
  balance: Number,
  creditCardNumber: String,
  cvc: String,
  expirationDate: String
});

module.exports = model("Economy", economySchema);
