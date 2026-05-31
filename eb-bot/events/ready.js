const { ActivityType } = require('discord.js');

module.exports = {
  name: 'clientReady',
  once: true,
  execute(client) {
    console.log(`\n✅ Bot online como ${client.user.tag}`);
    console.log(`📡 Servidores: ${client.guilds.cache.size}`);
    client.user.setPresence({
      activities: [{ name: '⚔️ Exército Brasileiro MilSim', type: ActivityType.Watching }],
      status: 'online',
    });
  },
};
