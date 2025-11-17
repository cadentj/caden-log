# deleteWebhook to remove

curl -X POST "https://api.telegram.org/bot${BOT_TOKEN}/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
        "url": "https://caden-log-api.vercel.app/api/webhook",
        "secret_token": "'${WEBHOOK_TOKEN}'"
      }'