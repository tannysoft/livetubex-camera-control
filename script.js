// Camera configuration
const cameras = {
    camera1: {
        id: 'camera1',
        ip: '192.168.8.201',
        connected: false,
        recording: false,
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
        elements: {
            connectionIndicator: 'connection-indicator-5',
            connectionText: 'connection-text-5',
            recordBtn: 'record-btn-5',
            stopBtn: 'stop-btn-5',
            recordStatus: 'record-status-5',
            currentTimecode: 'current-timecode-5',
            codecValue: 'codec-value-5',
            frameRateValue: 'frame-rate-value-5',
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

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all cameras
    Object.keys(cameras).forEach(cameraId => {
        updateConnectionStatus(cameraId, false);
    });
    
    // Auto-connect after a short delay
    setTimeout(() => {
        Object.keys(cameras).forEach(cameraId => {
            autoConnectToCamera(cameraId);
        });
    }, 1000);
});

// Connection functions
async function autoConnectToCamera(cameraId) {
    const camera = cameras[cameraId];
    if (!camera) return;
    
    updateConnectionText(cameraId, 'Connecting...');
    
    try {
        // Test connection by checking camera format endpoint
        const response = await fetch(`http://${camera.ip}/control/api/v1/system/format`, {
            method: 'GET',
            timeout: 5000
        });
        
        if (response.ok) {
            camera.connected = true;
            updateConnectionStatus(cameraId, true);
            
            // Test format endpoint first
            await testFormatEndpoint(cameraId);
            
            // Get initial camera format, timecode, device name and recording status
            await getCameraFormat(cameraId);
            await getTimecode(cameraId);
            await getDeviceName(cameraId);
            await getRecordingStatus(cameraId);
            
            // Enable controls
            enableControls(cameraId);
        } else {
            throw new Error(`HTTP ${response.status}`);
        }
    } catch (error) {
        updateConnectionStatus(cameraId, false);
        updateConnectionText(cameraId, 'Retrying in 5s...');
        
        // Schedule retry after 5 seconds
        setTimeout(() => {
            if (!camera.connected) {
                updateConnectionText(cameraId, 'Retrying...');
                autoConnectToCamera(cameraId);
            }
        }, 5000);
    }
}

function updateConnectionStatus(cameraId, connected) {
    const camera = cameras[cameraId];
    if (!camera) return;
    
    camera.connected = connected;
    
    const connectionIndicator = getCameraElement(cameraId, 'connectionIndicator');
    const connectionText = getCameraElement(cameraId, 'connectionText');
    
    if (connected) {
        connectionIndicator.className = 'status-indicator online';
        connectionText.textContent = 'Online';
    } else {
        connectionIndicator.className = 'status-indicator offline';
        connectionText.textContent = 'Auto-connecting...';
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

async function startRecording() {
    try {
        // Send start recording command to camera
        const response = await fetch(`http://${cameraIP}/control/api/v1/transports/0/record`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ recording: true })
        });

        if (response.ok) {
            isRecording = true;
            updateRecordingUI();
        } else {
            throw new Error(`HTTP ${response.status}`);
        }
    } catch (error) {
        // Silent error handling
    }
}

async function stopRecording() {
    try {
        // Send stop recording command to camera
        const response = await fetch(`http://${cameraIP}/control/api/v1/transports/0/record`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ recording: false })
        });

        if (response.ok) {
            isRecording = false;
            updateRecordingUI();
        } else {
            throw new Error(`HTTP ${response.status}`);
        }
    } catch (error) {
        // Silent error handling
    }
}

function updateRecordingUI() {
    if (isRecording) {
        recordBtn.disabled = true;
        stopBtn.disabled = false;
        recordStatus.textContent = 'Recording';
        recordStatus.parentElement.classList.add('recording');
    } else {
        recordBtn.disabled = false;
        stopBtn.disabled = true;
        recordStatus.textContent = 'Stopped';
        recordStatus.parentElement.classList.remove('recording');
    }
}





// Camera format functions
async function getCameraFormat() {
    try {
        const response = await fetch(`http://${cameraIP}/control/api/v1/system/format`);
        if (response.ok) {
            const data = await response.json();
            updateCameraFormat(data);
        } else {
            throw new Error(`HTTP ${response.status}`);
        }
    } catch (error) {
        // Set default values if API call fails
        setDefaultFormatValues();
    }
}

