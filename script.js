// Camera configuration with WebSocket support
const cameras = {
    camera1: {
        id: 'camera1',
        ip: '192.168.8.201',
        connected: false,
        recording: false,
        ws: null,
        propertyData: {},
        availableProperties: [],
        elements: {
            connectionIndicator: 'connection-indicator-1',
            connectionText: 'connection-text-1',
            recordBtn: 'record-btn-1',
            stopBtn: 'stop-btn-1',
            recordStatus: 'record-status-1',
            currentTimecode: 'current-timecode-1',
            codecValue: 'codec-value-1',
            frameRateValue: 'frame-rate-value-1',
            resolutionValue: 'resolution-value-1',
            deviceNameValue: 'device-name-value-1'
        }
    },
    camera2: {
        id: 'camera2',
        ip: '192.168.8.202',
        connected: false,
        recording: false,
        ws: null,
        propertyData: {},
        availableProperties: [],
        elements: {
            connectionIndicator: 'connection-indicator',
            connectionText: 'connection-text',
            recordBtn: 'record-btn',
            stopBtn: 'stop-btn',
            recordStatus: 'record-status',
            currentTimecode: 'current-timecode',
            codecValue: 'codec-value',
            frameRateValue: 'frame-rate-value',
            resolutionValue: 'resolution-value',
            deviceNameValue: 'device-name-value'
        }
    },
    camera3: {
        id: 'camera3',
        ip: '192.168.8.203',
        connected: false,
        recording: false,
        ws: null,
        propertyData: {},
        availableProperties: [],
        elements: {
            connectionIndicator: 'connection-indicator-3',
            connectionText: 'connection-text-3',
            recordBtn: 'record-btn-3',
            stopBtn: 'stop-btn-3',
            recordStatus: 'record-status-3',
            currentTimecode: 'current-timecode-3',
            codecValue: 'codec-value-3',
            frameRateValue: 'frame-rate-value-3',
            resolutionValue: 'resolution-value-3',
            deviceNameValue: 'device-name-value-3'
        }
    },
    camera5: {
        id: 'camera5',
        ip: '192.168.8.205',
        connected: false,
        recording: false,
        ws: null,
        propertyData: {},
        availableProperties: [],
        elements: {
            connectionIndicator: 'connection-indicator-5',
            connectionText: 'connection-text-5',
            recordBtn: 'record-btn-5',
            stopBtn: 'stop-btn-5',
            recordStatus: 'record-status-5',
            currentTimecode: 'current-timecode-5',
            codecValue: 'codec-value-5',
            resolutionValue: 'resolution-value-5',
            deviceNameValue: 'device-name-value-5'
        }
    }
};

// Helper function to get DOM element by camera ID and element name
function getCameraElement(cameraId, elementName) {
    const camera = cameras[cameraId];
    if (camera && camera.elements[elementName]) {
        return document.getElementById(camera.elements[elementName]);
    }
    return null;
}

// Initialize WebSocket connection for a camera
function initializeWebSocket(cameraId) {
    const camera = cameras[cameraId];
    if (!camera) return;
    
    try {
        // Create WebSocket connection
        camera.ws = new WebSocket(`ws://${camera.ip}/control/api/v1/event/websocket`);
        
        // Set up WebSocket event handlers
        camera.ws.onopen = (event) => {
            console.log(`WebSocket connected to ${camera.ip}`);
            updateConnectionStatus(cameraId, true);
            
            // Request list of available properties
            camera.ws.send(JSON.stringify({
                type: "request", 
                data: {action: "listProperties"}
            }));
        };
        
        camera.ws.onmessage = (event) => {
            try {
                const eventData = JSON.parse(event.data);
                const messageData = eventData.data;
                
                // Handle different types of messages
                if (messageData.action === "listProperties") {
                    camera.availableProperties = messageData.properties;
                    
                    // Subscribe to relevant properties after getting the list
                    setTimeout(() => {
                        subscribeToProperties(cameraId);
                    }, 100);
                }
                
                if (eventData.type === "response") {
                    // Store property values
                    Object.assign(camera.propertyData, messageData.values);
                    updateUIFromPropertyData(cameraId);
                }
                
                if (messageData.action === "propertyValueChanged") {
                    // Update specific property value
                    camera.propertyData[messageData.property] = messageData.value;
                    updateUIFromPropertyData(cameraId);
                }
                
            } catch (error) {
                console.error(`Error parsing WebSocket message for ${cameraId}:`, error);
            }
        };
        
        camera.ws.onerror = (error) => {
            console.error(`WebSocket error for ${cameraId}:`, error);
            updateConnectionStatus(cameraId, false);
        };
        
        camera.ws.onclose = (event) => {
            console.log(`WebSocket closed for ${cameraId}:`, event.code, event.reason);
            updateConnectionStatus(cameraId, false);
            
            // Try to reconnect after a delay
            setTimeout(() => {
                if (!camera.connected) {
                    initializeWebSocket(cameraId);
                }
            }, 5000);
        };
        
    } catch (error) {
        console.error(`Failed to initialize WebSocket for ${cameraId}:`, error);
        updateConnectionStatus(cameraId, false);
    }
}

