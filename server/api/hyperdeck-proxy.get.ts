/**
 * Proxy GET to HyperDeck REST API (avoids CORS from browser).
 * Query: ip, path (e.g. path=/transports/0)
 * See: REST API for HyperDeck (Blackmagic)
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const ip = query.ip as string
  const path = query.path as string
  if (!ip || !path || !path.startsWith('/')) {
    throw createError({ statusCode: 400, statusMessage: 'Missing or invalid ip/path' })
  }
  const url = `http://${ip}${path}`
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' }
    })
    if (res.status === 204) return null
    const text = await res.text()
    if (!text) return null
    try {
      return JSON.parse(text)
    } catch {
      // Device returned non-JSON (e.g. HTML error page) → treat as unreachable, return null
      return null
    }
  } catch (e: any) {
    if (e.statusCode) throw e
    throw createError({ statusCode: 502, statusMessage: e?.message || 'HyperDeck unreachable' })
  }
})
