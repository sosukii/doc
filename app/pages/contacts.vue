<script setup lang="ts">
import AppCard from '~/components/ui/AppCard.vue'
import AppButton from '~/components/ui/AppButton.vue'
import AppInput from '~/components/ui/AppInput.vue'

useSeoMeta({
  title: 'Контакты - Avent',
  description: 'Свяжитесь с нами для получения консультации или оформления заказа.'
})
</script>

<template>
  <div class="py-8 sm:py-12 lg:py-20">
    <div class="container mx-auto px-4 sm:px-6 xl:px-8">
      <div class="mb-10 max-w-3xl sm:mb-16">
        <h1 class="mb-4 text-3xl font-heading font-bold sm:mb-6 sm:text-4xl lg:text-6xl">Контакты</h1>
        <p class="text-base leading-relaxed text-white/60 sm:text-lg lg:text-xl">
          Мы всегда на связи. Оставьте сообщение или позвоните нам для обсуждения вашего проекта.
        </p>
      </div>

      <div class="grid gap-8 lg:grid-cols-2 lg:gap-12 xl:gap-20">
        <!-- Contact Info -->
        <div class="flex flex-col gap-8 sm:gap-12">
          <div class="grid gap-6 sm:grid-cols-2 sm:gap-8">
            <div class="flex flex-col gap-4">
              <h3 class="text-xs font-bold text-white/40 uppercase tracking-widest">Телефон</h3>
              <a href="tel:+74950000000" class="text-xl font-heading font-bold transition-colors hover:text-secondary sm:text-2xl">+7 (495) 000-00-00</a>
            </div>
            <div class="flex flex-col gap-4">
              <h3 class="text-xs font-bold text-white/40 uppercase tracking-widest">E-mail</h3>
              <a href="mailto:info@aventcompany.ru" class="text-xl font-heading font-bold transition-colors hover:text-secondary sm:text-2xl">info@aventcompany.ru</a>
            </div>
            <div class="flex flex-col gap-4">
              <h3 class="text-xs font-bold text-white/40 uppercase tracking-widest">Адрес</h3>
              <p class="text-lg font-heading font-medium leading-relaxed sm:text-xl">Москва, ул. Примерная, 123, офис 401</p>
            </div>
            <div class="flex flex-col gap-4">
              <h3 class="text-xs font-bold text-white/40 uppercase tracking-widest">График работы</h3>
              <p class="text-lg font-heading font-medium leading-relaxed sm:text-xl">Пн—Пт: 10:00 — 19:00</p>
            </div>
          </div>

          <!-- Map placeholder -->
          <div class="glass-panel flex aspect-video min-h-52 items-center justify-center overflow-hidden rounded-3xl border-white/5 bg-surface-container-low/30 p-4">
            <p class="text-center italic text-white/40">Интерактивная карта загружается...</p>
          </div>
        </div>

        <!-- Contact Form -->
        <AppCard variant="medium" class="p-5 sm:p-8 lg:p-12">
          <h2 class="mb-6 text-2xl font-heading font-bold sm:mb-8 sm:text-3xl">Напишите нам</h2>
          <form class="flex flex-col gap-6" @submit.prevent>
            <AppInput label="Имя" placeholder="Ваше имя" />
            <AppInput label="E-mail" placeholder="your@email.com" type="email" />
            <div class="flex flex-col gap-2">
              <label class="text-sm font-medium text-white/70">Сообщение</label>
              <textarea
                class="input-field min-h-[150px] resize-none focus:outline-none"
                placeholder="Расскажите о вашем проекте..."
              />
            </div>
            <AppButton variant="primary" type="submit" class="w-full py-4 text-lg">Отправить сообщение</AppButton>
            <p class="text-center text-xs text-white/40 mt-2">
              Нажимая кнопку, вы соглашаетесь с Политикой конфиденциальности.
            </p>
          </form>
        </AppCard>
      </div>
    </div>
  </div>
</template>
