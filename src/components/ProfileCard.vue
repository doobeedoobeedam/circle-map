<script setup>
import { ref, watch, computed } from 'vue'
import CategoryBadge from './CategoryBadge.vue'
import { avatarSrc } from '../constants/avatars'
import { getCategory } from '../constants/categories'

const props = defineProps({ friend: { type: Object, required: true } })
const emit = defineEmits(['close', 'edit', 'remove'])

const confirming = ref(false)
const cat = computed(() => getCategory(props.friend.category))
// ganti teman -> batalkan mode konfirmasi hapus
watch(() => props.friend.id, () => (confirming.value = false))
</script>

<template>
  <div class="card relative p-4" role="dialog" aria-label="Friend profile">
    <button
      class="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-lilac-soft font-bold hover:bg-lilac"
      aria-label="Close card"
      @click="emit('close')"
    >✕</button>

    <div class="flex items-center gap-4">
      <img
        :src="avatarSrc(friend)"
        alt=""
        class="h-20 w-20 shrink-0 rounded-full border-4 border-white object-cover"
        :style="{ boxShadow: `0 0 0 4px ${cat.color}` }"
      />
      <div class="min-w-0 pr-6">
        <h3 class="truncate text-2xl font-semibold leading-tight">{{ friend.nickname }}</h3>
        <CategoryBadge :id="friend.category" class="mt-1" />
        <p class="mt-1.5 text-sm text-ink-soft">
          📍 {{ friend.city }}<span v-if="friend.region && friend.region !== friend.city">, {{ friend.region }}</span
          ><span v-if="friend.country">, {{ friend.country }}</span>
        </p>
      </div>
    </div>

    <div class="mt-4 flex flex-wrap gap-2">
      <template v-if="!confirming">
        <button class="btn btn-lilac !py-1.5 text-sm" @click="emit('edit')">✏️ Edit</button>
        <button class="btn btn-ghost !py-1.5 text-sm" @click="confirming = true">🗑️ Delete</button>
      </template>
      <template v-else>
        <span class="self-center text-sm font-bold">Delete {{ friend.nickname }}?</span>
        <button class="btn btn-pink !py-1.5 text-sm" @click="emit('remove')">Yes, delete</button>
        <button class="btn btn-ghost !py-1.5 text-sm" @click="confirming = false">Cancel</button>
      </template>
    </div>
  </div>
</template>
