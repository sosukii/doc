export const formatPriceRub = (price: number) => {
  const numericPrice = Number(price)
  return `${new Intl.NumberFormat('ru-RU').format(Number.isNaN(numericPrice) ? 0 : numericPrice)} ₽`
}
