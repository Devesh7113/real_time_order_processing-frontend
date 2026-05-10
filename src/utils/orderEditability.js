/**
 * Backend allows address updates only when order is not in a terminal / shipped state.
 * Keep in sync with {@link OrderServiceImpl#updateOder}.
 *
 * @param {string | undefined | null} status Jackson enum name from API
 */
export function canModifyOrderShippingNotes(status) {
  const s = String(status ?? '')
  return s !== 'InTransit' && s !== 'SHIPPED' && s !== 'CANCELLED'
}

/** @param {string | undefined | null} status */
export function modifyOrderBlockedReason(status) {
  const s = String(status ?? '')
  if (s === 'InTransit') return 'This order is in transit. Addresses cannot be changed.'
  if (s === 'SHIPPED') return 'This order has shipped. It cannot be edited.'
  if (s === 'CANCELLED') return 'This order was cancelled. It cannot be edited.'
  return ''
}

/**
 * One customer-facing amendment (shipping address only). After {@link OrderDTO.customerEditUsed}, no more edits.
 *
 * @param {{ orderStatus?: string, customerEditUsed?: boolean } | null | undefined} order
 */
export function canCustomerEditOrder(order) {
  if (!order) return false
  return canModifyOrderShippingNotes(order.orderStatus) && !order.customerEditUsed
}

/** @param {{ customerEditUsed?: boolean } | null | undefined} order */
export function customerEditUsedReason(order) {
  if (order?.customerEditUsed) {
    return 'You have already used your one allowed edit for this order (shipping address only).'
  }
  return ''
}
