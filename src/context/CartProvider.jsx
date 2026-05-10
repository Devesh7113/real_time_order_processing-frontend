import { useCallback, useEffect, useMemo, useState } from 'react'
import { clearCartStorage, loadCart, saveCart } from '../api/cartStorage'
import { useAuth } from '../hooks/useAuth'
import { CartContext } from './CartContext'

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth()
  const [items, setItems] = useState(() => loadCart())

  useEffect(() => {
    saveCart(items)
  }, [items])

  useEffect(() => {
    if (!isAuthenticated) {
      setItems([])
      clearCartStorage()
    }
  }, [isAuthenticated])

  const addToCart = useCallback((product) => {
    const id = Number(product.id)
    const price = product.price != null ? Number(product.price) : NaN
    if (!Number.isFinite(id) || !Number.isFinite(price) || price < 0) return
    setItems((prev) => {
      const i = prev.findIndex((x) => x.productId === id)
      if (i >= 0) {
        const next = [...prev]
        next[i] = { ...next[i], quantity: next[i].quantity + 1 }
        return next
      }
      return [
        ...prev,
        {
          productId: id,
          name: String(product.name ?? ''),
          price,
          quantity: 1,
          imageUrl: product.imageUrl ?? null,
        },
      ]
    })
  }, [])

  const setQuantity = useCallback((productId, quantity) => {
    const q = Math.floor(Number(quantity))
    if (!Number.isFinite(q) || q < 1) {
      setItems((prev) => prev.filter((x) => x.productId !== productId))
      return
    }
    setItems((prev) =>
      prev.map((x) => (x.productId === productId ? { ...x, quantity: q } : x))
    )
  }, [])

  const removeFromCart = useCallback((productId) => {
    setItems((prev) => prev.filter((x) => x.productId !== productId))
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
    clearCartStorage()
  }, [])

  const totalAmount = useMemo(
    () => items.reduce((s, x) => s + x.price * x.quantity, 0),
    [items]
  )

  const itemCount = useMemo(() => items.reduce((s, x) => s + x.quantity, 0), [items])

  const value = useMemo(
    () => ({
      items,
      addToCart,
      setQuantity,
      removeFromCart,
      clearCart,
      totalAmount,
      itemCount,
    }),
    [items, addToCart, setQuantity, removeFromCart, clearCart, totalAmount, itemCount]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
