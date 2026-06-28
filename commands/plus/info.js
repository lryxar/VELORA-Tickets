const { EmbedBuilder } = require('discord.js');
const config = require('../../utils/config');
const tickets = require('../../utils/tickets');

module.exports = {
  name: 'info',

  async execute(message) {
    const ticket = tickets.byChannel(message.channel.id);
    if (!ticket) return message.reply(config.get('messages').ticketOnly);

    await message.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(config.get('bot').embedColors?.primary || '#7C3AED')
          .setTitle('Ticket Info')
          .addFields(
            { name: 'Owner', value: `<@${ticket.ownerId}>`, inline: true },
            { name: 'Created', value: `<t:${Math.floor(ticket.createdAt / 1000)}:R>`, inline: true },
            { name: 'Claimed By', value: ticket.claimedBy ? `<@${ticket.claimedBy}>` : 'Unclaimed', inline: true },
            { name: 'Type', value: ticket.type, inline: true },
            { name: 'Ticket ID', value: ticket.id, inline: true },
          ),
      ],
    });
  },
};
