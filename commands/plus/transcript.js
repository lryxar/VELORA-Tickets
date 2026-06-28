const config = require('../../utils/config');
const tickets = require('../../utils/tickets');

module.exports = {
  name: 'transcript',

  async execute(message) {
    if (!tickets.byChannel(message.channel.id)) return message.reply(config.get('messages').ticketOnly);

    await tickets.transcript(message.channel);
    await message.reply(config.get('messages').transcriptSaved);
  },
};
