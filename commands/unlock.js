const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unlock')
    .setDescription('Desbloqueia o canal atual.')
    .addStringOption((option) =>
      option
        .setName('motivo')
        .setDescription('Motivo do desbloqueio do canal.')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageChannels.toString()
    ),

  async execute(interaction) {
    const channel = interaction.channel;
    const motivo = interaction.options.getString('motivo') || 'Nenhum motivo informado.';
    const moderador = interaction.user;

    try {
      // Restaura a permissão de enviar mensagens para o @everyone
      await channel.permissionOverwrites.edit(interaction.guild.id, {
        SendMessages: null
      });

      // Cria a embed de canal desbloqueado
      const embed = new EmbedBuilder()
        .setColor('#57f287') // Cor verde para indicar sucesso/abertura
        .setTitle('🔓 Canal Desbloqueado')
        .addFields(
          { name: '👮‍♂️ Moderador', value: `${moderador}`, inline: false },
          { name: '📢 Canal', value: `${channel}`, inline: false },
          { name: '📝 Motivo', value: motivo, inline: false }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: 'Ocorreu um erro ao tentar desbloquear este canal.',
        ephemeral: true
      });
    }
  }
};
