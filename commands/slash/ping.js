const { SlashCommandBuilder }=require('discord.js'); const config=require('../../utils/config'); const {fmt}=require('../../utils/tickets');
module.exports={data:new SlashCommandBuilder().setName('ping').setDescription('Shows bot latency.'),async execute(interaction){ await interaction.reply({content:fmt(config.get('messages').ping,{latency:interaction.client.ws.ping})}); }};
