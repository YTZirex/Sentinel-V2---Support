const { model, Schema } = require("mongoose");

let supportStatsSchema = new Schema({
  user: String,
  botWarns: { type: Number, default: 0 },
  botKicks: { type: Number, default: 0 },
  botBans: { type: Number, default: 0 },
  botBlacklists: { type: Number, default: 0 },
});

module.exports = model("supportStat", supportStatsSchema);
