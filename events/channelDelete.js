const logger = require('../utils/logger');
const tickets = require('../utils/tickets');

module.exports = {
  name: 'channelDelete',

  async execute(channel) {
    const ticket = tickets.byChannel(channel.id);
    if (!ticket) return;

    tickets.remove(channel.id);
    await logger.log(channel.client, 'ticketDelete', `Removed database record for deleted ticket channel ${channel.id}.`);
  },
};
