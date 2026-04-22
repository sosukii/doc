<script setup lang="ts">
import AppButton from '~/components/ui/AppButton.vue'
import AppCard from '~/components/ui/AppCard.vue'
</script>

<template>
  <section class="container mx-auto px-4 py-24">
    <AppCard variant="high" class="relative overflow-hidden py-16 text-center lg:py-24" role="region" aria-label="Форма обратной связи">
      <div class="absolute right-0 top-0 -z-10 h-64 w-64 rounded-full bg-secondary/10 blur-[100px]" />
      <div class="relative z-10 mx-auto flex max-w-3xl flex-col gap-8">
        <h2 class="text-4xl font-heading font-bold lg:text-6xl">Готовы изменить ваше пространство?</h2>
        <p class="text-xl text-white/70">
          Оставьте заявку на бесплатную консультацию и наш специалист свяжется с вами в течение 15 минут.
        </p>
        <div class="flex justify-center gap-4">
          <AppButton variant="primary">Связаться с нами</AppButton>
        </div>
      </div>
    </AppCard>
  </section>
</template>
