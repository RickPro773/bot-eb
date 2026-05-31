const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
} = require('discord.js');
const { readDB, writeDB } = require('../../utils/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('🎫 Gerencia o sistema de tickets')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator) // permissão no comando raiz
    .addSubcommand(sub =>
      sub.setName('painel')
        .setDescription('Envia painel para abrir tickets')
        .addStringOption(o =>
          o.setName('descricao')
            .setDescription('Texto do painel')
            .setRequired(false)
        )
        .addRoleOption(o =>
          o.setName('cargo-admin')
            .setDescription('Cargo que pode ver e responder tickets')
            .setRequired(false)
        )
    )
    .addSubcommand(sub =>
      sub.setName('fechar')
        .setDescription('Fecha o ticket atual (admin ou dono)')
    )
    .addSubcommand(sub =>
      sub.setName('add')
        .setDescription('Adiciona um membro ao ticket atual')
        .addUserOption(o => o.setName('membro').setDescription('Membro').setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('listar')
        .setDescription('Lista todos os tickets abertos')
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const db = readDB('tickets');
    if (!db[interaction.guild.id]) db[interaction.guild.id] = { tickets: {}, counter: 0, adminRole: null };

    // ── PAINEL ──────────────────────────────────────────────────────────────
    if (sub === 'painel') {
      const descricao = interaction.options.getString('descricao') ||
        'Clique no botão abaixo para abrir um ticket.\nNossa equipe responderá o mais breve possível.';
      const adminRole = interaction.options.getRole('cargo-admin');

      if (adminRole) {
        db[interaction.guild.id].adminRole = adminRole.id;
        writeDB('tickets', db);
      }

      const embed = new EmbedBuilder()
        .setColor(0x2E7D32)
        .setTitle('🎫 CENTRAL DE ATENDIMENTO')
        .setDescription(descricao)
        .addFields(
          { name: '📋 Como funciona', value: '1. Clique em **Abrir Ticket**\n2. Descreva sua solicitação\n3. Aguarde um administrador' },
        )
        .setFooter({ text: '⚔️ Exército Brasileiro — Servidor MilSim' })
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('ticket_abrir')
          .setLabel('🎫 Abrir Ticket')
          .setStyle(ButtonStyle.Success),
      );

      await interaction.reply({ embeds: [embed], components: [row] });

    // ── FECHAR ───────────────────────────────────────────────────────────────
    } else if (sub === 'fechar') {
      const guildTickets = db[interaction.guild.id].tickets;
      const ticketData = Object.values(guildTickets).find(t => t.channelId === interaction.channel.id && t.aberto);

      if (!ticketData) {
        return interaction.reply({ content: '❌ Este canal não é um ticket aberto.', ephemeral: true });
      }

      const isAdmin = interaction.member.permissions.has(PermissionFlagsBits.Administrator);
      const isOwner = ticketData.userId === interaction.user.id;
      if (!isAdmin && !isOwner) {
        return interaction.reply({ content: '❌ Apenas administradores ou o dono do ticket podem fechar.', ephemeral: true });
      }

      const embed = new EmbedBuilder()
        .setColor(0xC62828)
        .setTitle('🔒 TICKET ENCERRADO')
        .setDescription(`Ticket fechado por ${interaction.user}\n\nEste canal será deletado em **5 segundos**.`)
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });

      ticketData.aberto = false;
      ticketData.fechadoPor = interaction.user.tag;
      ticketData.fechadoEm = new Date().toLocaleString('pt-BR');
      writeDB('tickets', db);

      setTimeout(async () => {
        await interaction.channel.delete().catch(() => {});
      }, 5000);

    // ── ADD MEMBRO ───────────────────────────────────────────────────────────
    } else if (sub === 'add') {
      const guildTickets = db[interaction.guild.id].tickets;
      const ticketData = Object.values(guildTickets).find(t => t.channelId === interaction.channel.id && t.aberto);

      if (!ticketData) {
        return interaction.reply({ content: '❌ Este canal não é um ticket aberto.', ephemeral: true });
      }

      const membro = interaction.options.getMember('membro');
      await interaction.channel.permissionOverwrites.edit(membro, {
        ViewChannel: true,
        SendMessages: true,
        ReadMessageHistory: true,
      });

      await interaction.reply({ content: `✅ ${membro} foi adicionado ao ticket.` });

    // ── LISTAR ───────────────────────────────────────────────────────────────
    } else if (sub === 'listar') {
      const guildTickets = db[interaction.guild.id].tickets;
      const abertos = Object.entries(guildTickets).filter(([, t]) => t.aberto);

      if (!abertos.length) {
        return interaction.reply({ content: '📭 Nenhum ticket aberto no momento.', ephemeral: true });
      }

      const embed = new EmbedBuilder()
        .setColor(0x1565C0)
        .setTitle('🎫 TICKETS ABERTOS')
        .setDescription(abertos.map(([id, t]) =>
          `**Ticket #${t.numero}** — <@${t.userId}> — <#${t.channelId}>\n📅 Aberto em: ${t.abertaEm}`
        ).join('\n\n'))
        .setFooter({ text: `Total: ${abertos.length} ticket(s) aberto(s)` })
        .setTimestamp();

      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};