<template>
  <div class="min-h-screen bg-camera-dark text-white flex flex-col">
    <!-- Header -->
    <header class="bg-camera-card/80 backdrop-blur border-b border-camera-border sticky top-0 z-10">
      <div class="max-w-8xl mx-auto px-5 py-3 flex items-center justify-between">
        <!-- Branding -->
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-camera-orange rounded-lg flex items-center justify-center shrink-0">
            <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17 10.5V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3.5l4 4v-11l-4 4z"/>
            </svg>
          </div>
          <div>
            <h1 class="text-base font-bold leading-none">Camera Control</h1>
            <p class="text-xs text-gray-400 mt-0.5 leading-none">LiveTubeX Dashboard</p>
          </div>
        </div>

        <!-- Live Stats -->
        <div class="flex items-center gap-5 text-sm">
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 rounded-full bg-green-400"></div>
            <span class="text-gray-400">Connected: <span class="text-white font-semibold">{{ connectedCamerasCount }}</span></span>
          </div>
          <div class="flex items-center gap-2">
            <div
              :class="['w-2 h-2 rounded-full bg-red-400 transition-all', recordingCamerasCount > 0 ? 'animate-pulse' : '']"
            ></div>
            <span class="text-gray-400">Recording:
              <span :class="['font-semibold', recordingCamerasCount > 0 ? 'text-red-400' : 'text-white']">
                {{ recordingCamerasCount }}
              </span>
            </span>
          </div>
        </div>
      </div>
    </header>

    <!-- Global Controls Bar -->
    <div class="bg-camera-card/40 border-b border-camera-border/50 px-5 py-2.5">
      <div class="max-w-8xl mx-auto flex items-center gap-3">
        <span class="text-xs text-gray-500 uppercase tracking-widest font-medium mr-1">Global</span>

        <button
          @click="startAllRecording"
          :disabled="!hasConnectedCameras"
          class="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 bg-red-600 hover:bg-red-500 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed hover:shadow-[0_0_12px_rgba(255,0,0,0.35)] active:scale-95"
        >
          <div class="w-2 h-2 bg-white rounded-full"></div>
          Start All
        </button>

        <button
          @click="stopAllRecording"
          :disabled="!hasRecordingCameras"
          class="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 bg-camera-element hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed border border-camera-border active:scale-95"
        >
          <div class="w-2 h-2 bg-white rounded-sm"></div>
          Stop All
        </button>

        <div class="h-4 w-px bg-camera-border mx-1"></div>

        <button
          @click="toggleAutoRestart"
          :class="[
            'flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 border active:scale-95',
            autoRestartEnabled
              ? 'bg-green-500/15 hover:bg-green-500/25 text-green-400 border-green-500/30'
              : 'bg-camera-element hover:bg-gray-600 text-gray-400 border-camera-border'
          ]"
        >
          <div
            :class="['w-2 h-2 rounded-full transition-colors duration-300', autoRestartEnabled ? 'bg-green-400' : 'bg-gray-500']"
          ></div>
          Auto Restart: {{ autoRestartEnabled ? 'ON' : 'OFF' }}
        </button>
      </div>
    </div>

    <!-- Camera Grid -->
    <div class="flex-1 p-5">
      <div class="max-w-8xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CameraCard
          :camera="cameras.cam1"
          @toggle-recording="handleToggleRecording"
          @stop-recording="handleStopRecording"
        />
        <CameraCard
          :camera="cameras.cam2"
          @toggle-recording="handleToggleRecording"
          @stop-recording="handleStopRecording"
        />
        <CameraCard
          :camera="cameras.cam3"
          @toggle-recording="handleToggleRecording"
          @stop-recording="handleStopRecording"
        />
        <CameraCard
          :camera="cameras.cam4"
          @toggle-recording="handleToggleRecording"
          @stop-recording="handleStopRecording"
        />
        <CameraCard
          :camera="cameras.cam9"
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
