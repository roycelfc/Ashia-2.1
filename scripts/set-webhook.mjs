const token = process.env.TELEGRAM_BOT_TOKEN;
const url = process.env.TELEGRAM_WEBHOOK_URL;
const secret = process.env.TELEGRAM_WEBHOOK_SECRET;

if (!token || !url) {
  console.error("Uso: TELEGRAM_BOT_TOKEN=... TELEGRAM_WEBHOOK_URL=https://.../telegram npm run set-webhook");
  process.exit(1);
}

const response = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ url, secret_token: secret, allowed_updates: ["message", "callback_query"] })
});

const result = await response.json();
console.log(JSON.stringify(result, null, 2));
if (!result.ok) process.exit(1);
