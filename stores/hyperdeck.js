import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'

const HYPERDECK_API_BASE = '/control/api/v1'
const WS_PATH = '/control/api/v1/event/websocket'

// Use server proxy for REST (CORS) when needed
function proxyGet(ip, path) {
  const q = new URLSearchParams({ ip, path })
  return fetch(`/api/hyperdeck-proxy?${q}`).then(async (res) => {
    if (!res.ok) return null
    const text = await res.text()
    if (!text) return null
    try {
      return JSON.parse(text)
    } catch {
      return null
    }
  })
}

function proxyPost(ip, path, body = undefined) {
  return fetch('/api/hyperdeck-proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ip, path, body })
  }).then((res) => res.json().then((data) => data?.ok === true).catch(() => res.ok))
}

function proxyPut(ip, path, body = undefined) {
  return fetch('/api/hyperdeck-proxy', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ip, path, body })
  }).then((res) => res.json().then((data) => data?.ok === true).catch(() => res.ok))
}

export const useHyperdeckStore = defineStore('hyperdeck', () => {
  const hyperdecks = reactive({})
  const hyperdeckOrder = ref([])

  const updateUIFromPropertyData = (hyperdeckId) => {
    const h = hyperdecks[hyperdeckId]
    if (!h) return
    const d = h.propertyData || {}
    if (d['/transports/0']) {
      const mode = d['/transports/0'].mode
      if (mode) h.mode = mode
    }
    if (d['/transports/0/record']) {
      h.recording = d['/transports/0/record'].recording === true
    }
    if (d['/transports/0/timecode']) {
      const tc = d['/transports/0/timecode'].display ?? d['/transports/0/timecode'].timeline
      if (typeof tc === 'string') h.timecode = tc
    }
    if (d['/system/product']) {
      const p = d['/system/product']
      h.productName = p.productName ?? ''
      h.softwareVersion = p.softwareVersion ?? ''
    }
  }

  const subscribeToProperties = (hyperdeckId) => {
    if (!process.client) return
    const h = hyperdecks[hyperdeckId]
    if (!h?.ws || h.ws.readyState !== WebSocket.OPEN) return
    const props = [
      '/transports/0',
      '/transports/0/record',
      '/transports/0/timecode',
      '/system/product'
    ]
    const available = h.availableProperties || []
    props.forEach((property) => {
      if (available.includes(property)) {
        h.ws.send(JSON.stringify({
          type: 'request',
          data: { action: 'subscribe', properties: [property] }
        }))
      }
    })
  }

  const initializeWebSocketConnection = (hyperdeckId) => {
    if (!process.client) return
    const h = hyperdecks[hyperdeckId]
    if (!h) return
    try {
      h.ws = new WebSocket(`ws://${h.ip}${WS_PATH}`)
      h.ws.onopen = () => {
        h.connected = true
        h.ws.send(JSON.stringify({ type: 'request', data: { action: 'listProperties' } }))
      }
      h.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data)
          const data = msg.data || {}
          if (data.action === 'listProperties') {
            h.availableProperties = data.properties || []
            setTimeout(() => subscribeToProperties(hyperdeckId), 100)
          }
          if (msg.type === 'response' && data.values) {
            Object.assign(h.propertyData, data.values)
            updateUIFromPropertyData(hyperdeckId)
          }
          if (data.action === 'propertyValueChanged') {
            h.propertyData[data.property] = data.value
            updateUIFromPropertyData(hyperdeckId)
          }
        } catch {
          // ignore parse errors
        }
      }
      h.ws.onerror = () => {
        h.connected = false
      }
      h.ws.onclose = () => {
        h.connected = false
        setTimeout(() => {
          if (hyperdecks[hyperdeckId] && !hyperdecks[hyperdeckId].connected) {
            initializeWebSocketConnection(hyperdeckId)
          }
        }, 5000)
      }
    } catch {
      h.connected = false
    }
  }

  const initializeWebSocket = (hyperdeckId) => {
    if (!process.client) return
    const h = hyperdecks[hyperdeckId]
    if (!h) return
    // Optional: pre-check via REST; if fail still try ws (same as camera)
    proxyGet(h.ip, `${HYPERDECK_API_BASE}/system/product`)
      .then((product) => {
        if (product) {
          h.productName = product.productName ?? ''
          h.softwareVersion = product.softwareVersion ?? ''
        }
      })
      .catch(() => {})
    initializeWebSocketConnection(hyperdeckId)
  }

  const startRecording = async (hyperdeckId) => {
    const h = hyperdecks[hyperdeckId]
    if (!h) return
    try {
      const ok = await proxyPost(h.ip, `${HYPERDECK_API_BASE}/transports/0/record`)
      if (ok) {
        h.recording = true
        h.mode = 'InputRecord'
      }
    } catch {
      // ws will update when device pushes
    }
  }

  const stopRecording = async (hyperdeckId) => {
    const h = hyperdecks[hyperdeckId]
    if (!h) return
    try {
      const ok = await proxyPut(h.ip, `${HYPERDECK_API_BASE}/transports/0`, { mode: 'InputPreview' })
      if (ok) {
        h.recording = false
        h.mode = 'InputPreview'
      }
    } catch {
      // ws will update when device pushes
    }
  }

  const play = async (hyperdeckId) => {
    const h = hyperdecks[hyperdeckId]
    if (!h) return
    try {
      await proxyPost(h.ip, `${HYPERDECK_API_BASE}/transports/0/play`)
    } catch {
      // ws will update
    }
  }

  const stopTransport = async (hyperdeckId) => {
    const h = hyperdecks[hyperdeckId]
    if (!h) return
    try {
      await proxyPost(h.ip, `${HYPERDECK_API_BASE}/transports/0/stop`)
    } catch {
      // ws will update
    }
  }

  const rebootHyperdeck = async (hyperdeckId) => {
    const h = hyperdecks[hyperdeckId]
    if (!h || !h.connected) return false
    try {
      const res = await fetch('/api/hyperdeck-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip: h.ip, path: `${HYPERDECK_API_BASE}/system/reboot` })
      })
      const data = await res.json().catch(() => ({}))
      if (data.ok === true) {
        h.connected = false
        return true
      }
      if (data.status === 409) return false
      return false
    } catch {
      return false
    }
  }

  const loadHyperdeckConfigs = async () => {
    try {
      const res = await fetch('/api/hyperdecks')
      if (!res.ok) return
      const data = await res.json()
      Object.keys(hyperdecks).forEach((key) => {
        const h = hyperdecks[key]
        if (h?.ws) try { h.ws.close() } catch { }
        delete hyperdecks[key]
      })
      hyperdeckOrder.value = []
      ;(data || []).forEach((cfg) => {
        if (!cfg || !cfg.id || !cfg.ip) return
        hyperdecks[cfg.id] = {
          id: cfg.id,
          ip: cfg.ip,
          connected: false,
          recording: false,
          mode: 'InputPreview',
          timecode: '00:00:00:00',
          productName: '',
          softwareVersion: '',
          ws: null,
          propertyData: {},
          availableProperties: []
        }
        hyperdeckOrder.value.push(cfg.id)
      })
    } catch {
      // ignore
    }
  }

  const saveHyperdeckConfigs = async () => {
    try {
      const order = hyperdeckOrder.value.filter((id) => hyperdecks[id])
      const payload = order.map((id, i) => ({
        id: hyperdecks[id].id,
        ip: hyperdecks[id].ip,
        sort_order: i + 1
      }))
      await fetch('/api/hyperdecks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
    } catch {
      // ignore
    }
  }

  const addHyperdeckConfig = async (id, ip) => {
    if (!id || !ip) return
    if (!hyperdecks[id]) {
      hyperdecks[id] = {
        id,
        ip,
        connected: false,
        recording: false,
        mode: 'InputPreview',
        timecode: '00:00:00:00',
        productName: '',
        softwareVersion: '',
        ws: null,
        propertyData: {},
        availableProperties: []
      }
      hyperdeckOrder.value.push(id)
    } else {
      hyperdecks[id].ip = ip
    }
    await saveHyperdeckConfigs()
    if (process.client && hyperdecks[id]) initializeWebSocket(id)
  }

  const removeHyperdeckConfig = async (id) => {
    const h = hyperdecks[id]
    if (!h) return
    if (h.ws) try { h.ws.close() } catch { }
    delete hyperdecks[id]
    hyperdeckOrder.value = hyperdeckOrder.value.filter((x) => x !== id)
    await saveHyperdeckConfigs()
  }

  const initializeHyperdecks = () => {
    if (!process.client) return
    hyperdeckOrder.value.forEach((id) => {
      if (hyperdecks[id]) initializeWebSocket(id)
    })
  }

  const cleanup = () => {
    if (!process.client) return
    hyperdeckOrder.value.forEach((id) => {
      const h = hyperdecks[id]
      if (h?.ws) {
        try { h.ws.close() } catch { }
        h.ws = null
      }
    })
  }

  const reorderHyperdecks = async (newOrderIds) => {
    hyperdeckOrder.value = newOrderIds
    await saveHyperdeckConfigs()
  }

  const pollHyperdeck = async (hyperdeckId) => {
    const h = hyperdecks[hyperdeckId]
    if (!h) return
    let product
    try {
      product = await proxyGet(h.ip, `${HYPERDECK_API_BASE}/system/product`)
    } catch {
      product = null
    }
    if (!product) {
      h.connected = false
      h.productName = ''
      h.softwareVersion = ''
      h.mode = 'InputPreview'
      h.recording = false
      h.timecode = '00:00:00:00'
      return
    }
    h.connected = true
    h.productName = product.productName ?? ''
    h.softwareVersion = product.softwareVersion ?? ''
    try {
      const [transport, recordState, timecode] = await Promise.all([
        proxyGet(h.ip, `${HYPERDECK_API_BASE}/transports/0`),
        proxyGet(h.ip, `${HYPERDECK_API_BASE}/transports/0/record`),
        proxyGet(h.ip, `${HYPERDECK_API_BASE}/transports/0/timecode`)
      ])
      h.mode = transport?.mode ?? 'InputPreview'
      h.recording = recordState?.recording === true
      const tc = timecode?.display ?? timecode?.timeline
      h.timecode = typeof tc === 'string' ? tc : '00:00:00:00'
    } catch {
      // keep connected
    }
  }

  return {
    hyperdecks,
    hyperdeckOrder,
    loadHyperdeckConfigs,
    saveHyperdeckConfigs,
    addHyperdeckConfig,
    removeHyperdeckConfig,
    startRecording,
    stopRecording,
    play,
    stopTransport,
    rebootHyperdeck,
    initializeHyperdecks,
    cleanup,
    pollHyperdeck,
    reorderHyperdecks
  }
})
