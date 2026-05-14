<script setup lang="ts">
import AppCard from '~/components/ui/AppCard.vue'

useSeoMeta({
  title: 'Доставка - Avent',
  description: 'Информация об условиях доставки и оплаты продукции Avent.'
})
</script>

<template>
  <div class="py-8 sm:py-12 lg:py-20">
    <div class="container mx-auto px-4 sm:px-6 xl:px-8">
      <div class="mb-10 max-w-3xl sm:mb-16">
        <h1 class="mb-4 text-3xl font-heading font-bold sm:mb-6 sm:text-4xl lg:text-6xl">Доставка и оплата</h1>
        <p class="text-base leading-relaxed text-white/60 sm:text-lg lg:text-xl">
          Мы стремимся обеспечить максимально быструю и безопасную доставку продукции нашим клиентам по всей стране.
        </p>
      </div>

      <div class="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
        <AppCard variant="low" class="flex flex-col gap-6">
          <h3 class="text-xl font-heading font-bold text-white/90 sm:text-2xl">Варианты доставки</h3>
          <ul class="flex flex-col gap-4 text-white/60">
            <li class="flex gap-4">
              <span class="text-secondary font-bold">●</span>
              <span>Курьерская доставка по Москве (1-2 дня) — Бесплатно при заказе от 50,000₽</span>
            </li>
            <li class="flex gap-4">
              <span class="text-secondary font-bold">●</span>
              <span>Доставка транспортными компаниями по РФ (СДЭК, Деловые Линии) — По тарифам ТК</span>
            </li>
            <li class="flex gap-4">
              <span class="text-secondary font-bold">●</span>
              <span>Самовывоз из нашего шоурума в Москве — Бесплатно</span>
            </li>
          </ul>
        </AppCard>

        <AppCard variant="low" class="flex flex-col gap-6">
          <h3 class="text-xl font-heading font-bold text-white/90 sm:text-2xl">Способы оплаты</h3>
          <ul class="flex flex-col gap-4 text-white/60">
            <li class="flex gap-4">
              <span class="text-secondary font-bold">●</span>
              <span>Банковской картой онлайн на сайте</span>
            </li>
            <li class="flex gap-4">
              <span class="text-secondary font-bold">●</span>
              <span>Безналичный расчет для юридических лиц (с НДС)</span>
            </li>
            <li class="flex gap-4">
              <span class="text-secondary font-bold">●</span>
              <span>Наличными или картой при получении (только для Москвы)</span>
            </li>
          </ul>
        </AppCard>
      </div>
    </div>
  </div>
</template>
