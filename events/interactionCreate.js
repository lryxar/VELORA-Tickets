const config = require('../utils/config');
const logger = require('../utils/logger');
const permissions = require('../utils/permissions');
const tickets = require('../utils/tickets');

async function handleSlashCommand(interaction) {
  const command = interaction.client.slashCommands.get(interaction.commandName);
  if (!command) return;

  const allowed = config.get('permissions').slash?.[interaction.commandName] || ['admin'];
  if (!permissions.has(interaction.member, allowed)) {
    return interaction.reply({ content: config.get('messages').noPermission, ephemeral: true });
  }

  await logger.log(interaction.client, 'commandUsage', `/${interaction.commandName} used by ${interaction.user.tag}`);
  await command.execute(interaction);
}

async function handleButton(interaction) {
  if (interaction.customId.startsWith('ticket_open_')) {
    return tickets.create(interaction, interaction.customId.replace('ticket_open_', ''));
  }

  const ticket = tickets.byChannel(interaction.channel.id);
  if (!ticket) return interaction.reply({ content: config.get('messages').ticketOnly, ephemeral: true });

  const panel = config.panel(ticket.type);
  if (!permissions.canManageTicket(interaction.member, panel)) {
    return interaction.reply({ content: config.get('messages').noPermission, ephemeral: true });
  }

  if (interaction.customId === 'ticket_claim') {
    if (ticket.claimedBy) {
      return interaction.reply({
        content: tickets.format(config.get('messages').alreadyClaimed, { user: `<@${ticket.claimedBy}>` }),
        ephemeral: true,
      });
    }

    tickets.update(interaction.channel.id, { claimedBy: interaction.user.id });
    await logger.log(interaction.client, 'claim', `${interaction.user.tag} claimed ${interaction.channel.name}`);
    return interaction.reply({ content: tickets.format(config.get('messages').claimed, { user: `<@${interaction.user.id}>` }) });
  }

  if (interaction.customId === 'ticket_close') {
    const delaySeconds = panel.deleteDelaySeconds ?? config.get('bot').deleteDelaySeconds ?? 5;
    await interaction.reply({ content: tickets.format(config.get('messages').closing, { seconds: delaySeconds }) });
    return tickets.close(interaction.channel);
  }
}

module.exports = {
  name: 'interactionCreate',

  async execute(interaction) {
    try {
      if (interaction.isChatInputCommand()) return handleSlashCommand(interaction);
      if (interaction.isButton()) return handleButton(interaction);
    } catch (error) {
      logger.error(error);
      if (interaction.isRepliable()) {
        await interaction.reply({ content: config.get('messages').error, ephemeral: true }).catch(() => null);
      }
    }
  },
};
