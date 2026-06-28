const path = require('path');
const { read, watch } = require('./jsonStore');
const root = path.join(__dirname, '..');
const files = { bot:'bot.json', support:'support-panel.json', purchase:'purchase-panel.json', permissions:'permissions.json', messages:'messages.json', logs:'logs.json' };
for (const name of Object.values(files)) watch(path.join(root,'configs',name), {});
function get(name){ return read(path.join(root,'configs',files[name]), {}); }
function panel(type){ return get(type); }
module.exports={get,panel,root};
