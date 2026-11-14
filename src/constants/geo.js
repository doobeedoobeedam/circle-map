const BASE = import.meta.env.BASE_URL

// sumber data batas wilayah
// file lokal di public/geo/ dicoba paling dulu (biar bisa offline)
export const GEO_SOURCES = {
  world: [
    `${BASE}geo/world.geojson`,
    'https://cdn.jsdelivr.net/gh/johan/world.geo.json@master/countries.geo.json',
    'https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json',
  ],
  provinces: [
    `${BASE}geo/indonesia-provinces.geojson`,
    'https://raw.githubusercontent.com/ans-4175/peta-indonesia-geojson/master/indonesia-prov.geojson',
    'https://raw.githubusercontent.com/superpikar/indonesia-geojson/master/indonesia-province-simple.json',
  ],
}

// warna peta kartun
export const MAP_STYLE = { ocean: '#D9F0F4' }
export const REGION_STYLE = {
  neutral: { fillColor: '#FBF4EC', fillOpacity: 1, color: '#EBDDE6', weight: 0.8 },
  soft: { fillColor: '#FFE3EE', fillOpacity: 1, color: '#F6C9DA', weight: 0.8 },
  hit: { fillColor: '#FFB8D1', fillOpacity: 1, color: '#FFFFFF', weight: 1.2 },
}

export const DEFAULT_VIEW = { center: [-2.5, 118], zoom: 4 }

// batas zoom -> min supaya dunia tetap muat, max supaya lokasi tunggal tidak terlalu dekat
export const ZOOM = { min: 1, max: { island: 8, archipelago: 7, world: 6 } }

// peta cadangan (dipakai cuma kalau GeoJSON gagal dimuat)
export const TILE_FALLBACK = {
  url: 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png',
  options: { subdomains: 'abcd', maxZoom: 10, crossOrigin: true },
}

// pulau-pulau besar Indonesia. bbox = [selatan, barat, utara, timur] (perkiraan kasar)
// keywords dicocokkan dengan nama provinsi (huruf besar) untuk menentukan pulaunya
export const ISLANDS = [
  { id: 'bali', label: 'Bali', keywords: ['BALI'], bbox: [-8.9, 114.4, -8.0, 115.8] },
  { id: 'jawa', label: 'Jawa', keywords: ['JAKARTA', 'BANTEN', 'JAWA', 'YOGYAKARTA', 'JOGJA'], bbox: [-8.9, 105.0, -5.8, 114.7] },
  { id: 'nusatenggara', label: 'Nusa Tenggara', keywords: ['NUSA TENGGARA'], bbox: [-11.2, 115.8, -8.0, 125.2] },
  { id: 'sulawesi', label: 'Sulawesi', keywords: ['SULAWESI', 'GORONTALO'], bbox: [-6.0, 118.8, 2.2, 125.5] },
  { id: 'maluku', label: 'Maluku', keywords: ['MALUKU'], bbox: [-8.6, 125.2, 2.8, 135.0] },
  { id: 'kalimantan', label: 'Kalimantan', keywords: ['KALIMANTAN'], bbox: [-4.3, 108.5, 4.5, 119.2] },
  { id: 'papua', label: 'Papua', keywords: ['PAPUA'], bbox: [-9.2, 130.6, 0.9, 141.2] },
  { id: 'sumatera', label: 'Sumatera', keywords: ['ACEH', 'SUMATERA', 'SUMATRA', 'RIAU', 'JAMBI', 'BENGKULU', 'LAMPUNG', 'BANGKA', 'BELITUNG'], bbox: [-6.2, 95.0, 6.2, 106.0] },
]
