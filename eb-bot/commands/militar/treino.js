const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { readDB, writeDB } = require('../../utils/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('treino')
    .setDescription('🎯 Gerencia treinos e exercícios militares')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents)
    .addSubcommand(sub =>
      sub.setName('agendar')
        .setDescription('Agenda um treino')
        .addStringOption(o => o.setName('nome').setDescription('Nome do treino').setRequired(true))
        .addStringOption(o => o.setName('data').setDescription('Data e hora').setRequired(true))
        .addStringOption(o => o.setName('descricao').setDescription('Descrição do treino').setRequired(true))
        .addStringOption(o =>
          o.setName('modalidade').setDescription('Modalidade').setRequired(true)
            .addChoices(
              { name: '🔫 Combate', value: 'combate' },
              { name: '🏃 Físico', value: 'fisico' },
              { name: '🗺️ Tática', value: 'tatica' },
              { name: '🚗 Condução', value: 'conducao' },
              { name: '💊 Primeiros Socorros', value: 'primeiros_socorros' },
              { name: '📡 Comunicações', value: 'comunicacoes' },
            )
        )
    )
    .addSubcommand(sub =>
      sub.setName('listar')
        .setDescription('Lista treinos agendados')
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const db = readDB('treinos');
    if (!db[interaction.guild.id]) db[interaction.guild.id] = {};

    const modalidadeEmoji = {
      combate: '🔫', fisico: '🏃', tatica: '🗺️',
      conducao: '🚗', primeiros_socorros: '💊', comunicacoes: '📡',
    };

    if (sub === 'agendar') {
      const nome = interaction.options.getString('nome');
      const data = interaction.options.getString('data');
      const descricao = interaction.options.getString('descricao');
      const modalidade = interaction.options.getString('modalidade');
      const id = Date.now().toString();

      db[interaction.guild.id][id] = {
        nome, data, descricao, modalidade,
        confirmados: [],
        instrutor: interaction.user.tag,
        ativo: true,
      };
      writeDB('treinos', db);

      const embed = new EmbedBuilder()
        .setColor(0x1565C0)
        .setTitle(`${modalidadeEmoji[modalidade]} TREINO: ${nome.toUpperCase()}`)
        .setDescription(`**📋 Descrição:**\n${descricao}`)
        .addFields(
          { name: '📅 Data/Hora', value: data, inline: true },
          { name: '🏷️ Modalidade', value: modalidade, inline: true },
          { name: '👨‍🏫 Instrutor', value: interaction.user.toString(), inline: true },
          { name: '✅ Confirmados', value: '0', inline: true },
          { name: '🆔 ID', value: `\`${id}\``, inline: true },
        )
        .setFooter({ text: '⚔️ Clique para confirmar presença no treino' })
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`treino_confirmar_${id}`).setLabel('✅ Confirmar').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId(`treino_cancelar_${id}`).setLabel('❌ Cancelar').setStyle(ButtonStyle.Danger),
      );

      await interaction.reply({ embeds: [embed], components: [row] });

    } else if (sub === 'listar') {
      const treinos = Object.entries(db[interaction.guild.id] || {}).filter(([, t]) => t.ativo);

      if (!treinos.length) {
        return interaction.reply({ content: '📭 Nenhum treino agendado.', ephemeral: true });
      }

      const embed = new EmbedBuilder()
        .setColor(0x1565C0)
        .setTitle('📋 TREINOS AGENDADOS')
        .setDescription(treinos.map(([id, t]) =>
          `${modalidadeEmoji[t.modalidade]} **${t.nome}** — 📅 ${t.data} — ✅ ${t.confirmados.length} confirmados`
        ).join('\n\n'))
        .setFooter({ text: '⚔️ Exército Brasileiro — Servidor MilSim' })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    }
  },
};
