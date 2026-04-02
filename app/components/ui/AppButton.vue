<script setup lang="ts">
import { NuxtLink } from '#components'

interface Props {
  variant?: 'primary' | 'glass' | 'text'
  to?: string
  type?: 'button' | 'submit' | 'reset'
  loading?: boolean
  disabled?: boolean
  ariaLabel?: string
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  type: 'button',
  loading: false,
  disabled: false
})
</script>

<template>
  <component
    :is="to ? NuxtLink : 'button'"
    :to="to"
    :type="!to ? type : undefined"
    :disabled="disabled || loading"
    :class="[
      'inline-flex items-center justify-center font-medium transition-all focus:outline-none focus:ring-2 focus:ring-secondary/50 disabled:opacity-50 disabled:cursor-not-allowed',
      {
        'btn-primary': variant === 'primary',
        'btn-glass': variant === 'glass',
        'btn-text': variant === 'text'
      }
    ]"
    :aria-label="ariaLabel"
  >
    <span v-if="loading" class="mr-2 animate-spin">
      <svg class="h-4 w-4" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </span>
    <slot />
  </component>
</template>
