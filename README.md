# Telegram Bot with Supabase Logging

A Node.js Telegram bot that logs all messages to a Supabase database, deployed on Fly.io with webhook support.

## Features

- Logs all Telegram messages to Supabase
- Webhook-based message handling for efficient processing
- Health check endpoint for Fly.io monitoring
- Graceful shutdown handling
- Auto-start/stop on Fly.io free tier

## Prerequisites

- Node.js 20+ installed locally
- A Telegram bot token (get one from [@BotFather](https://t.me/botfather))
- A Supabase project with a database table set up
- Fly.io account and CLI installed ([flyctl](https://fly.io/docs/getting-started/installing-flyctl/))

## Supabase Setup

### 1. Create the Messages Table

Run this SQL in your Supabase SQL Editor:

```sql
CREATE TABLE IF NOT EXISTS messages (
  id BIGSERIAL PRIMARY KEY,
  message_id BIGINT NOT NULL,
  user_id BIGINT,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  chat_id BIGINT NOT NULL,
  chat_type TEXT,
  text TEXT,
  timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);
```

### 2. Get Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy your Project URL and anon/public key

## Local Setup

1. **Clone and install dependencies:**

```bash
npm install
```

2. **Create a `.env` file** (copy from `.env.example`):

```bash
BOT_TOKEN=your_telegram_bot_token_here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_anon_key_here
WEBHOOK_DOMAIN=  # Leave empty for local development
```

3. **Get a Telegram Bot Token:**

   - Message [@BotFather](https://t.me/botfather) on Telegram
   - Send `/newbot` and follow the instructions
   - Copy the bot token and add it to your `.env` file

4. **Run locally (long-polling mode):**

```bash
npm start
```

For local development, the bot will use long-polling since `WEBHOOK_DOMAIN` is not set.

## Deployment to Fly.io

### 1. Install Fly.io CLI

Follow the [official installation guide](https://fly.io/docs/getting-started/installing-flyctl/).

### 2. Login to Fly.io

```bash
fly auth login
```

### 3. Create a Fly.io App

```bash
fly launch
```

When prompted:
- Choose an app name (or let Fly.io generate one)
- Select a region (e.g., `iad` for US East)
- Don't deploy yet (we'll set secrets first)

### 4. Update fly.toml

Edit `fly.toml` and change `app = "your-app-name"` to your actual app name.

### 5. Set Environment Variables

```bash
fly secrets set BOT_TOKEN=your_telegram_bot_token
fly secrets set SUPABASE_URL=https://your-project.supabase.co
fly secrets set SUPABASE_KEY=your_supabase_anon_key
```

### 6. Deploy

```bash
fly deploy
```

After deployment, Fly.io will provide you with a URL like `https://your-app-name.fly.dev`.

### 7. Set Webhook Domain

Update the webhook domain secret:

```bash
fly secrets set WEBHOOK_DOMAIN=https://your-app-name.fly.dev
```

Then redeploy to activate the webhook:

```bash
fly deploy
```

The bot will automatically set up the webhook on startup.

## Verification

1. **Check health endpoint:**

```bash
curl https://your-app-name.fly.dev/health
```

Should return: `{"status":"ok","timestamp":"..."}`

2. **Send a message to your bot on Telegram**

3. **Check Supabase:**

   - Go to your Supabase dashboard
   - Navigate to Table Editor > messages
   - You should see your message logged

## Monitoring

- View logs: `fly logs`
- Check app status: `fly status`
- SSH into the machine: `fly ssh console`

## Troubleshooting

### Bot not receiving messages

1. Check that the webhook is set correctly:
   ```bash
   curl https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo
   ```

2. Verify environment variables are set:
   ```bash
   fly secrets list
   ```

3. Check logs for errors:
   ```bash
   fly logs
   ```

### Database connection issues

- Verify your Supabase URL and key are correct
- Check that the `messages` table exists and has the correct schema
- Ensure Row Level Security (RLS) allows inserts, or disable RLS for the table during setup

## Project Structure

```
.
├── index.js           # Main bot application
├── package.json       # Dependencies and scripts
├── fly.toml          # Fly.io configuration
├── Dockerfile        # Container configuration
├── .dockerignore     # Docker ignore patterns
├── .gitignore        # Git ignore patterns
└── README.md         # This file
```

## License

MIT

