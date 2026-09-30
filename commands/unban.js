const {
  SlashCommandBuilder,
  PermissionFlagsBits
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Desbane um usuário do servidor.')
    .addStringOption((option) =>
      option
        .setName('usuario_id')
        .setDescription('O ID do usuário que será desbanido.')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(
      PermissionFlagsBits.BanMembers.toString()
    ),

  async execute(interaction) {
    const userId = interaction.options.getString('usuario_id');

    try {
      // Realiza o desbanimento utilizando o ID do usuário
      await interaction.guild.members.unban(userId);

      await interaction.reply(
        `O usuário com o ID ${userId} foi desbanido com sucesso.`
      );
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: 'Não foi possível desbanir este usuário. Verifique se o ID está correto e se ele realmente está banido.',
        ephemeral: true
      });
    }
  }
};
