// nentuin "cakupan" persebaran teman -> satu pulau, antarpulau, atau seluruh dunia, hasilnya dipakai untuk mewarnai wilayah dan mengatur zoom peta (di layar maupun di PNG)
import { ISLANDS } from '../constants/geo'
import { findFeatureAt, nearestFeature } from './geo'

const isIndonesia = (f) => !!f && (f.id === 'IDN' || f.properties?.name === 'Indonesia')

// karena nama provinsi bisa beda-beda tergantung file GeoJSON, jadi dicek beberapa kemungkinan
function provinceName(f) {
  const p = f.properties || {}
  return String(p.Propinsi ?? p.PROVINSI ?? p.Provinsi ?? p.provinsi ?? p.NAME_1 ?? p.state ?? p.name ?? '').toUpperCase()
}

const islandFromName = (name) => ISLANDS.find((i) => i.keywords.some((k) => name.includes(k)))?.id || null

function islandFromCoords(lat, lng) {
  return (
    ISLANDS.find(({ bbox: [s, w, n, e] }) => lat >= s && lat <= n && lng >= w && lng <= e)?.id || null
  )
}

export function computeScope(friends, world, provinces) {
  const scope = { mode: 'empty', islandIds: [], worldHits: new Set(), provinceClass: new Map() }
  if (!friends.length) return scope

  const infos = friends.map((f) => {
    const countryFeature = world ? findFeatureAt(f.lat, f.lng, world) || nearestFeature(f.lat, f.lng, world) : null
    // kalau nama negara sudah terisi, pakai itu
    const inIndonesia = f.country ? /^indonesia$/i.test(f.country.trim()) : isIndonesia(countryFeature)
    let provFeature = null
    if (inIndonesia && provinces) {
      provFeature = findFeatureAt(f.lat, f.lng, provinces) || nearestFeature(f.lat, f.lng, provinces)
    }
    const island = (provFeature && islandFromName(provinceName(provFeature))) || (inIndonesia ? islandFromCoords(f.lat, f.lng) : null)
    return { countryFeature, inIndonesia, provFeature, island }
  })

  const islandIds = [...new Set(infos.filter((i) => i.inIndonesia).map((i) => i.island).filter(Boolean))]
  const allIndonesia = infos.every((i) => i.inIndonesia)

  scope.mode = 'world'
  if (allIndonesia && islandIds.length) scope.mode = islandIds.length === 1 ? 'island' : 'archipelago'
  scope.islandIds = scope.mode === 'world' ? [] : islandIds

  if (scope.mode === 'world') {
    infos.forEach((i) => i.countryFeature && scope.worldHits.add(i.countryFeature))
  } else if (!provinces) {
    // tidak ada data provinsi -> sorot seluruh Indonesia saja
    const idn = world?.features.find(isIndonesia)
    if (idn) scope.worldHits.add(idn)
  } else {
    const hit = new Set(infos.map((i) => i.provFeature).filter(Boolean))
    for (const pf of provinces.features) {
      if (hit.has(pf)) scope.provinceClass.set(pf, 'hit')
      else if (scope.islandIds.includes(islandFromName(provinceName(pf)))) scope.provinceClass.set(pf, 'soft')
    }
  }
  return scope
}
