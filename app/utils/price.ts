export type PriceValue = number | string | null | undefined

export const PRICE_REQUEST_LABEL = 'Цена по запросу'

export const getNumericPrice = (price: PriceValue) => {
  const numericPrice = Number(price)
  return Number.isFinite(numericPrice) ? numericPrice : 0
}

export const isPriceAvailable = (price: PriceValue) => getNumericPrice(price) > 0

export const formatPriceRub = (price: PriceValue) => {
  if (!isPriceAvailable(price)) {
    return PRICE_REQUEST_LABEL
  }

  return `${new Intl.NumberFormat('ru-RU').format(getNumericPrice(price))} ₽`
}

export const formatPrice = formatPriceRub
