const config = require('../../utils/config');
const logger = require('../../utils/logger');
const tickets = require('../../utils/tickets');

module.exports = {
  name: 'add',

  async execute(message) {
    const ticket = tickets.byChannel(message.channel.id);
    const messages = config.get('messages');

    if (!ticket) return message.reply(messages.ticketOnly);

    const user = message.mentions.users.first();
    if (!user) return message.reply(messages.invalidUser);

    await message.channel.permissionOverwrites.edit(user.id, {
      ViewChannel: true,
      SendMessages: true,
      ReadMessageHistory: true,
    });

    const addedUsers = [...new Set([...(ticket.addedUsers || []), user.id])];
    tickets.update(message.channel.id, { addedUsers });
    await message.reply(tickets.format(messages.memberAdded, { user: `<@${user.id}>` }));
    await logger.log(message.client, 'memberAdd', `${message.author.tag} added ${user.tag} to ${message.channel.name}`);
  },
};
