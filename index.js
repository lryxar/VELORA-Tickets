require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const { load } = require('./handlers/commandHandler');
const logger = require('./utils/logger');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.Channel],
});

load(client);

const eventsPath = path.join(__dirname, 'events');
for (const file of fs.readdirSync(eventsPath).filter((eventFile) => eventFile.endsWith('.js'))) {
  const event = require(path.join(eventsPath, file));
  client[event.once ? 'once' : 'on'](event.name, (...args) => event.execute(...args));
}

process.on('unhandledRejection', logger.error);
process.on('uncaughtException', logger.error);

client.login(process.env.TOKEN);
