const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const userPermissionSchema = require("../../Models/UserPermissions");
const BlacklistSchema = require("../../Models/Blacklist");
const SupportStatsSchema = require("../../Models/SupportStats");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("sblacklist")
    .setDescription("[SUPPORT 4] Permet de blacklist un utilisateur.")
    .addUserOption((option) =>
      option
        .setName("utilisateur")
        .setDescription("Utilisateur à blacklist.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("raison")
        .setDescription("Raison du blacklist.")
        .setRequired(true)
    ),
  async execute(interaction) {
    const target = interaction.options.getUser("utilisateur");
    const raison = interaction.options.getString("raison");

    const userPermsRecord = await userPermissionSchema.findOne({
      user: interaction.user.id,
    });

    const userSupportStatsRecord = await SupportStatsSchema.findOne({
      user: interaction.user.id,
    });

    if (!userPermsRecord || userPermsRecord.supportLevel < 4) {
      return interaction.reply({
        content: `Vous n'avez pas la permission d'utiliser cette commande.`,
        ephemeral: true,
      });
    }

    const targetPermsRecord = await userPermissionSchema.findOne({
      user: target.id,
    });

    if (targetPermsRecord && targetPermsRecord.supportLevel >= 4) {
      return interaction.reply({
        content: `${target} est un Support supérieur ou égal à vous.`,
        ephemeral: true,
      });
    }

    const targetBlacklistRecord = await BlacklistSchema.findOne({
      user: target.id,
    });

    if (targetBlacklistRecord) {
      if (targetBlacklistRecord.blacklisted == true)
        return interaction.reply({
          content: `${target} est déjà blacklist par <@${targetBlacklistRecord.author}>.\n**Raison:** ${targetBlacklistRecord.blacklistReason}.`,
          ephemeral: true,
        });
    }

    if (!targetBlacklistRecord) {
      const newTargetBlacklistRecord = new BlacklistSchema({
        user: target.id,
        blacklisted: true,
        blacklistReason: raison,
        author: interaction.user.id,
      });
      await newTargetBlacklistRecord.save();

      // Send embed in the specific channel with ID "YOUR_ID"
      const channelId = "1185963458966073517";
      const channel = await interaction.client.channels.fetch(channelId);
      if (channel) {
        const res = new EmbedBuilder()
          .setTitle("🛡️ Ajout à la blacklist")
          .addFields(
            {
              name: '\u200a',
              value: '\u200a'
            },
            {
              name: "**👤 Utilisateur :**",
              value: target.username,
            },
            {
              name: "**💭 Raison : **",
              value: raison,
            },
            {
              name: "**🛠️ Modérateur : **",
              value: interaction.user.username,
            }
          )
          .setThumbnail(target.displayAvatarURL())
          .setTimestamp();

        channel.send({ embeds: [res] });
      }

      updateSupportStats(userSupportStatsRecord);

      return interaction.reply(`${target} est désormais blacklist.`);
    } else {
      targetBlacklistRecord.user = target.id;
      targetBlacklistRecord.blacklisted = true;
      targetBlacklistRecord.blacklistReason = raison;
      targetBlacklistRecord.author = interaction.user.id;
      await targetBlacklistRecord.save();

      // Send embed in the specific channel with ID "YOUR_ID"
      const channelId = "1185963458966073517";
      const channel = await interaction.client.channels.fetch(channelId);
      if (channel) {
        const res = new EmbedBuilder()
          .setTitle("🛡️ Ajout à la blacklist")
          .addFields(
            {
              name: '\u200a',
              value: '\u200a'
            },
            {
              name: "**👤 Utilisateur :**",
              value: target.username,
            },
            {
              name: "**💭 Raison : **",
              value: raison,
            },
            {
              name: "**🛠️ Modérateur : **",
              value: interaction.user.username,
            }
          )
          .setThumbnail(target.displayAvatarURL())
          .setTimestamp();

        channel.send({ embeds: [res] });
      }

      updateSupportStats(userSupportStatsRecord);

      return interaction.reply(`${target} est désormais blacklist.`);
    }
  },
};

async function updateSupportStats(userSupportStatsRecord) {
  if (!userSupportStatsRecord) {
    const newUserSupportStatsRecord = new SupportStatsSchema({
      user: interaction.user.id,
      botWarns: 0,
      botKicks: 0,
      botBans: 0,
      botBlacklists: 1,
    });
    await newUserSupportStatsRecord.save();
  } else {
    userSupportStatsRecord.botBlacklists += 1;
    await userSupportStatsRecord.save();
  }
}
