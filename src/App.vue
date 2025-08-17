<template>
  <div class="min-h-screen bg-camera-dark text-white p-5">
    <div class="max-w-8xl mx-auto">
      <!-- Global Control Panel -->
      <div class="mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Column 1: Global Camera Control Title -->
          <div class="flex flex-col justify-center">
            <h2 class="text-2xl font-semibold text-center md:text-left">Global Camera Control</h2>
            <div class="mt-1 text-center md:text-left text-sm text-gray-400">
              Connected: {{ connectedCamerasCount }} | Recording: {{ recordingCamerasCount }}
            </div>
          </div>
          
          <!-- Column 2: Global Record/Stop Buttons -->
          <div class="flex justify-center items-center gap-3">
            <button
              @click="startAllRecording"
              :disabled="!hasConnectedCameras"
              class="px-6 py-3 bg-camera-red hover:bg-red-600 disabled:bg-gray-500 disabled:cursor-not-allowed rounded-lg font-semibold text-white transition-all duration-300 hover:scale-105 shadow-lg flex items-center gap-2"
            >
              <div class="w-3 h-3 bg-white rounded-full"></div>
              Start
            </button>
            <button
              @click="stopAllRecording"
              :disabled="!hasRecordingCameras"
              class="px-6 py-3 bg-camera-element hover:bg-gray-600 disabled:bg-gray-500 disabled:cursor-not-allowed rounded-lg font-semibold text-white transition-all duration-300 hover:scale-105 shadow-lg flex items-center gap-2"
            >
              <div class="w-3 h-3 bg-white rounded"></div>
              Stop
            </button>
          </div>
          
          <!-- Column 3: Auto Restart Button -->
          <div class="flex flex-col justify-center items-end">
            <button
              @click="toggleAutoRestart"
              :class="[
                'px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2',
                autoRestartEnabled 
                  ? 'bg-camera-green hover:bg-green-600 text-white' 
                  : 'bg-camera-element hover:bg-gray-600 text-white'
              ]"
            >
              <div 
                :class="[
                  'w-3 h-3 rounded-full transition-all duration-300',
                  autoRestartEnabled ? 'bg-white' : 'bg-gray-400'
                ]"
              ></div>
              Auto Restart: {{ autoRestartEnabled ? 'ON' : 'OFF' }}
            </button>
          </div>
        </div>
      </div>
      
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Camera 1 -->
        <CameraCard 
          :camera="cameras.cam1" 
          @toggle-recording="handleToggleRecording"
          @stop-recording="handleStopRecording"
        />
        
        <!-- Camera 2 -->
        <CameraCard 
          :camera="cameras.cam2" 
          @toggle-recording="handleToggleRecording"
          @stop-recording="handleStopRecording"
        />
        
        <!-- Camera 3 -->
        <CameraCard 
          :camera="cameras.cam3" 
          @toggle-recording="handleToggleRecording"
          @stop-recording="handleStopRecording"
        />
        
        <!-- Camera 4 -->
        <CameraCard 
          :camera="cameras.cam4" 
          @toggle-recording="handleToggleRecording"
          @stop-recording="handleStopRecording"
        />
        
        <!-- Camera 5 -->
        <CameraCard 
          :camera="cameras.cam5" 
          @toggle-recording="handleToggleRecording"
          @stop-recording="handleStopRecording"
        />
        
        <!-- Camera 6 -->
        <CameraCard 
          :camera="cameras.cam6" 
          @toggle-recording="handleToggleRecording"
          @stop-recording="handleStopRecording"
        />
        
        <!-- Camera 7 -->
        <CameraCard 
          :camera="cameras.cam7" 
          @toggle-recording="handleToggleRecording"
          @stop-recording="handleStopRecording"
        />
        
        <!-- Camera 11 -->
        <CameraCard 
          :camera="cameras.cam11" 
          @toggle-recording="handleToggleRecording"
          @stop-recording="handleStopRecording"
        />
        
        <!-- Camera 12 -->
        <CameraCard 
          :camera="cameras.cam12" 
          @toggle-recording="handleToggleRecording"
          @stop-recording="handleStopRecording"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, computed, ref } from 'vue'
import CameraCard from './components/CameraCard.vue'
import { useCameraStore } from './stores/cameraStore'

const cameraStore = useCameraStore()
const { cameras, toggleRecording, startRecording, stopRecording, initializeCameras, cleanup, setGlobalAutoRestart, getGlobalAutoRestart } = cameraStore

const handleToggleRecording = (cameraId) => {
  console.log(`App: Toggle recording requested for ${cameraId}`)
  console.log('Camera store state:', cameraStore)
  console.log('Available cameras:', Object.keys(cameras))
  console.log('Camera object:', cameras[cameraId])
  console.log('Calling toggleRecording function...')
  toggleRecording(cameraId)
  console.log('toggleRecording function called')
}

const handleStopRecording = (cameraId) => {
  console.log(`App: Stop recording requested for ${cameraId}`)
  console.log('Camera store state:', cameraStore)
  stopRecording(cameraId)
}

// Global recording control functions
const startAllRecording = async () => {
  console.log('Starting recording on all connected cameras...')
  const connectedCameras = Object.keys(cameras).filter(id => cameras[id].connected)
  
  for (const cameraId of connectedCameras) {
    if (!cameras[cameraId].recording) {
      console.log(`Starting recording on ${cameraId}`)
      await startRecording(cameraId)
    }
  }
}

const stopAllRecording = async () => {
  console.log('Stopping recording on all cameras...')
  const recordingCameras = Object.keys(cameras).filter(id => cameras[id].recording)
  
  for (const cameraId of recordingCameras) {
    console.log(`Stopping recording on ${cameraId}`)
    await stopRecording(cameraId)
  }
}

// Auto restart state
const autoRestartEnabled = ref(true)

// Toggle auto restart function
const toggleAutoRestart = () => {
  autoRestartEnabled.value = !autoRestartEnabled.value
  console.log(`Auto restart ${autoRestartEnabled.value ? 'enabled' : 'disabled'}`)
  
  // Use store function to control global auto restart
  setGlobalAutoRestart(autoRestartEnabled.value)
}

// Computed properties for button states
const hasConnectedCameras = computed(() => {
  return Object.values(cameras).some(camera => camera.connected)
})

const hasRecordingCameras = computed(() => {
  return Object.values(cameras).some(camera => camera.recording)
})

const connectedCamerasCount = computed(() => {
  return Object.values(cameras).filter(camera => camera.connected).length
})

const recordingCamerasCount = computed(() => {
  return Object.values(cameras).filter(camera => camera.recording).length
})

onMounted(() => {
  console.log('App mounted, initializing cameras...')
  initializeCameras()
  
  // Initialize auto restart state from store
  autoRestartEnabled.value = getGlobalAutoRestart()
})

onUnmounted(() => {
  console.log('App unmounting, cleaning up...')
  cleanup()
})
</script> 