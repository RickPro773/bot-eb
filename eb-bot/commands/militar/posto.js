const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { readDB, writeDB } = require('../../utils/db');

const POSTOS = [
  { nome: 'Recruta',              sigla: 'REC',  nivel: 1,  emoji: '🪖' },
  { nome: 'Soldado',              sigla: 'SD',   nivel: 2,  emoji: '🎽' },
  { nome: 'Cabo',                 sigla: 'CB',   nivel: 3,  emoji: '🪖' },
  { nome: 'Terceiro Sargento',    sigla: '3º SGT', nivel: 4, emoji: '⭐' },
  { nome: 'Segundo Sargento',     sigla: '2º SGT', nivel: 5, emoji: '⭐⭐' },
  { nome: 'Primeiro Sargento',    sigla: '1º SGT', nivel: 6, emoji: '⭐⭐⭐' },
  { nome: 'Subtenente',           sigla: 'ST',   nivel: 7,  emoji: '🔰' },
  { nome: 'Segundo Tenente',      sigla: '2º TEN', nivel: 8, emoji: '🔱' },
  { nome: 'Primeiro Tenente',     sigla: '1º TEN', nivel: 9, emoji: '🔱🔱' },
  { nome: 'Capitão',              sigla: 'CAP',  nivel: 10, emoji: '🎖️' },
  { nome: 'Major',                sigla: 'MAJ',  nivel: 11, emoji: '🎖️🎖️' },
  { nome: 'Tenente-Coronel',      sigla: 'TC',   nivel: 12, emoji: '🏅' },
  { nome: 'Coronel',              sigla: 'CEL',  nivel: 13, emoji: '🏅🏅' },
  { nome: 'General de Brigada',   sigla: 'Gen Bda', nivel: 14, emoji: '⭐' },
  { nome: 'General de Divisão',   sigla: 'Gen Div', nivel: 15, emoji: '⭐⭐' },
  { nome: 'General de Exército',  sigla: 'Gen Ex',  nivel: 16, emoji: '⭐⭐⭐' },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('posto')
    .setDescription('🎖️ Gerencia postos militares dos membros')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addSubcommand(sub =>
      sub.setName('promover')
        .setDescription('Promove um soldado')
        .addUserOption(o => o.setName('membro').setDescription('Membro a promover').setRequired(true))
        .addStringOption(o => {
          o.setName('posto').setDescription('Posto a atribuir').setRequired(true);
          POSTOS.forEach(p => o.addChoices({ name: `${p.emoji} ${p.nome} (${p.sigla})`, value: p.sigla }));
          return o;
        })
        .addStringOption(o => o.setName('motivo').setDescription('Motivo da promoção').setRequired(false))
    )
    .addSubcommand(sub =>
      sub.setName('ver')
        .setDescription('Vê o posto de um membro')
        .addUserOption(o => o.setName('membro').setDescription('Membro').setRequired(false))
    )
    .addSubcommand(sub =>
      sub.setName('lista')
        .setDescription('Lista todos os postos disponíveis')
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const db = readDB('postos');
    if (!db[interaction.guild.id]) db[interaction.guild.id] = {};

    if (sub === 'promover') {
      const membro = interaction.options.getMember('membro');
      const sigla = interaction.options.getString('posto');
      const motivo = interaction.options.getString('motivo') || 'Não especificado';
      const posto = POSTOS.find(p => p.sigla === sigla);

      db[interaction.guild.id][membro.id] = {
        posto: posto.nome,
        sigla: posto.sigla,
        nivel: posto.nivel,
        emoji: posto.emoji,
        promovido_por: interaction.user.tag,
        motivo,
        data: new Date().toLocaleDateString('pt-BR'),
      };
      writeDB('postos', db);

      const embed = new EmbedBuilder()
        .setColor(0xFFD600)
        .setTitle('🎖️ PROMOÇÃO MILITAR')
        .setDescription(`${membro} foi promovido(a)!\n\n**Ordem do dia, firme!**`)
        .addFields(
          { name: '🪖 Novo Posto', value: `${posto.emoji} **${posto.nome}** (${posto.sigla})`, inline: true },
          { name: '🎖️ Promovido por', value: interaction.user.toString(), inline: true },
          { name: '📋 Motivo', value: motivo, inline: false },
        )
        .setThumbnail(membro.user.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: '⚔️ Exército Brasileiro — Servidor MilSim' })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });

    } else if (sub === 'ver') {
      const alvo = interaction.options.getMember('membro') || interaction.member;
      const dados = db[interaction.guild.id]?.[alvo.id];

      if (!dados) {
        return interaction.reply({ content: `❌ ${alvo} não possui posto registrado.`, ephemeral: true });
      }

      const embed = new EmbedBuilder()
        .setColor(0x2E7D32)
        .setTitle('📋 FICHA MILITAR')
        .addFields(
          { name: '👤 Soldado', value: alvo.toString(), inline: true },
          { name: '🎖️ Posto', value: `${dados.emoji} ${dados.nome} (${dados.sigla})`, inline: true },
          { name: '📊 Nível', value: `${dados.nivel}`, inline: true },
          { name: '⬆️ Promovido por', value: dados.promovido_por, inline: true },
          { name: '📅 Data', value: dados.data, inline: true },
          { name: '📋 Motivo', value: dados.motivo, inline: false },
        )
        .setThumbnail(alvo.user.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: '⚔️ Exército Brasileiro — Servidor MilSim' })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });

    } else if (sub === 'lista') {
      const embed = new EmbedBuilder()
        .setColor(0x1565C0)
        .setTitle('🎖️ HIERARQUIA MILITAR')
        .setDescription(POSTOS.map(p => `**Nível ${p.nivel}** — ${p.emoji} ${p.nome} \`${p.sigla}\``).join('\n'))
        .setFooter({ text: '⚔️ Exército Brasileiro — Servidor MilSim' })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    }
  },
};
