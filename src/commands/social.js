import { getUser, updateUser, getRelationship, setRelationship } from "../store.js";
import { mention, targetFromReplyOrMention, escapeHtml } from "../lib/helpers.js";

export async function reputation(ctx) {
  const target = targetFromReplyOrMention(ctx) ?? ctx.from;
  const user = await getUser(ctx.env, target);
  await ctx.reply(`✦ La reputación de ${mention(target)} es <b>${user.reputation}</b>.`, { parse_mode: "HTML" });
}

export async function partner(ctx) {
  const user = await getUser(ctx.env, ctx.from);
  if (!user.partnerId) return ctx.reply("✦ No tienes pareja registrada.");
  await ctx.reply(`✦ Tu pareja es ${mention({ id: user.partnerId, first_name: user.partnerName })}.`, { parse_mode: "HTML" });
}

export async function dateRequest(ctx) {
  const target = targetFromReplyOrMention(ctx);
  if (!target || target.id === ctx.from.id) return ctx.reply("✦ Responde al mensaje de la persona o usa una mención compatible para enviar una invitación.");
  const existing = await getRelationship(ctx.env, null, target.id);
  if (existing?.pendingFrom) return ctx.reply("✦ Esa persona ya tiene una invitación pendiente.");
  await setRelationship(ctx.env, null, target.id, { pendingFrom: ctx.from.id, pendingName: ctx.from.first_name });
  await ctx.reply(`✦ ${mention(ctx.from)} ha enviado una invitación a ${mention(target)}.`, { parse_mode: "HTML" });
  try { await ctx.api.sendMessage(target.id, `✦ ${mention(ctx.from)} quiere tener una cita contigo.\n\nResponde con /aceptar o /rechazar.`, { parse_mode: "HTML" }); } catch {}
}

export async function acceptDate(ctx) {
  const pending = await getRelationship(ctx.env, null, ctx.from.id);
  if (!pending?.pendingFrom) return ctx.reply("✦ No tienes ninguna invitación pendiente.");
  const inviter = { id: pending.pendingFrom, first_name: pending.pendingName ?? "Usuario" };
  await updateUser(ctx.env, ctx.from, { partnerId: inviter.id, partnerName: inviter.first_name });
  await updateUser(ctx.env, inviter, { partnerId: ctx.from.id, partnerName: ctx.from.first_name });
  await setRelationship(ctx.env, null, ctx.from.id, null);
  await ctx.reply(`✦ Cita aceptada. ${mention(ctx.from)} y ${mention(inviter)} ahora son pareja.`, { parse_mode: "HTML" });
}

export async function rejectDate(ctx) {
  const pending = await getRelationship(ctx.env, null, ctx.from.id);
  if (!pending?.pendingFrom) return ctx.reply("✦ No tienes ninguna invitación pendiente.");
  await setRelationship(ctx.env, null, ctx.from.id, null);
  await ctx.reply("✦ Invitación rechazada. Todo bien, sin dramas. ✦");
}
