const {
  SlashCommandBuilder,
  PermissionFlagsBits
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Bane um membro do servidor.')
    .addUserOption((option) =>
      option
        .setName('usuario')
        .setDescription('Usuário que será banido.')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(
      PermissionFlagsBits.BanMembers.toString()
    ),

  async execute(interaction) {
    const usuario = interaction.options.getUser('usuario');

    await interaction.reply(
      `O comando de banimento foi reconhecido para ${usuario}.`
    );
  }
};
