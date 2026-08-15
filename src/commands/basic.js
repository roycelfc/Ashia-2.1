import { getUser } from "../store.js";
import { escapeHtml, mention } from "../lib/helpers.js";

export async function start(ctx) {
  if (!ctx.from) return;

  const user = await getUser(ctx.env, ctx.from);
  const name = escapeHtml(user.firstName || ctx.from.first_name || "usuario");

  await ctx.reply(
    `✦ <b>Hola, ${name}</b>\n\n` +
      `Soy <b>Ashia</b>, una asistente elegante para Telegram.\n\n` +
      `Usa /menu para descubrir mis funciones.`,
    { parse_mode: "HTML" }
  );
}

export async function ping(ctx) {
  await ctx.reply("✦ Pong. Ashia está en línea.");
}

export async function menu(ctx) {
  await ctx.reply(
    `✦ <b>Ashia</b>\n\n` +
      `<b>Perfil</b>\n` +
      `/perfil — Tu perfil\n` +
      `/reputacion — Tu reputación\n` +
      `/rep — Alias de reputación\n` +
      `/pareja — Ver tu pareja\n\n` +
      `<b>Social</b>\n` +
      `/cita — Invitar a una cita\n` +
      `/aceptar — Aceptar una cita\n` +
      `/rechazar — Rechazar una cita\n` +
      `/besar — Enviar un beso\n` +
      `/abrazo — Enviar un abrazo\n\n` +
      `<b>Moderación</b>\n` +
      `/warn — Advertir a alguien\n` +
      `/warnings — Ver advertencias\n` +
      `/mute — Silenciar\n` +
      `/unmute — Quitar silencio\n` +
      `/ban — Expulsar\n` +
      `/del — Borrar un mensaje\n\n` +
      `<b>Multimedia</b>\n` +
      `/guardar &lt;categoría&gt; — Guardar un contenido respondiendo a él\n` +
      `/listamedia — Ver categorías`,
    { parse_mode: "HTML" }
  );
}

export async function profile(ctx) {
  if (!ctx.from) return;

  const user = await getUser(ctx.env, ctx.from);

  const partner = user.partnerName
    ? escapeHtml(user.partnerName)
    : "Ninguna";

  const date = user.joinedAt
    ? new Date(user.joinedAt).toLocaleDateString("es-ES")
    : "Desconocida";

  await ctx.reply(
    `✦ <b>Perfil</b>\n\n` +
      `Usuario: ${mention(ctx.from)}\n` +
      `Reputación: <b>${user.reputation ?? 0}</b>\n` +
      `Pareja: ${partner}\n` +
      `Miembro desde: ${date}`,
    { parse_mode: "HTML" }
  );
}
