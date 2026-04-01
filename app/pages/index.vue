<script setup lang="ts">
import AppButton from '~/components/ui/AppButton.vue'
import AppCard from '~/components/ui/AppCard.vue'

useSeoMeta({
  title: 'Avent - Прецизионные атмосферные решения',
  description: 'Компания Avent предоставляет современные технологические решения с акцентом на дизайн и глубину восприятия.',
  ogTitle: 'Avent - Прецизионные атмосферные решения',
  ogDescription: 'Компания Avent предоставляет современные технологические решения с акцентом на дизайн и глубину восприятия.',
})

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
</script>

<template>
  <main>
    <!-- Hero Section -->
    <section class="relative min-h-[90vh] flex items-center overflow-hidden">
      <div class="container mx-auto px-4 z-10 grid lg:grid-cols-2 gap-12 items-center">
        <div class="flex flex-col gap-8 max-w-2xl animate-fade-in">
          <h1 class="text-5xl lg:text-7xl font-heading font-bold leading-tight">
            Будущее <span class="gradient-text">Атмосферы</span> уже здесь
          </h1>
          <p class="text-xl text-white/60 leading-relaxed">
            Мы создаем пространства, где технологии незаметны, а ощущения — незабываемы. Прецизионная точность в каждой детали.
          </p>
          <div class="flex flex-wrap gap-4 mt-4">
            <AppButton variant="primary" to="/products">Смотреть каталог</AppButton>
            <AppButton variant="glass" to="/services">Наши кейсы</AppButton>
          </div>
        </div>

        <div class="relative hidden lg:block">
          <div class="absolute inset-0 bg-primary/20 rounded-full blur-[100px] -z-10 animate-pulse"></div>
          <NuxtImg
            src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200&auto=format&fit=crop"
            alt="Atmospheric technology"
            width="600"
            height="600"
            class="rounded-3xl shadow-2xl glass-panel p-4 rotate-3 transform transition-transform hover:rotate-0 hover:scale-105 duration-500"
            loading="eager"
            fetchpriority="high"
          />
        </div>
      </div>
    </section>

    <!-- Ecosystem Bento Grid -->
    <section class="py-24 bg-surface-container-low/20">
      <div class="container mx-auto px-4">
        <div class="text-center mb-16">
          <h2 class="text-4xl lg:text-5xl font-heading font-bold mb-6">Экосистема Avent</h2>
          <p class="text-white/60 max-w-2xl mx-auto">
            Наши решения бесшовно интегрируются в вашу жизнь, создавая единое интеллектуальное пространство.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AppCard
            v-for="(item, index) in ecosystemItems"
            :key="item.title"
            class="group relative overflow-hidden h-full min-h-[300px] flex flex-col justify-end"
            :variant="index % 2 === 0 ? 'low' : 'medium'"
          >
            <NuxtImg
              :src="item.image"
              :alt="item.title"
              class="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-40 transition-opacity duration-500"
            />
            <div class="relative z-10">
              <span class="text-4xl mb-4 block">{{ item.icon }}</span>
              <h3 class="text-xl font-heading font-bold mb-2 group-hover:text-secondary transition-colors">{{ item.title }}</h3>
              <p class="text-sm text-white/60">{{ item.description }}</p>
            </div>
          </AppCard>
        </div>
      </div>
    </section>

    <!-- Stats / Trust Section -->
    <section class="py-24">
      <div class="container mx-auto px-4 grid grid-cols-2 lg:grid-cols-4 gap-8">
        <div class="text-center">
          <div class="text-4xl lg:text-5xl font-heading font-bold gradient-text mb-2">10+</div>
          <p class="text-sm text-white/50 uppercase tracking-widest">Лет опыта</p>
        </div>
        <div class="text-center">
          <div class="text-4xl lg:text-5xl font-heading font-bold gradient-text mb-2">500+</div>
          <p class="text-sm text-white/50 uppercase tracking-widest">Проектов</p>
        </div>
        <div class="text-center">
          <div class="text-4xl lg:text-5xl font-heading font-bold gradient-text mb-2">24/7</div>
          <p class="text-sm text-white/50 uppercase tracking-widest">Поддержка</p>
        </div>
        <div class="text-center">
          <div class="text-4xl lg:text-5xl font-heading font-bold gradient-text mb-2">100%</div>
          <p class="text-sm text-white/50 uppercase tracking-widest">Качество</p>
        </div>
      </div>
    </section>

    <!-- Contact CTA -->
    <section class="py-24 container mx-auto px-4">
      <AppCard variant="high" class="text-center py-16 lg:py-24 relative overflow-hidden" role="region" aria-label="Форма обратной связи">
        <div class="absolute top-0 right-0 w-64 h-64 bg-secondary/10 rounded-full blur-[100px] -z-10"></div>
        <div class="relative z-10 max-w-3xl mx-auto flex flex-col gap-8">
          <h2 class="text-4xl lg:text-6xl font-heading font-bold">Готовы изменить ваше пространство?</h2>
          <p class="text-xl text-white/70">
            Оставьте заявку на бесплатную консультацию и наш специалист свяжется с вами в течение 15 минут.
          </p>
          <div class="flex justify-center gap-4">
            <AppButton variant="primary">Связаться с нами</AppButton>
          </div>
        </div>
      </AppCard>
    </section>
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
