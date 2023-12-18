const {
  SlashCommandBuilder,
  EmbedBuilder,
  CommandInteraction,
} = require("discord.js");

const { models, Schema } = require("mongoose");
const userPermissionSchema = require("../../Models/UserPermissions");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("dev")
    .setDescription(
      `[ÉTOILES] Permet d'ajouter un utilisateur dans la liste de développement.`
    )
    .addUserOption((option) =>
      option
        .setName("utilisateur")
        .setDescription("Utilisateur à modifier.")
        .setRequired(true)
    ),
  async execute(interaction) {
    const target = interaction.options.getUser("utilisateur");
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
      if (userRecord.star == false) {
        interaction.reply({
          content: `Vous n'avez pas la permission d'exécuter cette commande.`,
          ephemeral: true,
        });
        return;
      } else {
        const targetRecord = await userPermissionSchema.findOne({
          user: target.id,
        });

        if (!targetRecord) {
          const newTargetRecord = new userPermissionSchema({
            user: target.id,
            supportLevel: 0,
            dev: true,
            star: false,
          });
          await newTargetRecord.save();
          interaction.reply({
            content: `${target} a maintenant les permissions **Développeur**.`,
            ephemeral: false,
          });
          return;
        } else {
          targetRecord.dev = true;
          targetRecord.save();
          interaction.reply({
            content: `${target} a maintenant les permissions **Développeur**.`,
            ephemeral: false,
          });
          return;
        }
      }
    }
  },
};
