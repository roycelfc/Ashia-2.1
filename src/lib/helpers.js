export const CATEGORIES = new Set(["besar", "abrazo", "feliz", "bofetada"]);

export function mention(user) {
  const name = escapeHtml([user.first_name, user.last_name].filter(Boolean).join(" ") || "Usuario");
  return `<a href="tg://user?id=${user.id}">${name}</a>`;
}

export function escapeHtml(value = "") {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

export function commandArgs(ctx) {
  return (ctx.match ?? "").trim().split(/\s+/).filter(Boolean);
}

export function targetFromReplyOrMention(ctx) {
  const replied = ctx.msg?.reply_to_message?.from;
  if (replied) return replied;
  return ctx.message?.entities?.find((e) => e.type === "text_mention")?.user ?? null;
}

export function isGroup(ctx) {
  return ["group", "supergroup"].includes(ctx.chat?.type);
}

export async function isAdmin(ctx) {
  if (!isGroup(ctx)) return false;
  const member = await ctx.api.getChatMember(ctx.chat.id, ctx.from.id);
  return member.status === "creator" || member.status === "administrator";
}

export async function requireAdmin(ctx) {
  if (await isAdmin(ctx)) return true;
  await ctx.reply("✦ Esta función está reservada para administradores.");
  return false;
}

export async function deleteCommandMessage(ctx) {
  try { await ctx.deleteMessage(); } catch {}
}
