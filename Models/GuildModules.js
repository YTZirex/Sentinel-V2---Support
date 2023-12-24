const { model, Schema } = require('mongoose');

let guildModuleSchema = new Schema({
    guild: String,
    economy: Boolean,
    welcome: Boolean,
})

module.exports = model('GuildModule', guildModuleSchema);