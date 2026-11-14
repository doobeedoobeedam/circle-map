<script setup>
// card statistik -> otomatis berubah karena `stats` dihitung dari data teman
defineProps({ stats: { type: Object, required: true } })

const items = [
  { key: 'total', label: 'Friends', emoji: '💖', cls: 'bg-blush' },
  { key: 'cities', label: 'Cities', emoji: '🏙️', cls: 'bg-minty' },
  { key: 'countries', label: 'Countries', emoji: '🌏', cls: 'bg-lilac' },
]
</script>

<template>
  <div class="grid grid-cols-3 gap-3" aria-live="polite">
    <div
      v-for="it in items"
      :key="it.key"
      class="rounded-3xl border-[3px] border-white p-3 text-center shadow-soft"
      :class="it.cls"
    >
      <div class="text-xl" aria-hidden="true">{{ it.emoji }}</div>
      <Transition name="pop" mode="out-in">
        <div :key="stats[it.key]" class="font-display text-4xl font-bold leading-none">{{ stats[it.key] }}</div>
      </Transition>
      <div class="mt-1 text-sm font-bold">{{ it.label }}</div>
    </div>
  </div>
</template>
