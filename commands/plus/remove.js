const config = require('../../utils/config');
const logger = require('../../utils/logger');
const tickets = require('../../utils/tickets');

module.exports = {
  name: 'remove',

  async execute(message) {
    const ticket = tickets.byChannel(message.channel.id);
    const messages = config.get('messages');

    if (!ticket) return message.reply(messages.ticketOnly);

    const user = message.mentions.users.first();
    if (!user) return message.reply(messages.invalidUser);

    await message.channel.permissionOverwrites.edit(user.id, {
      ViewChannel: false,
      SendMessages: false,
    });

    const addedUsers = (ticket.addedUsers || []).filter((userId) => userId !== user.id);
    tickets.update(message.channel.id, { addedUsers });
    await message.reply(tickets.format(messages.memberRemoved, { user: `<@${user.id}>` }));
    await logger.log(message.client, 'memberRemove', `${message.author.tag} removed ${user.tag} from ${message.channel.name}`);
  },
};
