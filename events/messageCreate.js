const config = require('../utils/config');
const logger = require('../utils/logger');
const permissions = require('../utils/permissions');

module.exports = {
  name: 'messageCreate',

  async execute(message) {
    if (message.author.bot || !message.guild) return;

    const bot = config.get('bot');
    const prefix = bot.prefix || '+';
    if (!message.content.startsWith(prefix)) return;

    const [name, ...args] = message.content.slice(prefix.length).trim().split(/\s+/);
    const command = message.client.prefixCommands.get(name?.toLowerCase());
    if (!command) return;

    try {
      const allowed = config.get('permissions').prefix?.[command.name] || ['staff', 'admin'];
      if (!permissions.has(message.member, allowed)) return message.reply(config.get('messages').noPermission);

      await logger.log(message.client, 'commandUsage', `${prefix}${command.name} used by ${message.author.tag}`);
      await command.execute(message, args);
    } catch (error) {
      logger.error(error);
      await message.reply(config.get('messages').error).catch(() => null);
    }
  },
};
