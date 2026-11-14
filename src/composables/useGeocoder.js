// karena nominatim membatasi sekitar 1 request per detik, jadi form pakai jeda (debounce)
const BASE = 'https://nominatim.openstreetmap.org'

function parseAddress(item) {
  const a = item.address || {}
  const rawCity =
    a.city || a.town || a.municipality || a.county || a.village || a.suburb || a.state_district || a.state || item.name || ''
  return {
    // buang awalan "Kota " / "Kabupaten " supaya nama kota lebih singkat
    city: String(rawCity).replace(/^(Kota|Kabupaten|Kab\.)\s+/i, '').trim(),
    region: a.state || a.region || '',
    country: a.country || '',
  }
}

export async function reverseGeocode(lat, lng, signal) {
  const url = `${BASE}/reverse?format=jsonv2&addressdetails=1&zoom=10&accept-language=en&lat=${lat}&lon=${lng}`
  const res = await fetch(url, { signal })
  if (!res.ok) throw new Error('Reverse geocoding gagal')
  const data = await res.json()
  if (data.error) throw new Error(data.error)
  return parseAddress(data)
}

export async function searchPlace(query, signal) {
  const url = `${BASE}/search?format=jsonv2&addressdetails=1&limit=5&accept-language=en&q=${encodeURIComponent(query)}`
  const res = await fetch(url, { signal })
  if (!res.ok) throw new Error('Pencarian gagal')
  const data = await res.json()
  return data.map((item) => ({
    label: item.display_name,
    lat: parseFloat(item.lat),
    lng: parseFloat(item.lon),
    ...parseAddress(item),
  }))
}
