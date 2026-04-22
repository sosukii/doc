<script setup lang="ts">
import AppButton from '~/components/ui/AppButton.vue'

const ecosystemItems = [
  {
    title: 'Умное освещение',
    description: 'Адаптивные световые сценарии для вашего пространства.',
    icon: '💡',
    image: 'https://images.unsplash.com/photo-1558002038-1055907df827?q=80&w=800&auto=format&fit=crop'
  },
  {
    title: 'Акустический комфорт',
    description: 'Интегрированные аудиосистемы высокого разрешения.',
    icon: '🔊',
    image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=800&auto=format&fit=crop'
  },
  {
    title: 'Климат-контроль',
    description: 'Автоматическое поддержание идеальных параметров воздуха.',
    icon: '🌡️',
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=800&auto=format&fit=crop'
  },
  {
    title: 'Системы безопасности',
    description: 'Интеллектуальный мониторинг и защита в режиме 24/7.',
    icon: '🛡️',
    image: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?q=80&w=800&auto=format&fit=crop'
  }
]

const heroImage = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200&auto=format&fit=crop'

useHead({
  link: [
    {
      rel: 'preload',
      as: 'image',
      href: heroImage,
      fetchpriority: 'high',
      crossorigin: ''
    }
  ]
})

useSeoMeta({
  title: 'Avent - Прецизионные атмосферные решения',
  description: 'Компания Avent предоставляет современные технологические решения с акцентом на дизайн и глубину восприятия.',
  ogTitle: 'Avent - Прецизионные атмосферные решения',
  ogDescription: 'Компания Avent предоставляет современные технологические решения с акцентом на дизайн и глубину восприятия.',
})
</script>

<template>
  <main>
    <section class="relative flex min-h-[90vh] items-center overflow-hidden">
      <div class="container mx-auto z-10 grid items-center gap-12 px-4 lg:grid-cols-2">
        <div class="animate-fade-in flex max-w-2xl flex-col gap-8">
          <h1 class="text-5xl font-heading font-bold leading-tight lg:text-7xl">
            Будущее <span class="gradient-text">Атмосферы</span> уже здесь
          </h1>
          <p class="text-xl leading-relaxed text-white/60">
            Мы создаем пространства, где технологии незаметны, а ощущения - незабываемы. Прецизионная точность в каждой детали.
          </p>
          <div class="mt-4 flex flex-wrap gap-4">
            <AppButton variant="primary" to="/products">Смотреть каталог</AppButton>
            <AppButton variant="glass" to="/services">Наши кейсы</AppButton>
          </div>
        </div>

        <div class="relative hidden lg:block">
          <div class="absolute inset-0 -z-10 rounded-full bg-primary/20 blur-[100px] animate-pulse" />
          <NuxtImg
            :src="heroImage"
            alt="Atmospheric technology"
            width="600"
            height="600"
            sizes="(min-width: 1024px) 46vw, 92vw"
            class="glass-panel rounded-3xl p-4 shadow-2xl rotate-3 transform transition-transform duration-500 hover:rotate-0 hover:scale-105"
            loading="eager"
            fetchpriority="high"
          />
        </div>
      </div>
    </section>

    <LazyHomeEcosystemSection :items="ecosystemItems" />
    <LazyHomeStatsSection />
    <LazyHomeCtaSection />
  </main>
</template>

<style scoped>
@keyframes fade-in {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fade-in 1s ease-out forwards;
}
</style>
