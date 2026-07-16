/* the humans. — admin panel backend
 * - /presskit/admin/api/auth, /eventos-corporativos/admin/api/auth
 *     Checks the panel password server-side (repo is public, so nothing
 *     password-related can live in client JS).
 * - /presskit/admin/api/publish, /eventos-corporativos/admin/api/publish
 *     Writes the given file to GitHub using a repo-scoped token that lives
 *     only as a Worker secret — the browser never holds write access.
 *
 * Both route prefixes sit behind Cloudflare Access (email allowlist), so
 * only the site owner's authenticated session can reach any of this.
 *
 * Secrets (wrangler secret put): ADMIN_PASSWORD, GH_TOKEN
 */

const WINDOW_SECONDS = 900; // 15 min
const MAX_AUTH_ATTEMPTS = 5;
const MAX_PUBLISH_PER_HOUR = 30;

const REPO = 'prodbythehumans/thehumans-web';
const BRANCH = 'main';

const ALLOWED_PATHS = {
  presskit: [/^presskit\/data\/config\.json$/],
  eventos: [
    /^eventos-corporativos\/data\/content\.json$/,
    /^eventos-corporativos\/public\/(hero|bio1|bio2|bio3|clientsWide|clients2|clients3)-\d+\.(jpe?g|png|webp)$/,
  ],
};

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

async function rateLimited(env, key, max) {
  const raw = await env.RATE_LIMIT.get(key);
  const count = raw ? parseInt(raw, 10) : 0;
  if (count >= max) return true;
  await env.RATE_LIMIT.put(key, String(count + 1), { expirationTtl: WINDOW_SECONDS });
  return false;
}

async function handleAuth(request, env, ip) {
  const key = 'attempts:' + ip;
  const raw = await env.RATE_LIMIT.get(key);
  const count = raw ? parseInt(raw, 10) : 0;
  if (count >= MAX_AUTH_ATTEMPTS) {
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
}

async function handlePublish(request, env, ip, app) {
  if (await rateLimited(env, 'publish:' + ip, MAX_PUBLISH_PER_HOUR)) {
    return json({ ok: false, error: 'Demasiadas publicaciones. Prueba en un rato.' }, 429);
  }

  let body;
  try {
    body = await request.json();
  } catch (err) {
    return json({ ok: false, error: 'Solicitud inválida.' }, 400);
  }

  const path = typeof body.path === 'string' ? body.path : '';
  const contentBase64 = typeof body.contentBase64 === 'string' ? body.contentBase64 : '';
  const message = typeof body.message === 'string' && body.message ? body.message : 'Update from admin panel';

  const allowed = (ALLOWED_PATHS[app] || []).some((re) => re.test(path));
  if (!allowed || !contentBase64) {
    return json({ ok: false, error: 'Ruta de archivo no permitida.' }, 400);
  }

  const api = 'https://api.github.com/repos/' + REPO + '/contents/' + path;
  const ghHeaders = {
    Authorization: 'Bearer ' + env.GH_TOKEN,
    Accept: 'application/vnd.github+json',
    'User-Agent': 'thehumans-admin-worker',
  };

  const current = await fetch(api + '?ref=' + BRANCH, { headers: ghHeaders });
  const currentJson = current.ok ? await current.json() : null;

  const putRes = await fetch(api, {
    method: 'PUT',
    headers: ghHeaders,
    body: JSON.stringify({
      message,
      content: contentBase64,
      branch: BRANCH,
      ...(currentJson && currentJson.sha ? { sha: currentJson.sha } : {}),
    }),
  });

  if (!putRes.ok) {
    const errBody = await putRes.json().catch(() => ({}));
    return json({ ok: false, error: errBody.message || 'Error al guardar (HTTP ' + putRes.status + ')' }, 502);
  }

  return json({ ok: true });
}

export default {
  async fetch(request, env) {
    if (request.method !== 'POST') {
      return json({ ok: false, error: 'Método no permitido.' }, 405);
    }

    const url = new URL(request.url);
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';

    const app = url.pathname.startsWith('/presskit/admin/')
      ? 'presskit'
      : url.pathname.startsWith('/eventos-corporativos/admin/')
        ? 'eventos'
        : null;

    if (!app) return json({ ok: false, error: 'No encontrado.' }, 404);

    if (url.pathname.endsWith('/api/auth')) return handleAuth(request, env, ip);
    if (url.pathname.endsWith('/api/publish')) return handlePublish(request, env, ip, app);

    return json({ ok: false, error: 'No encontrado.' }, 404);
  },
};
