const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lock')
    .setDescription('Bloqueia o canal atual.')
    .addStringOption((option) =>
      option
        .setName('motivo')
        .setDescription('Motivo do bloqueio do canal.')
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
      // Bloqueia o envio de mensagens para o @everyone no canal atual
      await channel.permissionOverwrites.edit(interaction.guild.id, {
        SendMessages: false
      });

      // Cria a embed baseada na imagem enviada
      const embed = new EmbedBuilder()
        .setColor('#ed4245') // Cor vermelha parecida com a imagem
        .setTitle('🔒 Canal Bloqueado')
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
        content: 'Ocorreu um erro ao tentar bloquear este canal.',
        ephemeral: true
      });
    }
  }
};
