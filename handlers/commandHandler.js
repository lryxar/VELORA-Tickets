const fs=require('fs'); const path=require('path');
function load(client){ client.slashCommands=new Map(); client.prefixCommands=new Map(); for(const dir of ['slash','plus']){ const base=path.join(__dirname,'..','commands',dir); for(const file of fs.readdirSync(base).filter(f=>f.endsWith('.js'))){ const cmd=require(path.join(base,file)); if(dir==='slash') client.slashCommands.set(cmd.data.name,cmd); else client.prefixCommands.set(cmd.name,cmd); } } }
module.exports={load};
