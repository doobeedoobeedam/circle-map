<script setup>
import { ref, computed, nextTick } from 'vue'
import FriendMap from './components/FriendMap.vue'
import FriendForm from './components/FriendForm.vue'
import FriendList from './components/FriendList.vue'
import StatsCards from './components/StatsCards.vue'
import ProfileCard from './components/ProfileCard.vue'
import ExportPoster from './components/ExportPoster.vue'
import { useFriends } from './composables/useFriends'
import { useGeoData } from './composables/useGeoData'

const { friends, stats, storageError, addFriend, updateFriend, removeFriend, clearAll, loadSamples } = useFriends()
const { world, provinces, status } = useGeoData()

const panel = ref('list') // 'list' atau 'form'
const editing = ref(null) // teman yang lagi diedit (null = teman baru)
const draft = ref(null) // pin sementara dari form
const selectedId = ref(null)
const formRef = ref(null)
const posterRef = ref(null)
const panelEl = ref(null)
const exporting = ref(false)
const previewUrl = ref('')
const toast = ref('')
let toastTimer = null

const selectedFriend = computed(() => friends.value.find((f) => f.id === selectedId.value) || null)

function showToast(msg) {
  toast.value = msg
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (toast.value = ''), 2800)
}

// form
function openForm(friend = null) {
  editing.value = friend
  selectedId.value = null
  draft.value = null
  panel.value = 'form'
  nextTick(() => panelEl.value?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
}
function closeForm() {
  panel.value = 'list'
  editing.value = null
  draft.value = null
}
function onSave(data) {
  if (editing.value) {
    updateFriend(editing.value.id, data)
    selectedId.value = editing.value.id
    showToast('Changes saved ✨')
  } else {
    const f = addFriend(data)
    selectedId.value = f.id
    showToast(`${f.nickname} joined the map! 🎉`)
  }
  closeForm()
}

// peta
function onPick({ lat, lng }) {
  formRef.value?.setCoords(lat, lng)
}
function onSelect(id) {
  if (panel.value === 'form') {
    // saat form terbuka, klik marker = pakai lokasi teman itu (teman sekota)
    const f = friends.value.find((x) => x.id === id)
    if (f) formRef.value?.setCoords(f.lat, f.lng)
    return
  }
  selectedId.value = id
}
function onRemove() {
  const name = selectedFriend.value?.nickname
  removeFriend(selectedId.value)
  selectedId.value = null
  showToast(`${name} removed from the map`)
}

// daftar
function onClear() {
  if (window.confirm('Remove all friends from the map?')) {
    clearAll()
    selectedId.value = null
  }
}
function onSamples() {
  if (!friends.value.length || window.confirm('Replace all data with the sample friends?')) {
    loadSamples()
    selectedId.value = null
  }
}

// download PNG
async function download() {
  if (!friends.value.length) return showToast('Add some friends first 🌸')
  exporting.value = true
  try {
    previewUrl.value = await posterRef.value.generate()
  } catch (e) {
    console.error(e)
    showToast('Could not create the image. Please try again.')
  } finally {
    exporting.value = false
  }
}
const fileName = () => `circle-map-${new Date().toISOString().slice(0, 10)}.png`
</script>

<template>
  <div class="mx-auto min-h-screen max-w-[1400px] px-4 pb-8 pt-5 sm:px-6">
    <!-- Header -->
    <header class="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-4xl font-bold leading-none sm:text-5xl" style="text-shadow: 0 4px 0 #FFB8D1">Circle Map 🌸</h1>
        <p class="mt-2 font-semibold text-ink-soft">A friendship map made to show off.</p>
      </div>
      <div class="flex flex-wrap gap-2">
        <button class="btn btn-pink" @click="openForm()">+ New friend</button>
        <button class="btn btn-mint" :disabled="exporting" @click="download">
          {{ exporting ? 'Creating image...' : '⬇ Download PNG' }}
        </button>
      </div>
    </header>

    <p v-if="storageError" class="mb-4 rounded-3xl bg-peachy-soft p-3 text-sm font-bold">{{ storageError }}</p>

    <main class="grid gap-5 lg:grid-cols-[minmax(340px,420px)_1fr] lg:grid-rows-[auto_1fr]">
      <!-- statistik -->
      <div class="lg:col-start-1 lg:row-start-1">
        <StatsCards :stats="stats" />
      </div>

      <!-- peta -->
      <section
        class="z-20 self-start lg:sticky lg:top-4 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:h-[calc(100vh-7rem)] lg:min-h-[520px]"
        :class="panel === 'form' ? 'sticky top-2 h-[42vh] min-h-[280px]' : 'h-[52vh] min-h-[340px]'"
      >
        <FriendMap
          :friends="friends"
          :selected-id="selectedId"
          :world="world"
          :provinces="provinces"
          :geo-status="status"
          :picking="panel === 'form'"
          :draft="draft"
          @select="onSelect"
          @pick="onPick"
          @blank="selectedId = null"
          @add="openForm()"
        >
          <Transition name="slide">
            <ProfileCard
              v-if="selectedFriend && panel === 'list'"
              :friend="selectedFriend"
              @close="selectedId = null"
              @edit="openForm(selectedFriend)"
              @remove="onRemove"
            />
          </Transition>
        </FriendMap>
      </section>

      <!-- daftar / form -->
      <div ref="panelEl" class="scroll-mt-[46vh] lg:col-start-1 lg:row-start-2 lg:scroll-mt-0">
        <Transition name="fade" mode="out-in">
          <FriendForm
            v-if="panel === 'form'"
            :key="editing?.id || 'baru'"
            ref="formRef"
            :friend="editing"
            @update:draft="draft = $event"
            @save="onSave"
            @cancel="closeForm"
          />
          <FriendList
            v-else
            :friends="friends"
            :selected-id="selectedId"
            @select="selectedId = $event"
            @add="openForm()"
            @clear="onClear"
            @samples="onSamples"
          />
        </Transition>
      </div>
    </main>

    <footer class="mt-8 text-center text-sm text-ink-soft">
      <p>
        Your data is stored in this browser (localStorage) and is not synced to other devices automatically.
        Clearing site data in your browser will also erase your friend list.
      </p>
      <p class="mt-1">Location search by OpenStreetMap Nominatim.</p>
    </footer>

    <!-- poster tersembunyi untuk ekspor PNG -->
    <ExportPoster ref="posterRef" :friends="friends" :stats="stats" :world="world" :provinces="provinces" :geo-status="status" />

    <!-- preview hasil PNG -->
    <div
      v-if="previewUrl"
      class="fixed inset-0 z-[3000] grid place-items-center overflow-y-auto bg-ink/60 p-4"
      role="dialog"
      aria-label="Image preview"
      @click.self="previewUrl = ''"
    >
      <div class="card flex max-h-full flex-col items-center gap-3 p-4">
        <img :src="previewUrl" alt="Preview of the friendship map infographic" class="max-h-[70vh] rounded-3xl" />
        <div class="flex flex-wrap justify-center gap-2">
          <a :href="previewUrl" :download="fileName()" class="btn btn-mint">⬇ Save PNG</a>
          <button class="btn btn-ghost" @click="previewUrl = ''">Close</button>
        </div>
        <p class="text-xs text-ink-soft">On mobile: if it doesn't download automatically, press and hold the image and choose save.</p>
      </div>
    </div>

    <!-- toast -->
    <Transition name="fade">
      <div
        v-if="toast"
        class="fixed bottom-5 left-1/2 z-[3100] -translate-x-1/2 rounded-full border-2 border-white bg-lilac px-5 py-2 font-bold shadow-soft"
        role="status"
      >
        {{ toast }}
      </div>
    </Transition>
  </div>
</template>
