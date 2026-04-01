<template>
  <footer class="bg-surface-container-lowest py-12 lg:py-20 border-t border-white/5">
    <div class="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
      <div class="flex flex-col gap-6">
        <NuxtLink to="/" class="flex items-center gap-2 group">
          <span class="text-3xl font-heading font-bold gradient-text group-hover:scale-105 transition-transform">AVENT</span>
        </NuxtLink>
        <p class="text-white/60 text-sm leading-relaxed max-w-xs">
          Компания Avent — ваш партнер в создании уникальных атмосферных решений. Мы объединяем современные технологии и исключительный дизайн.
        </p>
      </div>

      <div class="flex flex-col gap-6">
        <h3 class="text-lg font-heading font-semibold text-white/90">Навигация</h3>
        <nav class="flex flex-col gap-3">
          <NuxtLink to="/products" class="text-sm text-white/60 hover:text-secondary transition-colors">Каталог</NuxtLink>
          <NuxtLink to="/services" class="text-sm text-white/60 hover:text-secondary transition-colors">Услуги</NuxtLink>
          <NuxtLink to="/brands" class="text-sm text-white/60 hover:text-secondary transition-colors">Бренды</NuxtLink>
          <NuxtLink to="/delivery" class="text-sm text-white/60 hover:text-secondary transition-colors">Доставка</NuxtLink>
        </nav>
      </div>

      <div class="flex flex-col gap-6">
        <h3 class="text-lg font-heading font-semibold text-white/90">Информация</h3>
        <nav class="flex flex-col gap-3">
          <NuxtLink to="/contacts" class="text-sm text-white/60 hover:text-secondary transition-colors">Контакты</NuxtLink>
          <NuxtLink to="/privacy" class="text-sm text-white/60 hover:text-secondary transition-colors">Политика конфиденциальности</NuxtLink>
          <NuxtLink to="/terms" class="text-sm text-white/60 hover:text-secondary transition-colors">Условия использования</NuxtLink>
        </nav>
      </div>

      <div class="flex flex-col gap-6">
        <h3 class="text-lg font-heading font-semibold text-white/90">Контакты</h3>
        <div class="flex flex-col gap-3 text-sm text-white/60">
          <p>Москва, ул. Примерная, 123</p>
          <a href="tel:+74950000000" class="hover:text-secondary transition-colors">+7 (495) 000-00-00</a>
          <a href="mailto:info@aventcompany.ru" class="hover:text-secondary transition-colors">info@aventcompany.ru</a>
        </div>
      </div>
    </div>

    <div class="container mx-auto px-4 pt-12 mt-12 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-white/40">
      <p>&copy; {{ new Date().getFullYear() }} Avent. Все права защищены.</p>
      <div class="flex gap-6">
        <a href="#" class="hover:text-white transition-colors">VK</a>
        <a href="#" class="hover:text-white transition-colors">Telegram</a>
        <a href="#" class="hover:text-white transition-colors">YouTube</a>
      </div>
    </div>
  </footer>
</template>
