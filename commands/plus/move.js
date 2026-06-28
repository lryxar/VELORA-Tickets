const config = require('../../utils/config');
const tickets = require('../../utils/tickets');

module.exports = {
  name: 'move',

  async execute(message, args) {
    const ticket = tickets.byChannel(message.channel.id);
    const messages = config.get('messages');

    if (!ticket) return message.reply(messages.ticketOnly);

    const type = args[0];
    if (!tickets.types.includes(type)) return message.reply(messages.invalidType);

    const panel = config.panel(type);
    await message.channel.setParent(panel.categoryId);
    tickets.update(message.channel.id, { type });
    await message.reply(tickets.format(messages.moved, { type }));
  },
};
