const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const { Code } = require("../../Models/CodeSchema");
const { userPermissions } = require("../../Models/UserPermissions");
const ERROR_MESSAGES = {
  CODE_NOT_FOUND: `Le code est invalide. Veuillez réessayer.`,
  EXPIRY_EDIT_FAILED: `La date d'expiration du code n'a pas pu être modifiée. Veuillez réessayer plus tard.`,
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("edit-expiry")
    .setDescription(`[ÉTOILES] Permet de modifier la durée d'un code Sentinel Premium.`)
    .addStringOption((option) =>
      option
        .setName("code")
        .setDescription("Code à modifier.")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("duree")
        .setDescription(`Nouvelle durée du code.`)
        .setRequired(true)
        .addChoices(
          {
            name: "1 jour",
            value: 1,
          },
          {
            name: "7 jours",
            value: 7,
          },
          {
            name: "30 jours",
            value: 30,
          },
          {
            name: "365 jours",
            value: 365,
          }
        )
    ),
  async execute(interaction) {
    const userPermsRecord = await userPermissions.findOne({
      user: interaction.user.id,
    });

    if (!userPermsRecord)
      return interaction.reply({
        content: `Vous n'avez pas la permission d'utiliser cette commande.`,
        ephemeral: true,
      });

    if (userPermsRecord.star == false)
      return interaction.reply({
        content: `Vous n'avez pas la permission d'utiliser cette commande.`,
        ephemeral: true,
      });

    const codeValue = interaction.options.getString("code");
    const daysToAdd = interaction.options.getInteger("duree");

    try {
      const code = await Code.findOne({
        code: codeValue,
      });

      if (!code) {
        const res = new EmbedBuilder()
          .setTimestamp()
          .setTitle("Oups!")
          .setDescription(ERROR_MESSAGES.CODE_NOT_FOUND)
          .setColor("Red");
        await interaction.reply({ embeds: [res], ephemeral: true });
        return;
      }

      let newExpiry;
      if (code.redeemedBy && code.redeemedBy.id) {
        newExpiry = new Date(code.expiresAt.getTime() + daysToAdd * 86400000);

        await Code.updateOne(
          { code: codeValue },
          { $set: { expiresAt: newExpiry } }
        );
      } else {
        const length = Object.keys(code)[0];

        await Code.updateOne(
          { code: codeValue },
          { $set: { length: `${daysToAdd} jours` } }
        );
      }

      const res = new EmbedBuilder()
        .setTitle(`Expiration modifiée!`)
        .setTimestamp()
        .setDescription(
          `La date d'expiration du code a été modifiée avec succès.`
        )
        .addFields({
          name: "Code:",
          value: code.code,
          inline: true,
        });

      if (newExpiry) {
        res.addFields({
          name: "Nouvelle expiration:",
          value: `<t:${Math.floor(newExpiry.getTime() / 1000)}:R>`,
          inline: true,
        });
      } else {
        res.addFields({
          name: "Nouvelle durée:",
          value: `${daysToAdd} jours`,
          inline: true,
        });
      }

      await interaction.reply({ embeds: [res], ephemeral: true });
    } catch (error) {
      console.error(error);
      const res = new EmbedBuilder()
        .setTimestamp()
        .setTitle("Oups!")
        .setDescription(ERROR_MESSAGES.EXPIRY_EDIT_FAILED)
        .setColor("Red");
      await interaction.reply({ embeds: [res], ephemeral: true });
      return;
    }
  },
};
