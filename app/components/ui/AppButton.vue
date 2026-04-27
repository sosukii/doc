<script setup lang="ts">
import { computed } from 'vue'
import { useCatalogNavigationWarmup } from '~/composables/useCatalogNavigationWarmup'

interface Props {
  variant?: 'primary' | 'glass' | 'text'
  to?: string
  type?: 'button' | 'submit' | 'reset'
  loading?: boolean
  disabled?: boolean
  ariaLabel?: string
}
const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  to: undefined,
  type: 'button',
  loading: false,
  disabled: false,
  ariaLabel: undefined
})
const { warmCatalogListing } = useCatalogNavigationWarmup()

const shouldWarmCatalogListing = computed(() => props.to === '/products' || props.to?.startsWith('/products?'))
const classes = computed(() => [
  'inline-flex items-center justify-center font-medium transition-all focus:outline-none focus:ring-2 focus:ring-secondary/50 disabled:opacity-50 disabled:cursor-not-allowed',
  {
    'btn-primary': props.variant === 'primary',
    'btn-glass': props.variant === 'glass',
    'btn-text': props.variant === 'text'
  }
])
</script>

<template>
  <NuxtLink
    v-if="to"
    :to="to"
    :class="classes"
    :aria-label="ariaLabel"
    prefetch-on="interaction"
    @pointerenter="shouldWarmCatalogListing ? warmCatalogListing() : undefined"
    @focus="shouldWarmCatalogListing ? warmCatalogListing() : undefined"
    @mousedown="shouldWarmCatalogListing ? warmCatalogListing() : undefined"
  >
    <span v-if="loading" class="mr-2 animate-spin"/>
    <slot />
  </NuxtLink>

  <button
    v-else
    :type="type"
    :disabled="disabled || loading"
    :class="classes"
    :aria-label="ariaLabel"
  >
      <span v-if="loading" class="mr-2 animate-spin">
      <svg class="h-4 w-4" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
      </svg>
    </span>
    <slot />
  </button>
</template>
