const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { readDB, writeDB } = require('../../utils/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('punicao')
    .setDescription('⚖️ Aplica punição disciplinar a um membro')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addSubcommand(sub =>
      sub.setName('aplicar')
        .setDescription('Aplica uma punição')
        .addUserOption(o => o.setName('membro').setDescription('Membro').setRequired(true))
        .addStringOption(o =>
          o.setName('tipo').setDescription('Tipo de punição').setRequired(true)
            .addChoices(
              { name: '📝 Advertência Verbal', value: 'advertencia_verbal' },
              { name: '📄 Advertência Escrita', value: 'advertencia_escrita' },
              { name: '⛔ Repreensão', value: 'repreensao' },
              { name: '🔇 Silêncio (Mute)', value: 'mute' },
              { name: '🚪 Expulsão Temporária', value: 'kick' },
              { name: '🔨 Banimento', value: 'ban' },
            )
        )
        .addStringOption(o => o.setName('motivo').setDescription('Motivo da punição').setRequired(true))
        .addIntegerOption(o => o.setName('duracao').setDescription('Duração em minutos (para mute)').setRequired(false))
    )
    .addSubcommand(sub =>
      sub.setName('historico')
        .setDescription('Vê o histórico de punições de um membro')
        .addUserOption(o => o.setName('membro').setDescription('Membro').setRequired(true))
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const db = readDB('punicoes');
    if (!db[interaction.guild.id]) db[interaction.guild.id] = {};

    if (sub === 'aplicar') {
      const membro = interaction.options.getMember('membro');
      const tipo = interaction.options.getString('tipo');
      const motivo = interaction.options.getString('motivo');
      const duracao = interaction.options.getInteger('duracao') || 60;

      const tipoNomes = {
        advertencia_verbal: '📝 Advertência Verbal',
        advertencia_escrita: '📄 Advertência Escrita',
        repreensao: '⛔ Repreensão',
        mute: '🔇 Silêncio',
        kick: '🚪 Expulsão Temporária',
        ban: '🔨 Banimento',
      };

      // Execute punishment
      try {
        if (tipo === 'mute') {
          await membro.timeout(duracao * 60 * 1000, motivo);
        } else if (tipo === 'kick') {
          await membro.kick(motivo);
        } else if (tipo === 'ban') {
          await membro.ban({ reason: motivo });
        }
      } catch (err) {
        return interaction.reply({ content: `❌ Não foi possível aplicar a punição: ${err.message}`, ephemeral: true });
      }

      // Log
      const registro = {
        tipo,
        motivo,
        aplicado_por: interaction.user.tag,
        data: new Date().toLocaleString('pt-BR'),
        duracao: tipo === 'mute' ? duracao : null,
      };

      if (!db[interaction.guild.id][membro.id]) db[interaction.guild.id][membro.id] = [];
      db[interaction.guild.id][membro.id].push(registro);
      writeDB('punicoes', db);

      const embed = new EmbedBuilder()
        .setColor(0xC62828)
        .setTitle('⚖️ PUNIÇÃO DISCIPLINAR APLICADA')
        .addFields(
          { name: '👤 Punido', value: membro.toString(), inline: true },
          { name: '📋 Tipo', value: tipoNomes[tipo], inline: true },
          { name: '🎖️ Aplicado por', value: interaction.user.toString(), inline: true },
          { name: '📝 Motivo', value: motivo, inline: false },
          { name: '📅 Data', value: new Date().toLocaleString('pt-BR'), inline: true },
          { name: '⚠️ Total de Punições', value: `${db[interaction.guild.id][membro.id].length}`, inline: true },
        )
        .setThumbnail(membro.user.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: '⚔️ Exército Brasileiro — Disciplina e Ordem' })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });

    } else if (sub === 'historico') {
      const membro = interaction.options.getMember('membro');
      const historico = db[interaction.guild.id]?.[membro.id] || [];

      if (!historico.length) {
        return interaction.reply({ content: `✅ ${membro} não possui punições registradas.`, ephemeral: true });
      }

      const embed = new EmbedBuilder()
        .setColor(0xF9A825)
        .setTitle(`📋 HISTÓRICO DE PUNIÇÕES — ${membro.user.username.toUpperCase()}`)
        .setDescription(historico.slice(-10).map((p, i) =>
          `**${i + 1}.** ${p.tipo} — ${p.motivo} — por ${p.aplicado_por} em ${p.data}`
        ).join('\n'))
        .addFields({ name: '⚠️ Total', value: `${historico.length} punições`, inline: true })
        .setFooter({ text: '⚔️ Exército Brasileiro — Mostrando últimas 10' })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    }
  },
};
