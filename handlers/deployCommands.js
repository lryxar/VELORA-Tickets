require('dotenv').config(); const {REST,Routes}=require('discord.js'); const fs=require('fs'); const path=require('path');
const commands=[]; for(const file of fs.readdirSync(path.join(__dirname,'..','commands','slash')).filter(f=>f.endsWith('.js'))) commands.push(require(path.join(__dirname,'..','commands','slash',file)).data.toJSON());
const rest=new REST({version:'10'}).setToken(process.env.TOKEN); rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),{body:commands}).then(()=>console.log('Slash commands deployed.')).catch(console.error);
