<script setup lang="ts">
const classes = {
  section: 'py-16 sm:py-20 lg:py-24',
  container: 'container mx-auto grid grid-cols-1 gap-4 px-4 sm:grid-cols-2 sm:gap-6 sm:px-6 lg:grid-cols-4 xl:px-8',
  stat: 'rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-6 text-center sm:bg-transparent',
  value: [
    'mb-2',
    'text-3xl',
    'font-heading',
    'font-bold',
    'gradient-text',
    'lg:text-5xl',
  ],
  label: 'text-sm uppercase tracking-widest text-white/50',
}
</script>

<template>
  <section :class="classes.section">
    <div :class="classes.container">
      <div :class="classes.stat">
        <div :class="classes.value" style="font-size: clamp(1.5rem, 6vw, 3rem);">10+</div>
        <p :class="classes.label">Лет опыта</p>
      </div>
      <div :class="classes.stat">
        <div :class="classes.value" style="font-size: clamp(1.5rem, 6vw, 3rem);">500+</div>
        <p :class="classes.label">Проектов</p>
      </div>
      <div :class="classes.stat">
        <div :class="classes.value" style="font-size: clamp(1.5rem, 6vw, 3rem);">24/7</div>
        <p :class="classes.label">Поддержка</p>
      </div>
      <div :class="classes.stat">
        <div :class="classes.value" style="font-size: clamp(1.5rem, 6vw, 3rem);">100%</div>
        <p :class="classes.label">Качество</p>
      </div>
    </div>
  </section>
</template>
