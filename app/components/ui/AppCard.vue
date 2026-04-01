<script setup lang="ts">
interface Props {
  variant?: 'low' | 'medium' | 'high'
  hoverEffect?: boolean
}

withDefaults(defineProps<Props>(), {
  variant: 'medium',
  hoverEffect: true
})
</script>

<template>
  <div
    :class="[
      'glass-panel p-6 sm:p-8',
      {
        'bg-surface-container-low/40': variant === 'low',
        'bg-surface-container-medium/40': variant === 'medium',
        'bg-surface-container-high/40': variant === 'high',
        'transition-transform hover:-translate-y-1': hoverEffect
      }
    ]"
  >
    <div v-if="$slots.header" class="mb-4">
      <slot name="header" />
    </div>
    
    <div class="content">
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
