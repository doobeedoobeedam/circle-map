// fungsi bantu geografi

// cek apakah titik ada di dalam satu cincin poligon (algoritma ray casting)
function pointInRing(lng, lat, ring) {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]
    const [xj, yj] = ring[j]
    if (yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

function* polygonsOf(feature) {
  const g = feature.geometry
  if (!g) return
  if (g.type === 'Polygon') yield g.coordinates
  else if (g.type === 'MultiPolygon') for (const p of g.coordinates) yield p
}

export function pointInFeature(lat, lng, feature) {
  for (const poly of polygonsOf(feature)) {
    // cincin pertama = luar, sisanya = lubang
    if (pointInRing(lng, lat, poly[0]) && !poly.slice(1).some((hole) => pointInRing(lng, lat, hole))) return true
  }
  return false
}

// cari wilayah (feature) yang memuat titik
export function findFeatureAt(lat, lng, collection) {
  if (!collection) return null
  return collection.features.find((f) => pointInFeature(lat, lng, f)) || null
}

// cadangan -> kalau titik jatuh sedikit di luar garis pantai (peta kasar), ambil wilayah terdekat
export function nearestFeature(lat, lng, collection, maxDeg = 0.8) {
  if (!collection) return null
  let best = null
  let bestDist = maxDeg
  for (const f of collection.features) {
    for (const poly of polygonsOf(f)) {
      for (const [x, y] of poly[0]) {
        const d = Math.hypot(x - lng, y - lat)
        if (d < bestDist) {
          bestDist = d
          best = f
        }
      }
    }
  }
  return best
}
