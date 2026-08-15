import { handleMessage } from "./handlers/messageHandler.js";

export default {
  async fetch(request, env) {
    if (request.method === "POST") {
      try {
        const update = await request.json();
        await handleMessage(update, env);

        return new Response("OK");
      } catch (error) {
        console.error(error);
        return new Response("Error", { status: 500 });
      }
    }

    return new Response("Ashia ✦ está funcionando.");
  }
};
