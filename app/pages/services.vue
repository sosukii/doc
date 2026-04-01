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
  <div class="py-12 lg:py-20">
    <div class="container mx-auto px-4">
      <div class="max-w-3xl mb-16">
        <h1 class="text-4xl lg:text-6xl font-heading font-bold mb-6">Наши услуги</h1>
        <p class="text-xl text-white/60 leading-relaxed">
          Компания Avent предоставляет полный цикл работ по созданию атмосферных и технологичных пространств. От проектирования до сервисного обслуживания.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AppCard
          v-for="service in services"
          :key="service.id"
          class="flex flex-col gap-6"
          variant="low"
        >
          <div class="text-5xl mb-4">{{ service.icon }}</div>
          <h3 class="text-2xl font-heading font-bold text-white/90">{{ service.title }}</h3>
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
      <div class="mt-32">
        <h2 class="text-3xl font-heading font-bold mb-12 text-center">Часто задаваемые вопросы</h2>
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
