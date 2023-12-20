const {
    SlashCommandBuilder,
    EmbedBuilder
} = require('discord.js');

const {Code} = require('../../Models/CodeSchema')
const { userPermissions } = require('../../Models/UserPermissions')
const MESSAGES = {
    USER_NOT_PREMIUM: `L'utilisateur n'est pas un membre Sentinel Premium.`
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('premium-status')
        .setDescription('[SUPPORT 1] Permet de voir si un membre possède un statut Sentinel Premium.')
        .addUserOption((option) =>
            option
                .setName('utilisateur')
                .setDescription('Utilisateur à vérifier.')
                .setRequired(true)
        ),
    async execute(interaction) {

        const userPermsRecord = await userPermissions.findOne({
            user: interaction.user.id,
          });
      
          if (!userPermsRecord)
            return interaction.reply({
              content: `Vous n'avez pas la permission d'utiliser cette commande.`,
              ephemeral: true,
            });
      
          if (userPermsRecord.supportLevel < 1)
            return interaction.reply({
              content: `Vous n'avez pas la permission d'utiliser cette commande.`,
              ephemeral: true,
            });

        const targetUserId = interaction.options.getUser('utilisateur')?.id || interaction.user.id;

        const code = await Code.findOne({ "redeemedBy.id": targetUserId });

        if (!code) {
            const embed = new EmbedBuilder()
                .setDescription(MESSAGES.USER_NOT_PREMIUM)
                .setColor('Red')
                .setTitle('Oups!')
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }

        const activatedOn = `<t:${Math.floor(code.redeemedOn.getTime() / 1000)}:R>`;
        const expiresAt = `<t:${Math.floor(code.expiresAt.getTime() / 1000)}:R>`;

        const res = new EmbedBuilder()
            .setColor('Green')
            .setDescription(`L'utilisateur <@${targetUserId}> est actuellement un membre Sentinel Premium.`)
            .addFields(
                {
                    name: 'Code',
                    value: code.code,
                    inline: true
                },
                {
                    name: 'Activé le:',
                    value: activatedOn,
                    inline: true
                },
                {
                    name: 'Expire le:',
                    value: expiresAt,
                    inline: true
                }
            )
            .setTimestamp();
        await interaction.reply({ embeds: [res], ephemeral: true });
        
    }
}