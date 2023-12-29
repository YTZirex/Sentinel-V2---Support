const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const EconomySchema = require("../../Models/Economy");
const userPermissionSchema = require("../../Models/UserPermissions");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("gestion-compte")
    .setDescription(
      `[SUPPORT] Permet de gérer le compte bancaire d'un utilisateur.`
    )
    .addUserOption((option) =>
      option
        .setName("utilisateur")
        .setDescription(`Utilisateur à modifier.`)
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("action")
        .setDescription(`L'action que vous voulez réaliser sur le compte.`)
        .setRequired(true)
        .addChoices(
          {
            name: "[SUPPORT 1] Voir",
            value: `view.`,
          },
          {
            name: "[SUPPORT 3] Suppression",
            value: `delete.`,
          }
        )
    ),
  async execute(interaction, client) {
    const user = interaction.user;
    const target = interaction.options.getUser("utilisateur");

    const targetEconomy = await EconomySchema.findOne({
      user: target.id,
    });

    const userPermsRecord = await userPermissionSchema.findOne({
      user: user.id,
    });

    const targetPermsRecord = await userPermissionSchema.findOne({
      user: target.id,
    });

    const resFail = new EmbedBuilder().setColor("Red");
    const resSuccess = new EmbedBuilder().setColor("Green");

    const chosenAction = interaction.options.getString(`action`);

    if (chosenAction == "view") {
      if (!userPermsRecord) {
        resFail.setTitle(
          `Vous n'avez pas la permission d'exécuter cette commmande.`
        );
        await interaction.reply({
          embeds: [resFail],
          ephemeral: true,
        });
        return;
      }

      if (userPermsRecord.supportLevel < 1) {
        resFail.setTitle(
          `Vous n'avez pas la permission d'exécuter cette commmande.`
        );
        await interaction.reply({
          embeds: [resFail],
          ephemeral: true,
        });
        return;
      }

      if (targetPermsRecord) {
        if (targetPermsRecord.supportLevel >= userPermsRecord.supportLevel) {
          resFail.setTitle(
            `${target} est un support supérieur ou égal à vous..`
          );
          await interaction.reply({
            embeds: [resFail],
            ephemeral: true,
          });
          return;
        }
      }

      if (!targetEconomy) {
        resFail.setTitle(`${target} ne possède pas de compte bancaire.`);
        await interaction.reply({
          embeds: [resFail],
          ephemeral: true,
        });
        return;
      }

      const res = new EmbedBuilder()
        .setTitle(`Compte de ${target.user.username}`)
        .addFields(
          {
            name: "👤 **Prénom et Nom :**",
            value: `${targetEconomy.names}`,
          },
          {
            name: "\u200a",
            value: "\u200a",
          },
          {
            name: "👶 **Date de naissance :**",
            value: `${targetEconomy.dateOfBirth}`,
          },
          {
            name: "\u200a",
            value: "\u200a",
          },
          {
            name: "👤 **Sexe :**",
            value: `${targetEconomy.gender}`,
          },
          {
            name: "\u200a",
            value: "\u200a",
          },
          {
            name: "🏦 **Banque : **",
            value: "Zirexium Finance",
          },
          {
            name: "\u200a",
            value: "\u200a",
          },
          {
            name: "💸 **Solde: **",
            value: `${targetEconomy.balance}`,
          },
          {
            name: "\u200a",
            value: "\u200a",
          },
          {
            name: "💳 **Numéro de carte bancaire :**",
            value: `${targetEconomy.creditCardNumber}`,
          },
          {
            name: "\u200a",
            value: "\u200a",
          },
          {
            name: "💳 **Cryptogramme :**",
            value: `${targetEconomy.cvc}`,
          },
          {
            name: "\u200a",
            value: "\u200a",
          },
          {
            name: "💳** Date d'expiration :**",
            value: `${targetEconomy.expirationDate}`,
          }
        )
        .setTimestamp()
        .setThumbnail(target.user.displayAvatarURL());
        await interaction.reply({
            embeds: [res],
            ephemeral: true
        })
        return;
    }
  },
};
