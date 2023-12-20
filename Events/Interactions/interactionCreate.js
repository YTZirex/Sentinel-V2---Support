const { CommandInteraction, EmbedBuilder } = require("discord.js");
const { models, Schema } = require("mongoose");
const BlacklistSchema = require("../../Models/Blacklist");
const { isUserPremium } = require("../../Functions/codeFunction");
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

    const isPremium = await isUserPremium(interaction.user.id);

    if (command.premiumOnly && !isPremium) {
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
