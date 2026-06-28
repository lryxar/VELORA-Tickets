require('dotenv').config();
const fs=require('fs'); const path=require('path'); const {Client,GatewayIntentBits,Partials}=require('discord.js'); const {load}=require('./handlers/commandHandler'); const logger=require('./utils/logger');
const client=new Client({intents:[GatewayIntentBits.Guilds,GatewayIntentBits.GuildMessages,GatewayIntentBits.MessageContent,GatewayIntentBits.GuildMembers],partials:[Partials.Channel]});
load(client);
for(const file of fs.readdirSync(path.join(__dirname,'events')).filter(f=>f.endsWith('.js'))){ const ev=require(path.join(__dirname,'events',file)); client[ev.once?'once':'on'](ev.name,(...args)=>ev.execute(...args)); }
process.on('unhandledRejection',logger.error); process.on('uncaughtException',logger.error);
client.login(process.env.TOKEN);
