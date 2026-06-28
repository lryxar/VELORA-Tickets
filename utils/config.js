const path = require('path');
const { read, watch } = require('./jsonStore');

const root = path.join(__dirname, '..');
const configDir = path.join(root, 'configs');
const files = {
  bot: 'bot.json',
  support: 'support-panel.json',
  purchase: 'purchase-panel.json',
  permissions: 'permissions.json',
  messages: 'messages.json',
  logs: 'logs.json',
};

for (const fileName of Object.values(files)) {
  watch(path.join(configDir, fileName), {});
}

function get(name) {
  return read(path.join(configDir, files[name]), {});
}

function panel(type) {
  return get(type);
}

module.exports = { get, panel, root };
