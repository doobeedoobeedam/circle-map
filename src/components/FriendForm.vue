<script setup>
// form tambah / edit teman
// Lokasi bisa diisi dengan klik peta, cari nama tempat, atau ketik manual nama kotanya
import { ref, computed, onBeforeUnmount } from 'vue'
import AvatarPicker from './AvatarPicker.vue'
import { CATEGORIES } from '../constants/categories'
import { reverseGeocode, searchPlace } from '../composables/useGeocoder'

const props = defineProps({ friend: { type: Object, default: null } })
const emit = defineEmits(['save', 'cancel', 'update:draft'])

const nickname = ref(props.friend?.nickname ?? '')
const category = ref(props.friend?.category ?? 'bestie')
const avatar = ref(props.friend?.avatar ?? { type: 'preset', id: 'kucing' })
const city = ref(props.friend?.city ?? '')
const region = ref(props.friend?.region ?? '')
const country = ref(props.friend?.country ?? '')
const lat = ref(props.friend?.lat ?? null)
const lng = ref(props.friend?.lng ?? null)

const geoState = ref('idle') // idle | loading | ok | error
const query = ref('')
const results = ref([])
const searching = ref(false)
const searchMsg = ref('')
const submitted = ref(false)

let controller = null
let timer = null

// kabarin App supaya pin sementara di peta ikut bergerak
const emitDraft = () => emit('update:draft', lat.value === null ? null : { lat: lat.value, lng: lng.value })
emitDraft()

// dipanggil App saat pengguna mengklik peta
function setCoords(a, b) {
  lat.value = Number(a.toFixed(5))
  lng.value = Number(b.toFixed(5))
  results.value = []
  emitDraft()
  clearTimeout(timer)
  timer = setTimeout(lookupCity, 350) // jeda singkat supaya tidak spam server
}

async function lookupCity() {
  controller?.abort()
  controller = new AbortController()
  geoState.value = 'loading'
  try {
    const r = await reverseGeocode(lat.value, lng.value, controller.signal)
    city.value = r.city
    region.value = r.region
    country.value = r.country
    geoState.value = 'ok'
  } catch (e) {
    if (e.name !== 'AbortError') geoState.value = 'error'
  }
}

async function doSearch() {
  const q = query.value.trim()
  if (!q) return
  searching.value = true
  searchMsg.value = ''
  try {
    results.value = await searchPlace(q)
    if (!results.value.length) searchMsg.value = 'Location not found. Try another name or click directly on the map.'
  } catch (e) {
    searchMsg.value = 'Search failed (check your internet connection). You can still click directly on the map.'
  } finally {
    searching.value = false
  }
}

function pickResult(r) {
  lat.value = Number(r.lat.toFixed(5))
  lng.value = Number(r.lng.toFixed(5))
  city.value = r.city || r.label.split(',')[0]
  region.value = r.region
  country.value = r.country
  geoState.value = 'ok'
  results.value = []
  query.value = ''
  emitDraft()
}

const errors = computed(() => ({
  nickname: !nickname.value.trim(),
  location: lat.value === null,
  city: lat.value !== null && !city.value.trim(),
}))

function submit() {
  submitted.value = true
  if (errors.value.nickname || errors.value.location || errors.value.city) return
  emit('save', {
    nickname: nickname.value.trim(),
    category: category.value,
    avatar: avatar.value,
    city: city.value.trim(),
    region: region.value.trim(),
    country: country.value.trim(),
    lat: lat.value,
    lng: lng.value,
  })
}

onBeforeUnmount(() => {
  controller?.abort()
  clearTimeout(timer)
})

defineExpose({ setCoords })
</script>

