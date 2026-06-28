# VELORA Tickets

A professional, lightweight Discord ticket bot built with Node.js, CommonJS, JSON configuration, JSON storage, and discord.js v14. It has no dashboard, no database server, and is suitable for Termux on Android.

## Features

- Two independent ticket systems: Support and Purchase.
- Per-ticket-type panel channel, ticket category, allowed opener roles, blocked opener roles, staff role, manager/claim roles, cooldowns, naming format, topic format, and delete delay.
- Slash panel commands: `/panel support`, `/panel purchase`, `/help`, `/ping`.
- Prefix ticket commands using `+`: `claim`, `unclaim`, `rename`, `add`, `remove`, `close`, `delete`, `transcript`, `move`, and `info`.
- JSON-only configuration and JSON ticket database.
- One open ticket per user per ticket type.
- HTML transcript generation in `logs/transcripts`.
- Config hot reload with JSON validation fallback.
- Stale ticket record cleanup when the bot starts and when ticket channels are deleted manually.
- Per-event logging toggles.
- Error logging to `logs/errors.log`.

## Installation

```bash
git clone <your-repo-url> VeloraTickets
cd VeloraTickets
npm install
cp .env.example .env
```

Edit `.env`:

```env
TOKEN=YOUR_BOT_TOKEN
CLIENT_ID=YOUR_APPLICATION_CLIENT_ID
GUILD_ID=YOUR_SERVER_ID
```

## Termux Setup

```bash
pkg update && pkg upgrade
pkg install nodejs git
npm install
```

Node.js 18.17.0 or newer is required.

## Configuration

All configuration lives in `configs/`:

- `bot.json` controls guild ID, prefix, presence, embed colors, admin roles, staff roles, transcript channel, log channel, and delete delay.
- `support-panel.json` controls the support panel channel, ticket category, opener roles, blocked roles, support staff role, claim/manager roles, cooldown, ticket name format, welcome message, and close message.
- `purchase-panel.json` controls the same options independently for shop/purchase tickets.
- `permissions.json` controls command permissions.
- `messages.json` contains bot messages.
- `logs.json` enables or disables each log type.

JSON files are watched and reloaded automatically. If invalid JSON is saved, the bot keeps the last valid in-memory config and logs the parsing problem.

### Important Per-Type Settings

Each panel file supports:

- `panelChannelId`: where `/panel <type>` sends that panel. If empty, the current channel is used.
- `categoryId`: where new ticket channels are created.
- `allowedOpenRoleIds`: if not empty, only these roles can open this ticket type.
- `blockedOpenRoleIds`: roles that cannot open this ticket type.
- `staffRoleId`: staff role that sees and replies to tickets.
- `claimRoleIds`: manager/admin roles for that ticket type.
- `creationCooldownSeconds`: anti-spam cooldown per user/type.
- `ticketNameFormat`: channel naming template, such as `support-{number}`.
- `deleteDelaySeconds`: close delay for that specific ticket type.

## Deploy Slash Commands

```bash
npm run deploy
```

## Run the Bot

```bash
npm start
```

For Termux/background usage, consider `tmux`:

```bash
pkg install tmux
tmux new -s velora
npm start
```

Detach with `CTRL+B`, then `D`. Resume with `tmux attach -t velora`.

## Folder Structure

```text
commands/
  plus/        Prefix commands
  slash/       Slash commands
events/        Discord event listeners
handlers/      Command loading and slash deployment
configs/       Editable JSON configuration
data/          JSON ticket database and counters
utils/         Shared helpers
logs/          Runtime logs and transcripts
index.js       Bot entry point
```

## Commands

### Slash Commands

- `/panel support` sends the support panel.
- `/panel purchase` sends the purchase panel.
- `/help` shows command help.
- `/ping` shows websocket latency.

### Prefix Commands

Use the prefix from `configs/bot.json` (`+` by default):

- `+claim` claims the current ticket.
- `+unclaim` removes the claim.
- `+rename New Name` renames the ticket channel.
- `+add @user` grants a user access.
- `+remove @user` removes a user's access.
- `+close` creates a transcript and deletes after the configured delay.
- `+delete` deletes immediately and removes the database record.
- `+transcript` creates and sends a transcript.
- `+move support` or `+move purchase` moves the ticket and updates its type.
- `+info` shows ticket metadata.

## Troubleshooting

- **Slash commands do not appear:** run `npm run deploy` and verify `CLIENT_ID` and `GUILD_ID`.
- **Panels fail to create tickets:** check category IDs, role IDs, and bot permissions.
- **Prefix commands do not respond:** enable the Message Content Intent in the Discord Developer Portal.
- **Duplicate ticket warning is wrong:** delete stale records from `data/tickets.json` only while the bot is stopped, or use `+close`/`+delete` inside tickets.
- **Transcripts are not sent:** verify `transcriptChannelId` in `configs/bot.json` and bot channel permissions.

## Notes

This bot intentionally uses only `discord.js` and `dotenv` to remain lightweight and easy to run on low-resource systems. Run `npm run check` after edits to validate JavaScript syntax.
