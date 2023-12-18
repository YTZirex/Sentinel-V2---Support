const {
  SlashCommandBuilder,
  EmbedBuilder,
  CommandInteraction,
} = require("discord.js");

const { models, Schema } = require("mongoose");
const userPermissionSchema = require("../../Models/UserPermissions");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("add")
    .setDescription("[ÉTOILES] Permet d'ajouter un Support.")
    .addUserOption((option) =>
      option
        .setName("utilisateur")
        .setDescription("Utilisateur à ajouter.")
        .setRequired(true)
    ),
  async execute(interaction) {
    const target = interaction.options.getUser("utilisateur");
    const userPermsRecord = await userPermissionSchema.findOne({
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
      interaction.reply({
        content: `Vous n'avez pas la permission d'utiliser cette commande.`,
        ephemeral: true,
      });
      return;
    } else {
      if (userPermsRecord.star == false) {
        interaction.reply({
          content: `Vous n'avez pas la permission d'utiliser cette commande.`,
          ephemeral: true,
        });
        return;
      } else {
        const targetPermsRecord = await userPermissionSchema.findOne({
          user: target.id,
        });

        if (!targetPermsRecord) {
          const newTargetPermsRecord = new userPermissionSchema({
            user: target.id,
            supportLevel: 1,
            dev: false,
            star: false,
          });
          await newTargetPermsRecord.save();
          interaction.reply({
            content: `${target} est maintenant **Support LVL-1**.`,
            ephemeral: false,
          });
          return;
        } else {
          if (targetPermsRecord == 0) {
            targetPermsRecord.supportLevel = 1;
            await targetPermsRecord.save();
            interaction.reply({
              content: `${target} est maintenant **Support LVL-1**.`,
              ephemeral: false,
            });
            return;
          } else {
            interaction.reply(`${target} est déjà **Support LVL-${targetPermsRecord.supportLevel}**.`)
            return;
          }
        }
      }
    }
  },
};
