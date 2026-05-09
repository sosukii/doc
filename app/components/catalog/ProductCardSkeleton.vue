<script setup lang="ts">
const classes = {
  container: [
    'glass-panel',
    'flex',
    'h-full',
    'flex-col',
    'rounded-2xl',
    'border',
    'border-white/5',
    'bg-surface-container-medium/40',
    'p-6',
    'sm:p-8',
  ],
  imageContainer: [
    'relative',
    'mb-6',
    'aspect-square',
    'overflow-hidden',
    'rounded-xl',
    'border',
    'border-white/6',
    'bg-white/[0.04]',
    'p-4',
  ],
  shimmer: [
    'absolute',
    'inset-0',
    'rounded-xl',
    'bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.14),_transparent_58%),linear-gradient(135deg,rgba(255,255,255,0.09),rgba(255,255,255,0.03))]',
    'animate-pulse',
  ],
  priceTag: [
    'absolute',
    'right-4',
    'top-4',
    'h-7',
    'w-20',
    'rounded-full',
    'border',
    'border-white/8',
    'bg-white/10',
    'animate-pulse',
  ],
  content: 'flex flex-grow flex-col gap-3',
  tags: 'flex gap-2',
  tag: 'h-3 w-20 rounded-full bg-white/10 animate-pulse',
  smallTag: 'h-3 w-16 rounded-full bg-white/8 animate-pulse',
  title: 'h-6 w-4/5 rounded-full bg-white/12 animate-pulse',
  description: 'space-y-2',
  descriptionLine: 'h-4 w-full rounded-full bg-white/8 animate-pulse',
  descriptionLine2: 'h-4 w-3/4 rounded-full bg-white/7 animate-pulse',
  footer: 'mt-6',
  button: [
    'h-11',
    'w-full',
    'rounded-2xl',
    'border',
    'border-white/8',
    'bg-white/10',
    'animate-pulse',
  ],
}
</script>

<template>
  <div
    :class="classes.container"
    aria-hidden="true"
  >
    <div :class="classes.imageContainer">
      <div :class="classes.shimmer" />
      <div :class="classes.priceTag" />
    </div>

    <div :class="classes.content">
      <div :class="classes.tags">
        <div :class="classes.tag" />
        <div :class="classes.smallTag" />
      </div>

      <div :class="classes.title" />
      <div :class="classes.description">
        <div :class="classes.descriptionLine" />
        <div :class="classes.descriptionLine2" />
      </div>
    </div>

    <div :class="classes.footer">
      <div :class="classes.button" />
    </div>
  </div>
</template>
