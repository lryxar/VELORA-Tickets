const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js');
const config = require('./config');

function appendLine(filePath, message) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.appendFileSync(filePath, `[${new Date().toISOString()}] ${message}\n`);
}

async function log(client, type, message) {
  const logSettings = config.get('logs');
  if (logSettings[type] === false) return;

  appendLine(path.join(config.root, 'logs', 'bot.log'), `${type}: ${message}`);

  try {
    const bot = config.get('bot');
    const channel = bot.logChannelId
      ? await client.channels.fetch(bot.logChannelId).catch(() => null)
      : null;

    if (!channel) return;

    await channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor(bot.embedColors?.primary || '#7C3AED')
          .setTitle(type)
          .setDescription(message.slice(0, 4000))
          .setTimestamp(),
      ],
    });
  } catch (error) {
    writeError(error);
  }
}

function writeError(error) {
  const message = error?.stack || error?.message || String(error);
  appendLine(path.join(config.root, 'logs', 'errors.log'), message);
}

module.exports = { log, error: writeError };
