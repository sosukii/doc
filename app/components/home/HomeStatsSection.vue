<script setup lang="ts">
const classes = {
  section: 'py-24',
  container: 'container mx-auto grid grid-cols-2 gap-8 px-4 lg:grid-cols-4',
  stat: 'text-center',
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
