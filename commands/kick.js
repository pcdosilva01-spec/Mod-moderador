const {
  SlashCommandBuilder,
  PermissionFlagsBits
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kica Um Membro do Servidor!')
    .addUserOption((option) =>
      option
        .setName('usuario')
        .setDescription('Usuário que será expulso.')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('motivo')
        .setDescription('Motivo da expulsão.')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(
      PermissionFlagsBits.KickMembers.toString()
    ),

  async execute(interaction) {
    const usuarioAlvo = interaction.options.getMember('usuario');
    const motivo = interaction.options.getString('motivo') || 'Nenhum motivo informado.';

    // Verifica se o usuário está no servidor
    if (!usuarioAlvo) {
      return interaction.reply({
        content: 'Não foi possível encontrar este usuário no servidor.',
        ephemeral: true
      });
    }

    // Verifica se o bot tem permissão/hierarquia para expulsar o usuário
    if (!usuarioAlvo.kickable) {
      return interaction.reply({
        content: 'Não consigo expulsar este usuário. Ele pode ter um cargo superior ou igual ao meu/teu.',
        ephemeral: true
      });
    }

    try {
      await usuarioAlvo.kick(motivo);

      await interaction.reply(
        `O usuário ${usuarioAlvo.user.tag} foi expulso com sucesso. Motivo: ${motivo}`
      );
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: 'Ocorreu um erro ao tentar expulsar este usuário.',
        ephemeral: true
      });
    }
  }
};
