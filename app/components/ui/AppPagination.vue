<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  page: number
  totalPages: number
  siblingCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  siblingCount: 1
})

const emit = defineEmits<{
  change: [page: number]
}>()

const pages = computed<(number | string)[]>(() => {
  const total = props.totalPages
  const current = props.page
  const sibling = props.siblingCount

  if (total <= 1) {
    return [1]
  }

  const range: (number | string)[] = []
  const start = Math.max(2, current - sibling)
  const end = Math.min(total - 1, current + sibling)

  range.push(1)

  if (start > 2) {
    range.push('...')
  }

  for (let i = start; i <= end; i++) {
    range.push(i)
  }

  if (end < total - 1) {
    range.push('...')
  }

  if (total > 1) {
    range.push(total)
  }

  return range
})

const goToPage = (page: number) => {
  if (page < 1 || page > props.totalPages || page === props.page) {
    return
  }

  emit('change', page)
}
</script>

<template>
  <nav class="flex items-center justify-center gap-2" aria-label="Пагинация">
    <button
      type="button"
      class="px-4 py-2 rounded-lg bg-white/10 text-white/80 transition disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/15"
      :disabled="page === 1"
      @click="goToPage(page - 1)"
    >
      Назад
    </button>

    <button
      v-for="item in pages"
      :key="`page-${item}`"
      type="button"
      class="min-w-10 h-10 px-3 rounded-lg transition"
      :class="item === page
        ? 'bg-primary text-white'
        : item === '...'
          ? 'bg-transparent text-white/40 cursor-default'
          : 'bg-white/10 text-white/80 hover:bg-white/15'"
      :disabled="item === '...'"
      @click="typeof item === 'number' && goToPage(item)"
    >
      {{ item }}
    </button>

    <button
      type="button"
      class="px-4 py-2 rounded-lg bg-white/10 text-white/80 transition disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/15"
      :disabled="page === totalPages"
      @click="goToPage(page + 1)"
    >
      Вперед
    </button>
  </nav>
</template>