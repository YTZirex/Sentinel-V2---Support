const { CommandInteraction, EmbedBuilder } = require("discord.js");
const { models, Schema } = require("mongoose");
const BlacklistSchema = require("../../Models/Blacklist");
const Code = require('../../Models/CodeSchema');
//const isUserPremium = require("../../Functions/codeFunction");
module.exports = {
  name: "interactionCreate",

  async execute(interaction, client) {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) {
      interaction.reply({ content: `Command is outdated.`, ephemeral: true });
      return;
    }

    const userBlacklistRecord = await BlacklistSchema.findOne({
      user: interaction.user.id,
    });

    if (userBlacklistRecord) {
      if (userBlacklistRecord.blacklisted == true) {
        const res = new EmbedBuilder()
          .setTitle("Oups!")
          .setColor("Red")
          .setThumbnail(interaction.user.displayAvatarURL())
          .setDescription(
            `Vous êtes actuellement blacklist de nos services. Si vous pensez que c'est une erreur, veuillez nous contacter sur notre [Support](https://discord.gg/My2BVCmJEY).`
          )
          .addFields(
            {
              name: "**Raison : **",
              value: userBlacklistRecord.blacklistReason,
            },
            {
              name: "**Modérateur : **",
              value: `<@${userBlacklistRecord.author}>`,
            }
          )
          .setTimestamp();

        interaction.reply({
          embeds: [res],
          ephemeral: true,
        });
        return;
      }
    }

    const userPremiumRecord = await Code.findOne({
      "redeemedBy.id": interaction.user.id
    })

    if (command.premiumOnly && !userPremiumRecord) {
      const res = new EmbedBuilder()
        .setTitle("Oups!")
        .setDescription(
          `Cette commande est réservé aux utilisateurs Sentinel Premium.`
        )
        .setColor("Red")
        .setTimestamp();
      return interaction.reply({
        embeds: [res],
        ephemeral: true,
      });
    }

    command.execute(interaction, client);
  },
};
