# Discord Webhook Manager

A simple web dashboard to manage, send, and test Discord webhooks — directly from your browser, with no server involved.

## Privacy

**Your webhook URLs never leave your device.**

All webhook URLs are stored exclusively in your browser's `localStorage`. No data is sent to any external server — every API call goes directly from your browser to the Discord API. There is no backend, no database, and no analytics.

## Features

- Add and manage multiple webhook URLs
- Send plain text messages and rich embeds
- Live message preview before sending
- Edit and delete previously sent messages
- Modify webhook name and avatar
- All operations map directly to the [Discord Webhook API](https://docs.discord.com/developers/resources/webhook)

## Tech Stack

| Tool                                     | Version |
| ---------------------------------------- | ------- |
| [Preact](https://preactjs.com/)          | ^10     |
| [Vite](https://vite.dev/)                | ^7      |
| [Tailwind CSS](https://tailwindcss.com/) | ^4      |
| [lucide-preact](https://lucide.dev/)     | ^0.577  |
| TypeScript                               | ~5.9    |

## Getting Started

**Requirements:** Node.js 18+ and [pnpm](https://pnpm.io/)

```bash
# Clone the repository
git clone https://github.com/minagishl/discord-webhook-manager.git
cd discord-webhook-manager

# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

Then open `http://localhost:5173` in your browser.

### Build for production

```bash
pnpm build
pnpm preview
```

## Usage

1. Click **Add Webhook** and paste a Discord webhook URL (format: `https://discord.com/api/webhooks/{id}/{token}`).
2. Select a webhook from the sidebar.
3. Use the **Send** tab to compose and send messages or embeds.
4. Use the **Messages** tab to fetch, edit, or delete messages sent by the webhook.
5. Use the **Manage** tab to update the webhook's name, avatar, or delete it.

## License

MIT
