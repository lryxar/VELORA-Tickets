const tickets=require('../utils/tickets'); const logger=require('../utils/logger');
module.exports={name:'channelDelete',async execute(channel){ const t=tickets.byChannel(channel.id); if(!t) return; tickets.remove(channel.id); await logger.log(channel.client,'ticketDelete',`Removed database record for deleted ticket channel ${channel.id}.`); }};
