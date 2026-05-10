/**
 * Mirrors backend enums (Jackson uses enum names as strings).
 *
 * @typedef {'NEW' | 'PROCESSING' | 'CONFIRMED' | 'ACTION_NEEDED' | 'InTransit' | 'CANCELLED' | 'SHIPPED'} OrderStatus
 */

/**
 * @typedef {'PENDING' | 'SUCCESS' | 'FAILED'} PaymentStatus
 */

/**
 * @typedef {Object} OrderItemDTO
 * @property {number} [id]
 * @property {number} productId
 * @property {number} quantity
 * @property {number} [price] Required when creating an order (used for line total).
 */

/**
 * @typedef {Object} OrderDTO
 * @property {number} id
 * @property {number} userId
 * @property {OrderItemDTO[] | null} [orderItems]
 * @property {number} totalAmount
 * @property {OrderStatus} orderStatus
 * @property {string | null} [createdAt] ISO-8601 from `LocalDateTime`
 * @property {string | null} [updatedAt]
 * @property {PaymentStatus} paymentStatus
 * @property {string | null} [shippingAddress]
 * @property {string | null} [notes]
 * @property {boolean} [customerEditUsed] After true, the customer may not edit again.
 */

/**
 * @typedef {Object} OrderCreateDTO
 * @property {OrderItemDTO[]} orderItems Each item needs `productId`, `quantity`, and `price`.
 * @property {string} shippingAddress
 * @property {string} [notes]
 */

/**
 * @typedef {Object} OrderUpdateDTO
 * @property {number} id
 * @property {string} shippingAddress
 */

/**
 * @typedef {Object} ProductDTO
 * @property {number} id
 * @property {string} name
 * @property {string} [description]
 * @property {number} price
 * @property {number} stockQuantity
 * @property {string} [category]
 * @property {string} [imageUrl]
 */

export {}
