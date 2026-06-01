<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface BannerImage {
  mobile: string
  tablet: string
  desktop: string
}

interface Banner {
  _id: string
  title: string
  subtitle: string
  image: BannerImage
  link: string
  visible: boolean
  order: number
}

const banners = ref<Banner[]>([])
const current = ref(0)
const loading = ref(true)
let timer: ReturnType<typeof setInterval> | null = null

const config = useRuntimeConfig()

const fetchBanners = async () => {
  try {
    const data = await $fetch<Banner[]>(`${config.public.apiBase}/admin/banners`)
    banners.value = data.filter((b) => b.visible)
  } catch {
    banners.value = []
  } finally {
    loading.value = false
  }
}

const next = () => { current.value = (current.value + 1) % banners.value.length }
const prev = () => { current.value = (current.value - 1 + banners.value.length) % banners.value.length }
const goTo = (i: number) => { current.value = i }

const startTimer = () => {
  if (banners.value.length < 2) return
  timer = setInterval(next, 5000)
}

const stopTimer = () => {
  if (timer) clearInterval(timer)
}

onMounted(async () => {
  await fetchBanners()
  startTimer()
})

onUnmounted(stopTimer)

const classes = {
  section: 'relative w-full overflow-hidden',
  track: 'flex transition-transform duration-500 ease-in-out',
  slide: 'relative w-full flex-shrink-0',
  picture: 'block w-full',
  img: 'w-full object-cover h-[220px] sm:h-[340px] lg:h-[480px]',
  overlay: 'absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent',
  content: 'absolute bottom-0 left-0 right-0 p-5 sm:p-8 lg:p-12',
  title: 'text-xl sm:text-3xl lg:text-5xl font-heading font-bold text-white leading-tight',
  subtitle: 'mt-1 sm:mt-2 text-sm sm:text-base text-white/75 max-w-xl',
  link: 'mt-4 inline-flex items-center gap-2 btn-primary text-sm sm:text-base',
  // Nav arrows
  arrow: {
    base: 'absolute top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 text-white transition-all duration-200 hover:bg-black/50',
    prev: 'left-3 sm:left-5',
    next: 'right-3 sm:right-5',
  },
  // Dots
  dots: 'absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10',
  dot: {
    base: 'rounded-full transition-all duration-300 cursor-pointer',
    active: 'w-6 h-2 bg-white',
    inactive: 'w-2 h-2 bg-white/40 hover:bg-white/70',
  },
}
</script>

<template>
  <section
    v-if="!loading && banners.length > 0"
    :class="classes.section"
    @mouseenter="stopTimer"
    @mouseleave="startTimer"
  >
    <!-- Track -->
    <div
      :class="classes.track"
      :style="{ transform: `translateX(-${current * 100}%)` }"
    >
      <div
        v-for="banner in banners"
        :key="banner._id"
        :class="classes.slide"
      >
        <picture :class="classes.picture">
          <source media="(min-width: 1024px)" :srcset="banner.image.desktop" />
          <source media="(min-width: 640px)" :srcset="banner.image.tablet" />
          <img
            :src="banner.image.mobile"
            :alt="banner.title"
            :class="classes.img"
            loading="lazy"
          />
        </picture>

        <div :class="classes.overlay" />

        <div :class="classes.content">
          <h2 :class="classes.title">{{ banner.title }}</h2>
          <p v-if="banner.subtitle" :class="classes.subtitle">{{ banner.subtitle }}</p>
          <NuxtLink v-if="banner.link" :to="banner.link" :class="classes.link">
            Подробнее →
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Arrows (only if multiple banners) -->
    <template v-if="banners.length > 1">
      <button :class="[classes.arrow.base, classes.arrow.prev]" aria-label="Предыдущий" @click="prev">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button :class="[classes.arrow.base, classes.arrow.next]" aria-label="Следующий" @click="next">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <!-- Dots -->
      <div :class="classes.dots">
        <button
          v-for="(_, i) in banners"
          :key="i"
          :class="[classes.dot.base, i === current ? classes.dot.active : classes.dot.inactive]"
          :aria-label="`Баннер ${i + 1}`"
          @click="goTo(i)"
        />
      </div>
    </template>
  </section>
</template>
