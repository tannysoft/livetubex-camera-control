import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'

export const useCameraStore = defineStore('camera', () => {
  // Global auto restart setting
  const globalAutoRestartEnabled = ref(true)

  // Camera configurations
  const cameras = reactive({
    cam1: {
      id: 'cam1',
      ip: import.meta.env.VITE_CAM1_IP || '192.168.110.158',
      connected: false,
      recording: false,
      manualStop: false,
      ws: null,
      propertyData: {},
      availableProperties: [],
      timecode: '00:00:00:00',
      format: {},
      deviceName: ''
    },
    cam2: {
      id: 'cam2',
      ip: import.meta.env.VITE_CAM2_IP || '192.168.110.157',
      connected: false,
      recording: false,
      manualStop: false,
      ws: null,
      propertyData: {},
      availableProperties: [],
      timecode: '00:00:00:00',
      format: {},
      deviceName: ''
    },
    cam3: {
      id: 'cam3',
      ip: import.meta.env.VITE_CAM3_IP || '192.168.110.93',
      connected: false,
      recording: false,
      manualStop: false,
      ws: null,
      propertyData: {},
      availableProperties: [],
      timecode: '00:00:00:00',
      format: {},
      deviceName: ''
    },
    cam4: {
      id: 'cam4',
      ip: import.meta.env.VITE_CAM4_IP || '192.168.110.53',
      connected: false,
      recording: false,
      manualStop: false,
      ws: null,
      propertyData: {},
      availableProperties: [],
      timecode: '00:00:00:00',
      format: {},
      deviceName: ''
    },
    cam9: {
      id: 'cam9',
      ip: import.meta.env.VITE_CAM9_IP || '192.168.110.210',
      connected: false,
      recording: false,
      manualStop: false,
      ws: null,
      propertyData: {},
      availableProperties: [],
      timecode: '00:00:00:00',
      format: {},
      deviceName: ''
    },
  })

  // Initialize WebSocket connection for a camera
  const initializeWebSocket = (cameraId) => {
    const camera = cameras[cameraId]
    if (!camera) return

    try {
      console.log(`Attempting to connect to ${camera.ip} for ${cameraId}`)

      // Try HTTP connection first to check if camera is reachable
      fetch(`http://${camera.ip}/control/api/v1/system/format`, {
        method: 'GET',
        timeout: 3000
      }).then(response => {
        if (response.ok) {
          console.log(`HTTP connection successful to ${camera.ip}`)
          // If HTTP works, try WebSocket
          initializeWebSocketConnection(cameraId)
        } else {
          console.log(`HTTP connection failed to ${camera.ip}: ${response.status}`)
          camera.connected = false
        }
      }).catch(error => {
        console.log(`HTTP connection error to ${camera.ip}:`, error)
        camera.connected = false
        // Fallback: try WebSocket anyway
        initializeWebSocketConnection(cameraId)
      })

    } catch (error) {
      console.error(`Failed to initialize connection for ${cameraId}:`, error)
      camera.connected = false
    }
  }

  // Initialize actual WebSocket connection
  const initializeWebSocketConnection = (cameraId) => {
    const camera = cameras[cameraId]
    if (!camera) return

    try {
      camera.ws = new WebSocket(`ws://${camera.ip}/control/api/v1/event/websocket`)

      camera.ws.onopen = () => {
        console.log(`WebSocket connected to ${camera.ip} for ${cameraId}`)
        camera.connected = true

        camera.ws.send(JSON.stringify({
          type: "request",
          data: { action: "listProperties" }
        }))
      }

      camera.ws.onmessage = (event) => {
        try {
          const eventData = JSON.parse(event.data)
          const messageData = eventData.data

          console.log(`WebSocket message from ${cameraId}:`, eventData)

          if (messageData.action === "listProperties") {
            camera.availableProperties = messageData.properties || []
            console.log(`Available properties for ${cameraId}:`, camera.availableProperties)
            setTimeout(() => subscribeToProperties(cameraId), 100)
          }

          if (eventData.type === "response") {
            Object.assign(camera.propertyData, messageData.values || {})
            updateUIFromPropertyData(cameraId)
          }

          if (messageData.action === "propertyValueChanged") {
            camera.propertyData[messageData.property] = messageData.value
            updateUIFromPropertyData(cameraId)
          }

        } catch (error) {
          console.error(`Error parsing WebSocket message for ${cameraId}:`, error)
        }
      }

      camera.ws.onerror = (error) => {
        console.error(`WebSocket error for ${cameraId}:`, error)
        camera.connected = false
      }

      camera.ws.onclose = () => {
        console.log(`WebSocket closed for ${cameraId}`)
        camera.connected = false

        setTimeout(() => {
          if (!camera.connected) {
            console.log(`Attempting to reconnect to ${cameraId}`)
            initializeWebSocket(cameraId)
          }
        }, 5000)
      }

    } catch (error) {
      console.error(`Failed to initialize WebSocket for ${cameraId}:`, error)
      camera.connected = false
    }
  }

  // Subscribe to relevant camera properties
  const subscribeToProperties = (cameraId) => {
    const camera = cameras[cameraId]
    if (!camera || !camera.ws || camera.ws.readyState !== WebSocket.OPEN) return

    const relevantProperties = [
      "/transports/0/record",
      "/transports/0/timecode",
      "/system/format",
      "/media/active"
    ]

    relevantProperties.forEach(property => {
      if (camera.availableProperties.includes(property)) {
        camera.ws.send(JSON.stringify({
          type: "request",
          data: {
            action: "subscribe",
            properties: [property]
          }
        }))
      }
    })
  }

  // Update UI based on property data
  const updateUIFromPropertyData = (cameraId) => {
    const camera = cameras[cameraId]
    if (!camera) return

    // Update recording status
    if (camera.propertyData['/transports/0/record']) {
      const recordData = camera.propertyData['/transports/0/record']
      if (recordData.recording !== camera.recording) {
        const wasRecording = camera.recording
        camera.recording = recordData.recording

        // Auto-restart recording if it was stopped (but not manually) and auto restart is enabled
        if (wasRecording && !camera.recording && !camera.manualStop) {
          console.log(`🔄 Auto-restarting recording for ${cameraId} (auto restart enabled)`)
          startRecording(cameraId)
        } else if (wasRecording && !camera.recording && camera.manualStop) {
          console.log(`⏹️ Recording stopped for ${cameraId} - NO auto-restart (manual stop or auto restart disabled)`)
        }
      }
    }

    // Update timecode
    if (camera.propertyData['/transports/0/timecode']) {
      const timecodeData = camera.propertyData['/transports/0/timecode']
      // Use display if available (already formatted string from WebSocket)
      if (timecodeData.display) {
        camera.timecode = timecodeData.display
      } else if (timecodeData.timecode !== undefined) {
        // Fallback to parsing BCD timecode
        camera.timecode = parseTimecode(timecodeData.timecode)
      } else if (timecodeData.clip !== undefined) {
        // Legacy fallback for clip property
        camera.timecode = parseTimecode(timecodeData.clip)
      }
    }

    // Update format data
    if (camera.propertyData['/system/format']) {
      const formatData = camera.propertyData['/system/format']
      camera.format = {
        codec: formatData.codec ? formatData.codec.toUpperCase().replace(":", " ").replace("_", ":") : 'N/A',
        frameRate: formatData.frameRate || 'N/A',
        resolution: formatData.recordResolution ?
          `${formatData.recordResolution.width}x${formatData.recordResolution.height}` : 'N/A'
      }
    }

    // Update device name
    if (camera.propertyData['/media/active']) {
      const mediaData = camera.propertyData['/media/active']
      camera.deviceName = mediaData.deviceName || 'N/A'
    }
  }

  // Fallback HTTP API for recording status
  const updateRecordingStatusHTTP = async (cameraId) => {
    const camera = cameras[cameraId]
    if (!camera || !camera.connected) return

    try {
      const response = await fetch(`http://${camera.ip}/control/api/v1/transports/0/record`)
      if (response.ok) {
        const data = await response.json()
        if (data.recording !== camera.recording) {
          const wasRecording = camera.recording
          camera.recording = data.recording

          // Auto-restart recording if it was stopped (but not manually) and auto restart is enabled
          if (wasRecording && !camera.recording && !camera.manualStop) {
            console.log(`🔄 Auto-restarting recording for ${cameraId} (HTTP fallback - auto restart enabled)`)
            startRecording(cameraId)
          } else if (wasRecording && !camera.recording && camera.manualStop) {
            console.log(`⏹️ Recording stopped for ${cameraId} (HTTP fallback) - NO auto-restart (manual stop or auto restart disabled)`)
          }
        }
      }
    } catch (error) {
      console.log(`HTTP fallback failed for ${cameraId}:`, error)
    }
  }

  // Parse timecode from BCD (Binary Coded Decimal)
  // BCD format: each byte represents 2 decimal digits (HH:MM:SS:FF)
  // Bit 31 is the drop frame flag
  const parseTimecode = (timecodeBCD) => {
    // Remove drop frame flag (bit 31)
    const value = timecodeBCD & 0x7FFFFFFF
    // Convert to hex string and pad to 8 characters
    const hexString = value.toString(16).padStart(8, '0')
    // Split into pairs (HH:MM:SS:FF) and join with colons
    return hexString.match(/.{2}/g).join(':')
  }

  // Recording functions
  const toggleRecording = async (cameraId) => {
    console.log(`Store: toggleRecording called for ${cameraId}`)
    console.log(`Store: Available cameras:`, Object.keys(cameras))
    console.log(`Store: Camera object for ${cameraId}:`, cameras[cameraId])

    const camera = cameras[cameraId]
    if (!camera) {
      console.error(`Store: Camera ${cameraId} not found`)
      console.error(`Store: Available camera IDs:`, Object.keys(cameras))
      return
    }

    if (!camera.connected) {
      console.error(`Store: Camera ${cameraId} is not connected`)
      console.error(`Store: Camera connection status:`, camera.connected)
      console.error(`Store: Camera IP:`, camera.ip)
      return
    }

    console.log(`Store: Camera ${cameraId} current recording state:`, camera.recording)
    console.log(`Store: Camera ${cameraId} connection status:`, camera.connected)
    console.log(`Store: Camera ${cameraId} IP address:`, camera.ip)

    if (!camera.recording) {
      console.log(`Store: Starting recording for ${cameraId}`)
      await startRecording(cameraId)
    } else {
      console.log(`Store: Stopping recording for ${cameraId}`)
      await stopRecording(cameraId)
    }
  }

  const startRecording = async (cameraId) => {
    console.log(`Store: startRecording called for ${cameraId}`)

    const camera = cameras[cameraId]
    if (!camera) {
      console.error(`Camera ${cameraId} not found`)
      return
    }

    if (!camera.connected) {
      console.error(`Camera ${cameraId} is not connected`)
      return
    }

    console.log(`Attempting to start recording for ${cameraId} at ${camera.ip}`)
    console.log(`Full URL: http://${camera.ip}/control/api/v1/transports/0/record`)
    console.log(`Request method: PUT`)
    console.log(`Request headers: { 'Content-Type': 'application/json' }`)

    try {
      const requestBody = { recording: true }
      console.log(`Request body:`, requestBody)
      console.log(`Request body JSON:`, JSON.stringify(requestBody))

      console.log(`Sending fetch request...`)

      // Create AbortController for timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      const response = await fetch(`http://${camera.ip}/control/api/v1/transports/0/record`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        mode: 'cors',
        signal: controller.signal,
        body: JSON.stringify(requestBody)
      })

      clearTimeout(timeoutId)

      console.log(`Fetch request completed`)
      console.log(`Start recording response for ${cameraId}:`, response.status, response.statusText)
      console.log(`Response headers:`, Object.fromEntries(response.headers.entries()))

      if (response.ok) {
        try {
          const responseData = await response.json()
          console.log(`Start recording success for ${cameraId}:`, responseData)
        } catch (e) {
          console.log(`Start recording success for ${cameraId} (no JSON response)`)
        }
        camera.recording = true
        camera.manualStop = false
        console.log(`Camera ${cameraId} recording state updated to:`, camera.recording)
      } else {
        console.error(`Start recording failed for ${cameraId}: ${response.status} ${response.statusText}`)
        try {
          const errorText = await response.text()
          console.error(`Error details:`, errorText)
        } catch (e) {
          console.error(`Could not read error response`)
        }
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error(`Request timeout for ${cameraId} - camera may be unreachable`)
      } else {
        console.error(`Failed to start recording for ${cameraId}:`, error)
        console.error(`Error details:`, error.message, error.stack)
        console.error(`Error type:`, error.constructor.name)
      }
    }
  }

  const stopRecording = async (cameraId) => {
    const camera = cameras[cameraId]
    if (!camera) {
      console.error(`Camera ${cameraId} not found`)
      return
    }

    if (!camera.connected) {
      console.error(`Camera ${cameraId} is not connected`)
      return
    }

    console.log(`Attempting to stop recording for ${cameraId} at ${camera.ip}`)
    console.log(`Full URL: http://${camera.ip}/control/api/v1/transports/0/record`)
    console.log(`Request method: PUT`)
    console.log(`Request headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }`)

    try {
      const requestBody = { recording: false }
      console.log(`Request body:`, requestBody)
      console.log(`Request body JSON:`, JSON.stringify(requestBody))

      console.log(`Sending fetch request to stop recording...`)

      // Create AbortController for timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      const response = await fetch(`http://${camera.ip}/control/api/v1/transports/0/record`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        mode: 'cors',
        signal: controller.signal,
        body: JSON.stringify(requestBody)
      })

      clearTimeout(timeoutId)
      console.log(`Fetch request completed`)
      console.log(`Stop recording response for ${cameraId}:`, response.status, response.statusText)
      console.log(`Response headers:`, Object.fromEntries(response.headers.entries()))

      if (response.ok) {
        try {
          const responseData = await response.json()
          console.log(`Stop recording success for ${cameraId}:`, responseData)
        } catch (e) {
          console.log(`Stop recording success for ${cameraId} (no JSON response)`)
        }

        // Set manual stop flag to prevent auto-restart
        camera.manualStop = true
        camera.recording = false

        console.log(`✅ Manual stop for ${cameraId} - auto-restart DISABLED`)
        console.log(`Camera ${cameraId} recording state updated to:`, camera.recording)
        console.log(`Camera ${cameraId} manualStop flag set to:`, camera.manualStop)
      } else {
        console.error(`Stop recording failed for ${cameraId}: ${response.status} ${response.statusText}`)
        try {
          const errorText = await response.text()
          console.error(`Error details:`, errorText)
        } catch (e) {
          console.error(`Could not read error response`)
        }
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error(`Request timeout for ${cameraId} - camera may be unreachable`)
      } else {
        console.error(`Failed to stop recording for ${cameraId}:`, error)
        console.error(`Error details:`, error.message, error.stack)
        console.error(`Error type:`, error.constructor.name)
      }
    }
  }

  // Test camera connection
  const testCameraConnection = async (cameraId) => {
    const camera = cameras[cameraId]
    if (!camera) return false

    try {
      console.log(`Testing connection to ${camera.ip}...`)
      const response = await fetch(`http://${camera.ip}/control/api/v1/system/format`, {
        method: 'GET',
        timeout: 5000
      })

      if (response.ok) {
        console.log(`✅ Camera ${cameraId} is reachable`)
        return true
      } else {
        console.log(`❌ Camera ${cameraId} returned status: ${response.status}`)
        return false
      }
    } catch (error) {
      console.log(`❌ Camera ${cameraId} connection failed:`, error.message)
      return false
    }
  }

  // Reset manual stop flag (for when user wants to enable auto-restart again)
  const resetManualStop = (cameraId) => {
    const camera = cameras[cameraId]
    if (camera) {
      camera.manualStop = false
      console.log(`🔄 Manual stop flag reset for ${cameraId} - auto-restart ENABLED`)
    }
  }

  // Set global auto restart setting
  const setGlobalAutoRestart = (enabled) => {
    globalAutoRestartEnabled.value = enabled
    console.log(`Global auto restart ${enabled ? 'ENABLED' : 'DISABLED'}`)

    // Update all cameras' manualStop flag based on global setting
    Object.keys(cameras).forEach(cameraId => {
      if (enabled) {
        // Enable auto restart - reset manualStop flag
        cameras[cameraId].manualStop = false
        console.log(`Camera ${cameraId} auto restart enabled`)
      } else {
        // Disable auto restart - set manualStop flag to prevent auto restart
        cameras[cameraId].manualStop = true
        console.log(`Camera ${cameraId} auto restart disabled`)
      }
    })
  }

  // Get global auto restart status
  const getGlobalAutoRestart = () => {
    return globalAutoRestartEnabled.value
  }

  // Initialize all cameras
  const initializeCameras = () => {
    Object.keys(cameras).forEach(cameraId => {
      initializeWebSocket(cameraId)
    })

    // Test all camera connections after 3 seconds
    setTimeout(() => {
      Object.keys(cameras).forEach(cameraId => {
        testCameraConnection(cameraId)
      })
    }, 3000)

    // Set up HTTP fallback polling for recording status
    setInterval(() => {
      Object.keys(cameras).forEach(cameraId => {
        if (cameras[cameraId].connected) {
          updateRecordingStatusHTTP(cameraId)
        }
      })
    }, 2000) // Check every 2 seconds
  }

  // Cleanup
  const cleanup = () => {
    Object.keys(cameras).forEach(cameraId => {
      const camera = cameras[cameraId]
      if (camera && camera.ws) {
        camera.ws.close()
      }
    })
  }

  return {
    cameras,
    toggleRecording,
    startRecording,
    stopRecording,
    initializeCameras,
    cleanup,
    resetManualStop,
    setGlobalAutoRestart,
    getGlobalAutoRestart
  }
}) 