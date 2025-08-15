<template>
  <div class="min-h-screen bg-camera-dark text-white p-5">
    <div class="max-w-8xl mx-auto">
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
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import CameraCard from './components/CameraCard.vue'
import { useCameraStore } from './stores/cameraStore'

const cameraStore = useCameraStore()
const { cameras, toggleRecording, stopRecording, initializeCameras, cleanup } = cameraStore

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

onMounted(() => {
  console.log('App mounted, initializing cameras...')
  initializeCameras()
})

onUnmounted(() => {
  console.log('App unmounting, cleaning up...')
  cleanup()
})
</script> 