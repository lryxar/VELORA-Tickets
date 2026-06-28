const fs = require('fs');
const path = require('path');

function load(client) {
  client.slashCommands = new Map();
  client.prefixCommands = new Map();

  for (const type of ['slash', 'plus']) {
    const directory = path.join(__dirname, '..', 'commands', type);
    const files = fs.readdirSync(directory).filter((file) => file.endsWith('.js'));

    for (const file of files) {
      const command = require(path.join(directory, file));
      if (type === 'slash') client.slashCommands.set(command.data.name, command);
      else client.prefixCommands.set(command.name, command);
    }
  }
}

module.exports = { load };
