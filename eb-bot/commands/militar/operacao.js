const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { readDB, writeDB } = require('../../utils/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('operacao')
    .setDescription('⚔️ Gerencia operações militares')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents)
    .addSubcommand(sub =>
      sub.setName('criar')
        .setDescription('Cria uma nova operação')
        .addStringOption(o => o.setName('nome').setDescription('Nome da operação').setRequired(true))
        .addStringOption(o => o.setName('descricao').setDescription('Briefing da operação').setRequired(true))
        .addStringOption(o => o.setName('data').setDescription('Data e hora (ex: 15/06 às 20h)').setRequired(true))
        .addStringOption(o => o.setName('tipo').setDescription('Tipo').setRequired(true)
          .addChoices(
            { name: '🔴 Ofensiva', value: 'ofensiva' },
            { name: '🔵 Defensiva', value: 'defensiva' },
            { name: '🟡 Reconhecimento', value: 'reconhecimento' },
            { name: '🟢 Treinamento', value: 'treinamento' },
          ))
        .addIntegerOption(o => o.setName('vagas').setDescription('Número máximo de soldados').setRequired(false))
    )
    .addSubcommand(sub =>
      sub.setName('listar')
        .setDescription('Lista operações ativas')
    )
    .addSubcommand(sub =>
      sub.setName('encerrar')
        .setDescription('Encerra uma operação')
        .addStringOption(o => o.setName('id').setDescription('ID da operação').setRequired(true))
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const db = readDB('operacoes');
    if (!db[interaction.guild.id]) db[interaction.guild.id] = {};

    if (sub === 'criar') {
      const nome = interaction.options.getString('nome');
      const descricao = interaction.options.getString('descricao');
      const data = interaction.options.getString('data');
      const tipo = interaction.options.getString('tipo');
      const vagas = interaction.options.getInteger('vagas') || 0;
      const id = Date.now().toString();

      const tipoEmoji = { ofensiva: '🔴', defensiva: '🔵', reconhecimento: '🟡', treinamento: '🟢' };

      db[interaction.guild.id][id] = {
        nome, descricao, data, tipo, vagas,
        confirmados: [],
        criador: interaction.user.tag,
        ativa: true,
        timestamp: Date.now(),
      };
      writeDB('operacoes', db);

      const embed = new EmbedBuilder()
        .setColor(0x2E7D32)
        .setTitle(`${tipoEmoji[tipo]} OPERAÇÃO: ${nome.toUpperCase()}`)
        .setDescription(`**📋 Briefing:**\n${descricao}`)
        .addFields(
          { name: '📅 Data/Hora', value: data, inline: true },
          { name: '⚔️ Tipo', value: tipo.charAt(0).toUpperCase() + tipo.slice(1), inline: true },
          { name: '👥 Vagas', value: vagas > 0 ? `${vagas}` : 'Ilimitado', inline: true },
          { name: '🎖️ Comandante', value: interaction.user.toString(), inline: true },
          { name: '🆔 ID', value: `\`${id}\``, inline: true },
          { name: '✅ Confirmados', value: '0', inline: true },
        )
        .setFooter({ text: '⚔️ Exército Brasileiro — Clique no botão para confirmar presença' })
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`op_confirmar_${id}`).setLabel('✅ Confirmar Presença').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId(`op_cancelar_${id}`).setLabel('❌ Cancelar').setStyle(ButtonStyle.Danger),
      );

      await interaction.reply({ embeds: [embed], components: [row] });

    } else if (sub === 'listar') {
      const ops = db[interaction.guild.id] || {};
      const ativas = Object.entries(ops).filter(([, o]) => o.ativa);

      if (!ativas.length) {
        return interaction.reply({ content: '📭 Nenhuma operação ativa no momento.', ephemeral: true });
      }

      const embed = new EmbedBuilder()
        .setColor(0x1565C0)
        .setTitle('📋 OPERAÇÕES ATIVAS')
        .setDescription(ativas.map(([id, op]) =>
          `**${op.nome}** — ${op.tipo} — 📅 ${op.data} — 👥 ${op.confirmados.length} confirmados\n🆔 \`${id}\``
        ).join('\n\n'))
        .setFooter({ text: '⚔️ Exército Brasileiro — Servidor MilSim' })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });

    } else if (sub === 'encerrar') {
      const id = interaction.options.getString('id');
      if (!db[interaction.guild.id][id]) {
        return interaction.reply({ content: '❌ Operação não encontrada.', ephemeral: true });
      }
      db[interaction.guild.id][id].ativa = false;
      writeDB('operacoes', db);
      await interaction.reply({ content: `✅ Operação **${db[interaction.guild.id][id].nome}** encerrada.` });
    }
  },
};
