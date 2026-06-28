const config = require('../../utils/config');
const logger = require('../../utils/logger');
const tickets = require('../../utils/tickets');

module.exports = {
  name: 'delete',

  async execute(message) {
    tickets.remove(message.channel.id);
    await logger.log(message.client, 'ticketDelete', `${message.channel.name} deleted by ${message.author.tag}`);
    await message.channel.send(config.get('messages').deleted);
    await message.channel.delete();
  },
};
