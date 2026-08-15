import { addMedia, getMedia } from "../store.js";
import { CATEGORIES, commandArgs, requireAdmin } from "../lib/helpers.js";

function extractMedia(message) {
  if (message?.photo?.length) return { type: "photo", fileId: message.photo.at(-1).file_id };
  if (message?.animation) return { type: "animation", fileId: message.animation.file_id };
  if (message?.video) return { type: "video", fileId: message.video.file_id };
  return null;
}

export async function saveMedia(ctx) {
  if (!(await requireAdmin(ctx))) return;
  const category = commandArgs(ctx)[0]?.toLowerCase();
  if (!CATEGORIES.has(category)) return ctx.reply("✦ Categorías: besar, abrazo, feliz, bofetada.");
  const source = extractMedia(ctx.msg?.reply_to_message);
  if (!source) return ctx.reply("✦ Responde a una foto, GIF o vídeo con /guardar <categoría>.");
  await addMedia(ctx.env, ctx.chat.id, category, source);
  await ctx.reply(`✦ Guardado en <b>${category}</b>.`, { parse_mode: "HTML" });
}

export async function sendMedia(ctx, category) {
  const items = await getMedia(ctx.env, ctx.chat.id, category);
  if (!items.length) return ctx.reply(`✦ Todavía no hay contenido guardado en ${category}.`);
  const item = items[Math.floor(Math.random() * items.length)];
  if (item.type === "photo") return ctx.replyWithPhoto(item.fileId);
  if (item.type === "animation") return ctx.replyWithAnimation(item.fileId);
  return ctx.replyWithVideo(item.fileId);
}

export async function listMedia(ctx) {
  const counts = await Promise.all(["besar", "abrazo", "feliz", "bofetada"].map(async (x) => [x, (await getMedia(ctx.env, ctx.chat.id, x)).length]));
  await ctx.reply(`✦ <b>Multimedia</b>\n\n${counts.map(([name, count]) => `• ${name}: ${count}`).join("\n")}`, { parse_mode: "HTML" });
}
