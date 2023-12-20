const { model, Schema } = require("mongoose");

const codeSchema = new Schema({
  code: {
    type: String,
    required: true,
  },
  length: {
    type: String,
    required: true,
  },
  redeemedBy: {
    id: {
      type: String,
      default: null,
    },
    username: {
      type: String,
      default: null,
    },
  },
  redeemedOn: {
    type: Date,
    default: null,
  },
  expiresAt: {
    type: Date,
    index: { expires: 0 },
    default: null,
  },
});

module.exports = model("Code", codeSchema);
