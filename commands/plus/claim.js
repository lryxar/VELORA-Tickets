const config = require('../../utils/config');
const logger = require('../../utils/logger');
const tickets = require('../../utils/tickets');

module.exports = {
  name: 'claim',

  async execute(message) {
    const ticket = tickets.byChannel(message.channel.id);
    const messages = config.get('messages');

    if (!ticket) return message.reply(messages.ticketOnly);
    if (ticket.claimedBy) return message.reply(tickets.format(messages.alreadyClaimed, { user: `<@${ticket.claimedBy}>` }));

    tickets.update(message.channel.id, { claimedBy: message.author.id });
    await message.channel.send(tickets.format(messages.claimed, { user: `<@${message.author.id}>` }));
    await logger.log(message.client, 'claim', `${message.author.tag} claimed ${message.channel.name}`);
  },
};