// Timecode functions
async function getTimecode() {
    try {
        const response = await fetch(`http://${cameraIP}/control/api/v1/transports/0/timecode`);
        if (response.ok) {
            const data = await response.json();
            updateTimecode(data);
        } else {
            throw new Error(`HTTP ${response.status}`);
        }
    } catch (error) {
        // Set default values if API call fails
        setDefaultTimecodeValues();
    }
}

function updateTimecode(timecodeData) {
    if (timecodeData.timecode) {
        // Parse BCD timecode to HH:MM:SS:FF format
        const formattedTimecode = parseTimecode(timecodeData.timecode);
        currentTimecode.textContent = formattedTimecode;
    }
}

// Parse BCD timecode to HH:MM:SS:FF format
function parseTimecode(timecodeBCD) {
    let noDropFrame = timecodeBCD & 0b01111111111111111111111111111111;     // The first bit of the timecode is 1 if "Drop Frame Timecode" is on. We don't want to include that in the display.
    let decimalTCInt = parseInt(noDropFrame.toString(16), 10);              // Convert the BCD number into base ten
    let decimalTCString = decimalTCInt.toString().padStart(8, '0');         // Convert the base ten number to a string eight characters long
    let finalTCString = decimalTCString.match(/.{1,2}/g).join(':');         // Put colons between every two characters
    return finalTCString;
}






function setDefaultTimecodeValues() {
    currentTimecode.textContent = '00:00:00:00';
}



function updateCameraFormat(formatData) {
    if (formatData.codec) {
        codecValue.textContent = formatData.codec;
    }
    
    if (formatData.frameRate) {
        frameRateValue.textContent = `${formatData.frameRate} fps`;
    }
    
    if (formatData.recordResolution) {
        const { width, height } = formatData.recordResolution;
        resolutionValue.textContent = `${width} × ${height}`;
    }
    
    if (formatData.offSpeedEnabled !== undefined) {
        if (formatData.offSpeedEnabled) {
            offSpeedValue.textContent = `${formatData.offSpeedFrameRate} fps`;
        } else {
            offSpeedValue.textContent = 'Disabled';
        }
    }
}

function setDefaultFormatValues() {
    codecValue.textContent = 'Auto-connecting...';
    frameRateValue.textContent = 'Auto-connecting...';
    resolutionValue.textContent = 'Auto-connecting...';
    offSpeedValue.textContent = 'Auto-connecting...';
}

// Update connection status text based on auto-connect state
function updateConnectionText(cameraId, text) {
    const camera = cameras[cameraId];
    if (!camera || camera.connected) return;
    
    const connectionText = getCameraElement(cameraId, 'connectionText');
    if (connectionText) {
        connectionText.textContent = text;
    }
}

// Enhanced error handling for format API
async function testFormatEndpoint(cameraId) {
    const camera = cameras[cameraId];
    if (!camera) return false;
    
    try {
        const response = await fetch(`http://${camera.ip}/control/api/v1/system/format`, {
            method: 'GET',
            timeout: 3000
        });
        
        if (response.ok) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        return false;
    }
}

// Check camera status using the new endpoint
async function checkCameraStatus(cameraId) {
    const camera = cameras[cameraId];
    if (!camera) return false;
    
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        const response = await fetch(`http://${camera.ip}/control/api/v1/control/api/v1`, {
            method: 'GET',
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
            // Camera is responding, keep connection
            return true;
        } else {
            return false;
        }
    } catch (error) {
        return false;
    }
}

function updateCameraInfo(info) {
    if (info.firmware) {
        document.getElementById('firmware-version').textContent = info.firmware;
    }
    if (info.battery) {
        document.getElementById('battery-level').textContent = `${info.battery}%`;
    }
    if (info.storage) {
        document.getElementById('storage-remaining').textContent = info.storage;
    }
}

