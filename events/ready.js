const { Events } = require('discord.js');

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    const atualizarStatus = () => {
      const totalServidores = client.guilds.cache.size;
      
      client.user.setPresence({
        activities: [{ name: `Moderando ${totalServidores} servidores`, type: 0 }],
        status: 'online',
      });
    };

    atualizarStatus();
    setInterval(atualizarStatus, 30 * 60 * 1000);
  },
};
