import { addWarning, getWarnings, getUser, updateUser } from "../store.js";
import { commandArgs, mention, requireAdmin, targetFromReplyOrMention, escapeHtml } from "../lib/helpers.js";

function target(ctx) { return targetFromReplyOrMention(ctx); }

export async function warn(ctx) {
  if (!(await requireAdmin(ctx))) return;
  const user = target(ctx);
  if (!user) return ctx.reply("✦ Responde al mensaje del usuario que quieres advertir.");
  const reason = commandArgs(ctx).join(" ") || "Sin motivo indicado";
  const warnings = await addWarning(ctx.env, ctx.chat.id, user.id, { reason, by: ctx.from.id, at: new Date().toISOString() });
  await updateUser(ctx.env, user, { warnings: warnings.length });
  await ctx.reply(`⚠️ ${mention(user)} recibe una advertencia. Total: <b>${warnings.length}</b>.\nMotivo: ${escapeHtml(reason)}`, { parse_mode: "HTML" });
}

export async function warnings(ctx) {
  const user = target(ctx) ?? ctx.from;
  const items = await getWarnings(ctx.env, ctx.chat.id, user.id);
  if (!items.length) return ctx.reply(`✦ ${mention(user)} no tiene advertencias.`, { parse_mode: "HTML" });
  await ctx.reply(`✦ ${mention(user)} tiene <b>${items.length}</b> advertencia(s).\n\n${items.map((x, i) => `${i + 1}. ${escapeHtml(x.reason)}`).join("\n")}`, { parse_mode: "HTML" });
}

export async function mute(ctx) {
  if (!(await requireAdmin(ctx))) return;
  const user = target(ctx);
  if (!user) return ctx.reply("✦ Responde al mensaje que quieres silenciar.");
  const minutes = Math.min(Math.max(Number(commandArgs(ctx)[0] || 10), 1), 1440);
  await ctx.api.restrictChatMember(ctx.chat.id, user.id, { permissions: { can_send_messages: false }, until_date: Math.floor(Date.now() / 1000) + minutes * 60 });
  await ctx.reply(`✦ ${mention(user)} ha sido silenciado durante ${minutes} minuto(s).`, { parse_mode: "HTML" });
}

export async function unmute(ctx) {
  if (!(await requireAdmin(ctx))) return;
  const user = target(ctx);
  if (!user) return ctx.reply("✦ Responde al usuario que quieres habilitar.");
  await ctx.api.restrictChatMember(ctx.chat.id, user.id, { permissions: { can_send_messages: true, can_send_audios: true, can_send_documents: true, can_send_photos: true, can_send_videos: true, can_send_video_notes: true, can_send_voice_notes: true, can_send_polls: true, can_send_other_messages: true, can_add_web_page_previews: true, can_change_info: false, can_invite_users: true, can_pin_messages: false, can_manage_topics: false } });
  await ctx.reply(`✦ ${mention(user)} puede volver a escribir.`, { parse_mode: "HTML" });
}

export async function ban(ctx) {
  if (!(await requireAdmin(ctx))) return;
  const user = target(ctx);
  if (!user) return ctx.reply("✦ Responde al usuario que quieres expulsar.");
  await ctx.api.banChatMember(ctx.chat.id, user.id);
  await ctx.reply(`✦ ${mention(user)} ha sido expulsado.`, { parse_mode: "HTML" });
}

export async function del(ctx) {
  if (!(await requireAdmin(ctx))) return;
  const replied = ctx.msg?.reply_to_message;
  if (!replied) return ctx.reply("✦ Responde al mensaje que quieres borrar.");
  try { await ctx.api.deleteMessage(ctx.chat.id, replied.message_id); } catch {}
  try { await ctx.deleteMessage(); } catch {}
}
