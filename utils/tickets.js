const fs = require('fs');
const path = require('path');
const {
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  EmbedBuilder,
  PermissionFlagsBits,
} = require('discord.js');
const config = require('./config');
const { read, write } = require('./jsonStore');
const logger = require('./logger');
const permissions = require('./permissions');

const ticketsFile = path.join(config.root, 'data', 'tickets.json');
const countersFile = path.join(config.root, 'data', 'counters.json');
const types = ['support', 'purchase'];
const cooldowns = new Map();

function all() {
  return read(ticketsFile, []);
}

function save(tickets) {
  write(ticketsFile, tickets);
}

function byChannel(channelId) {
  return all().find((ticket) => ticket.channelId === channelId);
}

function byOwner(ownerId, type) {
  return all().filter((ticket) => ticket.ownerId === ownerId && ticket.type === type);
}

function remove(channelId) {
  save(all().filter((ticket) => ticket.channelId !== channelId));
}

function update(channelId, patch) {
  save(all().map((ticket) => (ticket.channelId === channelId ? { ...ticket, ...patch } : ticket)));
}

function nextId(type) {
  const counters = read(countersFile, { support: 0, purchase: 0 });
  counters[type] = (counters[type] || 0) + 1;
  write(countersFile, counters);
  return String(counters[type]).padStart(3, '0');
}

function buttonStyle(name) {
  return ButtonStyle[name] || ButtonStyle.Primary;
}

function format(template, vars = {}) {
  return String(template || '').replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? '');
}

function sanitizeChannelName(name) {
  return name.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').slice(0, 90);
}

function cooldownKey(userId, type) {
  return `${userId}:${type}`;
}

function remainingCooldown(userId, type, seconds) {
  if (!seconds) return 0;
  const expiresAt = cooldowns.get(cooldownKey(userId, type)) || 0;
  return Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
}

function setCooldown(userId, type, seconds) {
  if (!seconds) return;
  cooldowns.set(cooldownKey(userId, type), Date.now() + seconds * 1000);
}

function ticketVars(interaction, ticketId) {
  return {
    number: ticketId,
    ticketId,
    user: `<@${interaction.user.id}>`,
    userId: interaction.user.id,
    userTag: interaction.user.tag,
  };
}

async function create(interaction, type) {
  const panel = config.panel(type);
  const messages = config.get('messages');

  if (!types.includes(type) || !panel.enabled) {
    return interaction.reply({ content: messages.ticketsDisabled, ephemeral: true });
  }

  const openPermission = permissions.canOpenTicket(interaction.member, panel);
  if (!openPermission.allowed) {
    const content = openPermission.reason === 'blocked'
      ? messages.ticketOpenRoleBlocked
      : messages.ticketOpenRoleDenied;
    return interaction.reply({ content, ephemeral: true });
  }

  const cooldownLeft = remainingCooldown(interaction.user.id, type, panel.creationCooldownSeconds || 0);
  if (cooldownLeft > 0) {
    return interaction.reply({
      content: format(messages.ticketCooldown, { seconds: cooldownLeft, type }),
      ephemeral: true,
    });
  }

  const existingTickets = byOwner(interaction.user.id, type);
  if (existingTickets.length >= (panel.maxOpenPerUser || 1)) {
    return interaction.reply({
      content: format(messages.ticketExists, { type, channel: `<#${existingTickets[0].channelId}>` }),
      ephemeral: true,
    });
  }

  const ticketId = nextId(type);
  const vars = ticketVars(interaction, ticketId);
  const channelName = sanitizeChannelName(format(panel.ticketNameFormat || `${type}-{number}`, vars));
  const channel = await interaction.guild.channels.create({
    name: channelName,
    type: ChannelType.GuildText,
    parent: panel.categoryId,
    topic: format(panel.channelTopic, vars),
    permissionOverwrites: [
      { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
      {
        id: interaction.user.id,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
      },
      {
        id: panel.staffRoleId,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
          PermissionFlagsBits.ManageMessages,
        ],
      },
    ],
  });

  save([
    ...all(),
    {
      id: ticketId,
      type,
      channelId: channel.id,
      ownerId: interaction.user.id,
      createdAt: Date.now(),
      claimedBy: null,
      addedUsers: [],
    },
  ]);
  setCooldown(interaction.user.id, type, panel.creationCooldownSeconds || 0);

  const embed = new EmbedBuilder()
    .setColor(panel.embedColor)
    .setTitle(`${panel.panelTitle} #${ticketId}`)
    .setDescription(format(panel.welcomeMessage, vars))
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('ticket_claim').setLabel('Claim').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('ticket_close').setLabel('Close').setStyle(ButtonStyle.Danger),
  );

  const staffMention = panel.pingStaffOnCreate ? ` <@&${panel.staffRoleId}>` : '';
  await channel.send({ content: `<@${interaction.user.id}>${staffMention}`, embeds: [embed], components: [row] });
  await interaction.reply({ content: format(messages.ticketCreated, { type, channel: `<#${channel.id}>` }), ephemeral: true });
  await logger.log(interaction.client, 'ticketCreate', `${type} ticket ${channel.name} created by ${interaction.user.tag}`);
}

