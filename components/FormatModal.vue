<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="$emit('close')">
    <div class="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
    <div class="relative bg-[#141414] border border-[#222] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">

      <!-- Header -->
      <div class="flex items-center justify-between px-5 py-4 border-b border-[#1c1c1c]">
        <div>
          <h3 class="text-sm font-semibold">
            Format
            <span class="font-mono text-gray-400 ml-1">{{ camera.id.toUpperCase() }}</span>
          </h3>
          <p class="text-[10px] text-gray-600 mt-0.5 font-mono">{{ camera.ip }}</p>
        </div>
        <button
          @click="$emit('close')"
          class="w-7 h-7 flex items-center justify-center rounded-lg bg-[#1e1e1e] hover:bg-[#2a2a2a] text-gray-500 hover:text-white text-xs transition-all"
        >
          ✕
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="px-5 py-10 flex flex-col items-center gap-3">
        <div class="w-6 h-6 rounded-full border-2 border-[#333] border-t-gray-500 animate-spin"></div>
        <p class="text-xs text-gray-600">Loading supported formats…</p>
      </div>

      <!-- Error -->
      <div v-else-if="loadError" class="px-5 py-8 text-center">
        <p class="text-xs text-red-400 mb-3">{{ loadError }}</p>
        <button
          @click="loadFormats"
          class="px-3 py-1.5 rounded-lg text-xs bg-[#1e1e1e] hover:bg-[#2a2a2a] text-gray-400 hover:text-white transition-all"
        >
          Retry
        </button>
      </div>

      <!-- Selection step -->
      <div v-else-if="!confirming && !applying && !applyError && !applySuccess">

        <!-- Current Format -->
        <div class="px-5 pt-4 pb-3">
          <p class="text-[9px] text-gray-700 uppercase tracking-wider mb-2">Current Format</p>
          <div class="flex items-center gap-2 flex-wrap">
            <span class="px-2 py-0.5 rounded bg-[#1c1c1c] border border-[#252525] text-[10px] font-mono text-gray-400">
              {{ currentFormat?.codec || '—' }}
            </span>
            <span class="px-2 py-0.5 rounded bg-[#1c1c1c] border border-[#252525] text-[10px] font-mono text-gray-400">
              {{ resLabel(currentFormat?.recordResolution) }}
            </span>
            <span class="px-2 py-0.5 rounded bg-[#1c1c1c] border border-[#252525] text-[10px] font-mono text-gray-400">
              {{ currentFormat?.frameRate ? currentFormat.frameRate + ' fps' : '—' }}
            </span>
          </div>
        </div>

        <div class="h-px mx-5 bg-[#1c1c1c]"></div>

        <!-- Body -->
        <div class="px-5 py-4 space-y-5 max-h-[55vh] overflow-y-auto">

          <!-- Resolution -->
          <div>
            <p class="text-[9px] text-gray-600 uppercase tracking-wider mb-2">Resolution</p>
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="group in supportedFormats"
                :key="resKey(group.recordResolution)"
                @click="selectGroup(group)"
                :class="selectedGroup === group
                  ? 'bg-white text-black border-white'
                  : 'bg-[#1c1c1c] border-[#2a2a2a] text-gray-400 hover:border-[#3a3a3a] hover:text-gray-200'"
                class="px-3 py-1.5 rounded-lg border text-[11px] font-mono font-medium transition-all duration-150"
              >
                {{ resLabel(group.recordResolution) }}
              </button>
            </div>
          </div>

          <!-- Codec -->
          <div v-if="selectedGroup">
            <p class="text-[9px] text-gray-600 uppercase tracking-wider mb-2">Codec</p>
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="codec in selectedGroup.codecs"
                :key="codec"
                @click="selectedCodec = codec"
                :class="selectedCodec === codec
                  ? 'bg-white text-black border-white'
                  : 'bg-[#1c1c1c] border-[#2a2a2a] text-gray-400 hover:border-[#3a3a3a] hover:text-gray-200'"
                class="px-3 py-1.5 rounded-lg border text-[11px] font-mono font-medium transition-all duration-150"
              >
                {{ codec }}
              </button>
            </div>
          </div>

          <!-- Frame Rate -->
          <div v-if="selectedGroup">
            <p class="text-[9px] text-gray-600 uppercase tracking-wider mb-2">Frame Rate</p>
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="fps in selectedGroup.frameRates"
                :key="fps"
                @click="selectedFps = fps"
                :class="selectedFps === fps
                  ? 'bg-white text-black border-white'
                  : 'bg-[#1c1c1c] border-[#2a2a2a] text-gray-400 hover:border-[#3a3a3a] hover:text-gray-200'"
                class="px-3 py-1.5 rounded-lg border text-[11px] font-mono font-medium transition-all duration-150"
              >
                {{ fps }}
              </button>
            </div>
          </div>

        </div>

        <!-- Footer -->
        <div class="px-5 py-4 border-t border-[#1c1c1c] flex justify-end gap-2">
          <button
            @click="$emit('close')"
            class="px-4 py-2 rounded-lg text-xs font-semibold bg-[#1e1e1e] hover:bg-[#272727] text-gray-400 hover:text-white transition-all"
          >
            Cancel
          </button>
          <button
            @click="confirming = true"
            :disabled="!canApply"
            class="px-4 py-2 rounded-lg text-xs font-semibold transition-all
                   bg-white text-black hover:bg-gray-200 active:bg-gray-300
                   disabled:bg-[#1c1c1c] disabled:text-gray-600 disabled:cursor-not-allowed"
          >
            Review &amp; Apply
          </button>
        </div>

      </div>

      <!-- Confirmation step -->
      <div v-else-if="confirming">

        <div class="px-5 py-4 space-y-4">
          <p class="text-xs text-gray-500">Review the format change before applying.</p>

          <!-- Before / After -->
          <div class="rounded-xl border border-[#222] overflow-hidden">
            <div class="px-4 py-3 border-b border-[#1c1c1c] bg-[#111]">
              <p class="text-[9px] text-gray-600 uppercase tracking-wider mb-1.5">Current</p>
              <div class="flex items-center gap-2 flex-wrap">
                <span class="px-2 py-0.5 rounded bg-[#1c1c1c] text-[10px] font-mono text-gray-500">{{ currentFormat?.codec || '—' }}</span>
                <span class="px-2 py-0.5 rounded bg-[#1c1c1c] text-[10px] font-mono text-gray-500">{{ resLabel(currentFormat?.recordResolution) }}</span>
                <span class="px-2 py-0.5 rounded bg-[#1c1c1c] text-[10px] font-mono text-gray-500">{{ currentFormat?.frameRate ? currentFormat.frameRate + ' fps' : '—' }}</span>
              </div>
            </div>
            <div class="px-4 py-3 bg-[#161616]">
              <p class="text-[9px] text-gray-600 uppercase tracking-wider mb-1.5">New</p>
              <div class="flex items-center gap-2 flex-wrap">
                <span class="px-2 py-0.5 rounded bg-white/10 border border-white/20 text-[10px] font-mono text-white font-semibold">{{ selectedCodec }}</span>
                <span class="px-2 py-0.5 rounded bg-white/10 border border-white/20 text-[10px] font-mono text-white font-semibold">{{ resLabel(selectedGroup?.recordResolution) }}</span>
                <span class="px-2 py-0.5 rounded bg-white/10 border border-white/20 text-[10px] font-mono text-white font-semibold">{{ selectedFps }} fps</span>
              </div>
            </div>
          </div>

          <!-- Warning if recording -->
          <div
            v-if="camera.recording"
            class="flex items-start gap-2.5 px-3 py-2.5 rounded-lg bg-amber-500/5 border border-amber-500/20"
          >
            <span class="text-amber-400 text-xs mt-px flex-shrink-0">⚠</span>
            <p class="text-[11px] text-amber-400/90 leading-relaxed">
              This camera is currently recording. Changing the format may interrupt recording.
            </p>
          </div>
        </div>

        <div class="px-5 py-4 border-t border-[#1c1c1c] flex justify-end gap-2">
          <button
            @click="confirming = false"
            class="px-4 py-2 rounded-lg text-xs font-semibold bg-[#1e1e1e] hover:bg-[#272727] text-gray-400 hover:text-white transition-all"
          >
            Back
          </button>
          <button
            @click="applyFormat"
            class="px-4 py-2 rounded-lg text-xs font-semibold transition-all bg-white text-black hover:bg-gray-200 active:bg-gray-300"
          >
            Confirm &amp; Apply
          </button>
        </div>

      </div>

      <!-- Applying -->
      <div v-else-if="applying" class="px-5 py-10 flex flex-col items-center gap-3">
        <div class="w-6 h-6 rounded-full border-2 border-[#333] border-t-white animate-spin"></div>
        <p class="text-xs text-gray-500">Applying format…</p>
      </div>

      <!-- Apply error -->
      <div v-else-if="applyError" class="px-5 py-8 text-center space-y-3">
        <p class="text-xs text-red-400">{{ applyError }}</p>
        <div class="flex justify-center gap-2">
          <button
            @click="resetState"
            class="px-3 py-1.5 rounded-lg text-xs bg-[#1e1e1e] hover:bg-[#2a2a2a] text-gray-400 hover:text-white transition-all"
          >
            Back
          </button>
          <button
            @click="applyFormat"
            class="px-3 py-1.5 rounded-lg text-xs bg-white text-black hover:bg-gray-200 transition-all"
          >
            Retry
          </button>
        </div>
      </div>

      <!-- Apply success -->
      <div v-else-if="applySuccess" class="px-5 py-10 flex flex-col items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center">
          <span class="text-emerald-400 text-base">✓</span>
        </div>
        <p class="text-xs text-emerald-400 font-medium">Format applied</p>
        <p class="text-[10px] text-gray-600">
          {{ selectedCodec }} · {{ resLabel(selectedGroup?.recordResolution) }} · {{ selectedFps }} fps
        </p>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  camera: { type: Object, required: true }
})

