const {
  EmbedBuilder,
  SlashCommandBuilder,
  CommandInteraction,
} = require("discord.js");

const { models, Schema } = require("mongoose");
const userPermissionSchema = require("../../Models/UserPermissions");
const maxPermSchema = require("../../Models/maxPerm");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("me")
    .setDescription("Permet de voir vos accès à nos services."),
  async execute(interaction) {
    const userStats = {};

    const userPermsRecord = await userPermissionSchema.findOne({
      user: interaction.user.id,
    });
    const userMaxPermRecord = await maxPermSchema.findOne({
      user: interaction.user.id,
    });

    if (!userPermsRecord) {
      const newUserPermsRecord = new userPermissionSchema({
        user: interaction.user.id,
        supportLevel: 0,
        dev: false,
        star: false,
      });
      await newUserPermsRecord.save();
      userStats["supportLevel"] = newUserPermsRecord.supportLevel;
      userStats["dev"] = newUserPermsRecord.dev;
      userStats["star"] = newUserPermsRecord.star;
    } else {
      userStats["supportLevel"] = userPermsRecord.supportLevel;
      userStats["dev"] = userPermsRecord.dev;
      userStats["star"] = userPermsRecord.star;
    }

    if (!userMaxPermRecord) {
      const newUserMaxPermRecord = new maxPermSchema({
        user: interaction.user.id,
        maxPerm: false,
      });
      await newUserMaxPermRecord.save();
      userStats["maxPerm"] = newUserMaxPermRecord.maxPerm;
    } else {
      userStats["maxPerm"] = userMaxPermRecord.maxPerm;
    }

    const supportStatsSchema = require("../../Models/SupportStats");
    const userSupportStatsRecord = await supportStatsSchema.findOne({
      user: interaction.user.id,
    });

    if (!userSupportStatsRecord) {
      const newUserSupportStatsRecord = new supportStatsSchema({
        user: interaction.user.id,
        botWarns: 0,
        botKicks: 0,
        botBans: 0,
        botBlacklists: 0,
      });
      await newUserSupportStatsRecord.save();
      userStats["botWarns"] = 0; // nombre de warns mit avec le bot support
      userStats["botKicks"] = 0; // nombre de bans mit avec le bot support
      userStats["botBans"] = 0; // nombre de kicks mit avec le bot support
      userStats["botBlacklists"] = 0; // nombre de blacklists mit avec le bot support
    } else {
      userStats["botWarns"] = userSupportStatsRecord.botWarns;
      userStats["botKicks"] = userSupportStatsRecord.botKicks;
      userStats["botBans"] = userSupportStatsRecord.botBans;
      userStats["botBlacklists"] = userSupportStatsRecord.botBlacklists;
    }

    const accountCreatedTimestamp = Math.round(
      interaction.user.createdTimestamp / 1000
    );
    const guildMember = await interaction.guild.members.fetch(
      interaction.user.id
    );
    const accountJoinedTimestamp = Math.round(
      guildMember.joinedTimestamp / 1000
    );

    switch (userStats["dev"]) {
      case false:
        userStats["dev"] = "❌";
        break;
      case true:
        userStats["dev"] = "✅";
        break;
    }

    switch (userStats["star"]) {
      case false:
        userStats["star"] = "❌";
        break;
      case true:
        userStats["star"] = "✅";
        break;
    }

    switch (userStats["maxPerm"]) {
      case false:
        userStats["maxPerm"] = "❌";
        break;
      case true:
        userStats["maxPerm"] = "✅";
        break;
    }

    const res = new EmbedBuilder()
      .setTitle("Mes informations")
      .addFields(
        {
          name: "\u200b",
          value: "**👤 Utilisateur : **",
          inline: false,
        },
        {
          name: "\u200a",
          value: "\u200a",
          inline: false,
        },
        {
          name: "Prénom : ",
          value: interaction.user.username,
          inline: true,
        },
        {
          name: "Identifiant : ",
          value: interaction.user.id,
          inline: true,
        },
        {
          name: "Compte créé le :",
          value: `<t:${accountCreatedTimestamp}:F>`,
          inline: true,
        },
        {
          name: "Serveur rejoint le :",
          value: `<t:${accountJoinedTimestamp}:F>`,
          inline: true,
        },
        {
          name: "\u200b",
          value: "**🪪 Permissions:**",
          inline: false,
        },
        {
          name: "\u200a",
          value: "\u200a",
        },
        {
          name: "Niveau de Support : ",
          value: `**Support LVL-${userStats["supportLevel"]}**`,
          inline: true,
        },
        {
          name: "Permission **Développeur** : ",
          value: `${userStats["dev"]}`,
          inline: true,
        },
        {
          name: "Permission **\u00C9toiles** : ",
          value: `${userStats["star"]}`,
          inline: true,
        },
        {
          name: "Permission **Sentinel** : ",
          value: `${userStats["maxPerm"]}`,
          inline: true,
        },
        {
          name: "\u200b",
          value: "**📁 Sanctions : **",
          inline: false,
        },
        {
          name: "\u200a",
          value: "\u200a",
          inline: false,
        },
        {
          name: "Avertissements effectués : ",
          value: `**${userStats["botWarns"]}** avertissements.`,
          inline: true,
        },
        {
          name: "Expulsions effectuées : ",
          value: `**${userStats["botKicks"]}** expulsions.`,
          inline: true,
        },
        {
          name: "Banissements effectués : ",
          value: `**${userStats["botBans"]}** banissements.`,
          inline: true,
        },
        {
          name: "Blacklists effectuées : ",
          value: `**${userStats["botBlacklists"]}** blacklists.`,
          inline: true,
        }
      )
      .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setColor("Blurple");
    interaction.reply({ embeds: [res] });
  },
};
