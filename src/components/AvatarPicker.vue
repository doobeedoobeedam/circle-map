<script setup>
import { ref, computed } from 'vue'
import { PRESET_AVATARS } from '../constants/avatars'
import { resizePhoto } from '../utils/image'

const props = defineProps({ modelValue: Object })
const emit = defineEmits(['update:modelValue'])

const fileInput = ref(null)
const error = ref('')
const isPhoto = computed(() => props.modelValue?.type === 'photo')

async function onFile(e) {
  const file = e.target.files?.[0]
  e.target.value = '' // supaya file yang sama bisa dipilih lagi
  if (!file) return
  error.value = ''
  try {
    emit('update:modelValue', { type: 'photo', src: await resizePhoto(file) })
  } catch (err) {
    error.value = err.message
  }
}
</script>

<template>
  <div>
    <div class="grid grid-cols-5 gap-2 sm:grid-cols-5">
      <!-- tombol upload foto -->
      <button
        type="button"
        class="relative aspect-square overflow-hidden rounded-full border-[3px] border-dashed border-lilac-deep bg-lilac-soft text-xs font-bold transition hover:bg-lilac"
        :class="isPhoto ? '!border-solid !border-blush-deep ring-4 ring-blush' : ''"
        aria-label="Upload your own photo"
        @click="fileInput.click()"
      >
        <img v-if="isPhoto" :src="modelValue.src" alt="Your chosen photo" class="h-full w-full object-cover" />
        <span v-else class="flex h-full flex-col items-center justify-center leading-tight">📷<span>Photo</span></span>
      </button>

      <!-- avatar bawaan -->
      <button
        v-for="a in PRESET_AVATARS"
        :key="a.id"
        type="button"
        class="aspect-square overflow-hidden rounded-full border-[3px] border-white shadow transition hover:scale-105"
        :class="!isPhoto && modelValue?.id === a.id ? 'ring-4 ring-blush-deep' : ''"
        :aria-label="`${a.name} avatar`"
        :aria-pressed="!isPhoto && modelValue?.id === a.id"
        @click="emit('update:modelValue', { type: 'preset', id: a.id })"
      >
        <img :src="a.src" alt="" class="h-full w-full" />
      </button>
    </div>
    <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onFile" />
    <p v-if="error" class="mt-2 text-sm font-bold text-[#A22D63]">{{ error }}</p>
  </div>
</template>
