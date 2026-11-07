// Proxy Pages -> Worker lewat Service Binding (nama binding: TRIAL_FETCH_WORKER).
// Frontend memanggil path relatif (/proxy), jadi tidak perlu URL Worker.
// _routes.json membatasi Function ini hanya untuk path yang ada di API_PATHS.
// CATATAN DEPLOY: folder functions/ HARUS di root repo (sejajar frontend/), LEBIH
// ANDAL untuk Pages Git build: kalau functions/ taruh di dalam folder yang jadi
// Build output directory, sering tidak ikut ter-upload dan API membalas HTML/405.

const API_PATHS = new Set(['/proxy']);

const jsonRes = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });

export async function onRequest({ request, env, next }) {
  const { pathname } = new URL(request.url);
  if (!API_PATHS.has(pathname)) return next();

  if (!env || !env.TRIAL_FETCH_WORKER) {
    return jsonRes(
      { error: 'Service binding TRIAL_FETCH_WORKER belum dipasang. Buka Pages > Settings > Bindings > Add > Service binding.' },
      500,
    );
  }
  try {
    return await env.TRIAL_FETCH_WORKER.fetch(request);
  } catch (err) {
    const msg = (err && err.message) || 'binding error';
    return jsonRes({ error: `Service binding TRIAL_FETCH_WORKER gagal: ${String(msg).slice(0, 200)}` }, 500);
  }
}
