const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { readDB, writeDB } = require('../../utils/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('config')
    .setDescription('⚙️ Configura o bot para este servidor')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sub =>
      sub.setName('boas-vindas')
        .setDescription('Define canal de boas-vindas')
        .addChannelOption(o => o.setName('canal').setDescription('Canal').setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('cargo-recruta')
        .setDescription('Define cargo automático para recrutas')
        .addRoleOption(o => o.setName('cargo').setDescription('Cargo').setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('log')
        .setDescription('Define canal de logs')
        .addChannelOption(o => o.setName('canal').setDescription('Canal de logs').setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('ver')
        .setDescription('Mostra configurações atuais')
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const db = readDB('config');
    if (!db[interaction.guild.id]) db[interaction.guild.id] = {};

    if (sub === 'boas-vindas') {
      const canal = interaction.options.getChannel('canal');
      db[interaction.guild.id].welcomeChannel = canal.id;
      writeDB('config', db);
      await interaction.reply({ content: `✅ Canal de boas-vindas definido: ${canal}`, ephemeral: true });

    } else if (sub === 'cargo-recruta') {
      const cargo = interaction.options.getRole('cargo');
      db[interaction.guild.id].recruitRole = cargo.id;
      writeDB('config', db);
      await interaction.reply({ content: `✅ Cargo de recruta definido: ${cargo}`, ephemeral: true });

    } else if (sub === 'log') {
      const canal = interaction.options.getChannel('canal');
      db[interaction.guild.id].logChannel = canal.id;
      writeDB('config', db);
      await interaction.reply({ content: `✅ Canal de logs definido: ${canal}`, ephemeral: true });

    } else if (sub === 'ver') {
      const cfg = db[interaction.guild.id] || {};
      const embed = new EmbedBuilder()
        .setColor(0x546E7A)
        .setTitle('⚙️ CONFIGURAÇÕES DO BOT')
        .addFields(
          { name: '👋 Boas-Vindas', value: cfg.welcomeChannel ? `<#${cfg.welcomeChannel}>` : 'Não configurado', inline: true },
          { name: '🪖 Cargo Recruta', value: cfg.recruitRole ? `<@&${cfg.recruitRole}>` : 'Não configurado', inline: true },
          { name: '📋 Canal de Logs', value: cfg.logChannel ? `<#${cfg.logChannel}>` : 'Não configurado', inline: true },
        )
        .setFooter({ text: '⚔️ Exército Brasileiro — Servidor MilSim' })
        .setTimestamp();
      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};