<template>
  <form class="card space-y-5 p-5" novalidate @submit.prevent="submit">
    <h2 class="text-xl font-semibold">{{ friend ? `Edit ${friend.nickname}` : 'New friend' }}</h2>

    <div>
      <span class="label">Avatar</span>
      <AvatarPicker v-model="avatar" />
    </div>

    <div>
      <label class="label" for="nick">Nickname</label>
      <input id="nick" v-model="nickname" class="field" maxlength="20" placeholder="e.g. Nana" autocomplete="off" />
      <p v-if="submitted && errors.nickname" class="mt-1 text-sm font-bold text-[#A22D63]">Please enter a nickname.</p>
    </div>

    <fieldset>
      <legend class="label">Relationship category</legend>
      <div class="flex flex-wrap gap-2">
        <label
          v-for="c in CATEGORIES"
          :key="c.id"
          class="cursor-pointer rounded-full border-2 px-3 py-1.5 text-sm font-bold transition has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-lilac-deep"
          :style="category === c.id ? { background: c.color, borderColor: c.text } : { background: c.soft, borderColor: 'transparent', color: c.text }"
        >
          <input v-model="category" type="radio" name="kategori" :value="c.id" class="sr-only" />
          {{ c.emoji }} {{ c.label }}
        </label>
      </div>
    </fieldset>

    <div>
      <label class="label" for="cari">Location</label>
      <div class="flex gap-2">
        <input
          id="cari"
          v-model="query"
          class="field"
          placeholder="Search a city, e.g. Osaka"
          autocomplete="off"
          @keydown.enter.prevent="doSearch"
        />
        <button type="button" class="btn btn-mint shrink-0 !px-4" :disabled="searching" @click="doSearch">
          {{ searching ? '...' : 'Search' }}
        </button>
      </div>
      <p class="mt-1.5 text-sm text-ink-soft">Or <b>click directly on the map</b> 📍 to drop a pin.</p>
      <p v-if="searchMsg" class="mt-1 text-sm font-bold text-[#9A4E15]">{{ searchMsg }}</p>

      <ul v-if="results.length" class="mt-2 space-y-1">
        <li v-for="(r, i) in results" :key="i">
          <button
            type="button"
            class="w-full rounded-2xl bg-lilac-soft px-3 py-2 text-left text-sm transition hover:bg-lilac"
            @click="pickResult(r)"
          >
            {{ r.label }}
          </button>
        </li>
      </ul>

      <div v-if="lat !== null" class="mt-3 space-y-2 rounded-3xl bg-minty-soft p-3">
        <p class="text-sm font-bold">📍 {{ lat }}, {{ lng }}</p>
        <p v-if="geoState === 'loading'" class="text-sm text-ink-soft">Looking up the city name...</p>
        <p v-else-if="geoState === 'error'" class="text-sm font-bold text-[#9A4E15]">
          Couldn't detect the city name automatically. Please fill it in below.
        </p>
        <div class="grid gap-2 sm:grid-cols-3">
          <div>
            <label class="label !mb-1 !text-xs" for="kota">City</label>
            <input id="kota" v-model="city" class="field !py-1.5 text-sm" placeholder="City" />
          </div>
          <div>
            <label class="label !mb-1 !text-xs" for="wilayah">Region</label>
            <input id="wilayah" v-model="region" class="field !py-1.5 text-sm" placeholder="Province / state" />
          </div>
          <div>
            <label class="label !mb-1 !text-xs" for="negara">Country</label>
            <input id="negara" v-model="country" class="field !py-1.5 text-sm" placeholder="Country" />
          </div>
        </div>
        <p v-if="submitted && errors.city" class="text-sm font-bold text-[#A22D63]">City name is required.</p>
      </div>
      <p v-if="submitted && errors.location" class="mt-2 text-sm font-bold text-[#A22D63]">
        Pick a location first: search a place or click on the map.
      </p>
    </div>

    <div class="flex gap-2">
      <button type="submit" class="btn btn-pink flex-1">{{ friend ? 'Save changes' : 'Add to map' }}</button>
      <button type="button" class="btn btn-ghost" @click="emit('cancel')">Cancel</button>
    </div>
  </form>
</template>
