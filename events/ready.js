const config = require('../utils/config');
const logger = require('../utils/logger');
const tickets = require('../utils/tickets');

module.exports = {
  name: 'ready',
  once: true,

  async execute(client) {
    const bot = config.get('bot');
    client.user.setPresence({
      status: bot.status || 'online',
      activities: [{ name: bot.presence || 'tickets' }],
    });

    await tickets.cleanupMissingChannels(client);
    await logger.log(client, 'botReady', `${client.user.tag} is online.`);
  },
};
