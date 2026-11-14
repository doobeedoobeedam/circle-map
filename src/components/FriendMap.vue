<script setup>
// komponen ini menghubungkan utils/mapRenderer.js dengan data Vue
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import {
  createMap, addFallbackTiles, createRegionLayers, removeRegionLayers, paintRegions,
  createMarkerState, syncMarkers, layoutMarkers, applySelection, fitToFriends,
  focusLatLng, setDraftPin, revealDraft,
} from '../utils/mapRenderer'
import { computeScope } from '../utils/scope'

const props = defineProps({
  friends: { type: Array, required: true },
  selectedId: { type: String, default: null },
  world: Object,
  provinces: Object,
  geoStatus: String,
  picking: Boolean, // true saat form terbuka -> klik peta = pilih lokasi
  draft: Object, // {lat, lng} pin sementara dari form
})
const emit = defineEmits(['select', 'pick', 'blank', 'add'])

const el = ref(null)
let map = null
let layers = {}
let state = null
let tiles = null
let observer = null

// gambar ulang wilayah, marker, dan (opsional) atur ulang zoom ngikutin persebaran teman
function refresh({ refit = false, animate = false } = {}) {
  if (!map) return
  const scope = computeScope(props.friends, props.world, props.provinces)
  paintRegions(map, layers, scope)
  syncMarkers(state, props.friends, { onClick: (id) => emit('select', id) })
  if (refit) fitToFriends(map, props.friends, scope, { animate })
  layoutMarkers(state)
  applySelection(state, props.selectedId)
}

function rebuildRegions() {
  removeRegionLayers(map, layers)
  layers = createRegionLayers(map, props.world, props.provinces)
  if (props.geoStatus === 'failed' && !tiles) tiles = addFallbackTiles(map)
  refresh({ refit: true })
}

function refit() {
  const scope = computeScope(props.friends, props.world, props.provinces)
  fitToFriends(map, props.friends, scope, { animate: true })
}

onMounted(() => {
  map = createMap(el.value)
  state = createMarkerState(map)
  layers = createRegionLayers(map, props.world, props.provinces)

  map.on('zoomend resize', () => layoutMarkers(state))
  map.on('click', (e) => {
    const ll = e.latlng.wrap()
    if (props.picking) emit('pick', { lat: ll.lat, lng: ll.lng })
    else emit('blank')
  })

  observer = new ResizeObserver(() => map.invalidateSize({ animate: false }))
  observer.observe(el.value)

  requestAnimationFrame(() => refresh({ refit: true }))
})

onBeforeUnmount(() => {
  observer?.disconnect()
  map?.remove()
})

// data wilayah selesai dimuat
watch(() => [props.world, props.provinces, props.geoStatus], rebuildRegions)
// data teman berubah (tambah / edit / hapus) -> marker & statistik langsung ikut, zoom menyesuaikan
watch(() => props.friends, () => refresh({ refit: true, animate: true }), { deep: true })
watch(() => props.selectedId, (id) => {
  if (!state) return
  applySelection(state, id)
  const f = props.friends.find((x) => x.id === id)
  if (f) focusLatLng(map, f.lat, f.lng)
})
watch(() => props.draft, (d) => {
  if (!state) return
  setDraftPin(state, d)
  if (d) revealDraft(map, d)
}, { deep: true })

defineExpose({ refit })
</script>

<template>
  <div class="relative isolate h-full w-full overflow-hidden rounded-4xl border-[6px] border-white shadow-soft" :class="{ 'is-picking': picking }">
    <div ref="el" class="absolute inset-0" role="application" aria-label="Map of your friends' locations"></div>

    <button
      class="btn btn-ghost absolute left-3 top-3 z-[1000] !px-3 !py-1.5 text-sm"
      aria-label="Fit the map to all friends"
      @click="refit"
    >✨ Fit map</button>

    <div v-if="geoStatus === 'loading'" class="absolute bottom-3 left-3 z-[1000] rounded-full bg-white/90 px-3 py-1 text-xs font-bold">
      Loading map...
    </div>
    <div v-else-if="geoStatus === 'failed'" class="absolute bottom-3 left-3 z-[1000] max-w-[70%] rounded-2xl bg-peachy-soft px-3 py-1.5 text-xs font-bold">
      Region borders failed to load, using a fallback map. © OpenStreetMap, © CARTO
    </div>

    <div
      v-if="picking"
      class="pointer-events-none absolute left-1/2 top-3 z-[1000] -translate-x-1/2 whitespace-nowrap rounded-full bg-blush px-4 py-1.5 text-sm font-bold shadow-pop max-sm:top-14"
    >
      Tap the map to drop a pin 📍
    </div>

    <div v-if="!friends.length && !picking" class="absolute inset-0 z-[1000] grid place-items-center p-6">
      <div class="card max-w-xs p-5 text-center">
        <p class="font-display text-xl font-semibold">Your map is empty</p>
        <p class="mt-1 text-sm text-ink-soft">Add your first friend and watch them appear on the map.</p>
        <button class="btn btn-pink mt-3" @click="emit('add')">+ New friend</button>
      </div>
    </div>

    <!-- card profil -->
    <div class="pointer-events-none absolute inset-x-3 bottom-3 z-[1000] mx-auto max-w-sm">
      <div class="pointer-events-auto"><slot /></div>
    </div>
  </div>
</template>
