const fs = require('fs'); const path = require('path'); const { EmbedBuilder } = require('discord.js'); const config=require('./config');
function line(file,msg){ fs.mkdirSync(path.dirname(file),{recursive:true}); fs.appendFileSync(file, `[${new Date().toISOString()}] ${msg}\n`); }
async function log(client,type,message){ const logs=config.get('logs'); if(logs[type]===false) return; line(path.join(config.root,'logs','bot.log'), `${type}: ${message}`); try{ const bot=config.get('bot'); const ch=bot.logChannelId && await client.channels.fetch(bot.logChannelId).catch(()=>null); if(ch) await ch.send({embeds:[new EmbedBuilder().setColor(bot.embedColors?.primary||'#7C3AED').setTitle(type).setDescription(message).setTimestamp()]}); }catch(e){ error(e); } }
function error(err){ const msg=err?.stack||err?.message||String(err); line(path.join(config.root,'logs','errors.log'), msg); }
module.exports={log,error};
