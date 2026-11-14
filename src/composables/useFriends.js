// data teman disimpan di localStorage browser
import { ref, computed, watch } from 'vue'
import { sampleFriends } from '../constants/sampleFriends'

const STORAGE_KEY = 'circle-map:v1'
const clone = (x) => JSON.parse(JSON.stringify(x))

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    // belum pernah dibuka = tampilkan data contoh. kalau sudah pernah (walau kosong), pakai isinya
    if (raw === null) return clone(sampleFriends)
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : clone(sampleFriends)
  } catch (e) {
    return clone(sampleFriends)
  }
}

const friends = ref(load())
const storageError = ref('')

watch(
  friends,
  (value) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
      storageError.value = ''
    } catch (e) {
      storageError.value = 'Browser storage is full or disabled. Your latest changes may not be saved.'
    }
  },
  { deep: true },
)

const norm = (s) => String(s || '').trim().toLowerCase()

const stats = computed(() => {
  const cities = new Set()
  const countries = new Set()
  const byCategory = {}
  for (const f of friends.value) {
    if (norm(f.city)) cities.add(`${norm(f.city)}|${norm(f.country)}`)
    if (norm(f.country)) countries.add(norm(f.country))
    byCategory[f.category] = (byCategory[f.category] || 0) + 1
  }
  return { total: friends.value.length, cities: cities.size, countries: countries.size, byCategory }
})

const newId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`

export function useFriends() {
  function addFriend(data) {
    const friend = { id: newId(), ...data }
    friends.value.push(friend)
    return friend
  }
  function updateFriend(id, data) {
    const i = friends.value.findIndex((f) => f.id === id)
    if (i !== -1) friends.value[i] = { ...friends.value[i], ...data }
  }
  function removeFriend(id) {
    friends.value = friends.value.filter((f) => f.id !== id)
  }
  const clearAll = () => (friends.value = [])
  const loadSamples = () => (friends.value = clone(sampleFriends))

  return { friends, stats, storageError, addFriend, updateFriend, removeFriend, clearAll, loadSamples }
}