const emit = defineEmits(['close'])

const BASE = computed(() => `http://${props.camera.ip}/control/api/v1`)

// State
const loading = ref(true)
const loadError = ref('')
const supportedFormats = ref([])
const currentFormat = ref(null)

const selectedGroup = ref(null)
const selectedCodec = ref('')
const selectedFps = ref('')

const confirming = ref(false)
const applying = ref(false)
const applyError = ref('')
const applySuccess = ref(false)

const canApply = computed(() => selectedGroup.value && selectedCodec.value && selectedFps.value)

// Helpers
const resKey = (res) => res ? `${res.width}x${res.height}` : '—'
const resLabel = (res) => {
  if (!res) return '—'
  const w = res.width, h = res.height
  if (w === 8192) return '8K'
  if (w === 6144) return '6K'
  if (w === 4096 && h === 3072) return '4K (4:3)'
  if (w === 4096) return '4K DCI'
  if (w === 3840) return '4K UHD'
  if (w === 2720 || w === 2688) return '2.7K'
  if (w === 2048) return '2K DCI'
  if (w === 1920) return 'FHD'
  if (w === 1280) return 'HD'
  return `${w}×${h}`
}

// Load formats from camera
const loadFormats = async () => {
  loading.value = true
  loadError.value = ''
  try {
    const [fmtRes, curRes] = await Promise.all([
      fetch(`${BASE.value}/system/supportedFormats`),
      fetch(`${BASE.value}/system/format`)
    ])
    if (!fmtRes.ok) throw new Error(`supportedFormats: ${fmtRes.status}`)
    if (!curRes.ok) throw new Error(`format: ${curRes.status}`)
    const fmtData = await fmtRes.json()
    const curData = await curRes.json()
    supportedFormats.value = fmtData.supportedFormats || []
    currentFormat.value = curData
    // Pre-select current format
    const match = supportedFormats.value.find(g =>
      g.recordResolution?.width === curData.recordResolution?.width &&
      g.recordResolution?.height === curData.recordResolution?.height
    )
    if (match) {
      selectedGroup.value = match
      selectedCodec.value = match.codecs.includes(curData.codec) ? curData.codec : (match.codecs[0] || '')
      selectedFps.value = match.frameRates.includes(curData.frameRate) ? curData.frameRate : (match.frameRates[0] || '')
    }
  } catch (e) {
    loadError.value = `Could not load formats from camera (${e.message})`
  } finally {
    loading.value = false
  }
}

const selectGroup = (group) => {
  selectedGroup.value = group
  // Reset codec/fps if not available in new group
  if (!group.codecs.includes(selectedCodec.value)) selectedCodec.value = group.codecs[0] || ''
  if (!group.frameRates.includes(selectedFps.value)) selectedFps.value = group.frameRates[0] || ''
}

const applyFormat = async () => {
  confirming.value = false
  applying.value = true
  applyError.value = ''
  try {
    const body = {
      codec: selectedCodec.value,
      frameRate: selectedFps.value,
      recordResolution: selectedGroup.value.recordResolution,
      sensorResolution: selectedGroup.value.sensorResolution
    }
    const res = await fetch(`${BASE.value}/system/format`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    if (!res.ok && res.status !== 204) {
      const msg = res.status === 400 ? 'Invalid format combination'
        : res.status === 409 ? 'Format not supported in current state'
        : `Error ${res.status}`
      throw new Error(msg)
    }
    applySuccess.value = true
    setTimeout(() => emit('close'), 1800)
  } catch (e) {
    applyError.value = `Failed to apply format: ${e.message}`
  } finally {
    applying.value = false
  }
}

const resetState = () => {
  confirming.value = false
  applyError.value = ''
}

onMounted(loadFormats)
</script>
