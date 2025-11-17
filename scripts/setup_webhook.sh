#!/bin/bash

COMMAND=${1:-list}

case $COMMAND in
  list)
    echo "Getting webhook info..."
    curl -X POST "https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo" | jq '.'
    ;;
  
  add)
    echo "Setting up webhook..."
    curl -X POST "https://api.telegram.org/bot${BOT_TOKEN}/setWebhook" \
      -H "Content-Type: application/json" \
      -d '{
            "url": "https://caden-log-api.vercel.app/bot/webhook",
            "secret_token": "'${WEBHOOK_TOKEN}'"
          }'
    echo ""
    echo "Webhook setup complete!"
    ;;
  
  remove)
    echo "Removing webhook..."
    curl -X POST "https://api.telegram.org/bot${BOT_TOKEN}/deleteWebhook" \
      -H "Content-Type: application/json" \
      -d '{
            "drop_pending_updates": true
          }'
    echo ""
    echo "Webhook removed!"
    ;;
  
  *)
    echo "Usage: bash setup_webhook.sh [list|add|remove]"
    echo "  list   - Show current webhook info (default)"
    echo "  add    - Set up the webhook"
    echo "  remove - Delete the webhook"
    exit 1
    ;;
esac
