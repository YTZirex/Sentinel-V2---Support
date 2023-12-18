const { EmbedBuilder, GuildMember } = require("discord.js");

module.exports = {
  name: "guildMemberAdd",
  async execute(member) {
   // const role = member.guild.roles.cache.get('774713026867757056')
    member.roles.add("1159171919237627945");
  },
};