async function transcript(channel) {
  const bot = config.get('bot');
  const limit = Math.min(Math.max(bot.transcriptMessageLimit || 100, 1), 100);
  const messages = await channel.messages.fetch({ limit });
  const ticket = byChannel(channel.id);
  const safe = (value) => String(value || '').replace(/[&<>]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[char]));

  let html = `<!doctype html><html><head><meta charset="utf-8"><title>${safe(channel.name)}</title>`;
  html += '<style>body{font-family:Arial,sans-serif;background:#111827;color:#e5e7eb;padding:24px}article{border-bottom:1px solid #374151;padding:12px 0}.meta{color:#9ca3af;font-size:12px}</style></head><body>';
  html += `<h1>${safe(channel.name)}</h1>`;

  for (const message of [...messages.values()].reverse()) {
    html += `<article><strong>${safe(message.author.tag)}</strong><div class="meta">${message.createdAt.toISOString()}</div><p>${safe(message.content)}</p></article>`;
  }

  html += '</body></html>';
  const filePath = path.join(config.root, 'logs', 'transcripts', `${channel.name}-${Date.now()}.html`);
  fs.writeFileSync(filePath, html);

  const destination = bot.transcriptChannelId
    ? await channel.client.channels.fetch(bot.transcriptChannelId).catch(() => null)
    : null;

  if (destination) {
    await destination.send({
      content: `Transcript for ${channel.name}${ticket ? ` (owner <@${ticket.ownerId}>)` : ''}`,
      files: [new AttachmentBuilder(filePath)],
    });
  }

  await logger.log(channel.client, 'transcript', `Transcript generated for ${channel.name}`);
  return filePath;
}

async function close(channel) {
  const ticket = byChannel(channel.id);
  const panel = ticket ? config.panel(ticket.type) : null;
  const bot = config.get('bot');
  const delaySeconds = panel?.deleteDelaySeconds ?? bot.deleteDelaySeconds ?? 5;

  await channel.send(panel?.closeMessage || 'Closing ticket.');
  await transcript(channel);
  remove(channel.id);
  await logger.log(channel.client, 'ticketClose', `${channel.name} closed`);

  setTimeout(() => channel.delete().catch(logger.error), delaySeconds * 1000);
}

async function cleanupMissingChannels(client) {
  const tickets = all();
  const validTickets = [];

  for (const ticket of tickets) {
    const channel = await client.channels.fetch(ticket.channelId).catch(() => null);
    if (channel) validTickets.push(ticket);
  }

  if (validTickets.length !== tickets.length) {
    save(validTickets);
    await logger.log(client, 'ticketDelete', `Cleaned ${tickets.length - validTickets.length} stale ticket record(s).`);
  }
}

module.exports = {
  types,
  all,
  save,
  byChannel,
  byOwner,
  remove,
  update,
  create,
  transcript,
  close,
  cleanupMissingChannels,
  format,
  buttonStyle,
  sanitizeChannelName,
};
