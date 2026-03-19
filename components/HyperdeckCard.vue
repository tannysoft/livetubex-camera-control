<template>
  <div
    class="relative rounded-xl overflow-hidden transition-all duration-300 group border"
    :class="hyperdeck.recording
      ? 'shadow-lg shadow-red-900/20 border-red-900/40'
      : hyperdeck.connected
        ? 'border-[#1e1e1e] hover:border-[#2a2a2a]'
        : 'border-[#181818] opacity-80'"
  >
    <div class="relative z-10 bg-[#141414] rounded-xl overflow-hidden min-h-full">
      <!-- Top accent -->
      <div
        class="h-[2px] w-full transition-all duration-500"
        :class="hyperdeck.recording
          ? 'bg-red-600/60'
          : hyperdeck.connected
            ? 'bg-emerald-600/40'
            : 'bg-[#1c1c1c]'"
      />

      <!-- Header: ID, IP, Reboot, Delete, Drag, Status -->
      <div class="px-4 pt-3 pb-2.5 flex items-start justify-between gap-2">
        <div class="flex items-center gap-1.5 min-w-0">
          <div class="min-w-0">
            <div class="text-base font-bold tracking-wider font-mono leading-none">
              {{ hyperdeck.id.toUpperCase() }}
            </div>
            <div class="text-[10px] text-gray-700 font-mono mt-1 leading-none tabular-nums">
              {{ hyperdeck.ip }}
            </div>
          </div>
          <button
            @click="handleRebootClick"
            :disabled="!hyperdeck.connected"
            class="w-5 h-5 rounded-md hover:bg-amber-600/15 text-transparent group-hover:text-gray-600 hover:!text-amber-400 flex items-center justify-center transition-all flex-shrink-0 self-start mt-0.5 disabled:opacity-30 disabled:pointer-events-none"
            title="Reboot Hyperdeck"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button
            @click="handleDeleteClick"
            class="w-5 h-5 rounded-md hover:bg-red-600/15 text-transparent group-hover:text-gray-600 hover:!text-red-400 flex items-center justify-center text-[10px] transition-all flex-shrink-0 self-start mt-0.5"
            title="Remove Hyperdeck"
          >
            &#x2715;
          </button>
        </div>
        <div class="flex items-center gap-1.5 flex-shrink-0">
          <div
            class="drag-handle cursor-grab active:cursor-grabbing text-transparent group-hover:text-gray-600 hover:!text-gray-400 transition-colors duration-200 select-none"
            title="Drag to reorder"
          >
            <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor">
              <circle cx="2" cy="2" r="1.5" />
              <circle cx="8" cy="2" r="1.5" />
              <circle cx="2" cy="7" r="1.5" />
              <circle cx="8" cy="7" r="1.5" />
              <circle cx="2" cy="12" r="1.5" />
              <circle cx="8" cy="12" r="1.5" />
            </svg>
          </div>
          <div
            :class="hyperdeck.connected
              ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
              : 'bg-orange-500/10 border-orange-500/25 text-orange-400'"
            class="flex items-center gap-1.5 px-2 py-1 rounded-full border text-[10px] font-medium flex-shrink-0"
          >
            <div
              :class="hyperdeck.connected ? 'bg-emerald-400' : 'bg-orange-400'"
              class="w-1.5 h-1.5 rounded-full flex-shrink-0"
            />
            {{ hyperdeck.connected ? 'Online' : 'Offline' }}
          </div>
        </div>
      </div>

      <!-- Transport controls: Record, Stop record, Play, Stop -->
      <div class="px-4 pb-3 flex items-center gap-2.5">
        <button
          @click="handleRecordClick"
          :disabled="!hyperdeck.connected || hyperdeck.recording"
          :class="hyperdeck.connected && !hyperdeck.recording
            ? 'bg-red-600 hover:bg-red-500 hover:scale-105 shadow-md shadow-red-900/40 cursor-pointer'
            : hyperdeck.recording
              ? 'bg-red-600/20 border border-red-600/30 cursor-not-allowed'
              : 'bg-[#1c1c1c] cursor-not-allowed opacity-40'"
          class="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 flex-shrink-0"
          title="Start recording"
        >
          <div
            class="w-3 h-3 bg-white rounded-full"
            :class="hyperdeck.recording ? 'animate-pulse' : ''"
          />
        </button>

        <button
          @click="handleStopTransportClick"
          :disabled="!hyperdeck.connected"
          :class="hyperdeck.connected
            ? 'bg-[#242424] hover:bg-[#2e2e2e] border border-[#333] cursor-pointer'
            : 'bg-[#141414] border-[#1c1c1c] cursor-not-allowed opacity-30'"
          class="w-9 h-9 rounded-full border flex items-center justify-center transition-all duration-200 flex-shrink-0"
          title="Stop"
        >
          <div class="w-3 h-3 bg-gray-300 rounded-sm" />
        </button>

        <button
          @click="handlePlayClick"
          :disabled="!hyperdeck.connected"
          :class="hyperdeck.connected
            ? 'bg-[#242424] hover:bg-[#2e2e2e] border border-[#333] cursor-pointer'
            : 'bg-[#141414] border-[#1c1c1c] cursor-not-allowed opacity-30'"
          class="w-9 h-9 rounded-full border flex items-center justify-center transition-all duration-200 flex-shrink-0"
          title="Play"
        >
          <svg class="w-4 h-4 text-gray-300 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>

        <div class="flex-1" />

        <div
          v-if="hyperdeck.recording"
          class="text-[10px] font-semibold text-red-400 uppercase tracking-wider flex-shrink-0"
        >
          &#x25CF; REC
        </div>

        <div
          class="font-mono text-xs font-semibold tabular-nums tracking-wider"
          :class="hyperdeck.recording ? 'text-red-300' : 'text-gray-500'"
        >
          {{ hyperdeck.timecode || '00:00:00:00' }}
        </div>
      </div>

      <!-- Mode + Device (when online) -->
      <div class="px-4 pb-3 flex flex-wrap gap-x-6 gap-y-2">
        <div>
          <div class="text-[9px] text-gray-700 uppercase tracking-wider mb-0.5">Mode</div>
          <div class="text-[11px] text-gray-400 font-medium">{{ modeLabel }}</div>
        </div>
        <div v-if="hyperdeck.connected && (hyperdeck.productName || hyperdeck.softwareVersion)" class="min-w-0">
          <div class="text-[9px] text-gray-700 uppercase tracking-wider mb-0.5">Device</div>
          <div class="text-[11px] text-gray-400 font-medium truncate">
            {{ hyperdeck.productName || '—' }}
            <span v-if="hyperdeck.softwareVersion" class="text-gray-600"> · v{{ hyperdeck.softwareVersion }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  hyperdeck: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['start-recording', 'play', 'stop-transport', 'reboot', 'delete-hyperdeck'])

const modeLabel = computed(() => {
  const m = props.hyperdeck.mode
  if (!m) return '—'
  const labels = {
    InputPreview: 'Input Preview',
    InputRecord: 'Recording',
    Output: 'Playback'
  }
  return labels[m] || m
})

const handleRecordClick = () => emit('start-recording', props.hyperdeck.id)
const handlePlayClick = () => emit('play', props.hyperdeck.id)
const handleStopTransportClick = () => emit('stop-transport', props.hyperdeck.id)
const handleRebootClick = () => emit('reboot', props.hyperdeck.id)
const handleDeleteClick = () => emit('delete-hyperdeck', props.hyperdeck.id)
</script>
