const {
  SlashCommandBuilder,
  PermissionFlagsBits
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('Coloca um membro em timeout temporariamente.')
    .addUserOption((option) =>
      option
        .setName('usuario')
        .setDescription('Membro que receberá o timeout.')
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName('minutos')
        .setDescription('Duração do timeout em minutos.')
        .setMinValue(1)
        .setMaxValue(40320)
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('motivo')
        .setDescription('Motivo da punição.')
        .setMaxLength(500)
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers.toString()),

  async execute(interaction) {
    if (!interaction.guild) {
      return interaction.reply({
        content: '❌ Este comando só pode ser usado dentro de um servidor.',
        ephemeral: true
      });
    }

    const user = interaction.options.getUser('usuario');
    const minutes = interaction.options.getInteger('minutos');
    const reason = interaction.options.getString('motivo') || 'Nenhum motivo informado.';
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);

    if (!member) {
      return interaction.reply({
        content: '❌ Esse usuário não é membro deste servidor.',
        ephemeral: true
      });
    }

    if (member.id === interaction.user.id) {
      return interaction.reply({
        content: '❌ Você não pode aplicar timeout em si mesmo.',
        ephemeral: true
      });
    }

    if (!member.moderatable) {
      return interaction.reply({
        content: '❌ Não posso aplicar timeout nesse membro. Verifique a hierarquia dos cargos e minhas permissões.',
        ephemeral: true
      });
    }

    try {
      await member.timeout(minutes * 60 * 1000, `${reason} | Aplicado por ${interaction.user.tag}`);
      return interaction.reply({
        content: `✅ ${member} recebeu timeout por **${minutes} minuto(s)**.\n**Motivo:** ${reason}`
      });
    } catch (error) {
      console.error('Erro no comando timeout:', error);
      return interaction.reply({
        content: '❌ Não foi possível aplicar o timeout. Verifique se o bot possui a permissão **Moderar Membros**.',
        ephemeral: true
      });
    }
  }
};
