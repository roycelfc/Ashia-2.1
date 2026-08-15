# Ashia ✦ 2.0

Bot social y asistente para **Telegram**, reconstruido con una arquitectura moderna y orientada a Cloudflare Workers.

## Qué estaba mal en la versión anterior

- Mezclaba código de **WhatsApp/Baileys** con un Worker de **Telegram**.
- `package.json` no tenía dependencias ni scripts de ejecución.
- La base de datos usaba `node:fs`, que no existe como almacenamiento persistente normal en Cloudflare Workers.
- Pinterest estaba declarado como comando pero siempre lanzaba un error porque el servicio no estaba implementado.
- Los comandos estaban duplicados en dos arquitecturas distintas.
- No había autenticación del webhook.
- No había registro de comandos en BotFather mediante `setMyCommands`.
- La multimedia dependía de carpetas locales, algo que no es persistente en Workers.

## Arquitectura nueva

- **grammY 1.45.1** para Telegram.
- Cloudflare Workers como runtime.
- Webhook `POST /telegram`.
- `X-Telegram-Bot-Api-Secret-Token` para proteger el webhook.
- KV opcional para persistencia; sin KV el bot funciona en modo memoria para pruebas.
- Multimedia mediante `file_id` de Telegram, sin depender del sistema de archivos del Worker.
- Manejo global de errores y respuestas seguras.
- Comandos publicados automáticamente con `setMyCommands`.
- Moderación básica para grupos.

La elección de grammY sigue el patrón usado por proyectos open source de Telegram sobre Workers: hay ejemplos públicos que combinan Cloudflare Workers y grammY, y grammY ofrece un bundle web compatible con entornos como Cloudflare Workers. Además, grammY sigue activo y publicado actualmente. 

## Comandos

### Básicos

`/start` `/menu` `/help` `/ping` `/perfil` `/reputacion` `/rep` `/pareja`

### Social

`/cita` — responde al mensaje de una persona para invitarla.

`/aceptar` — acepta la invitación pendiente.

`/rechazar` — rechaza la invitación.

`/besar` `/abrazo` `/feliz` `/bofetada` — envían multimedia guardada en el grupo.

### Multimedia

Un administrador responde a una foto/GIF/vídeo con:

`/guardar besar`

Categorías disponibles: `besar`, `abrazo`, `feliz`, `bofetada`.

`/listamedia` muestra cuántos elementos hay en cada categoría.

### Moderación

`/warn`, `/warnings`, `/mute`, `/unmute`, `/ban`, `/del`.

Las acciones de moderación verifican que quien ejecuta el comando sea administrador.

## Configuración

1. Crea el bot con **@BotFather** y copia el token.
2. Instala Node.js 20+.
3. Ejecuta `npm install`.
4. Configura el secreto:

```bash
npx wrangler secret put TELEGRAM_BOT_TOKEN
npx wrangler secret put TELEGRAM_WEBHOOK_SECRET
```

5. Despliega:

```bash
npm run deploy
```

6. Configura el webhook apuntando a:

```text
https://TU_WORKER.workers.dev/telegram
```

Puedes usar el script incluido:

```bash
TELEGRAM_BOT_TOKEN="TU_TOKEN" \
TELEGRAM_WEBHOOK_URL="https://TU_WORKER.workers.dev/telegram" \
TELEGRAM_WEBHOOK_SECRET="TU_SECRETO" \
npm run set-webhook
```

## Persistencia recomendada

Para que perfiles, parejas, reputación, advertencias y multimedia sobrevivan a reinicios/despliegues, crea una **Workers KV namespace** y añade su ID en `wrangler.jsonc`:

```jsonc
"kv_namespaces": [
  { "binding": "ASHIA_KV", "id": "TU_NAMESPACE_ID" }
]
```

Sin KV, Ashia sigue funcionando, pero los datos son temporales y dependen de la instancia del Worker.

## Pruebas locales

```bash
npm install
npm run check
npm run dev
```

El endpoint raíz debe devolver un JSON parecido a:

```json
{ "ok": true, "bot": "Ashia ✦", "version": "2.0.0" }
```

## Seguridad

No subas `.env`, `.dev.vars` ni tokens al repositorio. El token de Telegram debe almacenarse como secret de Cloudflare.

## Licencia

MIT
