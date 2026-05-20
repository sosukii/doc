<script setup lang="ts">
import {
  AVENT_PHONE_HREF,
  AVENT_PHONE_LABEL,
  AVENT_TELEGRAM_URL,
  AVENT_WHATSAPP_URL,
  usePriceRequest
} from '~/composables/usePriceRequest'
import { usePriceRequestLead, type PriceRequestChannel } from '~/composables/usePriceRequestLead'

const { product, isOpen, closePriceRequest, getPriceRequestText } = usePriceRequest()
const { sendPriceRequestLead } = usePriceRequestLead()

const buildTelegramUrl = () => {
  const text = getPriceRequestText()
  return `${AVENT_TELEGRAM_URL}?text=${encodeURIComponent(text)}`
}

const buildWhatsappUrl = () => {
  const text = getPriceRequestText()
  return `${AVENT_WHATSAPP_URL}?text=${encodeURIComponent(text)}`
}

const contact = async (channel: PriceRequestChannel, href: string) => {
  if (!product.value || !import.meta.client) {
    return
  }

  void sendPriceRequestLead(product.value, channel)
  window.location.href = href
}

const closeOnEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isOpen.value) {
    closePriceRequest()
  }
}

watch(isOpen, (open) => {
  if (!import.meta.client) {
    return
  }

  document.body.style.overflow = open ? 'hidden' : ''
})

onMounted(() => {
  window.addEventListener('keydown', closeOnEscape)
})

onBeforeUnmount(() => {
  if (import.meta.client && isOpen.value) {
    document.body.style.overflow = ''
  }

  window.removeEventListener('keydown', closeOnEscape)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="price-request-fade">
      <div
        v-if="isOpen && product"
        class="price-request-overlay"
        role="presentation"
        @click.self="closePriceRequest"
      >
        <section
          class="price-request-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="price-request-title"
        >
          <button
            type="button"
            class="price-request-modal__close"
            aria-label="Закрыть окно"
            @click="closePriceRequest"
          >
            ×
          </button>

          <div class="price-request-modal__body">
            <p class="price-request-modal__eyebrow">{{ product.title }}</p>
            <h2 id="price-request-title" class="price-request-modal__title">Уточнить цену товара</h2>
            <p class="price-request-modal__text">
              Выберите удобный способ связи — мы подскажем актуальную цену и наличие.
            </p>

            <div class="price-request-modal__actions">
              <a class="price-request-contact" :href="buildTelegramUrl()" @click.prevent="contact('telegram', buildTelegramUrl())">
                <span class="price-request-contact__icon">TG</span>
                <span>Telegram</span>
              </a>
              <a class="price-request-contact" :href="buildWhatsappUrl()" @click.prevent="contact('whatsapp', buildWhatsappUrl())">
                <span class="price-request-contact__icon">WA</span>
                <span>WhatsApp</span>
              </a>
              <a class="price-request-contact" :href="AVENT_PHONE_HREF" @click.prevent="contact('phone', AVENT_PHONE_HREF)">
                <span class="price-request-contact__icon">☎</span>
                <span>{{ AVENT_PHONE_LABEL }}</span>
              </a>
            </div>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.price-request-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  place-items: center;
  background: rgba(3, 7, 18, 0.62);
  padding: 1rem;
  backdrop-filter: blur(18px);
}

.price-request-modal {
  position: relative;
  width: min(100%, 32rem);
  overflow: hidden;
  border: 1px solid rgba(var(--color-border-rgb), 0.18);
  border-radius: 24px;
  background:
    linear-gradient(135deg, rgba(var(--color-surface-rgb), 0.96), rgba(var(--color-surface-rgb), 0.84)),
    var(--color-surface);
  box-shadow: 0 28px 90px rgba(0, 0, 0, 0.34);
}

.price-request-modal__body {
  display: grid;
  gap: 1rem;
  padding: clamp(1.25rem, 4vw, 2rem);
}

.price-request-modal__close {
  position: absolute;
  top: 0.8rem;
  right: 0.8rem;
  display: inline-grid;
  width: 2.25rem;
  height: 2.25rem;
  place-items: center;
  border: 1px solid rgba(var(--color-border-rgb), 0.16);
  border-radius: 999px;
  background: rgba(var(--color-text-rgb), 0.06);
  color: var(--color-text);
  font-size: 1.35rem;
  line-height: 1;
  transition: background 180ms ease, border-color 180ms ease;
}

.price-request-modal__close:hover,
.price-request-modal__close:focus-visible {
  border-color: rgba(var(--color-primary-rgb), 0.28);
  background: rgba(var(--color-text-rgb), 0.1);
  outline: none;
}

.price-request-modal__eyebrow {
  max-width: calc(100% - 3rem);
  color: rgba(var(--color-text-rgb), 0.55);
  font-size: 0.78rem;
  font-weight: 800;
  line-height: 1.35;
  text-transform: uppercase;
}

.price-request-modal__title {
  color: var(--color-text);
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(1.45rem, 4vw, 2rem);
  font-weight: 800;
  line-height: 1.1;
}

.price-request-modal__text {
  color: rgba(var(--color-text-rgb), 0.68);
  line-height: 1.6;
}

.price-request-modal__actions {
  display: grid;
  gap: 0.75rem;
  margin-top: 0.25rem;
}

.price-request-contact {
  display: grid;
  grid-template-columns: 2.35rem minmax(0, 1fr);
  align-items: center;
  gap: 0.8rem;
  min-height: 3.25rem;
  border: 1px solid rgba(var(--color-border-rgb), 0.16);
  border-radius: 16px;
  background: rgba(var(--color-text-rgb), 0.045);
  color: var(--color-text);
  font-weight: 750;
  padding: 0.65rem 0.8rem;
  text-align: left;
  transition: background 180ms ease, border-color 180ms ease, box-shadow 180ms ease;
}

.price-request-contact:hover,
.price-request-contact:focus-visible {
  border-color: rgba(var(--color-primary-rgb), 0.24);
  background: rgba(var(--color-text-rgb), 0.075);
  box-shadow: 0 12px 28px rgba(var(--color-primary-rgb), 0.12);
  outline: none;
}

.price-request-contact__icon {
  display: inline-grid;
  width: 2.35rem;
  height: 2.35rem;
  place-items: center;
  border-radius: 999px;
  background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
  color: #ffffff;
  font-size: 0.72rem;
  font-weight: 900;
}

.price-request-fade-enter-active,
.price-request-fade-leave-active {
  transition: opacity 220ms ease;
}

.price-request-fade-enter-active .price-request-modal,
.price-request-fade-leave-active .price-request-modal {
  transition: transform 220ms ease, opacity 220ms ease;
}

.price-request-fade-enter-from,
.price-request-fade-leave-to {
  opacity: 0;
}

.price-request-fade-enter-from .price-request-modal,
.price-request-fade-leave-to .price-request-modal {
  opacity: 0;
  transform: translateY(0.35rem) scale(0.992);
}

@media (max-width: 420px) {
  .price-request-overlay {
    align-items: end;
    padding: 0.75rem;
  }

  .price-request-modal {
    border-radius: 22px;
  }
}
</style>
