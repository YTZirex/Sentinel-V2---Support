const {
  SlashCommandBuilder,
  EmbedBuilder,
  CommandInteraction,
} = require("discord.js");
const { model, Schema } = require("mongoose");
const userPermissionSchema = require("../../Models/UserPermissions");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("perm")
    .setDescription(
      "[SUPPORT 4] Permet de changer les permissions d'un utilisateur."
    )
    .addUserOption((option) =>
      option
        .setName("utilisateur")
        .setDescription("Utilisateur à modifier.")
        .setRequired(true)
    )
    .addNumberOption((option) =>
      option
        .setName("niveau")
        .setDescription("Niveau de support de l'utilisateur.")
        .setRequired(true)
        .setMinValue(0)
        .setMaxValue(3)
    ),
  async execute(interaction) {
    const user = interaction.user;
    const target = interaction.options.getUser("utilisateur");
    const niveau = interaction.options.getNumber("niveau");

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
        content: `Vous devez être **Support LVL-4** pour exécuter cette commande.`,
        ephemeral: true,
      });
      return;
    } else if (userRecord.supportLevel < 4) {
      interaction.reply({
        content: `Vous devez être **Support LVL-4** pour exécuter cette commande.`,
        ephemeral: true,
      });
      return;
    } else if (userRecord.supportLevel >= 4) {
      // modifying the target's  permissions
      const targetRecord = await userPermissionSchema.findOne({
        user: target.id,
      });

      if (!targetRecord) {
        const newTargetRecord = new userPermissionSchema({
          user: target.id,
          supportLevel: niveau,
          dev: false,
          star: false,
        });
        await newTargetRecord.save();
        interaction.reply(
          `Successfully set ${target}'s permissions to **Support LVL-${niveau}**.`
        );
        return;
      } else {
        targetRecord.supportLevel = niveau;
        await targetRecord.save();
        interaction.reply(
          `Successfully set ${target}'s permissions to **Support LVL-${niveau}**.`
        );
        return;
      }
    }
  },
};
