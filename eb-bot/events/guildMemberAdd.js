const { Events, EmbedBuilder } = require('discord.js');
const { readDB } = require('../utils/db');

module.exports = {
  name: Events.GuildMemberAdd,
  async execute(member, client) {
    const config = readDB('config');
    const guildConfig = config[member.guild.id];
    if (!guildConfig || !guildConfig.welcomeChannel) return;

    const channel = member.guild.channels.cache.get(guildConfig.welcomeChannel);
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setColor(0x2E7D32)
      .setTitle('🫡 NOVO RECRUTA CHEGOU AO QUARTEL!')
      .setDescription(
        `Bem-vindo(a) ao **${member.guild.name}**, ${member}!\n\n` +
        `📋 Leia as regras antes de prosseguir.\n` +
        `🎖️ Aguarde a atribuição do seu posto.\n` +
        `⚔️ **Ordem, Disciplina e Patriotismo!**`
      )
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: '👤 Usuário', value: `${member.user.tag}`, inline: true },
        { name: '📅 Membro Nº', value: `${member.guild.memberCount}`, inline: true }
      )
      .setFooter({ text: '⚔️ Exército Brasileiro — Servidor MilSim' })
      .setTimestamp();

    await channel.send({ content: `${member}`, embeds: [embed] });

    // Auto-role if configured
    if (guildConfig.recruitRole) {
      const role = member.guild.roles.cache.get(guildConfig.recruitRole);
      if (role) await member.roles.add(role).catch(console.error);
    }
  },
};
