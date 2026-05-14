<script setup lang="ts">
import AppButton from '~/components/ui/AppButton.vue'
import AppCard from '~/components/ui/AppCard.vue'

const classes = {
  section: 'container mx-auto px-4 py-16 sm:px-6 sm:py-20 lg:py-24 xl:px-8',
  card: 'relative overflow-hidden px-4 py-12 text-center sm:px-8 sm:py-16 lg:py-24',
  bgBlob: [
    'absolute',
    'right-0',
    'top-0',
    '-z-10',
    'h-64',
    'w-64',
    'rounded-full',
    'bg-secondary/10',
    'blur-[100px]',
  ],
  content: [
    'relative',
    'z-10',
    'mx-auto',
    'flex',
    'max-w-3xl',
    'flex-col',
    'gap-8',
  ],
  title: 'text-3xl font-heading font-bold lg:text-6xl',
  subtitle: 'text-base leading-relaxed text-white/70 sm:text-lg lg:text-xl',
  actions: 'grid justify-center gap-4 sm:flex',
}
</script>

<template>
  <section :class="classes.section">
    <AppCard :class="classes.card" variant="high" role="region" aria-label="Форма обратной связи">
      <div :class="classes.bgBlob" />
      <div :class="classes.content">
        <h2 :class="classes.title" style="font-size: clamp(1.875rem, 7vw, 3.75rem);">Готовы изменить ваше пространство?</h2>
        <p :class="classes.subtitle">
          Оставьте заявку на бесплатную консультацию и наш специалист свяжется с вами в течение 15 минут.
        </p>
        <div :class="classes.actions">
          <AppButton variant="primary">Связаться с нами</AppButton>
        </div>
      </div>
    </AppCard>
  </section>
</template>
