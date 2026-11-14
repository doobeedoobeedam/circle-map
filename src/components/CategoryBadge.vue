<script setup>
import { computed } from 'vue'
import { getCategory } from '../constants/categories'

const props = defineProps({ id: String, small: Boolean })
const cat = computed(() => getCategory(props.id))
</script>

<template>
  <span
    class="inline-flex shrink-0 items-center gap-1 rounded-full font-bold"
    :class="small ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'"
    :style="{ background: cat.soft, color: cat.text, boxShadow: `inset 0 0 0 2px ${cat.color}` }"
  >
    <span aria-hidden="true">{{ cat.emoji }}</span>{{ cat.label }}
  </span>
</template>
