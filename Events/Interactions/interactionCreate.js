const { CommandInteraction, EmbedBuilder } = require("discord.js");
const { models, Schema } = require("mongoose");
const BlacklistSchema = require("../../Models/Blacklist");
const Code = require('../../Models/CodeSchema');

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

    if (userBlacklistRecord && userBlacklistRecord.blacklisted) {
      const res = new EmbedBuilder()
        .setTitle("Oups!")
        .setColor("Red")
        .setThumbnail(interaction.user.displayAvatarURL())
        .setDescription(
          `Vous êtes actuellement blacklisté de nos services. Si vous pensez que c'est une erreur, veuillez nous contacter sur notre [Support](https://discord.gg/My2BVCmJEY).`
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

    if (command.premiumOnly) {
      const userPremiumRecord = await Code.findOne({
        "redeemedBy.id": interaction.user.id,
      });

      if (!userPremiumRecord || userPremiumRecord.expiresAt < new Date()) {
        if (userPremiumRecord) {
          // Remove the expired code from the database
          await Code.deleteOne({ "redeemedBy.id": interaction.user.id });
        }

        const res = new EmbedBuilder()
          .setTitle("Oups!")
          .setDescription(
            `Cette commande est réservée aux utilisateurs Sentinel Premium.`
          )
          .setColor("Red")
          .setTimestamp();
        return interaction.reply({
          embeds: [res],
          ephemeral: true,
        });
      }
    }

    command.execute(interaction, client);
  },
};
