const {
  SlashCommandBuilder,
  EmbedBuilder,
  CommandInteraction,
} = require("discord.js");

const { models, Schema } = require("mongoose");
const userPermissionSchema = require("../../Models/UserPermissions");
const SupportStatsSchema = require("../../Models/SupportStats");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("remove")
    .setDescription("[ÉTOILES] Permet d'enlever les permissions d'un Support.")
    .addUserOption((option) =>
      option
        .setName("support")
        .setDescription("Support à retirer.")
        .setRequired(true)
    ),
  async execute(interaction) {
    const target = interaction.options.getUser("support");
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
        content: `Vous n'avez pas la permission d'utiliser cette commande.`,
        ephemeral: true,
      });
      return;
    } else {
      if (userRecord.supportLevel < 4) {
        interaction.reply({
          content: `Vous n'avez pas la permission d'utiliser cette commande.`,
          ephemeral: true,
        });
        return;
      } else if (userRecord.supportLevel >= 4) {
        const targetRecord = await userPermissionSchema.findOne({
          user: target.id,
        });

        if (!targetRecord) {
          interaction.reply({
            content: `${target} n'est pas un Support.`,
            ephemeral: true,
          });
          return;
        } else {
          if (
            targetRecord.supportLevel >= 4 ||
            targetRecord.dev == true ||
            targetRecord.star == true
          ) {
            interaction.reply({
              content: `${target} a des permissions trop hautes. Veuillez enlever le Support via la base de donnée directe. (Contactez ofb.official)`,
              ephemeral: true,
            });
            return;
          } else {
            try {
              await userPermissionSchema.findOneAndDelete({ user: target.id });
              await SupportStatsSchema.findOneAndDelete({ user: target.id });
              interaction.reply(
                `${target} a été enlevé de la liste des Supports.`
              );
            } catch (err) {
              interaction.reply({
                content: `Error while deleting Support. Please contact ofb.official.`,
                ephemeral: true,
              });
              console.log(err);
            }
          }
        }
      }
    }
  },
};
