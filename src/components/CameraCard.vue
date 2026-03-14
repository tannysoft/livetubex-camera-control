<template>
  <div
    :class="[
      'rounded-2xl border transition-all duration-500 overflow-hidden',
      camera.recording
        ? 'border-red-500/60 shadow-[0_0_28px_rgba(255,0,0,0.18)] bg-gradient-to-b from-[#2d1a1a] to-camera-card'
        : 'border-camera-border bg-camera-card shadow-lg'
    ]"
  >
    <!-- Header -->
    <div class="flex justify-between items-center px-4 py-3 border-b border-camera-border/50">
      <!-- Left: Camera ID + REC badge + IP -->
      <div>
        <div class="flex items-center gap-2">
          <h2 class="text-xl font-bold tracking-wider font-mono">{{ camera.id.toUpperCase() }}</h2>
          <div
            v-if="camera.recording"
            class="flex items-center gap-1.5 bg-red-500/20 px-2 py-0.5 rounded-full"
          >
            <div class="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse shadow-[0_0_6px_rgba(255,80,80,0.8)]"></div>
            <span class="text-red-400 text-xs font-bold tracking-widest">REC</span>
          </div>
        </div>
        <span class="text-xs text-gray-500 font-mono">{{ camera.ip }}</span>
      </div>

      <!-- Right: Status badge + buttons -->
      <div class="flex items-center gap-2">
        <!-- Connection Status Pill -->
        <div
          :class="[
            'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border',
            camera.connected
              ? 'bg-green-500/10 text-green-400 border-green-500/30'
              : 'bg-orange-500/10 text-orange-400 border-orange-500/30'
          ]"
        >
          <div :class="['w-1.5 h-1.5 rounded-full', camera.connected ? 'bg-green-400' : 'bg-orange-400']"></div>
          {{ camera.connected ? 'Online' : 'Offline' }}
        </div>

        <!-- Record Button -->
        <button
          @click="handleRecordClick"
          :disabled="!camera.connected || camera.recording"
          :title="camera.recording ? 'Recording...' : 'Start Recording'"
          :class="[
            'w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 shrink-0',
            camera.recording
              ? 'bg-red-900/40 cursor-not-allowed ring-1 ring-red-500/30'
              : camera.connected
                ? 'bg-red-600 hover:bg-red-500 hover:shadow-[0_0_14px_rgba(255,0,0,0.5)] hover:scale-110 active:scale-95 shadow-lg'
                : 'bg-gray-700 cursor-not-allowed opacity-40'
          ]"
        >
          <div class="w-2.5 h-2.5 bg-white rounded-full"></div>
        </button>

        <!-- Stop Button -->
        <button
          @click="handleStopClick"
          :disabled="!camera.connected || !camera.recording"
          :title="!camera.recording ? 'Not Recording' : 'Stop Recording'"
          :class="[
            'w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 shrink-0',
            camera.recording
              ? 'bg-camera-element hover:bg-gray-500 hover:scale-110 active:scale-95 border border-camera-border shadow-lg'
              : 'bg-gray-800/50 cursor-not-allowed opacity-40'
          ]"
        >
          <div class="w-2.5 h-2.5 bg-white rounded-sm"></div>
        </button>
      </div>
    </div>

    <!-- Timecode -->
    <div class="px-4 py-3 border-b border-camera-border/30 flex items-center justify-between">
      <span class="text-xs text-gray-500 uppercase tracking-widest font-medium">Timecode</span>
      <div
        :class="[
          'font-mono text-2xl font-bold tracking-wider tabular-nums',
          camera.recording ? 'text-red-400' : 'text-camera-orange'
        ]"
      >
        {{ camera.timecode || '00:00:00:00' }}
      </div>
    </div>

    <!-- Info Grid -->
    <div class="grid grid-cols-2 divide-x divide-y divide-camera-border/30">
      <div class="px-4 py-2.5">
        <div class="text-xs text-gray-500 mb-0.5">Codec</div>
        <div class="text-sm font-semibold text-camera-orange truncate">{{ camera.format?.codec || '—' }}</div>
      </div>
      <div class="px-4 py-2.5">
        <div class="text-xs text-gray-500 mb-0.5">Frame Rate</div>
        <div class="text-sm font-semibold text-camera-orange">{{ camera.format?.frameRate || '—' }}</div>
      </div>
      <div class="px-4 py-2.5">
        <div class="text-xs text-gray-500 mb-0.5">Resolution</div>
        <div class="text-sm font-semibold text-camera-orange">{{ camera.format?.resolution || '—' }}</div>
      </div>
      <div class="px-4 py-2.5">
        <div class="text-xs text-gray-500 mb-0.5">Device</div>
        <div class="text-sm font-semibold text-camera-orange truncate">{{ camera.deviceName || '—' }}</div>
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