// Subscribe to relevant camera properties
function subscribeToProperties(cameraId) {
    const camera = cameras[cameraId];
    if (!camera || !camera.ws || camera.ws.readyState !== WebSocket.OPEN) return;
    
    const relevantProperties = [
        "/transports/0/record",
        "/transports/0/timecode",
        "/system/format",
        "/media/active"
    ];
    
    relevantProperties.forEach(property => {
        if (camera.availableProperties.includes(property)) {
            camera.ws.send(JSON.stringify({
                type: "request",
                data: {
                    action: "subscribe",
                    properties: [property]
                }
            }));
        }
    });
}

// Update UI based on property data
function updateUIFromPropertyData(cameraId) {
    const camera = cameras[cameraId];
    if (!camera) return;
    
    // Update recording status
    if (camera.propertyData['/transports/0/record']) {
        const recordData = camera.propertyData['/transports/0/record'];
        if (recordData.recording !== camera.recording) {
            camera.recording = recordData.recording;
            updateRecordingUI(cameraId);
        }
    }
    
    // Update timecode
    if (camera.propertyData['/transports/0/timecode']) {
        const timecodeData = camera.propertyData['/transports/0/timecode'];
        if (timecodeData.timecode !== undefined) {
            updateTimecode(cameraId, timecodeData);
        }
    }
    
    // Update format data
    if (camera.propertyData['/system/format']) {
        const formatData = camera.propertyData['/system/format'];
        updateCameraFormat(cameraId, formatData);
    }
    
    // Update device name
    if (camera.propertyData['/media/active']) {
        const mediaData = camera.propertyData['/media/active'];
        updateDeviceName(cameraId, mediaData);
    }
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all cameras with WebSocket connections
    Object.keys(cameras).forEach(cameraId => {
        updateConnectionStatus(cameraId, false);
        initializeWebSocket(cameraId);
    });
});

// Connection functions
function updateConnectionStatus(cameraId, connected) {
    const camera = cameras[cameraId];
    if (!camera) return;
    
    camera.connected = connected;
    
    const connectionIndicator = getCameraElement(cameraId, 'connectionIndicator');
    const connectionText = getCameraElement(cameraId, 'connectionText');
    
    if (connected) {
        if (connectionIndicator) connectionIndicator.className = 'status-indicator online';
        if (connectionText) connectionText.textContent = 'Online';
        enableControls(cameraId);
    } else {
        if (connectionIndicator) connectionIndicator.className = 'status-indicator offline';
        if (connectionText) connectionText.textContent = 'Connecting...';
        disableControls(cameraId);
    }
}

// Recording functions
async function toggleRecording(cameraId) {
    const camera = cameras[cameraId];
    if (!camera || !camera.connected) {
        return;
    }

    if (!camera.recording) {
        await startRecording(cameraId);
    } else {
        await stopRecording(cameraId);
    }
}

async function startRecording(cameraId) {
    const camera = cameras[cameraId];
    if (!camera) return;
    
    try {
        const response = await fetch(`http://${camera.ip}/control/api/v1/transports/0/record`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ recording: true })
        });
        
        if (response.ok) {
            camera.recording = true;
            updateRecordingUI(cameraId);
        }
    } catch (error) {
        console.error(`Failed to start recording for ${cameraId}:`, error);
    }
}

async function stopRecording(cameraId) {
    const camera = cameras[cameraId];
    if (!camera) return;
    
    try {
        const response = await fetch(`http://${camera.ip}/control/api/v1/transports/0/record`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ recording: false })
        });
        
        if (response.ok) {
            camera.recording = false;
            updateRecordingUI(cameraId);
        }
    } catch (error) {
        console.error(`Failed to stop recording for ${cameraId}:`, error);
    }
}

function updateRecordingUI(cameraId) {
    const camera = cameras[cameraId];
    if (!camera) return;
    
    const recordStatus = getCameraElement(cameraId, 'recordStatus');
    const recordBtn = getCameraElement(cameraId, 'recordBtn');
    const stopBtn = getCameraElement(cameraId, 'stopBtn');
    
    if (camera.recording) {
        if (recordStatus) {
            recordStatus.textContent = 'Recording';
            recordStatus.style.color = '#e74c3c';
        }
        if (recordBtn) recordBtn.disabled = true;
        if (stopBtn) stopBtn.disabled = false;
    } else {
        if (recordStatus) {
            recordStatus.textContent = 'Stopped';
            recordStatus.style.color = '#34495e';
        }
        if (recordBtn) recordBtn.disabled = false;
        if (stopBtn) stopBtn.disabled = true;
    }
}

