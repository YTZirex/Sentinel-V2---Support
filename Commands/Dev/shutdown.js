const {
  SlashCommandBuilder,
  EmbedBuilder,
  CommandInteraction,
} = require("discord.js");
const { model, Schema } = require("mongoose");
const userPermissionSchema = require("../../Models/UserPermissions");
const sleep = (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports = {
  data: new SlashCommandBuilder()
    .setName("shutdown")
    .setDescription("[DEV] Permet de m'éteindre."),
  async execute(interaction) {
    const userRecord = await userPermissionSchema.findOne({
      user: interaction.user.id,
    });

    if (!userRecord) {
      const newUserRecord = new userPermissionSchema({
        user: interaction.user.id,
        supportLevel: 0,
        dev: false,
        star: false,
      });
      await newUserRecord.save();
      interaction.reply({
        content: `Vous n'avez pas la permission d'exécuter cette commande.`,
        ephemeral: true,
      });
      return;
    } else {
      if (userRecord.dev == true || userRecord.star == true) {
        interaction.reply(`Bonne nuit!`);
        console.log(`${interaction.user.username} m'a éteint !`);
        await sleep(2500);
        await process.exit();
      } else {
        interaction.reply({
          content: `Vous n'avez pas la permission d'exécuter cette commande.`,
          ephemeral: true,
        });
        return;
      }
    }
  },
};
