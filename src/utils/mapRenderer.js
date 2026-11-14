// semua urusan menggambar peta Leaflet
// dipakai bersama oleh peta di layar (FriendMap.vue) dan peta di poster PNG (ExportPoster.vue) biar konsisten
import L from 'leaflet'
import { avatarSrc } from '../constants/avatars'
import { getCategory } from '../constants/categories'
import { DEFAULT_VIEW, ISLANDS, MAP_STYLE, REGION_STYLE, TILE_FALLBACK, ZOOM } from '../constants/geo'

const clamp = (v, a, b) => Math.min(Math.max(v, a), b)
const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

// peta dasar

export function createMap(el, { interactive = true } = {}) {
  const map = L.map(el, {
    zoomControl: false,
    attributionControl: false,
    minZoom: ZOOM.min,
    maxZoom: 10,
    zoomSnap: 0.25,
    zoomDelta: 0.5,
    worldCopyJump: true,
    dragging: interactive,
    scrollWheelZoom: interactive,
    doubleClickZoom: interactive,
    boxZoom: interactive,
    keyboard: interactive,
    touchZoom: interactive,
    zoomAnimation: interactive,
    fadeAnimation: interactive,
    markerZoomAnimation: interactive,
  })
  map.getContainer().style.background = MAP_STYLE.ocean
  map.setView(DEFAULT_VIEW.center, DEFAULT_VIEW.zoom, { animate: false })
  if (interactive) L.control.zoom({ position: 'topright' }).addTo(map)
  return map
}

export function addFallbackTiles(map) {
  return L.tileLayer(TILE_FALLBACK.url, TILE_FALLBACK.options).addTo(map)
}

// wilayah berwarna

export function createRegionLayers(map, world, provinces) {
  const opts = { style: () => REGION_STYLE.neutral, interactive: false }
  return {
    worldLayer: world ? L.geoJSON(world, opts).addTo(map) : null,
    provLayer: provinces ? L.geoJSON(provinces, opts) : null,
  }
}

export function removeRegionLayers(map, layers) {
  if (layers?.worldLayer) map.removeLayer(layers.worldLayer)
  if (layers?.provLayer && map.hasLayer(layers.provLayer)) map.removeLayer(layers.provLayer)
}

export function paintRegions(map, layers, scope) {
  layers.worldLayer?.eachLayer((l) =>
    l.setStyle(scope.worldHits.has(l.feature) ? REGION_STYLE.hit : REGION_STYLE.neutral),
  )
  if (!layers.provLayer) return
  const indo = scope.mode === 'island' || scope.mode === 'archipelago'
  if (indo && !map.hasLayer(layers.provLayer)) layers.provLayer.addTo(map)
  if (!indo && map.hasLayer(layers.provLayer)) map.removeLayer(layers.provLayer)
  layers.provLayer.eachLayer((l) => l.setStyle(REGION_STYLE[scope.provinceClass.get(l.feature) || 'neutral']))
  // pastikan wilayah selalu di bawah titik & garis penanda
  layers.provLayer.bringToBack()
  layers.worldLayer?.bringToBack()
}

// soom otomatis (bounding box + padding + batas zoom)

export function fitToFriends(map, friends, scope, { animate = false } = {}) {
  map.invalidateSize({ animate: false })
  if (!friends.length) {
    map.setView(DEFAULT_VIEW.center, DEFAULT_VIEW.zoom, { animate })
    return
  }
  const bounds = L.latLngBounds(friends.map((f) => [f.lat, f.lng]))
  // satu pulau / antarpulau -> pulau yang berisi teman ikut dimasukkan supaya terlihat utuh
  for (const id of scope.islandIds) {
    const isl = ISLANDS.find((i) => i.id === id)
    if (isl) bounds.extend([[isl.bbox[0], isl.bbox[1]], [isl.bbox[2], isl.bbox[3]]])
  }
  const size = map.getSize()
  const pad = clamp(Math.min(size.x, size.y) * 0.16, 56, 130) // padding proporsional
  const maxZoom = ZOOM.max[scope.mode] ?? ZOOM.max.world
  let zoom = map.getBoundsZoom(bounds, false, L.point(pad * 2, pad * 2))
  if (!Number.isFinite(zoom)) zoom = maxZoom // satu titik aja
  zoom = clamp(zoom, ZOOM.min, maxZoom)
  map.setView(bounds.getCenter(), zoom, { animate })
}

export function focusLatLng(map, lat, lng) {
  if (!map.getBounds().pad(-0.12).contains([lat, lng])) map.panTo([lat, lng])
}

// marker avatar

function buildIcon(friend, { isNew = false } = {}) {
  const cat = getCategory(friend.category)
  const html =
    `<div class="fm-marker${isNew ? ' is-new' : ''}" style="--ring:${cat.color}">` +
    `<div class="fm-marker__inner">` +
    `<img src="${avatarSrc(friend)}" alt="" draggable="false"/>` +
    `<span class="fm-marker__name">${esc(friend.nickname)}</span>` +
    `</div></div>`
  return L.divIcon({ html, className: 'fm-marker-wrap', iconSize: [0, 0] })
}

