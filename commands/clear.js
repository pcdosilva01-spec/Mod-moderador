const {
  SlashCommandBuilder,
  PermissionFlagsBits
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Apaga uma quantidade específica de mensagens do canal.')
    .addIntegerOption((option) =>
      option
        .setName('quantidade')
        .setDescription('Número de mensagens a apagar (entre 1 e 100).')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)
    )
    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageMessages.toString()
    ),

  async execute(interaction) {
    const quantidade = interaction.options.getInteger('quantidade');

    try {
      // Deleta as mensagens no canal atual (o true ignora mensagens com mais de 2 semanas)
      await interaction.channel.bulkDelete(quantidade, true);

      await interaction.reply({
        content: `Foram apagadas ${quantidade} mensagens com sucesso.`,
        ephemeral: true // Mensagem visível apenas para quem executou o comando
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: 'Ocorreu um erro ao tentar apagar as mensagens. (Lembre-se que o Discord não permite apagar mensagens com mais de 14 dias em massa).',
        ephemeral: true
      });
    }
  }
};
