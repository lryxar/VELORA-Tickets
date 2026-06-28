const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const config = require('../../utils/config');

module.exports = {
  data: new SlashCommandBuilder().setName('help').setDescription('Shows available commands.'),

  async execute(interaction) {
    const bot = config.get('bot');
    const messages = config.get('messages');

    const embed = new EmbedBuilder()
      .setColor(bot.embedColors?.primary || '#7C3AED')
      .setTitle(messages.helpTitle)
      .addFields(
        { name: 'Slash Commands', value: '`/panel support`\n`/panel purchase`\n`/help`\n`/ping`' },
        {
          name: 'Ticket Commands',
          value: '`+claim`, `+unclaim`, `+rename`, `+add`, `+remove`, `+close`, `+delete`, `+transcript`, `+move`, `+info`',
        },
        { name: 'Bot Information', value: 'JSON configured, lightweight, Termux compatible.' },
      );

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