async function getRecordingStatus(cameraId) {
    const camera = cameras[cameraId];
    if (!camera) return;
    
    try {
        const response = await fetch(`http://${camera.ip}/control/api/v1/transports/0/record`);
        if (response.ok) {
            const data = await response.json();
            if (data.recording !== camera.recording) {
                camera.recording = data.recording;
                updateRecordingUI(cameraId);
            }
        }
    } catch (error) {
        // Silent error handling
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



// Periodic status updates and auto-reconnection
setInterval(() => {
    Object.keys(cameras).forEach(cameraId => {
        const camera = cameras[cameraId];
        if (camera.connected) {
            // Update camera data every 1 second when connected
            getRecordingStatus(cameraId);
            getCameraFormat(cameraId);
            getTimecode(cameraId);
            getDeviceName(cameraId);
        } else {
            // Try to auto-reconnect every 30 seconds when disconnected
            autoConnectToCamera(cameraId);
        }
    });
}, 1000);

// Separate timer for auto-reconnection attempts
setInterval(() => {
    Object.keys(cameras).forEach(cameraId => {
        const camera = cameras[cameraId];
        if (!camera.connected) {
            autoConnectToCamera(cameraId);
        }
    });
}, 10000); // Try every 10 seconds

// Error handling for network issues
window.addEventListener('online', () => {
    // Try to reconnect when network is back
    Object.keys(cameras).forEach(cameraId => {
        const camera = cameras[cameraId];
        if (!camera.connected) {
            setTimeout(() => {
                autoConnectToCamera(cameraId);
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

// Auto-reconnect on connection errors
window.addEventListener('error', (event) => {
    if (event.error && event.error.message && event.error.message.includes('fetch')) {
        Object.keys(cameras).forEach(cameraId => {
            const camera = cameras[cameraId];
            if (camera.connected) {
                updateConnectionStatus(cameraId, false);
            }
            setTimeout(() => {
                autoConnectToCamera(cameraId);
            }, 2000);
        });
    }
});

// Add some sample format values for demonstration
setTimeout(() => {
    Object.keys(cameras).forEach(cameraId => {
        const camera = cameras[cameraId];
        if (!camera.connected) {
            // Set default format values
            setDefaultFormatValues(cameraId);
            setDefaultTimecodeValues(cameraId);
        }
    });
}, 2000);

// Generic camera functions
async function getCameraFormat(cameraId) {
    const camera = cameras[cameraId];
    if (!camera) return;
    
    try {
        const response = await fetch(`http://${camera.ip}/control/api/v1/system/format`);
        if (response.ok) {
            const data = await response.json();
            updateCameraFormat(cameraId, data);
        }
    } catch (error) {
        // Silent error handling
    }
}

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

function setDefaultFormatValues(cameraId) {
    const camera = cameras[cameraId];
    if (!camera) return;
    
    const codecValue = getCameraElement(cameraId, 'codecValue');
    const frameRateValue = getCameraElement(cameraId, 'frameRateValue');
    const resolutionValue = getCameraElement(cameraId, 'resolutionValue');
    const deviceNameValue = getCameraElement(cameraId, 'deviceNameValue');
    
    if (codecValue) codecValue.textContent = 'Connecting...';
    if (frameRateValue) frameRateValue.textContent = 'Connecting...';
    if (resolutionValue) resolutionValue.textContent = 'Connecting...';
    if (deviceNameValue) deviceNameValue.textContent = 'Connecting...';
}

async function getTimecode(cameraId) {
    const camera = cameras[cameraId];
    if (!camera) return;
    
    try {
        const response = await fetch(`http://${camera.ip}/control/api/v1/transports/0/timecode`);
        if (response.ok) {
            const data = await response.json();
            updateTimecode(cameraId, data);
        }
    } catch (error) {
        // Silent error handling
    }
}

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

function setDefaultTimecodeValues(cameraId) {
    const camera = cameras[cameraId];
    if (!camera) return;
    
    const currentTimecode = getCameraElement(cameraId, 'currentTimecode');
    if (currentTimecode) {
        currentTimecode.textContent = '00:00:00:00';
    }
}

async function getDeviceName(cameraId) {
    const camera = cameras[cameraId];
    if (!camera) return;
    
    try {
        const response = await fetch(`http://${camera.ip}/control/api/v1/media/active`);
        if (response.ok) {
            const data = await response.json();
            updateDeviceName(cameraId, data);
        }
    } catch (error) {
        // Silent error handling
    }
}

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
        // Silent error handling
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
        // Silent error handling
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

// Parse timecode from BCD
function parseTimecode(timecodeBCD) {
    let noDropFrame = timecodeBCD & 0b01111111111111111111111111111111;     // The first bit of the timecode is 1 if "Drop Frame Timecode" is on. We don't want to include that in the display.
    let decimalTCInt = parseInt(noDropFrame.toString(16), 10);              // Convert the BCD number into base ten
    let decimalTCString = decimalTCInt.toString().padStart(8, '0');         // Convert the base ten number to a string eight characters long
    let finalTCString = decimalTCString.match(/.{1,2}/g).join(':');         // Put colons between every two characters
    return finalTCString;
} 