// Control functions
function enableControls(cameraId) {
    const camera = cameras[cameraId];
    if (!camera) return;
    
    const recordBtn = getCameraElement(cameraId, 'recordBtn');
    const stopBtn = getCameraElement(cameraId, 'stopBtn');
    
    if (recordBtn) recordBtn.disabled = false;
    if (stopBtn) stopBtn.disabled = !camera.recording;
}

function disableControls(cameraId) {
    const camera = cameras[cameraId];
    if (!camera) return;
    
    const recordBtn = getCameraElement(cameraId, 'recordBtn');
    const stopBtn = getCameraElement(cameraId, 'stopBtn');
    
    if (recordBtn) recordBtn.disabled = true;
    if (stopBtn) stopBtn.disabled = true;
}

// Camera format functions
function updateCameraFormat(cameraId, data) {
    const camera = cameras[cameraId];
    if (!camera) return;
    
    const codecValue = getCameraElement(cameraId, 'codecValue');
    const frameRateValue = getCameraElement(cameraId, 'frameRateValue');
    const resolutionValue = getCameraElement(cameraId, 'resolutionValue');
    
    // Update Codec
    if (data.codec && codecValue) {
        codecValue.textContent = data.codec;
    } else if (codecValue) {
        codecValue.textContent = 'N/A';
    }
    
    // Update Frame Rate
    if (data.frameRate && frameRateValue) {
        frameRateValue.textContent = data.frameRate;
    } else if (frameRateValue) {
        frameRateValue.textContent = 'N/A';
    }
    
    // Update Resolution from recordResolution
    if (data.recordResolution && resolutionValue) {
        const width = data.recordResolution.width;
        const height = data.recordResolution.height;
        if (width && height) {
            resolutionValue.textContent = `${width}x${height}`;
        } else {
            resolutionValue.textContent = 'N/A';
        }
    } else if (resolutionValue) {
        resolutionValue.textContent = 'N/A';
    }
}

// Timecode functions
function updateTimecode(cameraId, data) {
    const camera = cameras[cameraId];
    if (!camera) return;
    
    if (data.timecode !== undefined) {
        const formattedTimecode = parseTimecode(data.timecode);
        const currentTimecode = getCameraElement(cameraId, 'currentTimecode');
        if (currentTimecode) {
            currentTimecode.textContent = formattedTimecode;
        }
    }
}

// Device name functions
function updateDeviceName(cameraId, data) {
    const camera = cameras[cameraId];
    if (!camera) return;
    
    const deviceNameValue = getCameraElement(cameraId, 'deviceNameValue');
    
    if (data.deviceName && deviceNameValue) {
        deviceNameValue.textContent = data.deviceName;
    } else if (deviceNameValue) {
        deviceNameValue.textContent = 'N/A';
    }
}

// Parse timecode from BCD
function parseTimecode(timecodeBCD) {
    let noDropFrame = timecodeBCD & 0b01111111111111111111111111111111;     // The first bit of the timecode is 1 if "Drop Frame Timecode" is on. We don't want to include that in the display.
    let decimalTCInt = parseInt(noDropFrame.toString(16), 10);              // Convert the BCD number into base ten
    let decimalTCString = decimalTCInt.toString().padStart(8, '0');         // Convert the base ten number to a string eight characters long
    let finalTCString = decimalTCString.match(/.{1,2}/g).join(':');         // Put colons between every two characters
    return finalTCString;
}

// Set default values when camera is not connected
function setDefaultValues(cameraId) {
    const camera = cameras[cameraId];
    if (!camera) return;
    
    const codecValue = getCameraElement(cameraId, 'codecValue');
    const frameRateValue = getCameraElement(cameraId, 'frameRateValue');
    const resolutionValue = getCameraElement(cameraId, 'resolutionValue');
    const deviceNameValue = getCameraElement(cameraId, 'deviceNameValue');
    const currentTimecode = getCameraElement(cameraId, 'currentTimecode');
    
    if (codecValue) codecValue.textContent = 'Connecting...';
    if (frameRateValue) frameRateValue.textContent = 'Connecting...';
    if (resolutionValue) resolutionValue.textContent = 'Connecting...';
    if (deviceNameValue) deviceNameValue.textContent = 'Connecting...';
    if (currentTimecode) currentTimecode.textContent = '00:00:00:00';
}

// Cleanup WebSocket connections on page unload
window.addEventListener('beforeunload', () => {
    Object.keys(cameras).forEach(cameraId => {
        const camera = cameras[cameraId];
        if (camera && camera.ws) {
            camera.ws.close();
        }
    });
});

// Network status handling
window.addEventListener('online', () => {
    Object.keys(cameras).forEach(cameraId => {
        const camera = cameras[cameraId];
        if (!camera.connected) {
            setTimeout(() => {
                initializeWebSocket(cameraId);
            }, 1000);
        }
    });
});

window.addEventListener('offline', () => {
    Object.keys(cameras).forEach(cameraId => {
        const camera = cameras[cameraId];
        if (camera.connected) {
            updateConnectionStatus(cameraId, false);
        }
    });
}); 