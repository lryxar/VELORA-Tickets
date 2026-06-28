const config = require('../../utils/config');
const logger = require('../../utils/logger');
const tickets = require('../../utils/tickets');

module.exports = {
  name: 'rename',

  async execute(message, args) {
    if (!tickets.byChannel(message.channel.id)) return message.reply(config.get('messages').ticketOnly);

    const name = tickets.sanitizeChannelName(args.join('-'));
    if (!name) return message.reply('Provide a new name.');

    const oldName = message.channel.name;
    await message.channel.setName(name);
    await message.reply(tickets.format(config.get('messages').renamed, { name }));
    await logger.log(message.client, 'ticketRename', `${oldName} renamed to ${name} by ${message.author.tag}`);
  },
};
