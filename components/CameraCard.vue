<template>
  <div class="bg-camera-card rounded-xl p-4 border border-camera-border shadow-lg">
    <div class="flex justify-between items-center mb-2">
      <div class="flex items-center gap-2">
        <h1 class="text-2xl font-semibold">{{ camera.id.toUpperCase() }}</h1>
        <button
          @click="handleDeleteClick"
          class="ml-1 w-7 h-7 flex items-center justify-center rounded-lg bg-red-700/80 hover:bg-red-600 text-xs font-semibold text-white transition-all duration-200 hover:scale-105 hover:-translate-y-0.5 shadow-md"
          title="ลบกล้องนี้"
        >
          ✕
        </button>
      </div>
      <div class="flex items-center gap-3">
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

        <div class="flex items-center justify-between bg-camera-element p-3 rounded-lg">
          <div class="text-sm font-medium text-gray-300">Power Source</div>
          <div class="text-sm font-semibold text-camera-orange">
            {{ powerSourceLabel }}
          </div>
        </div>

        <div class="flex items-center justify-between bg-camera-element p-3 rounded-lg">
          <div class="text-sm font-medium text-gray-300">Battery</div>
          <div class="text-sm font-semibold" :class="batteryClass">
            {{ batteryLabel }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineEmits, computed } from 'vue'

const props = defineProps({
  camera: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['toggle-recording', 'stop-recording', 'delete-camera'])

const powerSourceLabel = computed(() => {
  const src = props.camera.power?.source
  if (!src) return '—'
  const labels = { Battery: 'Battery', AC: 'AC', Fiber: 'Fiber', USB: 'USB', POE: 'POE' }
  return labels[src] || src
})

const batteryLabel = computed(() => {
  const power = props.camera.power
  if (!power || !power.batteries?.length) {
    if (power?.source && power.source !== 'Battery') return '—'
    return '—'
  }
  const bat = power.batteries[0]
  const pct = bat.chargeRemainingPercent
  const voltage = bat.milliVolt != null ? `${(bat.milliVolt / 1000).toFixed(1)}V` : ''
  const flags = bat.statusFlags || []
  const charging = flags.some(f => f && f.includes('Charging'))
  const low = flags.some(f => f && (f.includes('Low') || f.includes('Critically')))
  let text = pct != null ? `${pct}%` : voltage || '—'
  if (charging) text += ' (charging)'
  else if (low) text += ' (low)'
  return text
})

const batteryClass = computed(() => {
  const power = props.camera.power
  if (!power?.batteries?.length) return 'text-camera-orange'
  const bat = power.batteries[0]
  const pct = bat.chargeRemainingPercent
  const flags = bat.statusFlags || []
  const critical = flags.some(f => f && f.includes('Critically'))
  const low = flags.some(f => f && f.includes('Low'))
  if (critical || (pct != null && pct <= 10)) return 'text-red-400'
  if (low || (pct != null && pct <= 25)) return 'text-amber-400'
  return 'text-camera-green'
})

const handleRecordClick = () => {
  emit('toggle-recording', props.camera.id)
}

const handleStopClick = () => {
  emit('stop-recording', props.camera.id)
}

const handleDeleteClick = () => {
  emit('delete-camera', props.camera.id)
}
</script>

