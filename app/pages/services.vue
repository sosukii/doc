<script setup lang="ts">
import AppCard from '~/components/ui/AppCard.vue'
import AppButton from '~/components/ui/AppButton.vue'

const services = useServices()

useSeoMeta({
  title: 'Услуги - Avent',
  description: 'Профессиональные услуги компании Avent по проектированию и интеграции интеллектуальных систем.'
})
</script>

<template>
  <div class="py-8 sm:py-12 lg:py-20">
    <div class="container mx-auto px-4 sm:px-6 xl:px-8">
      <div class="mb-10 max-w-3xl sm:mb-16">
        <h1 class="text-3xl lg:text-6xl font-heading font-bold mb-6" style="font-size: clamp(1.875rem, 8vw, 3.75rem);">Наши услуги</h1>
        <p class="text-base leading-relaxed text-white/60 sm:text-lg lg:text-xl">
          Компания Avent предоставляет полный цикл работ по созданию атмосферных и технологичных пространств. От проектирования до сервисного обслуживания.
        </p>
      </div>

      <div class="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3 min-w-0">
        <AppCard
          v-for="service in services"
          :key="service.id"
          class="flex flex-col gap-6"
          variant="low"
        >
          <div class="text-4xl mb-4 sm:text-5xl" style="font-size: clamp(2rem, 10vw, 3rem);">{{ service.icon }}</div>
          <h3 class="text-xl font-heading font-bold text-white/90 sm:text-2xl">{{ service.title }}</h3>
          <p class="text-white/60 leading-relaxed flex-grow">{{ service.description }}</p>
          <template #footer>
            <AppButton variant="text" class="px-0 group">
              Узнать больше 
              <span class="inline-block transition-transform group-hover:translate-x-2 ml-2">→</span>
            </AppButton>
          </template>
        </AppCard>
      </div>

      <!-- FAQ Section placeholder -->
      <div class="mt-20 sm:mt-24 lg:mt-32">
        <h2 class="mb-8 text-center text-2xl font-heading font-bold sm:mb-12 sm:text-3xl">Часто задаваемые вопросы</h2>
        <div class="max-w-4xl mx-auto flex flex-col gap-4">
          <AppCard variant="medium" class="cursor-pointer">
            <div class="font-heading font-bold text-lg">Сколько времени занимает установка системы?</div>
          </AppCard>
          <AppCard variant="medium" class="cursor-pointer">
            <div class="font-heading font-bold text-lg">Нужно ли проводить ремонт для интеграции ваших решений?</div>
          </AppCard>
          <AppCard variant="medium" class="cursor-pointer">
            <div class="font-heading font-bold text-lg">Предоставляете ли вы гарантийное обслуживание?</div>
          </AppCard>
        </div>
      </div>
    </div>
  </div>
</template>
