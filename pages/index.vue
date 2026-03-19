<template>
  <div class="min-h-screen bg-[#0a0a0a] text-white">

    <!-- Header -->
    <header class="sticky top-0 z-20 bg-[#0f0f0f] border-b border-[#1c1c1c]">
      <div class="max-w-screen-2xl mx-auto px-5 py-3 flex items-center gap-4">

        <!-- Logo + Title -->
        <div class="flex flex-col items-start justify-center flex-shrink-0 pt-1">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 830.32 78.78" class="h-4 w-auto">
            <path fill="#f73727" d="m605.7,52.41c0,13.18,10.68,23.86,23.86,23.86h57.45v-19.18h-57.45c-2.6,0-4.72-2.08-4.72-4.69s2.12-4.69,4.72-4.69h57.45v-19.18h-57.45c-2.6,0-4.72-2.08-4.72-4.69s2.12-4.69,4.72-4.69h57.45V0h-57.45c-13.18,0-23.86,10.68-23.86,23.86,0,5.36,1.79,10.29,4.77,14.27-2.98,3.98-4.77,8.91-4.77,14.27Z"/>
            <path fill="#ffffff" d="m222.56,52.41c0,13.18,10.68,23.86,23.86,23.86h57.45v-19.18h-57.45c-2.6,0-4.72-2.08-4.72-4.69s2.12-4.69,4.72-4.69h57.45v-19.18h-57.45c-2.6,0-4.72-2.08-4.72-4.69s2.12-4.69,4.72-4.69h57.45V0h-57.45C233.24,0,222.56,10.68,222.56,23.86c0,5.36,1.79,10.29,4.77,14.27-2.98,3.98-4.77,8.91-4.77,14.27Z"/>
            <polygon fill="#ffffff" points="190.47 0 147.47 47.67 147.47 0 120.89 0 120.89 76.27 121.67 76.27 147.47 76.27 153.97 76.27 222.88 0 190.47 0"/>
            <path fill="#ffffff" d="m75.51,55.9v20.38H0V0h26.59v55.9h48.92Z"/>
            <path fill="#ffffff" d="m84.24,76.27V0h26.59v76.27h-26.59Z"/>
            <path fill="#f73727" d="m400.58,20.16h-30.18v56.12h-26.59V20.16h-30.07V0h86.84v20.16Z"/>
            <path fill="#f73727" d="m501.12,0v40.32c0,23.54-16.34,38.46-45.55,38.46s-45.65-14.93-45.65-38.46V0h26.59v38.25c0,11.33,5.88,19.51,19.07,19.51s18.96-8.17,18.96-19.51V0h26.59Z"/>
            <path fill="#f73727" d="m818.72,63.42l-20.35-22.57c-1.44-1.59-1.43-4.01,0-5.6l20.28-22.45c4.08-4.52,11.59-1.64,11.6,4.45l.07,41.7c.01,6.1-7.51,9-11.6,4.47Z"/>
            <polygon fill="#ffffff" points="799.85 76.27 765.36 38.03 799.71 0 769.86 0 750.46 21.51 731.05 0 701.2 0 735.55 38.03 701.06 76.27 730.81 76.27 750.46 54.53 770.1 76.27 799.85 76.27"/>
            <path fill="#f73727" d="m594.71,23.86C594.71,10.68,584.02,0,570.85,0h-57.45v19.18h57.45c2.6,0,4.72,2.08,4.72,4.69s-2.12,4.69-4.72,4.69h-57.45v19.18h57.45c2.6,0,4.72,2.08,4.72,4.69s-2.12,4.69-4.72,4.69h-57.45v19.18h57.45c13.18,0,23.86-10.68,23.86-23.86,0-5.36-1.79-10.29-4.77-14.27,2.98-3.98,4.77-8.91,4.77-14.27Z"/>
          </svg>
        </div>

        <!-- Tabs -->
        <div class="flex items-center gap-0.5 border-l border-[#222] pl-4 ml-1">
          <button
            type="button"
            :class="activeTab === 'camera'
              ? 'bg-[#1a1a1a] border-[#333] text-white'
              : 'border-transparent text-gray-500 hover:text-gray-400 hover:bg-[#141414]'"
            class="px-3.5 py-2 rounded-lg text-xs font-semibold border transition-all duration-200"
            @click="activeTab = 'camera'"
          >
            Camera Control
          </button>
          <button
            type="button"
            :class="activeTab === 'hyperdeck'
              ? 'bg-[#1a1a1a] border-[#333] text-white'
              : 'border-transparent text-gray-500 hover:text-gray-400 hover:bg-[#141414]'"
            class="px-3.5 py-2 rounded-lg text-xs font-semibold border transition-all duration-200"
            @click="activeTab = 'hyperdeck'"
          >
            Hyperdeck Control
          </button>
        </div>

        <!-- Stats Pills (Camera tab) -->
        <div v-show="activeTab === 'camera'" class="flex items-center gap-2 flex-1 justify-center">
          <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1a1a1a] border border-[#222] text-xs">
            <div class="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
            <span class="text-gray-400">{{ connectedCamerasCount }}</span>
            <span class="text-gray-600 hidden sm:inline">Online</span>
          </div>
          <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1a1a1a] border border-[#222] text-xs">
            <div
              class="w-1.5 h-1.5 rounded-full bg-red-500"
              :class="recordingCamerasCount > 0 ? 'animate-pulse' : 'opacity-40'"
            ></div>
            <span class="text-gray-400">{{ recordingCamerasCount }}</span>
            <span class="text-gray-600 hidden sm:inline">Recording</span>
          </div>
          <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1a1a1a] border border-[#222] text-xs text-gray-600">
            <span>{{ totalCamerasCount }} Cameras</span>
          </div>
        </div>

        <!-- Stats Pills (Hyperdeck tab) -->
        <div v-show="activeTab === 'hyperdeck'" class="flex items-center gap-2 flex-1 justify-center">
          <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1a1a1a] border border-[#222] text-xs">
            <div class="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
            <span class="text-gray-400">{{ connectedHyperdecksCount }}</span>
            <span class="text-gray-600 hidden sm:inline">Online</span>
          </div>
          <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1a1a1a] border border-[#222] text-xs">
            <div
              class="w-1.5 h-1.5 rounded-full bg-red-500"
              :class="recordingHyperdecksCount > 0 ? 'animate-pulse' : 'opacity-40'"
            ></div>
            <span class="text-gray-400">{{ recordingHyperdecksCount }}</span>
            <span class="text-gray-600 hidden sm:inline">Recording</span>
          </div>
          <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1a1a1a] border border-[#222] text-xs text-gray-600">
            <span>{{ totalHyperdecksCount }} Hyperdecks</span>
          </div>
        </div>

        <!-- Controls (Camera tab) -->
        <div v-show="activeTab === 'camera'" class="flex items-center gap-2 flex-shrink-0">
          <button
            @click="startAllRecording"
            :disabled="!hasConnectedCameras"
            class="px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all duration-200
                   bg-red-600 hover:bg-red-500 active:bg-red-700
                   disabled:bg-[#1c1c1c] disabled:text-gray-600 disabled:cursor-not-allowed
                   shadow-sm shadow-red-900/30"
          >
            <div class="w-2 h-2 bg-white rounded-full flex-shrink-0"></div>
            <span class="hidden sm:inline">Start All</span>
          </button>

          <button
            @click="stopAllRecording"
            :disabled="!hasRecordingCameras"
            class="px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all duration-200
                   bg-[#242424] hover:bg-[#2e2e2e] active:bg-[#1a1a1a]
                   disabled:bg-[#141414] disabled:text-gray-700 disabled:cursor-not-allowed"
          >
            <div class="w-2 h-2 bg-current rounded-sm flex-shrink-0"></div>
            <span class="hidden sm:inline">Stop All</span>
          </button>

          <div class="w-px h-5 bg-[#222] mx-0.5"></div>

          <button
            @click="toggleAutoRestart"
            :class="autoRestartEnabled
              ? 'bg-emerald-600/15 border-emerald-600/30 text-emerald-400 hover:bg-emerald-600/25'
              : 'bg-[#1a1a1a] border-[#222] text-gray-600 hover:bg-[#222] hover:text-gray-400'"
            class="px-3.5 py-2 rounded-lg text-xs font-semibold border transition-all duration-200 flex items-center gap-2"
          >
            <div
              :class="autoRestartEnabled ? 'bg-emerald-400' : 'bg-gray-600'"
              class="w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors duration-200"
            ></div>
            <span class="hidden md:inline">Auto Restart</span>
          </button>

          <button
            @click="openAddCameraModal"
            class="w-8 h-8 rounded-lg bg-[#1a1a1a] hover:bg-[#242424] border border-[#222] hover:border-[#333]
                   flex items-center justify-center text-gray-500 hover:text-white transition-all text-base leading-none"
            title="Add Camera"
          >
            +
          </button>
        </div>

        <!-- Controls (Hyperdeck tab) -->
        <div v-show="activeTab === 'hyperdeck'" class="flex items-center gap-2 flex-shrink-0">
          <button
            @click="openAddHyperdeckModal"
            class="w-8 h-8 rounded-lg bg-[#1a1a1a] hover:bg-[#242424] border border-[#222] hover:border-[#333]
                   flex items-center justify-center text-gray-500 hover:text-white transition-all text-base leading-none"
            title="Add Hyperdeck"
          >
            +
          </button>
        </div>

      </div>
    </header>

    <!-- Main content by tab -->
    <main class="max-w-screen-2xl mx-auto p-4 sm:p-5">
      <!-- Camera Control tab -->
      <template v-if="activeTab === 'camera'">
        <div
          v-if="orderedCamerasList.length === 0"
          class="flex flex-col items-center justify-center py-24 text-center"
        >
          <div class="w-16 h-16 rounded-2xl bg-[#141414] border border-[#1e1e1e] flex items-center justify-center mb-4">
            <div class="w-6 h-6 rounded-full border-2 border-[#333]"></div>
          </div>
          <p class="text-gray-500 text-sm">No cameras configured</p>
          <button
            @click="openAddCameraModal"
            class="mt-3 px-4 py-2 text-xs text-gray-400 hover:text-white bg-[#1a1a1a] hover:bg-[#222] border border-[#222] rounded-lg transition-all"
          >
            Add your first camera
          </button>
        </div>

        <div
          v-else
          ref="gridEl"
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3"
        >
          <CameraCard
            v-for="camera in orderedCamerasList"
            :key="camera.id"
            :camera="camera"
            @toggle-recording="handleToggleRecording"
            @stop-recording="handleStopRecording"
            @delete-camera="handleDeleteCamera"
          />
        </div>
      </template>

      <!-- Hyperdeck Control tab -->
      <template v-else-if="activeTab === 'hyperdeck'">
        <div
          v-if="orderedHyperdecksList.length === 0"
          class="flex flex-col items-center justify-center py-24 text-center"
        >
          <div class="w-16 h-16 rounded-2xl bg-[#141414] border border-[#1e1e1e] flex items-center justify-center mb-4">
            <svg class="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </div>
          <p class="text-gray-500 text-sm">No Hyperdecks configured</p>
          <button
            @click="openAddHyperdeckModal"
            class="mt-3 px-4 py-2 text-xs text-gray-400 hover:text-white bg-[#1a1a1a] hover:bg-[#222] border border-[#222] rounded-lg transition-all"
          >
            Add your first Hyperdeck
          </button>
        </div>
        <div
          v-else
          ref="hyperdeckGridEl"
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3"
        >
          <HyperdeckCard
            v-for="h in orderedHyperdecksList"
            :key="h.id"
            :hyperdeck="h"
            @start-recording="handleHyperdeckStartRecording"
            @play="handleHyperdeckPlay"
            @stop-transport="handleHyperdeckStopTransport"
            @reboot="handleHyperdeckReboot"
            @delete-hyperdeck="handleDeleteHyperdeck"
          />
        </div>
      </template>
    </main>

    <!-- Add Camera Modal -->
    <Transition name="modal">
      <div
        v-if="showAddModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="closeAddCameraModal"
      >
        <div class="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
        <div class="relative bg-[#141414] border border-[#222] rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">

          <!-- Modal Header -->
          <div class="flex items-center justify-between px-5 py-4 border-b border-[#1c1c1c]">
            <div>
              <h3 class="text-sm font-semibold">Add Camera</h3>
              <p class="text-xs text-gray-600 mt-0.5">Configure a new Blackmagic camera</p>
            </div>
            <button
              @click="closeAddCameraModal"
              class="w-7 h-7 flex items-center justify-center rounded-lg bg-[#1e1e1e] hover:bg-[#2a2a2a] text-gray-500 hover:text-white text-xs transition-all"
            >
              ✕
            </button>
          </div>

          <!-- Modal Body -->
          <div class="px-5 py-4 space-y-3">
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1.5" for="modalCameraId">
                Camera ID
              </label>
              <input
                id="modalCameraId"
                v-model="newCameraId"
                type="text"
                placeholder="e.g. cam23"
                autocomplete="off"
                class="w-full px-3 py-2.5 rounded-lg bg-[#1a1a1a] border border-[#222] text-sm text-white placeholder-gray-700
                       focus:outline-none focus:border-emerald-600/50 focus:ring-1 focus:ring-emerald-600/30 transition-all"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1.5" for="modalCameraIp">
                IP Address
              </label>
              <input
                id="modalCameraIp"
                v-model="newCameraIp"
                type="text"
                placeholder="e.g. 192.168.110.230"
                autocomplete="off"
                class="w-full px-3 py-2.5 rounded-lg bg-[#1a1a1a] border border-[#222] text-sm text-white placeholder-gray-700
                       focus:outline-none focus:border-emerald-600/50 focus:ring-1 focus:ring-emerald-600/30 transition-all"
              />
            </div>
            <div class="min-h-[1.25rem]">
              <p v-if="addError" class="text-xs text-red-400">{{ addError }}</p>
              <p v-else-if="addSuccess" class="text-xs text-emerald-400">Camera added successfully</p>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="px-5 py-4 border-t border-[#1c1c1c] flex justify-end gap-2">
            <button
              @click="closeAddCameraModal"
              class="px-4 py-2 rounded-lg text-xs font-semibold bg-[#1e1e1e] hover:bg-[#272727] text-gray-400 hover:text-white transition-all"
            >
              Cancel
            </button>
            <button
              @click="handleAddCamera"
              :disabled="!canAddCamera"
              class="px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700
                     disabled:bg-[#1c1c1c] disabled:text-gray-600 disabled:cursor-not-allowed text-white transition-all"
            >
              Add &amp; Save
            </button>
          </div>

        </div>
      </div>
    </Transition>

    <!-- Add Hyperdeck Modal -->
    <Transition name="modal">
      <div
        v-if="showAddHyperdeckModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="closeAddHyperdeckModal"
      >
        <div class="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
        <div class="relative bg-[#141414] border border-[#222] rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">

          <div class="flex items-center justify-between px-5 py-4 border-b border-[#1c1c1c]">
            <div>
              <h3 class="text-sm font-semibold">Add Hyperdeck</h3>
              <p class="text-xs text-gray-600 mt-0.5">Configure a Blackmagic HyperDeck recorder</p>
            </div>
            <button
              @click="closeAddHyperdeckModal"
              class="w-7 h-7 flex items-center justify-center rounded-lg bg-[#1e1e1e] hover:bg-[#2a2a2a] text-gray-500 hover:text-white text-xs transition-all"
            >
              ✕
            </button>
          </div>

          <div class="px-5 py-4 space-y-3">
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1.5" for="modalHyperdeckId">Hyperdeck ID</label>
              <input
                id="modalHyperdeckId"
                v-model="newHyperdeckId"
                type="text"
                placeholder="e.g. hd1"
                autocomplete="off"
                class="w-full px-3 py-2.5 rounded-lg bg-[#1a1a1a] border border-[#222] text-sm text-white placeholder-gray-700
                       focus:outline-none focus:border-emerald-600/50 focus:ring-1 focus:ring-emerald-600/30 transition-all"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1.5" for="modalHyperdeckIp">IP Address</label>
              <input
                id="modalHyperdeckIp"
                v-model="newHyperdeckIp"
                type="text"
                placeholder="e.g. 192.168.1.100"
                autocomplete="off"
                class="w-full px-3 py-2.5 rounded-lg bg-[#1a1a1a] border border-[#222] text-sm text-white placeholder-gray-700
                       focus:outline-none focus:border-emerald-600/50 focus:ring-1 focus:ring-emerald-600/30 transition-all"
              />
            </div>
            <div class="min-h-[1.25rem]">
              <p v-if="addHyperdeckError" class="text-xs text-red-400">{{ addHyperdeckError }}</p>
              <p v-else-if="addHyperdeckSuccess" class="text-xs text-emerald-400">Hyperdeck added successfully</p>
            </div>
          </div>

          <div class="px-5 py-4 border-t border-[#1c1c1c] flex justify-end gap-2">
            <button
              @click="closeAddHyperdeckModal"
              class="px-4 py-2 rounded-lg text-xs font-semibold bg-[#1e1e1e] hover:bg-[#272727] text-gray-400 hover:text-white transition-all"
            >
              Cancel
            </button>
            <button
              @click="handleAddHyperdeck"
              :disabled="!canAddHyperdeck"
              class="px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700
                     disabled:bg-[#1c1c1c] disabled:text-gray-600 disabled:cursor-not-allowed text-white transition-all"
            >
              Add &amp; Save
            </button>
          </div>

        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { onMounted, onUnmounted, computed, ref, watch, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import Sortable from 'sortablejs'
import CameraCard from '~/components/CameraCard.vue'
import HyperdeckCard from '~/components/HyperdeckCard.vue'
import { useCameraStore } from '~/stores/camera'
import { useHyperdeckStore } from '~/stores/hyperdeck'

const activeTab = ref('camera') // 'camera' | 'hyperdeck'

const cameraStore = useCameraStore()
const hyperdeckStore = useHyperdeckStore()

const { hyperdecks, hyperdeckOrder } = storeToRefs(hyperdeckStore)
const {
  loadHyperdeckConfigs,
  addHyperdeckConfig,
  removeHyperdeckConfig,
  startRecording: startHyperdeckRecording,
  play: hyperdeckPlay,
  stopTransport: hyperdeckStopTransport,
  rebootHyperdeck,
  initializeHyperdecks,
  cleanup: hyperdeckCleanup
} = hyperdeckStore

const {
  cameras,
  toggleRecording,
  startRecording,
  stopRecording,
  initializeCameras,
  cleanup,
  setGlobalAutoRestart,
  getGlobalAutoRestart,
  loadCameraConfigs,
  addCameraConfig,
  removeCameraConfig,
  reorderCameras
} = cameraStore

const orderedHyperdecksList = computed(() => {
  const order = hyperdeckOrder.value ?? []
  const ids = Array.isArray(order) ? order : []
  return ids.filter(id => hyperdecks.value && hyperdecks.value[id]).map(id => hyperdecks.value[id])
})

// Local ordered list (synced from store, mutated by drag)
const orderedCamerasList = ref([])
watch(() => cameraStore.cameraOrder, (newOrder) => {
  orderedCamerasList.value = newOrder.filter(id => cameras[id]).map(id => cameras[id])
}, { deep: true })

// Sortable drag-and-drop (Camera grid)
const gridEl = ref(null)
let sortable = null

const initSortable = () => {
  if (!gridEl.value) return
  sortable = Sortable.create(gridEl.value, {
    animation: 200,
    handle: '.drag-handle',
    ghostClass: 'drag-ghost',
    dragClass: 'drag-active',
    onEnd: async (evt) => {
      if (evt.oldIndex === evt.newIndex) return
      const newOrder = [...cameraStore.cameraOrder]
      const [moved] = newOrder.splice(evt.oldIndex, 1)
      newOrder.splice(evt.newIndex, 0, moved)
      await reorderCameras(newOrder)
    }
  })
}

// Sortable drag-and-drop (Hyperdeck grid)
const hyperdeckGridEl = ref(null)
let hyperdeckSortable = null

const initHyperdeckSortable = () => {
  if (!hyperdeckGridEl.value) return
  hyperdeckSortable?.destroy()
  hyperdeckSortable = Sortable.create(hyperdeckGridEl.value, {
    animation: 200,
    handle: '.drag-handle',
    ghostClass: 'drag-ghost',
    dragClass: 'drag-active',
    onEnd: async (evt) => {
      if (evt.oldIndex === evt.newIndex) return
      const currentOrder = hyperdeckOrder.value ?? []
      const newOrder = [...currentOrder]
      const [moved] = newOrder.splice(evt.oldIndex, 1)
      newOrder.splice(evt.newIndex, 0, moved)
      await hyperdeckStore.reorderHyperdecks(newOrder)
    }
  })
}

const handleToggleRecording = (cameraId) => toggleRecording(cameraId)
const handleStopRecording = (cameraId) => stopRecording(cameraId)

const handleDeleteCamera = async (cameraId) => {
  if (!confirm(`Remove camera ${cameraId} from the system?`)) return
  await removeCameraConfig(cameraId)
}

const startAllRecording = async () => {
  const connectedCameras = Object.keys(cameras).filter(id => cameras[id].connected)
  for (const cameraId of connectedCameras) {
    if (!cameras[cameraId].recording) {
      await startRecording(cameraId)
    }
  }
}

const stopAllRecording = async () => {
  const recordingCameras = Object.keys(cameras).filter(id => cameras[id].recording)
  for (const cameraId of recordingCameras) {
    await stopRecording(cameraId)
  }
}

const autoRestartEnabled = ref(true)

const toggleAutoRestart = () => {
  autoRestartEnabled.value = !autoRestartEnabled.value
  setGlobalAutoRestart(autoRestartEnabled.value)
}

const hasConnectedCameras = computed(() => Object.values(cameras).some(c => c.connected))
const hasRecordingCameras = computed(() => Object.values(cameras).some(c => c.recording))
const connectedCamerasCount = computed(() => Object.values(cameras).filter(c => c.connected).length)
const recordingCamerasCount = computed(() => Object.values(cameras).filter(c => c.recording).length)
const totalCamerasCount = computed(() => Object.keys(cameras).length)

const connectedHyperdecksCount = computed(() => Object.values(hyperdecks.value || {}).filter(h => h.connected).length)
const recordingHyperdecksCount = computed(() => Object.values(hyperdecks.value || {}).filter(h => h.recording).length)
const totalHyperdecksCount = computed(() => Object.keys(hyperdecks.value || {}).length)

const showAddModal = ref(false)
const newCameraId = ref('')
const newCameraIp = ref('')
const addError = ref('')
const addSuccess = ref(false)

const openAddCameraModal = () => {
  addError.value = ''
  addSuccess.value = false
  newCameraId.value = ''
  newCameraIp.value = ''
  showAddModal.value = true
}

const closeAddCameraModal = () => {
  showAddModal.value = false
}

const canAddCamera = computed(() => {
  const id = newCameraId.value.trim()
  const ip = newCameraIp.value.trim()
  if (!id || !ip) return false
  return !cameras[id]
})

const handleAddCamera = async () => {
  addError.value = ''
  addSuccess.value = false
  const id = newCameraId.value.trim()
  const ip = newCameraIp.value.trim()
  if (!id || !ip) { addError.value = 'Please fill in both Camera ID and IP'; return }
  if (cameras[id]) { addError.value = 'Camera ID already exists'; return }
  try {
    await addCameraConfig(id, ip)
    addSuccess.value = true
    setTimeout(() => {
      addSuccess.value = false
      showAddModal.value = false
    }, 800)
  } catch {
    addError.value = 'Failed to add camera. Please try again.'
  }
}

// Hyperdeck modal
const showAddHyperdeckModal = ref(false)
const newHyperdeckId = ref('')
const newHyperdeckIp = ref('')
const addHyperdeckError = ref('')
const addHyperdeckSuccess = ref(false)

const openAddHyperdeckModal = () => {
  addHyperdeckError.value = ''
  addHyperdeckSuccess.value = false
  newHyperdeckId.value = ''
  newHyperdeckIp.value = ''
  showAddHyperdeckModal.value = true
}

const closeAddHyperdeckModal = () => {
  showAddHyperdeckModal.value = false
}

const canAddHyperdeck = computed(() => {
  const id = newHyperdeckId.value.trim()
  const ip = newHyperdeckIp.value.trim()
  if (!id || !ip) return false
  return !(hyperdecks.value || {})[id]
})

const handleAddHyperdeck = async () => {
  addHyperdeckError.value = ''
  addHyperdeckSuccess.value = false
  const id = newHyperdeckId.value.trim()
  const ip = newHyperdeckIp.value.trim()
  if (!id || !ip) { addHyperdeckError.value = 'Please fill in both Hyperdeck ID and IP'; return }
  if ((hyperdecks.value || {})[id]) { addHyperdeckError.value = 'Hyperdeck ID already exists'; return }
  try {
    await addHyperdeckConfig(id, ip)
    addHyperdeckSuccess.value = true
    setTimeout(() => {
      addHyperdeckSuccess.value = false
      showAddHyperdeckModal.value = false
    }, 800)
  } catch {
    addHyperdeckError.value = 'Failed to add Hyperdeck. Please try again.'
  }
}

const handleDeleteHyperdeck = async (hyperdeckId) => {
  if (!confirm(`Remove Hyperdeck ${hyperdeckId} from the system?`)) return
  await removeHyperdeckConfig(hyperdeckId)
}

const handleHyperdeckStartRecording = (id) => startHyperdeckRecording(id)
const handleHyperdeckPlay = (id) => hyperdeckPlay(id)
const handleHyperdeckStopTransport = (id) => hyperdeckStopTransport(id)
const handleHyperdeckReboot = async (id) => {
  if (!confirm(`Reboot Hyperdeck ${id}? The device will restart.`)) return
  const ok = await rebootHyperdeck(id)
  if (!ok) alert('Reboot not possible in current state.')
}

onMounted(async () => {
  if (process.client) {
    await loadCameraConfigs()
    initializeCameras()
    await loadHyperdeckConfigs()
    initializeHyperdecks()
    autoRestartEnabled.value = getGlobalAutoRestart()
    await nextTick()
    initSortable()
  }
})

watch(activeTab, async (tab) => {
  if (!process.client) return
  await nextTick()
  if (tab === 'camera') {
    initSortable()
  } else if (tab === 'hyperdeck') {
    initHyperdeckSortable()
  }
})

onUnmounted(() => {
  if (process.client) {
    cleanup()
    hyperdeckCleanup()
    sortable?.destroy()
    hyperdeckSortable?.destroy()
  }
})
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.2s ease;
}
.modal-enter-from .relative {
  transform: scale(0.96) translateY(4px);
}
.modal-leave-to .relative {
  transform: scale(0.96) translateY(4px);
}

:deep(.drag-ghost) {
  opacity: 0.3;
  border: 1px dashed #444 !important;
}
:deep(.drag-active) {
  opacity: 0.9;
  transform: rotate(1deg) scale(1.02);
  box-shadow: 0 20px 40px rgba(0,0,0,0.5);
}
</style>
