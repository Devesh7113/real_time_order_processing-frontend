import { useState } from 'react'
import { resolveProductImageUrl } from '../utils/productImageUrl'

const PLACEHOLDER = '/placeholder-product.svg'

/**
 * Renders a product image; falls back to a same-origin SVG if the URL fails
 * (wrong MIME, 404 HTML, ORB, etc.).
 */
export default function ProductImage({
  src,
  alt = '',
  className = '',
  loading = 'lazy',
}) {
  const [usePlaceholder, setUsePlaceholder] = useState(false)

  const resolved = resolveProductImageUrl(src)
  const url =
    usePlaceholder || !resolved ? PLACEHOLDER : resolved

  return (
    <img
      src={url}
      alt={alt}
      className={className}
      loading={loading}
      decoding="async"
      onError={() => setUsePlaceholder(true)}
    />
  )
}
