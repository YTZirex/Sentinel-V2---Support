const { model, Schema } = require("mongoose");

let jobSchema = new Schema({
  user: String,
  job: String
});

module.exports = model("Job", jobSchema);
