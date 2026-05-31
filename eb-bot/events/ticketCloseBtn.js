const { Events, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { readDB, writeDB } = require('../utils/db');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction, client) {
    if (!interaction.isButton()) return;
    if (!interaction.customId.startsWith('ticket_fechar_btn_')) return;

    const { guild, user } = interaction;
    const db = readDB('tickets');
    const guildData = db[guild.id];
    if (!guildData) return;

    const ticketData = Object.values(guildData.tickets).find(
      t => t.channelId === interaction.channel.id && t.aberto
    );
    if (!ticketData) return;

    const isAdmin = interaction.member.permissions.has(PermissionFlagsBits.Administrator);
    const isOwner = ticketData.userId === user.id;

    if (!isAdmin && !isOwner) {
      return interaction.reply({
        content: '❌ Apenas administradores ou o dono do ticket podem fechar.',
        ephemeral: true,
      });
    }

    const embed = new EmbedBuilder()
      .setColor(0xC62828)
      .setTitle('🔒 TICKET ENCERRADO')
      .setDescription(`Ticket fechado por ${user}\n\nEste canal será **deletado em 5 segundos**.`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

    ticketData.aberto = false;
    ticketData.fechadoPor = user.tag;
    ticketData.fechadoEm = new Date().toLocaleString('pt-BR');
    writeDB('tickets', db);

    setTimeout(async () => {
      await interaction.channel.delete().catch(() => {});
    }, 5000);
  },
};
