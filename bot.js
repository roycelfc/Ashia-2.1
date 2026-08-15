import { Bot } from "grammy";
import { start, ping, menu, profile } from "./commands/basic.js";
import { reputation, partner, dateRequest, acceptDate, rejectDate } from "./commands/social.js";
import { saveMedia, sendMedia, listMedia } from "./commands/media.js";
import { warn, warnings, mute, unmute, ban, del } from "./commands/moderation.js";

export function createBot(env) {
  if (!env.TELEGRAM_BOT_TOKEN) throw new Error("Falta TELEGRAM_BOT_TOKEN");
  const bot = new Bot(env.TELEGRAM_BOT_TOKEN);
  bot.use(async (ctx, next) => {
    ctx.env = env;
    if (ctx.chat && ctx.chat.type !== "private" && !ctx.from) return;
    await next();
  });

  bot.command("start", start);
  bot.command("help", menu);
  bot.command("menu", menu);
  bot.command("ping", ping);
  bot.command("perfil", profile);
  bot.command("reputacion", reputation);
  bot.command("rep", reputation);
  bot.command("pareja", partner);
  bot.command("cita", dateRequest);
  bot.command("aceptar", acceptDate);
  bot.command("rechazar", rejectDate);
  bot.command("guardar", saveMedia);
  bot.command("listamedia", listMedia);
  bot.command("besar", (ctx) => sendMedia(ctx, "besar"));
  bot.command("abrazo", (ctx) => sendMedia(ctx, "abrazo"));
  bot.command("feliz", (ctx) => sendMedia(ctx, "feliz"));
  bot.command("bofetada", (ctx) => sendMedia(ctx, "bofetada"));
  bot.command("warn", warn);
  bot.command("warnings", warnings);
  bot.command("mute", mute);
  bot.command("unmute", unmute);
  bot.command("ban", ban);
  bot.command("del", del);

  bot.catch(async (error) => {
    console.error("Ashia error:", error.error);
    try {
      if (error.ctx.chat) await error.ctx.reply("✦ No pude completar esa acción. Comprueba que Ashia tenga permisos suficientes.");
    } catch {}
  });

  return bot;
}
