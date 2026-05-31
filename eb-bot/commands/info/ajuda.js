const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ajuda')
    .setDescription('📖 Mostra todos os comandos disponíveis'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(0x2E7D32)
      .setTitle('📖 MANUAL DE COMANDOS — EXÉRCITO BRASILEIRO BOT')
      .setDescription('Lista completa de comandos disponíveis:')
      .addFields(
        {
          name: '📢 Avisos',
          value: [
            '`/aviso` — Emite aviso oficial (urgente, operação, treino, reunião, formatura, geral)',
          ].join('\n'),
        },
        {
          name: '⚔️ Militar',
          value: [
            '`/operacao criar` — Cria uma operação militar',
            '`/operacao listar` — Lista operações ativas',
            '`/operacao encerrar` — Encerra uma operação',
            '`/treino agendar` — Agenda um treino/exercício',
            '`/treino listar` — Lista treinos agendados',
            '`/posto promover` — Promove um membro',
            '`/posto ver` — Vê posto de um membro',
            '`/posto lista` — Lista hierarquia completa',
          ].join('\n'),
        },
        {
          name: '⚖️ Moderação',
          value: [
            '`/punicao aplicar` — Aplica punição disciplinar',
            '`/punicao historico` — Histórico de punições',
          ].join('\n'),
        },
        {
          name: '⚙️ Administração',
          value: [
            '`/config boas-vindas` — Define canal de boas-vindas',
            '`/config cargo-recruta` — Define cargo automático',
            '`/config log` — Define canal de logs',
            '`/config ver` — Mostra configurações',
          ].join('\n'),
        },
      )
      .setFooter({ text: '⚔️ Exército Brasileiro — Ordem, Disciplina e Patriotismo' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
