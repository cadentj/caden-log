# deleteWebhook to remove

curl -X POST "https://api.telegram.org/bot${BOT_TOKEN}/setupWebhook" \
  -H "Content-Type: application/json" \
  -d '{
        "url": "https://caden-log-api.vercel.app/bot/webhook",
        "secret_token": "'${WEBHOOK_TOKEN}'"
      }'