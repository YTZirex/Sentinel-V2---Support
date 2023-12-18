const {
  SlashCommandBuilder,
  EmbedBuilder,
  CommandInteraction,
} = require("discord.js");
const { models, Schema } = require("mongoose");
const WarnsList = require("../../Models/WarnsList");
const UserPermissions = require("../../Models/UserPermissions");
const SupportStats = require("../../Models/SupportStats");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("swarn")
    .setDescription("[SUPPORT 2] Permet de sanctionner un utilisateur.")
    .addUserOption((option) =>
      option
        .setName("utilisateur")
        .setDescription("Utilisateur à avertir.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("raison")
        .setDescription("Raison de l'avertissement.")
        .setRequired(true)
    ),
  async execute(interaction) {
    const target = interaction.options.getUser("utilisateur");
    const raison = interaction.options.getString("raison");

    const userPermsRecord = await UserPermissions.findOne({
      user: interaction.user.id,
    });

    if (!userPermsRecord)
      return interaction.reply({
        content: `Vous n'avez pas la permission d'utiliser cette commande.`,
        ephemeral: true,
      });

    if (userPermsRecord.supportLevel < 2)
      return interaction.reply({
        content: `Vous n'avez pas la permission d'utiliser cette commande.`,
        ephemeral: true,
      });

    const targetPermsRecord = await UserPermissions.findOne({
      user: target.id,
    });

    if (targetPermsRecord) {
      if (userPermsRecord.supportLevel <= targetPermsRecord.supportLevel)
        return interaction.reply({
          content: `${target} est un Support supérieur ou égal à vous.`,
          ephemeral: true,
        });
    }

    const userSupportStatsRecord = await SupportStats.findOne({
      user: interaction.user.id,
    });

    if (!userSupportStatsRecord) {
      const newUserSupportStatsRecord = new SupportStats({
        user: interaction.user.id,
        botWarns: 0,
        botKicks: 0,
        botBans: 0,
        botBlacklists: 0,
      });
      await newUserSupportStatsRecord.save();
    }

    // Find or create WarnsList document for the target user
    let targetWarnsRecord = await WarnsList.findOne({ user: target.id });
    if (!targetWarnsRecord) {
      targetWarnsRecord = new WarnsList({
        user: target.id,
        warns: new Map(),
      });
    }

    // Find the highest warn number
    const warnNumbers = Array.from(targetWarnsRecord.warns.keys());
    const highestWarn = warnNumbers.length > 0 ? Math.max(...warnNumbers) : 0;

    // Create a new warn with the next number
    const nextWarnNumber = highestWarn + 1;
    targetWarnsRecord.warns.set(nextWarnNumber.toString(), {
      reason: raison,
      author: interaction.user.id,
    });

    // Save the updated WarnsList document
    await targetWarnsRecord.save();
    interaction.reply(
      `J'ai averti ${target} pour la raison suivante : **${raison}**.`
    );
    const updatedUserSupportStatsRecord = await SupportStats.findOne({
      user: interaction.user.id
    })
    updatedUserSupportStatsRecord.botWarns += 1;
    await updatedUserSupportStatsRecord.save();
  },
};
