require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');

const commands = [];
const slashCommandsPath = path.join(__dirname, '..', 'commands', 'slash');

for (const file of fs.readdirSync(slashCommandsPath).filter((commandFile) => commandFile.endsWith('.js'))) {
  commands.push(require(path.join(slashCommandsPath, file)).data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

rest
  .put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: commands })
  .then(() => console.log('Slash commands deployed.'))
  .catch(console.error);
