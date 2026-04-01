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
  <div class="py-12 lg:py-20">
    <div class="container mx-auto px-4">
      <div class="max-w-3xl mb-16">
        <h1 class="text-4xl lg:text-6xl font-heading font-bold mb-6">Контакты</h1>
        <p class="text-xl text-white/60 leading-relaxed">
          Мы всегда на связи. Оставьте сообщение или позвоните нам для обсуждения вашего проекта.
        </p>
      </div>

      <div class="grid lg:grid-cols-2 gap-12 lg:gap-20">
        <!-- Contact Info -->
        <div class="flex flex-col gap-12">
          <div class="grid sm:grid-cols-2 gap-8">
            <div class="flex flex-col gap-4">
              <h3 class="text-xs font-bold text-white/40 uppercase tracking-widest">Телефон</h3>
              <a href="tel:+74950000000" class="text-2xl font-heading font-bold hover:text-secondary transition-colors">+7 (495) 000-00-00</a>
            </div>
            <div class="flex flex-col gap-4">
              <h3 class="text-xs font-bold text-white/40 uppercase tracking-widest">E-mail</h3>
              <a href="mailto:info@aventcompany.ru" class="text-2xl font-heading font-bold hover:text-secondary transition-colors">info@aventcompany.ru</a>
            </div>
            <div class="flex flex-col gap-4">
              <h3 class="text-xs font-bold text-white/40 uppercase tracking-widest">Адрес</h3>
              <p class="text-xl font-heading font-medium leading-relaxed">Москва, ул. Примерная, 123, офис 401</p>
            </div>
            <div class="flex flex-col gap-4">
              <h3 class="text-xs font-bold text-white/40 uppercase tracking-widest">График работы</h3>
              <p class="text-xl font-heading font-medium leading-relaxed">Пн—Пт: 10:00 — 19:00</p>
            </div>
          </div>

          <!-- Map placeholder -->
          <div class="aspect-video bg-surface-container-low/30 rounded-3xl overflow-hidden glass-panel flex items-center justify-center border-white/5">
            <p class="text-white/40 italic">Интерактивная карта загружается...</p>
          </div>
        </div>

        <!-- Contact Form -->
        <AppCard variant="medium" class="p-8 lg:p-12">
          <h2 class="text-3xl font-heading font-bold mb-8">Напишите нам</h2>
          <form class="flex flex-col gap-6" @submit.prevent>
            <AppInput label="Имя" placeholder="Ваше имя" />
            <AppInput label="E-mail" placeholder="your@email.com" type="email" />
            <div class="flex flex-col gap-2">
              <label class="text-sm font-medium text-white/70">Сообщение</label>
              <textarea
                class="input-field min-h-[150px] resize-none focus:outline-none"
                placeholder="Расскажите о вашем проекте..."
              ></textarea>
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
