const { SlashCommandBuilder, Permissions } = require("discord.js");
const userPermissionSchema = require("../../Models/UserPermissions");
const SupportStatsSchema = require("../../Models/SupportStats");

async function updateSupportStats(userSupportStatsRecord) {
    if (!userSupportStatsRecord) {
      const newUserSupportStatsRecord = new SupportStatsSchema({
        user: interaction.user.id,
        botWarns: 0,
        botKicks: 1,
        botBans: 0,
        botBlacklists: 0,
      });
      await newUserSupportStatsRecord.save();
    } else {
      userSupportStatsRecord.botKicks += 1;
      await userSupportStatsRecord.save();
    }
  }
module.exports = {
  data: new SlashCommandBuilder()
    .setName("skick")
    .setDescription(
      "[SUPPORT 4] Permet d'expulser un utilisateur du Serveur Support."
    )
    .addUserOption((option) =>
      option
        .setName("utilisateur")
        .setDescription("Utilisateur à expulser.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("raison")
        .setDescription("Raison de l'expulsion.")
        .setMaxLength(250)
        .setRequired(true)
    ),
  async execute(interaction) {
    const target = interaction.options.getUser("utilisateur");
    const raison = interaction.options.getString("raison");

    const userPermsRecord = await userPermissionSchema.findOne({
      user: interaction.user.id,
    });

    const targetPermsRecord = await userPermissionSchema.findOne({
      user: target.id,
    });

    if (!userPermsRecord || userPermsRecord.supportLevel < 4) {
      return interaction.reply({
        content: `Vous n'avez pas la permission d'utiliser cette commande.`,
        ephemeral: true,
      });
    }

    if (
      targetPermsRecord &&
      userPermsRecord.supportLevel <= targetPermsRecord.supportLevel
    ) {
      return interaction.reply({
        content: `${target.username} est un Support supérieur ou égal à vous.`,
        ephemeral: true,
      });
    }

    if (
      target.id === "1184763317860958259" ||
      target.id === "1159561550399541288" ||
      target.id === interaction.user.id
    ) {
      return interaction.reply({
        content: `Vous ne pouvez pas expulser cette utilisateur.`,
        ephemeral: true,
      });
    }

    try {
      await interaction.guild.members.kick(target.id, `Expulsion: ${raison}`);
      interaction.reply(`${target.username} a été expulsé pour ${raison}`);
      const userSupportStatsRecord = await SupportStatsSchema.findOne({
        user: interaction.user.id
      });
      updateSupportStats(userSupportStatsRecord);
    } catch (error) {
      console.error(error);
      interaction.reply({
        content: `Une erreur s'est produite lors de l'expulsion de ${target.username}.`,
        ephemeral: true,
      });
    }
  },
};

