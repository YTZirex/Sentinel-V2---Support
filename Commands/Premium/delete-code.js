const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const { Code } = require("../../Models/CodeSchema");
const { userPermissions } = require("../../Models/UserPermissions");
const ERROR_MESSAGES = {
  CODE_NOT_FOUND: `Le code est invalide. Veuillez réessayer.`,
  CODE_ALREADY_REDEEMED: `Le code est déjà utilisé.`,
  EXPIRATION_DATE_NOT_FOUND: `Le code est déjà utilisé, mais nous n'arrivons pas à trouver la date d'expiration.`,
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("delete-code")
    .setDescription("[ÉTOILES] Permet de supprimer un code Sentinel Premium.")
    .addStringOption((option) =>
      option
        .setName("code")
        .setDescription("Code à supprimer.")
        .setRequired(true)
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

    try {
      const codeValue = interaction.options.getString("code");

      const code = await Code.findOne({
        code: codeValue,
      });

      if (!code) {
        const res = new EmbedBuilder()
          .setTitle("Oups!")
          .setColor("Red")
          .setDescription(ERROR_MESSAGES.CODE_NOT_FOUND)
          .setTimestamp();
        await interaction.reply({ embeds: [res], ephemeral: true });
        return;
      }

      if (code.redeemedBy && code.redeemedBy.username && code.redeemedBy.id) {
        const resConfirm = new EmbedBuilder()
          .setTitle("Oups!")
          .setDescription(
            `Voulez vous vraiment supprimer le code ${codeValue} ?\n\nEcrivez \`!delete ${codeValue}\` pour confirmer.`
          )
          .setColor("Orange")
          .setTimestamp();
        const message = await interaction.reply({
          embeds: [resConfirm],
          ephemeral: true,
        });

        const filter = (msg) =>
          msg.author.id === interaction.user.id &&
          msg.content.toLowerCase === `!delete ${codeValue}`;

        const collector = interaction.channel.createMessageCollector({
          filter,
          time: 10000,
        });

        collector.on("collect", async (msg) => {
          await msg.delete();
          await Code.deleteOne({ _id: code._id });

          const res = new EmbedBuilder()
            .setTitle("Code supprimé!")
            .setDescription(`Le code a été supprimé avec succès.`)
            .setColor("Green")
            .setTimestamp();
          await interaction.reply({ embeds: [res], ephemeral: true });
          return;
        });

        collector.on("end", async (collected) => {
          if (collected.size === 0) {
            const resEnd = new EmbedBuilder()
              .setTitle("Suppression ratée!")
              .setDescription(`Vous n'avez pas fait la confirmation à temps.`)
              .setColor("Red")
              .setTimestamp();
            await interaction.reply({ embeds: [resEnd], ephemeral: true });
          }
        });
      }
    } catch (error) {
      console.error(error);
      const res = new EmbedBuilder()
        .setTitle("Oups!")
        .setColor("Red")
        .setDescription(
          `Une erreur s'est produite. Veuillez réessayer plus tard.`
        )
        .setTimestamp();
      await interaction.reply({ embeds: [res], ephemeral: true });
      return;
    }
  },
};
