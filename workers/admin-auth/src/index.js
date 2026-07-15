/* the humans. — admin panel auth
 * Checks the panel password server-side so it never ships in client JS
 * (the site repo is public, so anything in admin.js is world-readable).
 * ADMIN_PASSWORD is a Worker secret, set via `wrangler secret put`.
 */

const WINDOW_SECONDS = 900; // 15 min
const MAX_ATTEMPTS = 5;

function timingSafeEqual(a, b) {
  const enc = new TextEncoder();
  const aBytes = enc.encode(a);
  const bBytes = enc.encode(b);
  if (aBytes.length !== bBytes.length) return false;
  let diff = 0;
  for (let i = 0; i < aBytes.length; i++) diff |= aBytes[i] ^ bBytes[i];
  return diff === 0;
}

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { 'content-type': 'application/json' },
  });
}

export default {
  async fetch(request, env) {
    if (request.method !== 'POST') {
      return json({ ok: false, error: 'Método no permitido.' }, 405);
    }

    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const key = 'attempts:' + ip;

    const raw = await env.RATE_LIMIT.get(key);
    const count = raw ? parseInt(raw, 10) : 0;
    if (count >= MAX_ATTEMPTS) {
      return json({ ok: false, error: 'Demasiados intentos. Prueba en unos minutos.' }, 429);
    }

    let body;
    try {
      body = await request.json();
    } catch (err) {
      return json({ ok: false, error: 'Solicitud inválida.' }, 400);
    }

    const password = typeof body.password === 'string' ? body.password : '';
    const match = password.length > 0 && timingSafeEqual(password, env.ADMIN_PASSWORD);

    if (!match) {
      await env.RATE_LIMIT.put(key, String(count + 1), { expirationTtl: WINDOW_SECONDS });
      return json({ ok: false, error: 'Contraseña incorrecta.' }, 401);
    }

    await env.RATE_LIMIT.delete(key);
    return json({ ok: true });
  },
};
