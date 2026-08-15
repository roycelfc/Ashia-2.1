import { createBot } from "./bot.js";

const commands = [
  { command: "start", description: "Iniciar Ashia" },
  { command: "menu", description: "Ver todos los comandos" },
  { command: "ping", description: "Comprobar que Ashia está en línea" },
  { command: "perfil", description: "Ver tu perfil" },
  { command: "reputacion", description: "Ver reputación" },
  { command: "pareja", description: "Ver tu pareja" },
  { command: "cita", description: "Invitar a una cita" },
  { command: "aceptar", description: "Aceptar una invitación" },
  { command: "rechazar", description: "Rechazar una invitación" },
  { command: "besar", description: "Enviar un beso" },
  { command: "abrazo", description: "Enviar un abrazo" },
  { command: "feliz", description: "Enviar algo feliz" },
  { command: "bofetada", description: "Enviar una bofetada" }
];

let cachedBot;
let configured = false;

function getBot(env) {
  if (!cachedBot) cachedBot = createBot(env);
  return cachedBot;
}

async function configureBot(bot) {
  if (configured) return;
  await bot.api.setMyCommands(commands);
  configured = true;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname === "/") {
      return Response.json({ ok: true, bot: "Ashia ✦", version: "2.0.0" });
    }
    if (request.method !== "POST" || url.pathname !== "/telegram") {
      return new Response("Not Found", { status: 404 });
    }

    const secret = env.TELEGRAM_WEBHOOK_SECRET;
    if (secret && request.headers.get("X-Telegram-Bot-Api-Secret-Token") !== secret) {
      return new Response("Unauthorized", { status: 401 });
    }

    try {
      const bot = getBot(env);
      await configureBot(bot);
      const update = await request.json();
      await bot.handleUpdate(update);
      return new Response("OK");
    } catch (error) {
      console.error("Webhook error:", error);
      return new Response("OK");
    }
  }
};