const memory = new Map();

function key(namespace, id) {
  return `ashia:${namespace}:${id}`;
}

async function getJson(env, namespace, id, fallback) {
  const k = key(namespace, id);
  if (env.ASHIA_KV) {
    const value = await env.ASHIA_KV.get(k);
    return value ? JSON.parse(value) : fallback;
  }
  return memory.has(k) ? structuredClone(memory.get(k)) : structuredClone(fallback);
}

async function putJson(env, namespace, id, value) {
  const k = key(namespace, id);
  if (env.ASHIA_KV) {
    await env.ASHIA_KV.put(k, JSON.stringify(value));
  } else {
    memory.set(k, structuredClone(value));
  }
  return value;
}

export async function getUser(env, user) {
  const id = String(user.id);
  const current = await getJson(env, "user", id, null);
  if (current) return current;

  const created = {
    id: Number(user.id),
    username: user.username ?? null,
    firstName: user.first_name ?? "Usuario",
    reputation: 0,
    partnerId: null,
    partnerName: null,
    joinedAt: new Date().toISOString(),
    warnings: 0
  };
  return putJson(env, "user", id, created);
}

export async function updateUser(env, user, patch) {
  const current = await getUser(env, user);
  return putJson(env, "user", String(user.id), { ...current, ...patch });
}

export async function getRelationship(env, chatId, userId) {
  return getJson(env, "relationship", String(userId), null);
}

export async function setRelationship(env, chatId, userId, relationship) {
  return putJson(env, "relationship", String(userId), relationship);
}

export async function getMedia(env, chatId, category) {
  return getJson(env, "media", `${chatId}:${category}`, []);
}

export async function addMedia(env, chatId, category, item) {
  const items = await getMedia(env, chatId, category);
  if (!items.some((x) => x.fileId === item.fileId)) items.push(item);
  await putJson(env, "media", `${chatId}:${category}`, items.slice(-100));
  return items;
}

export async function getWarnings(env, chatId, userId) {
  return getJson(env, "warnings", `${chatId}:${userId}`, []);
}

export async function addWarning(env, chatId, userId, warning) {
  const warnings = await getWarnings(env, chatId, userId);
  warnings.push(warning);
  await putJson(env, "warnings", `${chatId}:${userId}`, warnings.slice(-20));
  return warnings;
}