import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'

export const useCameraStore = defineStore('camera', () => {
  const globalAutoRestartEnabled = ref(true)

  const cameras = reactive({})
  const cameraOrder = ref([]) // array of camera IDs in display order

  const initializeWebSocket = (cameraId) => {
    if (!process.client) return
    const camera = cameras[cameraId]
    if (!camera) return

    try {
      fetch(`http://${camera.ip}/control/api/v1/system/format`, {
        method: 'GET'
      }).then(response => {
        if (response.ok) {
          initializeWebSocketConnection(cameraId)
        } else {
          camera.connected = false
        }
      }).catch(() => {
        camera.connected = false
        initializeWebSocketConnection(cameraId)
      })
    } catch (error) {
      camera.connected = false
    }
  }

  const initializeWebSocketConnection = (cameraId) => {
    if (!process.client) return
    const camera = cameras[cameraId]
    if (!camera) return

    try {
      camera.ws = new WebSocket(`ws://${camera.ip}/control/api/v1/event/websocket`)

      camera.ws.onopen = () => {
        camera.connected = true
        camera.ws.send(JSON.stringify({
          type: 'request',
          data: { action: 'listProperties' }
        }))
      }

      camera.ws.onmessage = (event) => {
        try {
          const eventData = JSON.parse(event.data)
          const messageData = eventData.data

          if (messageData.action === 'listProperties') {
            camera.availableProperties = messageData.properties || []
            setTimeout(() => subscribeToProperties(cameraId), 100)
          }

          if (eventData.type === 'response') {
            Object.assign(camera.propertyData, messageData.values || {})
            updateUIFromPropertyData(cameraId)
          }

          if (messageData.action === 'propertyValueChanged') {
            camera.propertyData[messageData.property] = messageData.value
            updateUIFromPropertyData(cameraId)
          }
        } catch {
        }
      }

      camera.ws.onerror = () => {
        camera.connected = false
      }

      camera.ws.onclose = () => {
        camera.connected = false
        setTimeout(() => {
          if (!camera.connected) {
            initializeWebSocket(cameraId)
          }
        }, 5000)
      }
    } catch {
      camera.connected = false
    }
  }

  const subscribeToProperties = (cameraId) => {
    if (!process.client) return
    const camera = cameras[cameraId]
    if (!camera || !camera.ws || camera.ws.readyState !== WebSocket.OPEN) return

    const relevantProperties = [
      '/transports/0/record',
      '/transports/0/timecode',
      '/system/format',
      '/media/active',
      '/camera/power'
    ]

    relevantProperties.forEach(property => {
      if (camera.availableProperties.includes(property)) {
        camera.ws.send(JSON.stringify({
          type: 'request',
          data: {
            action: 'subscribe',
            properties: [property]
          }
        }))
      }
    })
  }

  const updateUIFromPropertyData = (cameraId) => {
    const camera = cameras[cameraId]
    if (!camera) return

    if (camera.propertyData['/transports/0/record']) {
      const recordData = camera.propertyData['/transports/0/record']
      if (recordData.recording !== camera.recording) {
        const wasRecording = camera.recording
        camera.recording = recordData.recording

        if (wasRecording && !camera.recording && !camera.manualStop) {
          startRecording(cameraId)
        }
      }
    }

    if (camera.recording && camera.propertyData['/transports/0/timecode']) {
      const timecodeData = camera.propertyData['/transports/0/timecode']
      if (timecodeData.display) {
        camera.timecode = timecodeData.display
      }
    }

    if (camera.propertyData['/system/format']) {
      const formatData = camera.propertyData['/system/format']
      camera.format = {
        codec: formatData.codec ? formatData.codec.toUpperCase().replace(':', ' ').replace('_', ':') : 'N/A',
        frameRate: formatData.frameRate || 'N/A',
        resolution: formatData.recordResolution
          ? `${formatData.recordResolution.width}x${formatData.recordResolution.height}` : 'N/A'
      }
    }

    if (camera.propertyData['/media/active']) {
      const mediaData = camera.propertyData['/media/active']
      camera.deviceName = mediaData.deviceName || 'N/A'
    }

    if (camera.propertyData['/camera/power']) {
      const powerData = camera.propertyData['/camera/power']
      camera.power = {
        source: powerData.source || '',
        milliVolt: powerData.milliVolt ?? null,
        batteries: Array.isArray(powerData.batteries) ? powerData.batteries : []
      }
    }
  }

  const toggleRecording = async (cameraId) => {
    const camera = cameras[cameraId]
    if (!camera || !camera.connected) return

    if (!camera.recording) {
      await startRecording(cameraId)
    } else {
      await stopRecording(cameraId)
    }
  }

  const startRecording = async (cameraId) => {
    const camera = cameras[cameraId]
    if (!camera || !camera.connected) return

    try {
      const response = await fetch(`http://${camera.ip}/control/api/v1/transports/0/record`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ recording: true })
      })

      if (response.ok) {
        camera.recording = true
        camera.manualStop = false
      }
    } catch {
    }
  }

  const stopRecording = async (cameraId) => {
    const camera = cameras[cameraId]
    if (!camera || !camera.connected) return

    try {
      const response = await fetch(`http://${camera.ip}/control/api/v1/transports/0/record`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ recording: false })
      })

      if (response.ok) {
        camera.manualStop = true
        camera.recording = false
      }
    } catch {
    }
  }

  const testCameraConnection = async (cameraId) => {
    const camera = cameras[cameraId]
    if (!camera) return false

    try {
      const response = await fetch(`http://${camera.ip}/control/api/v1/system/format`, {
        method: 'GET'
      })

      if (response.ok) {
        return true
      }
      return false
    } catch {
      return false
    }
  }

  const resetManualStop = (cameraId) => {
    const camera = cameras[cameraId]
    if (camera) {
      camera.manualStop = false
    }
  }

  const setGlobalAutoRestart = (enabled) => {
    globalAutoRestartEnabled.value = enabled

    Object.keys(cameras).forEach(cameraId => {
      if (enabled) {
        cameras[cameraId].manualStop = false
      } else {
        cameras[cameraId].manualStop = true
      }
    })
  }

  const getGlobalAutoRestart = () => {
    return globalAutoRestartEnabled.value
  }

  const initializeCameras = () => {
    if (!process.client) return

    Object.keys(cameras).forEach(cameraId => {
      initializeWebSocket(cameraId)
    })

    setTimeout(() => {
      Object.keys(cameras).forEach(cameraId => {
        testCameraConnection(cameraId)
      })
    }, 3000)
  }

  const cleanup = () => {
    if (!process.client) return

    Object.keys(cameras).forEach(cameraId => {
      const camera = cameras[cameraId]
      if (camera && camera.ws) {
        camera.ws.close()
      }
    })
  }

  const loadCameraConfigs = async () => {
    try {
      const res = await fetch('/api/cameras')
      if (!res.ok) return
      const data = await res.json()
      Object.keys(cameras).forEach((key) => {
        delete cameras[key]
      })
      cameraOrder.value = []
      data.forEach((cfg) => {
        if (!cfg || !cfg.id || !cfg.ip) return
        cameras[cfg.id] = {
          id: cfg.id,
          ip: cfg.ip,
          connected: false,
          recording: false,
          manualStop: false,
          ws: null,
          propertyData: {},
          availableProperties: [],
          timecode: '00:00:00:00',
          format: {},
          deviceName: '',
          power: { source: '', milliVolt: null, batteries: [] }
        }
        cameraOrder.value.push(cfg.id)
      })
    } catch {
    }
  }

  const saveCameraConfigs = async () => {
    try {
      const order = cameraOrder.value.filter(id => cameras[id])
      const payload = order.map((id, i) => ({
        id: cameras[id].id,
        ip: cameras[id].ip,
        sort_order: i + 1
      }))

      await fetch('/api/cameras', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
    } catch {
    }
  }

  const reorderCameras = async (newOrderIds) => {
    cameraOrder.value = newOrderIds
    await saveCameraConfigs()
  }

  const addCameraConfig = async (id, ip) => {
    if (!id || !ip) return

    if (!cameras[id]) {
      cameras[id] = {
        id,
        ip,
        connected: false,
        recording: false,
        manualStop: false,
        ws: null,
        propertyData: {},
        availableProperties: [],
        timecode: '00:00:00:00',
        format: {},
        deviceName: '',
        power: { source: '', milliVolt: null, batteries: [] }
      }
      cameraOrder.value.push(id)
    } else {
      cameras[id].ip = ip
    }

    await saveCameraConfigs()

    if (process.client) {
      initializeWebSocket(id)
      setTimeout(() => {
        testCameraConnection(id)
      }, 3000)
    }
  }

  const removeCameraConfig = async (id) => {
    const camera = cameras[id]
    if (!camera) return

    if (process.client && camera.ws) {
      try {
        camera.ws.close()
      } catch {
      }
    }

    delete cameras[id]
    cameraOrder.value = cameraOrder.value.filter(cid => cid !== id)

    await saveCameraConfigs()
  }

  return {
    cameras,
    cameraOrder,
    toggleRecording,
    startRecording,
    stopRecording,
    initializeCameras,
    cleanup,
    resetManualStop,
    setGlobalAutoRestart,
    getGlobalAutoRestart,
    loadCameraConfigs,
    saveCameraConfigs,
    reorderCameras,
    addCameraConfig,
    removeCameraConfig
  }
})

