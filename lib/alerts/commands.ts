// Command menu shown in Telegram. Synced by /api/telegram/setup and refreshed by the webhook after deploys.
export const BOT_COMMANDS = [
  { command: 'status', description: 'Current alert settings' },
  { command: 'mute', description: 'Silence alerts, e.g. /mute 2h' },
  { command: 'unmute', description: 'Turn alerts back on' },
  { command: 'quiet', description: 'Quiet hours, e.g. /quiet 23-7' },
  { command: 'tz', description: 'Time zone, e.g. /tz America/New_York' },
  { command: 'topics', description: 'Sort alerts into topic tabs' },
  { command: 'watch', description: 'Alert when a company visits, e.g. /watch Deloitte' },
  { command: 'watchlist', description: 'Companies being watched' },
  { command: 'qr', description: 'QR code for a tagged link, e.g. /qr byui-fair' },
  { command: 'health', description: 'Check the site, AI, voice and lookups' },
  { command: 'test', description: 'Send a sample visitor alert' },
  { command: 'help', description: 'What the bot can do' },
]
