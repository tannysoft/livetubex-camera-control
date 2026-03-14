<template>
  <div class="min-h-screen bg-camera-dark text-white p-5">
    <div class="max-w-8xl mx-auto">
      <div class="mb-6 space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="flex flex-col justify-center">
            <h2 class="text-2xl font-semibold text-center md:text-left">Global Camera Control</h2>
            <div class="mt-1 text-center md:text-left text-sm text-gray-400">
              Connected: {{ connectedCamerasCount }} | Recording: {{ recordingCamerasCount }}
            </div>
          </div>

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

          <div class="flex justify-end items-center gap-3">
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

            <button
              @click="openAddCameraModal"
              class="w-9 h-9 flex items-center justify-center rounded-full bg-camera-element hover:bg-gray-600 text-camera-green font-bold text-xl leading-none shadow-md transition-all duration-200"
              title="เพิ่มกล้องใหม่"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CameraCard 
          v-for="(camera, key) in cameras"
          :key="key"
          :camera="camera" 
          @toggle-recording="handleToggleRecording"
          @stop-recording="handleStopRecording"
          @delete-camera="handleDeleteCamera"
        />
      </div>
      <div
        v-if="showAddModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      >
        <div class="bg-camera-card border border-camera-border rounded-xl shadow-2xl w-full max-w-md mx-4">
          <div class="flex items-center justify-between px-4 py-3 border-b border-camera-border">
            <h3 class="text-lg font-semibold">
              เพิ่มกล้องใหม่
            </h3>
            <button
              @click="closeAddCameraModal"
              class="w-7 h-7 flex items-center justify-center rounded-full bg-camera-element hover:bg-gray-600 text-sm"
            >
              ✕
            </button>
          </div>
          <div class="px-4 py-4 space-y-4">
            <div>
              <label class="block text-xs font-semibold text-gray-300 mb-1" for="modalCameraId">
                Camera ID
              </label>
              <input
                id="modalCameraId"
                v-model="newCameraId"
                type="text"
                placeholder="เช่น cam23"
                class="w-full px-3 py-2 rounded-lg bg-camera-element border border-camera-border text-sm focus:outline-none focus:ring-2 focus:ring-camera-green"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-300 mb-1" for="modalCameraIp">
                Camera IP
              </label>
              <input
                id="modalCameraIp"
                v-model="newCameraIp"
                type="text"
                placeholder="เช่น 192.168.110.230"
                class="w-full px-3 py-2 rounded-lg bg-camera-element border border-camera-border text-sm focus:outline-none focus:ring-2 focus:ring-camera-green"
              />
            </div>
            <div class="min-h-[1.25rem]">
              <p v-if="addError" class="text-xs text-red-400">
                {{ addError }}
              </p>
              <p v-else-if="addSuccess" class="text-xs text-camera-green">
                เพิ่มกล้องและบันทึกลงฐานข้อมูลเรียบร้อยแล้ว
              </p>
            </div>
          </div>
          <div class="px-4 py-3 border-t border-camera-border flex justify-end gap-3">
            <button
              @click="closeAddCameraModal"
              class="px-4 py-2 rounded-lg text-sm font-semibold bg-camera-element hover:bg-gray-600"
            >
              ยกเลิก
            </button>
            <button
              @click="handleAddCamera"
              :disabled="!canAddCamera"
              class="px-5 py-2 rounded-lg text-sm font-semibold bg-camera-green hover:bg-green-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white"
            >
              เพิ่ม &amp; Save
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, computed, ref } from 'vue'
import CameraCard from '~/components/CameraCard.vue'
import { useCameraStore } from '~/stores/camera'

const cameraStore = useCameraStore()
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
  removeCameraConfig
} = cameraStore

const handleToggleRecording = (cameraId) => {
  toggleRecording(cameraId)
}

const handleStopRecording = (cameraId) => {
  stopRecording(cameraId)
}

const handleDeleteCamera = async (cameraId) => {
  if (!confirm(`ต้องการลบกล้อง ${cameraId} ออกจากระบบหรือไม่?`)) {
    return
  }
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

const hasConnectedCameras = computed(() =>
  Object.values(cameras).some(camera => camera.connected)
)

const hasRecordingCameras = computed(() =>
  Object.values(cameras).some(camera => camera.recording)
)

const connectedCamerasCount = computed(() =>
  Object.values(cameras).filter(camera => camera.connected).length
)

const recordingCamerasCount = computed(() =>
  Object.values(cameras).filter(camera => camera.recording).length
)

const showAddModal = ref(false)
const newCameraId = ref('')
const newCameraIp = ref('')
const addError = ref('')
const addSuccess = ref(false)

const openAddCameraModal = () => {
  addError.value = ''
  addSuccess.value = false
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

  if (!id || !ip) {
    addError.value = 'กรุณากรอกทั้ง Camera ID และ IP'
    return
  }

  if (cameras[id]) {
    addError.value = 'Camera ID นี้มีอยู่แล้ว'
    return
  }

  try {
    await addCameraConfig(id, ip)
    newCameraId.value = ''
    newCameraIp.value = ''
    addSuccess.value = true
    setTimeout(() => {
      addSuccess.value = false
      showAddModal.value = false
    }, 800)
  } catch {
    addError.value = 'ไม่สามารถเพิ่มกล้องได้ กรุณาลองใหม่อีกครั้ง'
  }
}

onMounted(async () => {
  if (process.client) {
    await loadCameraConfigs()
    initializeCameras()
    autoRestartEnabled.value = getGlobalAutoRestart()
  }
})

onUnmounted(() => {
  if (process.client) {
    cleanup()
  }
})
</script>

