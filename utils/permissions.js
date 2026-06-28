const config=require('./config');
function has(member, allowed=[]){ if(allowed.includes('everyone')) return true; const bot=config.get('bot'); const roles=member.roles.cache; if(allowed.includes('admin') && bot.adminRoles?.some(r=>roles.has(r))) return true; if(allowed.includes('staff') && bot.staffRoles?.some(r=>roles.has(r))) return true; return member.permissions.has('Administrator'); }
module.exports={has};
