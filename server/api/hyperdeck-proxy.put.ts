/**
 * Proxy PUT to HyperDeck REST API (avoids CORS from browser).
 * Body: { ip: string, path: string, body?: object }
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => ({}))
  const ip = body?.ip ?? (body && 'ip' in body ? (body as any).ip : null)
  const path = body?.path ?? (body && 'path' in body ? (body as any).path : null)
  const data = body?.body ?? (body && 'body' in body ? (body as any).body : null)
  if (!ip || !path || !path.startsWith('/')) {
    throw createError({ statusCode: 400, statusMessage: 'Missing or invalid ip/path' })
  }
  const url = `http://${ip}${path}`
  try {
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: data != null ? JSON.stringify(data) : undefined
    })
    return { ok: res.ok, status: res.status }
  } catch (e: any) {
    throw createError({ statusCode: 502, statusMessage: e?.message || 'HyperDeck unreachable' })
  }
})
