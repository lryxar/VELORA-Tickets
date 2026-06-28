const { ActionRowBuilder, ButtonBuilder, EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const config = require('../../utils/config');
const tickets = require('../../utils/tickets');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('panel')
    .setDescription('Send a ticket panel.')
    .addStringOption((option) => option
      .setName('type')
      .setDescription('Panel type')
      .setRequired(true)
      .addChoices({ name: 'support', value: 'support' }, { name: 'purchase', value: 'purchase' })),

  async execute(interaction) {
    const type = interaction.options.getString('type');
    const panel = config.panel(type);
    const messages = config.get('messages');

    const embed = new EmbedBuilder()
      .setColor(panel.embedColor)
      .setTitle(panel.panelTitle)
      .setDescription(panel.description)
      .setFooter({ text: panel.footer || 'VELORA Tickets' });

    if (panel.image) embed.setImage(panel.image);
    if (panel.thumbnail) embed.setThumbnail(panel.thumbnail);

    const button = new ButtonBuilder()
      .setCustomId(`ticket_open_${type}`)
      .setLabel(panel.buttonLabel)
      .setStyle(tickets.buttonStyle(panel.buttonStyle));

    if (panel.buttonEmoji) button.setEmoji(panel.buttonEmoji);

    const targetChannel = panel.panelChannelId
      ? await interaction.guild.channels.fetch(panel.panelChannelId).catch(() => null)
      : interaction.channel;

    await targetChannel.send({ embeds: [embed], components: [new ActionRowBuilder().addComponents(button)] });
    await interaction.reply({ content: tickets.format(messages.panelSent, { type }), ephemeral: true });
  },
};
