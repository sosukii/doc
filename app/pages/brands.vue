<script setup lang="ts">
import AppCard from '~/components/ui/AppCard.vue'

const brands = useBrands()

useSeoMeta({
  title: 'Бренды - Avent',
  description: 'Мы работаем с лучшими мировыми брендами интеллектуальных систем и аксессуаров.'
})
</script>

<template>
  <div class="py-8 sm:py-12 lg:py-20">
    <div class="container mx-auto px-4 sm:px-6 xl:px-8">
      <div class="mb-10 max-w-3xl sm:mb-16">
        <h1 class="text-3xl lg:text-6xl font-heading font-bold mb-6" style="font-size: clamp(1.875rem, 8vw, 3.75rem);">Бренды</h1>
        <p class="text-base leading-relaxed text-white/60 sm:text-lg lg:text-xl">
          Компания Avent сотрудничает с лидерами рынка интеллектуальных систем для обеспечения максимальной надежности и комфорта наших клиентов.
        </p>
      </div>

      <div class="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3 min-w-0">
        <component
          :is="brand.slug ? 'NuxtLink' : 'div'"
          v-for="brand in brands"
          :key="brand.id"
          :to="brand.slug ? `/products?brand=${brand.slug}` : undefined"
          class="block"
        >
          <AppCard
            class="flex h-full flex-col gap-6"
            variant="low"
          >
            <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-3xl font-heading font-bold text-white/90">
              {{ brand.logo }}
            </div>
            <h2 class="text-2xl font-heading font-bold text-white/90">{{ brand.name }}</h2>
            <p class="flex-grow leading-relaxed text-white/60">{{ brand.description }}</p>
            <p v-if="brand.slug" class="text-sm font-medium text-secondary">
              Открыть товары бренда
            </p>
          </AppCard>
        </component>
      </div>

      <!-- Trust Indicator -->
      <div class="mt-20 rounded-3xl border border-white/5 bg-surface-container-high/20 p-6 text-center sm:mt-24 sm:p-12 lg:mt-32 lg:p-24">
        <h2 class="mb-6 text-2xl font-heading font-bold italic sm:mb-8 sm:text-3xl">«Мы выбираем только лучшее для создания безупречного пространства»</h2>
        <p class="text-white/40 uppercase tracking-widest text-sm font-bold">— Наша философия</p>
      </div>
    </div>
  </div>
</template>
