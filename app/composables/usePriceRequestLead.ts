import type { Product } from '~/composables/useCatalog'

export type PriceRequestChannel = 'telegram' | 'whatsapp' | 'phone'

export interface PriceRequestLead {
  productId?: string
  productTitle: string
  productSlug?: string
  productPrice?: number | null
  source: 'price_request_modal'
  channel: PriceRequestChannel
  pageUrl: string
  createdAt: string
}

const LEADS_STORAGE_KEY = 'avent:price-request-leads:v1'

export const usePriceRequestLead = () => {
  const saveLeadDraft = (lead: PriceRequestLead) => {
    if (import.meta.server) {
      return
    }

    try {
      const storedLeads = window.localStorage.getItem(LEADS_STORAGE_KEY)
      const leads = storedLeads ? JSON.parse(storedLeads) as PriceRequestLead[] : []
      window.localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify([...leads, lead].slice(-50)))
    } catch {
      // Lead capture must never block the user's contact action.
    }
  }

  const sendPriceRequestLead = async (product: Product, channel: PriceRequestChannel) => {
    const lead: PriceRequestLead = {
      productId: product._id,
      productTitle: product.title,
      productSlug: product.slug,
      productPrice: product.price ?? null,
      source: 'price_request_modal',
      channel,
      pageUrl: import.meta.client ? window.location.href : '',
      createdAt: new Date().toISOString()
    }

    saveLeadDraft(lead)

    // TODO: replace the local draft with a real endpoint call, for example:
    // await $fetch('/api/leads/price-request', { method: 'POST', body: lead })
  }

  return {
    sendPriceRequestLead
  }
}
