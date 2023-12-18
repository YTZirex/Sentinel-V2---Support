const {
  SlashCommandBuilder,
  EmbedBuilder,
  CommandInteraction,
} = require("discord.js");

const { models, Schema } = require("mongoose");
const userPermissionSchema = require("../../Models/UserPermissions");
const maxPermSchema = require("../../Models/maxPerm");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("star")
    .setDescription(
      `[MAX] Permet de mettre les permissions \u00C9toiles à un utilisateur.`
    )
    .addUserOption((option) =>
      option
        .setName("utilisateur")
        .setDescription("Utilisateur à modifier.")
        .setRequired(true)
    ),
  async execute(interaction) {
    const target = interaction.options.getUser("utilisateur");
    const user = interaction.user;
    const userMaxPermRecord = await maxPermSchema.findOne({
      user: user.id,
    });
    const userPermsRecord = await userPermissionSchema.findOne({
      user: user.id,
    });

    if (!userMaxPermRecord) {
      const newUserMaxPermRecord = new maxPermSchema({
        user: user.id,
        maxPerm: false,
      });
      await newUserMaxPermRecord.save();
      interaction.reply({
        content: `Vous n'avez pas la permission d'exécuter cette commande.`,
        ephemeral: true,
      });
      return;
    } else {
      if (userMaxPermRecord.maxPerm == true) {
        const targetPermsRecord = await userPermissionSchema.findOne({
          user: target.id,
        });

        if (!targetPermsRecord) {
          const newTargetPermsRecord = new userPermissionSchema({
            user: target.id,
            supportLevel: 0,
            dev: false,
            star: true,
          });
          await newTargetPermsRecord.save();
          interaction.reply({
            content: `${target} a maintenant les permissions **\u00C9toiles**.`,
            ephemeral: false,
          });
          return;
        } else {
          targetPermsRecord.star = true;
          targetPermsRecord.save();
          interaction.reply({
            content: `${target} a maintenant les permissions **\u00C9toiles**.`,
            ephemeral: false,
          });
          return;
        }
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
