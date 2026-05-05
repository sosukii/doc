import {
  CLOUDINARY_HOSTNAME,
  CLOUDINARY_PRODUCT_CARD_TRANSFORMATION,
  CLOUDINARY_PRODUCT_DETAIL_TRANSFORMATION,
  CLOUDINARY_UPLOAD_MARKER
} from '~/constants/cloudinary'

const CLOUDINARY_TRANSFORM_SEGMENT = /^([a-z]{1,3}_|fl_|dpr_|ar_|c_|e_|g_|h_|q_|r_|t_|w_|x_|y_|z_)/i

const hasCloudinaryTransformation = (segment: string) => segment
  .split(',')
  .some(part => CLOUDINARY_TRANSFORM_SEGMENT.test(part))

export const optimizeCloudinaryImageUrl = (src: string, transformation = CLOUDINARY_PRODUCT_CARD_TRANSFORMATION) => {
  if (!src || src.startsWith('data:')) {
    return src
  }

  let parsedUrl: URL

  try {
    parsedUrl = new URL(src)
  } catch {
    return src
  }

  if (parsedUrl.hostname !== CLOUDINARY_HOSTNAME || !parsedUrl.pathname.includes(CLOUDINARY_UPLOAD_MARKER)) {
    return src
  }

  const uploadIndex = parsedUrl.pathname.indexOf(CLOUDINARY_UPLOAD_MARKER)
  const prefix = parsedUrl.pathname.slice(0, uploadIndex)
  const suffix = parsedUrl.pathname.slice(uploadIndex + CLOUDINARY_UPLOAD_MARKER.length)
  const pathSegments = suffix.split('/').filter(Boolean)

  if (!pathSegments.length) {
    return src
  }

  const firstSegment = pathSegments[0]
  const nextSegments = hasCloudinaryTransformation(firstSegment)
    ? [transformation, ...pathSegments.slice(1)]
    : [transformation, ...pathSegments]

  parsedUrl.pathname = `${prefix}${CLOUDINARY_UPLOAD_MARKER}${nextSegments.join('/')}`
  return parsedUrl.toString()
}

export const optimizeProductCardImageUrl = (src: string) => optimizeCloudinaryImageUrl(src, CLOUDINARY_PRODUCT_CARD_TRANSFORMATION)

export const optimizeProductDetailImageUrl = (src: string) => optimizeCloudinaryImageUrl(src, CLOUDINARY_PRODUCT_DETAIL_TRANSFORMATION)
