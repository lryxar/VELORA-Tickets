const config = require('../../utils/config');
const logger = require('../../utils/logger');
const tickets = require('../../utils/tickets');

module.exports = {
  name: 'unclaim',

  async execute(message) {
    if (!tickets.byChannel(message.channel.id)) return message.reply(config.get('messages').ticketOnly);

    tickets.update(message.channel.id, { claimedBy: null });
    await message.channel.send(config.get('messages').unclaimed);
    await logger.log(message.client, 'unclaim', `${message.author.tag} unclaimed ${message.channel.name}`);
  },
};
