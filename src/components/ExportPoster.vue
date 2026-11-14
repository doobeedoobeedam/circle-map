<script setup>
// cakupan geografis poster selalu ngikutin persebaran teman terbaru (bukan zoom layar)
import { ref, computed, nextTick } from 'vue'
import { toPng } from 'html-to-image'
import {
  createMap, addFallbackTiles, createRegionLayers, paintRegions, createMarkerState,
  syncMarkers, layoutMarkers, fitToFriends,
} from '../utils/mapRenderer'
import { computeScope } from '../utils/scope'
import { CATEGORIES } from '../constants/categories'

const props = defineProps({
  friends: { type: Array, required: true },
  stats: { type: Object, required: true },
  world: Object,
  provinces: Object,
  geoStatus: String,
})

const visible = ref(false)
const root = ref(null)
const mapEl = ref(null)

const legend = computed(() =>
  CATEGORIES.map((c) => ({ ...c, count: props.stats.byCategory[c.id] || 0 })).filter((c) => c.count > 0),
)
const subtitle = computed(() =>
  props.stats.cities > 1 ? `My friends are spread across ${props.stats.cities} cities` : 'My friend circle',
)

const wait = (ms) => new Promise((r) => setTimeout(r, ms))

async function generate() {
  visible.value = true
  await nextTick()
  await document.fonts.ready
  let map = null
  try {
    map = createMap(mapEl.value, { interactive: false })
    const layers = createRegionLayers(map, props.world, props.provinces)
    let tiles = null
    if (props.geoStatus === 'failed') tiles = addFallbackTiles(map)

    const scope = computeScope(props.friends, props.world, props.provinces)
    paintRegions(map, layers, scope)
    const state = createMarkerState(map)
    syncMarkers(state, props.friends)
    fitToFriends(map, props.friends, scope, { animate: false })
    layoutMarkers(state)

    // tunggu peta cadangan (kalau dipakai) selesai memuat gambar
    if (tiles) {
      await new Promise((res) => {
        const t = setTimeout(res, 5000)
        tiles.once('load', () => { clearTimeout(t); res() })
      })
    }
    await wait(400)

    const options = { pixelRatio: 1, width: 1080, height: 1920, cacheBust: false }
    await toPng(root.value, options) // make sure font & gambar sudah termuat
    return await toPng(root.value, options)
  } finally {
    map?.remove()
    visible.value = false
  }
}

defineExpose({ generate })
</script>

<template>
  <div v-if="visible" class="pointer-events-none fixed -left-[3000px] top-0" aria-hidden="true">
    <div
      ref="root"
      class="fm-static relative overflow-hidden font-body text-ink"
      style="width: 1080px; height: 1920px; background: linear-gradient(170deg, #FFE3EE 0%, #F0EBFF 48%, #E4F7F1 100%)"
    >
      <!-- hiasan bulat pastel -->
      <div class="absolute rounded-full" style="left: -140px; top: 90px; width: 380px; height: 380px; background: #FFC8DD; opacity: .5"></div>
      <div class="absolute rounded-full" style="right: -120px; top: 520px; width: 300px; height: 300px; background: #D9CCFF; opacity: .55"></div>
      <div class="absolute rounded-full" style="left: -100px; bottom: 240px; width: 320px; height: 320px; background: #BDEBDD; opacity: .55"></div>
      <div class="absolute rounded-full" style="right: -90px; bottom: -60px; width: 340px; height: 340px; background: #FFD9C0; opacity: .6"></div>

      <div class="absolute inset-0 flex flex-col items-center" style="padding: 140px 80px 0">
        <p class="rounded-full bg-white font-display font-semibold" style="padding: 10px 36px; font-size: 34px">🌸 friendship map 🌸</p>
        <h1 class="font-display font-bold leading-none" style="margin-top: 20px; font-size: 118px; text-shadow: 0 8px 0 #FFB8D1">Circle Map</h1>
        <p class="font-bold text-ink-soft" style="margin-top: 18px; font-size: 40px">{{ subtitle }}</p>

        <div
          class="w-full overflow-hidden bg-white"
          style="margin-top: 44px; height: 900px; border: 14px solid #fff; border-radius: 64px; box-shadow: 0 30px 60px -20px rgba(155, 132, 240, .5)"
        >
          <div ref="mapEl" style="width: 100%; height: 100%"></div>
        </div>

        <div class="flex w-full" style="margin-top: 38px; gap: 24px">
          <div class="flex-1 text-center" style="background: #FFC8DD; border: 8px solid #fff; border-radius: 44px; padding: 18px 0">
            <div class="font-display font-bold leading-none" style="font-size: 80px">{{ stats.total }}</div>
            <div class="font-bold" style="font-size: 30px; margin-top: 6px">Friends</div>
          </div>
          <div class="flex-1 text-center" style="background: #BDEBDD; border: 8px solid #fff; border-radius: 44px; padding: 18px 0">
            <div class="font-display font-bold leading-none" style="font-size: 80px">{{ stats.cities }}</div>
            <div class="font-bold" style="font-size: 30px; margin-top: 6px">Cities</div>
          </div>
          <div class="flex-1 text-center" style="background: #D9CCFF; border: 8px solid #fff; border-radius: 44px; padding: 18px 0">
            <div class="font-display font-bold leading-none" style="font-size: 80px">{{ stats.countries }}</div>
            <div class="font-bold" style="font-size: 30px; margin-top: 6px">Countries</div>
          </div>
        </div>

        <div class="flex flex-wrap justify-center" style="margin-top: 30px; gap: 12px">
          <span
            v-for="c in legend"
            :key="c.id"
            class="font-bold"
            :style="{ background: c.soft, color: c.text, boxShadow: `inset 0 0 0 3px ${c.color}`, padding: '8px 26px', borderRadius: '9999px', fontSize: '28px' }"
          >{{ c.emoji }} {{ c.label }} {{ c.count }}</span>
        </div>
      </div>

      <p class="absolute inset-x-0 text-center font-display font-semibold text-ink-soft" style="bottom: 90px; font-size: 34px">
        made with Circle Map
      </p>
    </div>
  </div>
</template>
