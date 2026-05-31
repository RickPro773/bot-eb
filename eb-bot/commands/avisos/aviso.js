const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { embedAviso } = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('aviso')
    .setDescription('📢 Emite um aviso oficial no servidor')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addStringOption(opt =>
      opt.setName('tipo')
        .setDescription('Tipo do aviso')
        .setRequired(true)
        .addChoices(
          { name: '🚨 Urgente',   value: 'urgente' },
          { name: '⚔️ Operação',  value: 'operacao' },
          { name: '🎯 Treino',    value: 'treino' },
          { name: '📋 Reunião',   value: 'reuniao' },
          { name: '🫡 Formatura', value: 'formatura' },
          { name: '📢 Geral',     value: 'geral' },
        )
    )
    .addStringOption(opt =>
      opt.setName('mensagem')
        .setDescription('Conteúdo do aviso')
        .setRequired(true)
    )
    .addChannelOption(opt =>
      opt.setName('canal')
        .setDescription('Canal para enviar (deixe vazio para o atual)')
        .setRequired(false)
    )
    .addRoleOption(opt =>
      opt.setName('marcar')
        .setDescription('Cargo para marcar no aviso')
        .setRequired(false)
    ),

  async execute(interaction) {
    const tipo = interaction.options.getString('tipo');
    const mensagem = interaction.options.getString('mensagem');
    const canal = interaction.options.getChannel('canal') || interaction.channel;
    const cargo = interaction.options.getRole('marcar');

    const embed = embedAviso(tipo, mensagem, `${interaction.user}`);

    const mencao = cargo ? `${cargo}` : '';
    await canal.send({ content: mencao, embeds: [embed] });

    await interaction.reply({ content: `✅ Aviso enviado em ${canal}!`, ephemeral: true });
  },
};
