const config = require('./config');

function memberHasAnyRole(member, roleIds = []) {
  return roleIds.some((roleId) => member.roles.cache.has(roleId));
}

function has(member, allowed = []) {
  if (!member) return false;
  if (allowed.includes('everyone')) return true;

  const bot = config.get('bot');
  const isAdminRole = memberHasAnyRole(member, bot.adminRoles || []);
  const isStaffRole = memberHasAnyRole(member, bot.staffRoles || []);

  if (allowed.includes('admin') && isAdminRole) return true;
  if (allowed.includes('staff') && isStaffRole) return true;

  return member.permissions.has('Administrator');
}

function canOpenTicket(member, panelConfig) {
  const allowedRoles = panelConfig.allowedOpenRoleIds || [];
  const blockedRoles = panelConfig.blockedOpenRoleIds || [];

  if (blockedRoles.length && memberHasAnyRole(member, blockedRoles)) {
    return { allowed: false, reason: 'blocked' };
  }

  if (allowedRoles.length && !memberHasAnyRole(member, allowedRoles)) {
    return { allowed: false, reason: 'not_allowed' };
  }

  return { allowed: true };
}

function canManageTicket(member, panelConfig) {
  const bot = config.get('bot');
  const managerRoles = [
    ...(bot.adminRoles || []),
    panelConfig.staffRoleId,
    ...(panelConfig.claimRoleIds || []),
  ].filter(Boolean);

  return memberHasAnyRole(member, managerRoles) || member.permissions.has('Administrator');
}

module.exports = { has, canOpenTicket, canManageTicket, memberHasAnyRole };
