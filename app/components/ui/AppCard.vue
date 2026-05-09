<script setup lang="ts">
interface Props {
  variant?: 'low' | 'medium' | 'high'
  hoverEffect?: boolean
}
withDefaults(defineProps<Props>(), {
  variant: 'medium',
  hoverEffect: true
})

const classes = {
  container: [
    'glass-panel',
    'p-6',
    'sm:p-8',
  ],
  variants: {
    low: 'bg-surface-container-low/40',
    medium: 'bg-surface-container-medium/40',
    high: 'bg-surface-container-high/40',
  },
  hoverEffect: 'transition-transform hover:-translate-y-1',
}
</script>

<template>
  <div
    :class="[
      classes.container,
      classes.variants[variant],
      hoverEffect && classes.hoverEffect
    ]"
  >
    <div v-if="$slots.header" class="mb-4">
      <slot name="header" />
    </div>
    
    <div class="content flex flex-col h-full">
      <slot />
    </div>
    <div v-if="$slots.footer" class="mt-6">
      <slot name="footer" />
    </div>
  </div>
</template>

<style scoped>
.glass-panel {
  backdrop-filter: blur(32px);
}
</style>