export function createMarkerState(map) {
  return {
    map,
    group: L.layerGroup().addTo(map), // marker + titik lokasi asli
    lines: L.layerGroup().addTo(map), // garis putus-putus penanda geser
    items: new Map(),
    selectedId: null,
    draft: null,
    ready: false, // marker yang ditambah setelah ini diberi animasi "pop"
  }
}

export function syncMarkers(state, friends, { onClick } = {}) {
  const ids = new Set(friends.map((f) => f.id))
  for (const [id, it] of state.items) {
    if (!ids.has(id)) {
      state.group.removeLayer(it.marker)
      state.group.removeLayer(it.dot)
      state.items.delete(id)
    }
  }
  for (const f of friends) {
    const sig = JSON.stringify(f)
    const it = state.items.get(f.id)
    const cat = getCategory(f.category)
    if (!it) {
      const dot = L.circleMarker([f.lat, f.lng], {
        radius: 4, color: '#fff', weight: 2, fillColor: cat.color, fillOpacity: 1, interactive: false,
      })
      const marker = L.marker([f.lat, f.lng], {
        icon: buildIcon(f, { isNew: state.ready }),
        title: f.nickname,
        riseOnHover: true,
      })
      marker.on('click', () => onClick?.(f.id))
      state.group.addLayer(dot)
      state.group.addLayer(marker)
      state.items.set(f.id, { marker, dot, friend: f, sig })
    } else if (it.sig !== sig) {
      it.friend = f
      it.sig = sig
      it.marker.setLatLng([f.lat, f.lng])
      it.marker.setIcon(buildIcon(f))
      it.dot.setLatLng([f.lat, f.lng])
      it.dot.setStyle({ fillColor: cat.color })
    }
  }
  state.ready = true
}

export function applySelection(state, id = state.selectedId) {
  state.selectedId = id
  for (const it of state.items.values()) {
    const selected = it.friend.id === id
    it.marker.getElement()?.querySelector('.fm-marker')?.classList.toggle('is-selected', selected)
    it.marker.setZIndexOffset(selected ? 1000 : 0)
  }
}

// kalau beberapa teman terlalu berdekatan di layar, geser marker-nya melingkar supaya tidak menumpuk
const SEPARATION = 58
const CANDIDATES = (() => {
  const out = [[0, 0]]
  for (let ring = 1; ring <= 4; ring++) {
    const n = ring * 6
    for (let k = 0; k < n; k++) {
      const a = -Math.PI / 2 + (2 * Math.PI * k) / n
      out.push([Math.round(Math.cos(a) * SEPARATION * ring), Math.round(Math.sin(a) * SEPARATION * ring)])
    }
  }
  return out
})()

export function layoutMarkers(state) {
  const { map } = state
  state.lines.clearLayers()
  const placed = []
  for (const it of state.items.values()) {
    const base = map.latLngToContainerPoint([it.friend.lat, it.friend.lng])
    let off = [0, 0]
    for (const c of CANDIDATES) {
      const x = base.x + c[0]
      const y = base.y + c[1]
      if (placed.every((q) => Math.hypot(q.x - x, q.y - y) >= SEPARATION)) {
        off = c
        break
      }
    }
    placed.push({ x: base.x + off[0], y: base.y + off[1] })
    const inner = it.marker.getElement()?.querySelector('.fm-marker__inner')
    if (inner) {
      inner.style.setProperty('--dx', off[0] + 'px')
      inner.style.setProperty('--dy', off[1] + 'px')
    }
    if (off[0] || off[1]) {
      const to = map.containerPointToLatLng(L.point(base.x + off[0], base.y + off[1]))
      L.polyline([[it.friend.lat, it.friend.lng], to], {
        color: '#8F7BC4', weight: 2, opacity: 0.7, dashArray: '1 5', lineCap: 'round', interactive: false,
      }).addTo(state.lines)
    }
  }
  applySelection(state)
}

// pin sementara saat memilih lokasi di form

export function setDraftPin(state, draft) {
  if (!draft) {
    if (state.draft) state.map.removeLayer(state.draft)
    state.draft = null
    return
  }
  const ll = [draft.lat, draft.lng]
  if (!state.draft) {
    state.draft = L.marker(ll, {
      icon: L.divIcon({ className: 'fm-draft-wrap', html: '<div class="fm-draft"></div>', iconSize: [0, 0] }),
      interactive: false,
      zIndexOffset: 2000,
    }).addTo(state.map)
  } else {
    state.draft.setLatLng(ll)
  }
}

export function revealDraft(map, draft) {
  const ll = [draft.lat, draft.lng]
  if (map.getBounds().pad(-0.1).contains(ll)) return
  map.flyTo(ll, Math.max(map.getZoom(), 5))
}
