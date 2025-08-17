<template>
  <div class="bg-camera-card rounded-xl p-4 border border-camera-border shadow-lg">
    <!-- Header -->
    <div class="flex justify-between items-center mb-2">
      <h1 class="text-2xl font-semibold">{{ camera.id.toUpperCase() }}</h1>
      <div class="flex items-center gap-3">
        <!-- Connection Status -->
        <div class="flex items-center gap-2 bg-camera-element px-3 py-2 rounded-lg border border-camera-border">
          <div 
            :class="[
              'w-3 h-3 rounded-full',
              camera.connected ? 'bg-camera-green shadow-lg shadow-camera-green/50' : 'bg-camera-orange shadow-lg shadow-camera-orange/50'
            ]"
          ></div>
          <span class="text-sm font-medium">
            {{ camera.connected ? 'Online' : 'Offline' }}
          </span>
        </div>
        
        <!-- Control Buttons -->
        <div class="flex gap-2">
          <button
            @click="handleRecordClick"
            :disabled="!camera.connected || camera.recording"
            :class="[
              'w-9 h-9 rounded-lg flex items-center justify-center text-white font-semibold transition-all duration-300',
              camera.recording 
                ? 'bg-gradient-to-r from-red-500 to-red-700 animate-recording-gradient cursor-not-allowed' 
                : 'bg-camera-red hover:bg-red-600 hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-xl'
            ]"
          >
            <div class="w-3 h-3 bg-white rounded-full"></div>
          </button>
          
          <button
            @click="handleStopClick"
            :disabled="!camera.connected || !camera.recording"
            :class="[
              'w-9 h-9 rounded-lg flex items-center justify-center text-white font-semibold transition-all duration-300',
              camera.recording 
                ? 'bg-camera-element hover:bg-gray-600 hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-xl' 
                : 'bg-gray-500 cursor-not-allowed'
            ]"
          >
            <div class="w-3 h-3 bg-white rounded"></div>
          </button>
        </div>
      </div>
    </div>

    <!-- Status Display -->
    <div class="grid grid-cols-2 gap-2 mb-2">
      <div 
        :class="[
          'flex items-center justify-between p-3 rounded-lg transition-all duration-300',
          camera.recording 
            ? 'bg-gradient-to-br from-red-500 to-red-700 animate-recording-item-pulse' 
            : 'bg-camera-element'
        ]"
      >
        <div class="text-sm font-medium text-gray-300">Record Status</div>
        <div 
          :class="[
            'text-lg font-semibold',
            camera.recording ? 'text-white' : 'text-camera-orange'
          ]"
        >
          {{ camera.recording ? 'Recording' : 'Stopped' }}
        </div>
      </div>
      
      <div class="flex items-center justify-between bg-camera-element p-3 rounded-lg">
        <div class="text-sm font-medium text-gray-300">Timecode</div>
        <div class="text-lg font-semibold text-camera-orange">
          {{ camera.timecode || '00:00:00:00' }}
        </div>
      </div>
    </div>

    <!-- Format Information -->
    <div class="space-y-3">
      <div class="grid grid-cols-2 gap-2">
        <div class="flex items-center justify-between bg-camera-element p-3 rounded-lg">
          <div class="text-sm font-medium text-gray-300">Codec</div>
          <div class="text-sm font-semibold text-camera-orange">
            {{ camera.format?.codec || 'Connecting...' }}
          </div>
        </div>
        
        <div class="flex items-center justify-between bg-camera-element p-3 rounded-lg">
          <div class="text-sm font-medium text-gray-300">Frame Rate</div>
          <div class="text-sm font-semibold text-camera-orange">
            {{ camera.format?.frameRate || 'Connecting...' }}
          </div>
        </div>
        
        <div class="flex items-center justify-between bg-camera-element p-3 rounded-lg">
          <div class="text-sm font-medium text-gray-300">Resolution</div>
          <div class="text-sm font-semibold text-camera-orange">
            {{ camera.format?.resolution || 'Connecting...' }}
          </div>
        </div>
        
        <div class="flex items-center justify-between bg-camera-element p-3 rounded-lg">
          <div class="text-sm font-medium text-gray-300">Device Name</div>
          <div class="text-sm font-semibold text-camera-orange">
            {{ camera.deviceName || 'Unknown...' }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineEmits } from 'vue'

const props = defineProps({
  camera: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['toggle-recording', 'stop-recording'])

const handleRecordClick = () => {
  console.log(`Record button clicked for ${props.camera.id}`)
  console.log('Camera state:', {
    id: props.camera.id,
    connected: props.camera.connected,
    recording: props.camera.recording,
    ip: props.camera.ip
  })
  emit('toggle-recording', props.camera.id)
}

const handleStopClick = () => {
  console.log(`Stop button clicked for ${props.camera.id}`)
  console.log('Camera state:', {
    id: props.camera.id,
    connected: props.camera.connected,
    recording: props.camera.recording,
    ip: props.camera.ip
  })
  emit('stop-recording', props.camera.id)
}
</script> 