const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { Code } = require("../../Models/CodeSchema");
const { userPermissions } = require('../../Models/UserPermissions')
module.exports = {
  data: new SlashCommandBuilder()
    .setName("generate-code")
    .setDescription("[ÉTOILES] Permet de générer un code Sentinel Premium.")
    .addStringOption((option) =>
      option
        .setName("duree")
        .setDescription("Durée du code.")
        .setRequired(true)
        .addChoices(
          {
            name: "1 jour",
            value: "quotidien",
          },
          {
            name: "7 jours",
            value: "hebdomadaire",
          },
          {
            name: "30 jours",
            value: "mensuel",
          },
          {
            name: "365 jours",
            value: "annuel",
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

    const codeType = interaction.options.getString("duree");

    const code = Math.random().toString(36).substring(2, 8);

    const newCode = new Code({
      code,
      length: codeType,
    });

    try {
      await newCode.save();
      const res = new EmbedBuilder()
        .setTitle("Code généré!")
        .setColor("Green")
        .setDescription(`Votre code a été généré avec succès.`)
        .addFields(
          {
            name: "Code",
            value: `${code}`,
            inline: true,
          },
          {
            name: "Durée",
            value: `${codeType}`,
            inline: true,
          }
        )
        .setTimestamp();
      await interaction.reply({ embeds: [res], ephemeral: true });
    } catch (error) {
      console.error(error);
      const res = new EmbedBuilder()
        .setDescription(
          `Une erreur s'est produite. Veuillez réessayer plus tard.`
        )
        .setTimestamp()
        .setColor("Red")
        .setTitle("Oups!");
      await interaction.reply({ embeds: [res], ephemeral: true });
    }
  },
};
