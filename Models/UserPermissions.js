const { model, Schema } = require("mongoose");

let userPermissionSchema = new Schema({
  user: String,
  supportLevel: Number,
  dev: Boolean,
  star: Boolean,
});

module.exports = model("userPermission", userPermissionSchema);
