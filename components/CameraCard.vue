<template>
  <div
    class="relative bg-[#141414] rounded-xl border overflow-hidden transition-all duration-300 group"
    :class="camera.recording
      ? 'border-red-600/40 shadow-lg shadow-red-900/20'
      : camera.connected
        ? 'border-[#1e1e1e] hover:border-[#2a2a2a]'
        : 'border-[#181818] opacity-80'"
  >
    <!-- Top accent strip -->
    <div
      class="h-[2px] w-full transition-all duration-500"
      :class="camera.recording
        ? 'bg-red-500 animate-recording-gradient bg-[length:200%_100%]'
        : camera.connected
          ? 'bg-emerald-600/40'
          : 'bg-[#1c1c1c]'"
    ></div>

    <!-- Card Header -->
    <div class="px-4 pt-3 pb-2.5 flex items-start justify-between gap-2">

      <!-- Left: Camera ID + IP + Delete -->
      <div class="flex items-center gap-1.5 min-w-0">
        <div class="min-w-0">
          <div class="text-base font-bold tracking-wider font-mono leading-none">
            {{ camera.id.toUpperCase() }}
          </div>
          <div class="text-[10px] text-gray-700 font-mono mt-1 leading-none tabular-nums">
            {{ camera.ip }}
          </div>
        </div>
        <button
          @click="handleDeleteClick"
          class="w-5 h-5 rounded-md hover:bg-red-600/15 text-transparent group-hover:text-gray-600 hover:!text-red-400 flex items-center justify-center text-[10px] transition-all duration-200 flex-shrink-0 self-start mt-0.5"
          title="Remove camera"
        >
          &#x2715;
        </button>
      </div>

      <!-- Right: Drag handle + Status badge -->
      <div class="flex items-center gap-1.5 flex-shrink-0">
        <div
          class="drag-handle cursor-grab active:cursor-grabbing text-transparent group-hover:text-gray-600 hover:!text-gray-400 transition-colors duration-200 select-none"
          title="Drag to reorder"
        >
          <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor">
            <circle cx="2" cy="2" r="1.5"/>
            <circle cx="8" cy="2" r="1.5"/>
            <circle cx="2" cy="7" r="1.5"/>
            <circle cx="8" cy="7" r="1.5"/>
            <circle cx="2" cy="12" r="1.5"/>
            <circle cx="8" cy="12" r="1.5"/>
          </svg>
        </div>
        <div
          :class="camera.connected
            ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
            : 'bg-orange-500/10 border-orange-500/25 text-orange-400'"
          class="flex items-center gap-1.5 px-2 py-1 rounded-full border text-[10px] font-medium flex-shrink-0"
        >
          <div
            :class="camera.connected ? 'bg-emerald-400' : 'bg-orange-400'"
            class="w-1.5 h-1.5 rounded-full flex-shrink-0"
          ></div>
          {{ camera.connected ? 'Online' : 'Offline' }}
        </div>
      </div>

    </div>

    <!-- Controls Row -->
    <div class="px-4 pb-3 flex items-center gap-2.5">
      <!-- Record button -->
      <button
        @click="handleRecordClick"
        :disabled="!camera.connected || camera.recording"
        :class="camera.connected && !camera.recording
          ? 'bg-red-600 hover:bg-red-500 hover:scale-105 shadow-md shadow-red-900/40 cursor-pointer'
          : camera.recording
            ? 'bg-red-600/20 border border-red-600/30 cursor-not-allowed'
            : 'bg-[#1c1c1c] cursor-not-allowed opacity-40'"
        class="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 flex-shrink-0"
      >
        <div
          class="w-3 h-3 bg-white rounded-full"
          :class="camera.recording ? 'animate-pulse' : ''"
        ></div>
      </button>

      <!-- Stop button -->
      <button
        @click="handleStopClick"
        :disabled="!camera.connected || !camera.recording"
        :class="camera.recording
          ? 'bg-[#2a2a2a] hover:bg-[#333] border-[#333] hover:scale-105 cursor-pointer'
          : 'bg-[#141414] border-[#1c1c1c] cursor-not-allowed opacity-30'"
        class="w-9 h-9 rounded-full border flex items-center justify-center transition-all duration-200 flex-shrink-0"
      >
        <div class="w-3 h-3 bg-white rounded-sm"></div>
      </button>

      <div class="flex-1"></div>

      <!-- REC indicator -->
      <div
        v-if="camera.recording"
        class="text-[10px] font-semibold text-red-400 uppercase tracking-wider flex-shrink-0"
      >
        &#x25CF; REC
      </div>

      <!-- Timecode -->
      <div
        class="font-mono text-xs font-semibold tabular-nums tracking-wider"
        :class="camera.recording ? 'text-red-300' : 'text-gray-500'"
      >
        {{ camera.timecode || '00:00:00:00' }}
      </div>
    </div>

    <!-- Divider -->
    <div class="mx-4 h-px bg-[#1c1c1c]"></div>

    <!-- Format Info -->
    <div class="px-4 py-3 grid grid-cols-3 gap-3">
      <div>
        <div class="text-[9px] text-gray-700 uppercase tracking-wider mb-0.5">Codec</div>
        <div class="text-[11px] text-gray-400 font-medium truncate">
          {{ camera.format?.codec || '—' }}
        </div>
      </div>
      <div>
        <div class="text-[9px] text-gray-700 uppercase tracking-wider mb-0.5">FPS</div>
        <div class="text-[11px] text-gray-400 font-medium truncate">
          {{ camera.format?.frameRate || '—' }}
        </div>
      </div>
      <div>
        <div class="text-[9px] text-gray-700 uppercase tracking-wider mb-0.5">Resolution</div>
        <div class="text-[11px] text-gray-400 font-medium truncate">
          {{ camera.format?.resolution || '—' }}
        </div>
      </div>
    </div>

    <!-- Divider -->
    <div class="mx-4 h-px bg-[#1c1c1c]"></div>

    <!-- Device + Power -->
    <div class="px-4 py-3 flex items-end justify-between gap-2">
      <div class="min-w-0">
        <div class="text-[9px] text-gray-700 uppercase tracking-wider mb-0.5">Device</div>
        <div class="text-[11px] text-gray-500 font-medium truncate max-w-[120px]">
          {{ camera.deviceName || '—' }}
        </div>
      </div>
      <div class="text-right flex-shrink-0">
        <div class="text-[9px] text-gray-700 uppercase tracking-wider mb-0.5">{{ powerSourceLabel }}</div>
        <div class="text-[11px] font-semibold" :class="batteryClass">
          {{ batteryLabel }}
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  camera: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['toggle-recording', 'stop-recording', 'delete-camera'])

const powerSourceLabel = computed(() => {
  const src = props.camera.power?.source
  if (!src) return 'Power'
  const labels = { Battery: 'Battery', AC: 'AC Power', Fiber: 'Fiber', USB: 'USB', POE: 'POE' }
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
  if (charging) text += ' ↑'
  else if (low) text += ' !'
  return text
})

const batteryClass = computed(() => {
  const power = props.camera.power
  if (!power?.batteries?.length) return 'text-gray-600'
  const bat = power.batteries[0]
  const pct = bat.chargeRemainingPercent
  const flags = bat.statusFlags || []
  const critical = flags.some(f => f && f.includes('Critically'))
  const low = flags.some(f => f && f.includes('Low'))
  if (critical || (pct != null && pct <= 10)) return 'text-red-400'
  if (low || (pct != null && pct <= 25)) return 'text-amber-400'
  return 'text-emerald-400'
})

const handleRecordClick = () => emit('toggle-recording', props.camera.id)
const handleStopClick = () => emit('stop-recording', props.camera.id)
const handleDeleteClick = () => emit('delete-camera', props.camera.id)
</script>
