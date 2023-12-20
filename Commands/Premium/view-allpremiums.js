const { model, Schema } = require("mongoose");
const Code = require("../../Models/CodeSchema");
const userPermissions = require("../../Models/UserPermissions");
const {
  EmbedBuilder,
  SlashCommandBuilder,
  CommandInteraction,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("liste-premium")
    .setDescription("[SUPPORT 1] Permet de voir tous les codes Premium."),
  async execute(interaction) {
    const userPermsRecord = await userPermissions.findOne({
        user: interaction.user.id,
      });
  
      if (!userPermsRecord)
        return interaction.reply({
          content: `Vous n'avez pas la permission d'utiliser cette commande.`,
          ephemeral: true,
        });
  
      if (userPermsRecord.supportLevel < 1)
        return interaction.reply({
          content: `Vous n'avez pas la permission d'utiliser cette commande.`,
          ephemeral: true,
        });

    const codes = await Code.findOne({ "redeemedBy.id": { $ne: null } });
    const users = codes.map((code) => code.redeemedBy);

    if (users.length > 0) {
      const embed = new EmbedBuilder()
        .setColor(0x1c1c1c)
        .setDescription("Codes Premium")
        .addFields(
          users.map((user) => {
            return {
              name: `<@${user.id}`,
              value: `\`${user.id}\``,
              inline: true,
            };
          })
        )
        .setTimestamp()
        .setFooter({ text: "Codes Premium" });

      interaction.reply({ embeds: [embed], ephemeral: true });
    } else {
      interaction.reply({
        content: `Aucun code n'a été récupéré pour le moment.`,
        ephemeral: true,
      });
    }
  },
};
