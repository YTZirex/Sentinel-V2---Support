const {
  SlashCommandBuilder,
  EmbedBuilder,
  CommandInteraction,
} = require("discord.js");

const { models, Schema } = require("mongoose");
const userPermissionSchema = require("../../Models/UserPermissions");
const BlacklistSchema = require("../../Models/Blacklist");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("sunblacklist")
    .setDescription(
      "[SUPPORT 4] Permet d'enlever la blacklist d'un utilisateur."
    )
    .addUserOption((option) =>
      option
        .setName("utilisateur")
        .setDescription("Utilisateur à modifier.")
        .setRequired(true)
    ),
  async execute(interaction) {
    const target = interaction.options.getUser("utilisateur");

    const userPermsRecord = await userPermissionSchema.findOne({
      user: interaction.user.id,
    });

    if (!userPermsRecord)
      return interaction.reply({
        content: `Vous n'avez pas la permission d'utiliser cette commande.`,
        ephemeral: true,
      });

    const targetBlacklistRecord = await BlacklistSchema.findOne({
      user: target.id,
    });

    if (!targetBlacklistRecord)
      return interaction.reply({
        content: `${target} n'est pas dans la blacklist.`,
        ephemeral: true,
      });

    if (targetBlacklistRecord) {
      if (targetBlacklistRecord.blacklisted == false)
        return interaction.reply({
          content: `${target} n'est pas dans la blacklist.`,
          ephemeral: true,
        });
    }

    if (userPermsRecord) {
      if (userPermsRecord.supportLevel < 4)
        return interaction.reply({
          content: `Vous n'avez pas la permission d'utiliser cette commande.`,
          ephemeral: true,
        });
    }

    if (
      userPermsRecord.supportLevel >= 4 &&
      targetBlacklistRecord.blacklisted == true
    ) {
      BlacklistSchema.findOneAndDelete({
        user: target.id,
      });
      interaction.reply(`✅ ${target} n'est plus dans la blacklist.`);
    }
  },
};
