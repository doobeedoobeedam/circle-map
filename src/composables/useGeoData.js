// load data GeoJSON (batas negara & provinsi) sekali aja, lalu dibagikan ke semua komponen
import { ref, shallowRef, markRaw } from 'vue'
import { GEO_SOURCES } from '../constants/geo'

const world = shallowRef(null)
const provinces = shallowRef(null)
const status = ref('loading') // loading | ready | partial | failed
let started = false

// coba tiap alamat sampai ada yang berisi FeatureCollection yang valid
async function loadFirst(urls) {
  for (const url of urls) {
    try {
      const res = await fetch(url)
      if (!res.ok) continue
      const json = await res.json()
      if (json?.type === 'FeatureCollection' && json.features?.length) return markRaw(json)
    } catch (e) {
      // lanjut ke alamat berikutnya
    }
  }
  return null
}

export function useGeoData() {
  if (!started) {
    started = true
    Promise.all([loadFirst(GEO_SOURCES.world), loadFirst(GEO_SOURCES.provinces)]).then(([w, p]) => {
      world.value = w
      provinces.value = p
      status.value = w && p ? 'ready' : w ? 'partial' : 'failed'
    })
  }
  return { world, provinces, status }
}
