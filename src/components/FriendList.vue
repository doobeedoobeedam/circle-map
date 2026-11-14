<script setup>
import CategoryBadge from './CategoryBadge.vue'
import { avatarSrc } from '../constants/avatars'

defineProps({ friends: Array, selectedId: String })
defineEmits(['select', 'add', 'clear', 'samples'])
</script>

<template>
  <div class="card p-5">
    <div class="mb-3 flex items-center justify-between gap-2">
      <h2 class="text-xl font-semibold">My Circle</h2>
      <button class="btn btn-pink !px-4 !py-1.5 text-sm" @click="$emit('add')">+ New friend</button>
    </div>

    <p v-if="!friends.length" class="rounded-3xl bg-lilac-soft p-4 text-sm text-ink-soft">
      No friends on the map yet. Press <b>+ New friend</b> to add your first one 🌸
    </p>

    <ul v-else class="max-h-[46vh] space-y-2 overflow-y-auto pr-1 lg:max-h-[42vh]">
      <li v-for="f in friends" :key="f.id">
        <button
          class="flex w-full items-center gap-3 rounded-3xl border-2 p-2.5 text-left transition"
          :class="f.id === selectedId ? 'border-blush-deep bg-blush-soft' : 'border-transparent bg-white/70 hover:bg-lilac-soft'"
          @click="$emit('select', f.id)"
        >
          <img :src="avatarSrc(f)" alt="" class="h-12 w-12 shrink-0 rounded-full border-2 border-white object-cover shadow" />
          <span class="min-w-0 flex-1">
            <span class="block truncate font-bold">{{ f.nickname }}</span>
            <span class="block truncate text-sm text-ink-soft">{{ f.city }}<template v-if="f.country">, {{ f.country }}</template></span>
          </span>
          <CategoryBadge :id="f.category" small class="hidden sm:inline-flex" />
        </button>
      </li>
    </ul>

    <div class="mt-4 flex flex-wrap gap-2 border-t-2 border-dashed border-lilac pt-3">
      <button class="btn btn-ghost !px-3 !py-1 text-xs" @click="$emit('samples')">Restore samples</button>
      <button class="btn btn-ghost !px-3 !py-1 text-xs" :disabled="!friends.length" @click="$emit('clear')">Clear all</button>
    </div>
  </div>
</template>
