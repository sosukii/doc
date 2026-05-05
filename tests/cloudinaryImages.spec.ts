import { describe, expect, it } from 'vitest'
import {
  optimizeCloudinaryImageUrl,
  optimizeProductCardImageUrl,
  optimizeProductDetailImageUrl
} from '@/utils/cloudinaryImages'

const CLOUDINARY_FIXTURE_BASE_URL = 'https://res.cloudinary.com/demo/image/upload'
const CLOUDINARY_VERSIONED_PRODUCT_URL = `${CLOUDINARY_FIXTURE_BASE_URL}/v1710000000/products/watch.png`
const CLOUDINARY_PRODUCT_URL = `${CLOUDINARY_FIXTURE_BASE_URL}/products/watch.png`
const CLOUDINARY_TRANSFORMED_PRODUCT_URL = `${CLOUDINARY_FIXTURE_BASE_URL}/c_fill,w_1200,q_90/products/watch.png`
const EXPECTED_CARD_PRODUCT_URL = `${CLOUDINARY_FIXTURE_BASE_URL}/f_auto,q_auto,c_limit,w_600/products/watch.png`
const EXPECTED_CARD_VERSIONED_PRODUCT_URL = `${CLOUDINARY_FIXTURE_BASE_URL}/f_auto,q_auto,c_limit,w_600/v1710000000/products/watch.png`
const EXPECTED_DETAIL_PRODUCT_URL = `${CLOUDINARY_FIXTURE_BASE_URL}/f_auto,q_auto,c_limit,w_900/products/watch.png`
const DATA_IMAGE_URL = 'data:image/svg+xml;charset=UTF-8,%3Csvg%3E%3C/svg%3E'
const EXTERNAL_IMAGE_URL = 'https://images.unsplash.com/photo-123?q=80&w=1200'

describe('cloudinary image helpers', () => {
  it('injects automatic format, quality and card width after image upload', () => {
    expect(optimizeProductCardImageUrl(CLOUDINARY_VERSIONED_PRODUCT_URL)).toBe(EXPECTED_CARD_VERSIONED_PRODUCT_URL)
  })

  it('uses a wider detail transformation when requested', () => {
    expect(optimizeProductDetailImageUrl(CLOUDINARY_PRODUCT_URL)).toBe(EXPECTED_DETAIL_PRODUCT_URL)
  })

  it('keeps data urls and non-cloudinary urls unchanged', () => {
    expect(optimizeProductCardImageUrl(DATA_IMAGE_URL)).toBe(DATA_IMAGE_URL)
    expect(optimizeProductCardImageUrl(EXTERNAL_IMAGE_URL)).toBe(EXTERNAL_IMAGE_URL)
  })

  it('replaces an existing leading Cloudinary transformation to stay idempotent', () => {
    expect(optimizeCloudinaryImageUrl(CLOUDINARY_TRANSFORMED_PRODUCT_URL)).toBe(EXPECTED_CARD_PRODUCT_URL)
  })
})
