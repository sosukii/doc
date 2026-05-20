import type { Product } from '~/composables/useCatalog'

export const AVENT_PHONE_LABEL = '+7 (495) 000-00-00'
export const AVENT_PHONE_HREF = 'tel:+74950000000'
export const AVENT_WHATSAPP_URL = 'https://wa.me/74950000000'
export const AVENT_TELEGRAM_URL = 'https://t.me/share/url'

export const usePriceRequest = () => {
  const product = useState<Product | null>('price-request-product', () => null)
  const isOpen = useState('price-request-modal-open', () => false)

  const openPriceRequest = (targetProduct: Product) => {
    product.value = targetProduct
    isOpen.value = true
  }

  const closePriceRequest = () => {
    isOpen.value = false
  }

  const getPriceRequestText = (targetProduct = product.value) => {
    if (!targetProduct) {
      return 'Здравствуйте! Подскажите, пожалуйста, цену на товар'
    }

    const reference = targetProduct.sku || targetProduct.model || targetProduct.slug
    const referenceText = reference ? `. Артикул/модель: ${reference}` : ''

    return `Здравствуйте! Подскажите, пожалуйста, цену на ${targetProduct.title}${referenceText}`
  }

  return {
    product,
    isOpen,
    openPriceRequest,
    closePriceRequest,
    getPriceRequestText
  }
}
