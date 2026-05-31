const { Events, ChannelType, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { readDB, writeDB } = require('../utils/db');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction, client) {
    if (!interaction.isButton()) return;
    if (interaction.customId !== 'ticket_abrir') return;

    const { guild, user } = interaction;
    const db = readDB('tickets');
    if (!db[guild.id]) db[guild.id] = { tickets: {}, counter: 0, adminRole: null };

    const guildData = db[guild.id];

    // Verifica se o usuário já tem ticket aberto
    const jaTemTicket = Object.values(guildData.tickets).find(
      t => t.userId === user.id && t.aberto
    );
    if (jaTemTicket) {
      return interaction.reply({
        content: `❌ Você já tem um ticket aberto: <#${jaTemTicket.channelId}>`,
        ephemeral: true,
      });
    }

    guildData.counter += 1;
    const numero = guildData.counter;
    const nomeCanal = `ticket-${numero.toString().padStart(4, '0')}-${user.username.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

    // Monta permissões do canal
    const permOverwrites = [
      {
        // Nega para @everyone
        id: guild.roles.everyone.id,
        deny: [PermissionFlagsBits.ViewChannel],
      },
      {
        // Permite para o criador do ticket
        id: user.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
          PermissionFlagsBits.AttachFiles,
        ],
      },
    ];

    // Permite para o cargo admin configurado
    if (guildData.adminRole) {
      permOverwrites.push({
        id: guildData.adminRole,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
          PermissionFlagsBits.ManageMessages,
          PermissionFlagsBits.AttachFiles,
        ],
      });
    }

    // Permite para quem tem permissão de Administrator
    const adminMembers = guild.members.cache.filter(m =>
      m.permissions.has(PermissionFlagsBits.Administrator) && !m.user.bot
    );
    adminMembers.forEach(m => {
      if (!permOverwrites.find(p => p.id === m.id)) {
        permOverwrites.push({
          id: m.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
            PermissionFlagsBits.ManageMessages,
          ],
        });
      }
    });

    // Cria o canal de ticket
    let canal;
    try {
      canal = await guild.channels.create({
        name: nomeCanal,
        type: ChannelType.GuildText,
        permissionOverwrites: permOverwrites,
        topic: `Ticket de ${user.tag} | Aberto em ${new Date().toLocaleString('pt-BR')}`,
      });
    } catch (err) {
      return interaction.reply({
        content: `❌ Não foi possível criar o canal: ${err.message}`,
        ephemeral: true,
      });
    }

    // Salva no DB
    guildData.tickets[canal.id] = {
      channelId: canal.id,
      userId: user.id,
      numero,
      aberto: true,
      abertaEm: new Date().toLocaleString('pt-BR'),
    };
    writeDB('tickets', db);

    // Embed dentro do canal do ticket
    const adminMencao = guildData.adminRole ? `<@&${guildData.adminRole}>` : '`Administradores`';

    const embed = new EmbedBuilder()
      .setColor(0x2E7D32)
      .setTitle(`🎫 TICKET #${numero.toString().padStart(4, '0')}`)
      .setDescription(
        `Bem-vindo(a) ${user}!\n\n` +
        `Descreva sua solicitação neste canal e aguarde um administrador.\n\n` +
        `**Admins notificados:** ${adminMencao}`
      )
      .addFields(
        { name: '👤 Aberto por', value: `${user.tag}`, inline: true },
        { name: '📅 Data/Hora', value: new Date().toLocaleString('pt-BR'), inline: true },
      )
      .setFooter({ text: '⚔️ Exército Brasileiro — Use o botão abaixo para fechar' })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`ticket_fechar_btn_${canal.id}`)
        .setLabel('🔒 Fechar Ticket')
        .setStyle(ButtonStyle.Danger),
    );

    await canal.send({
      content: `${user} ${guildData.adminRole ? `<@&${guildData.adminRole}>` : ''}`,
      embeds: [embed],
      components: [row],
    });

    await interaction.reply({
      content: `✅ Ticket aberto: ${canal}`,
      ephemeral: true,
    });
  },
};
