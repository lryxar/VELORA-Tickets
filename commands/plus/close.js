const config = require('../../utils/config');
const tickets = require('../../utils/tickets');

module.exports = {
  name: 'close',

  async execute(message) {
    const ticket = tickets.byChannel(message.channel.id);
    if (!ticket) return message.reply(config.get('messages').ticketOnly);

    const panel = config.panel(ticket.type);
    const delaySeconds = panel.deleteDelaySeconds ?? config.get('bot').deleteDelaySeconds ?? 5;
    await message.channel.send(tickets.format(config.get('messages').closing, { seconds: delaySeconds }));
    await tickets.close(message.channel);
  },
};
