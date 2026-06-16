import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiTag, FiArrowRight, FiShield, FiCheckCircle } from 'react-icons/fi'
import { fetchCart, updateCartItem, removeCartItem, applyCoupon, removeCoupon } from '../redux/slices/cartSlice'
import { selectCartSubtotal } from '../redux/slices/cartSlice'

const formatPrice = (p) => new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 0,
}).format(p)

const SHIPPING_THRESHOLD = 499
const SHIPPING_CHARGE = 49

export default function CartPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { token } = useSelector((s) => s.auth)
  const { cart, loading, couponDiscount, appliedCoupon } = useSelector((s) => s.cart)
  const subtotal = useSelector(selectCartSubtotal)
  const [couponCode, setCouponCode] = useState('')

  useEffect(() => {
    if (token) {
      dispatch(fetchCart())
    }
  }, [dispatch, token])

  const items = cart?.items || []
  const shipping = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_CHARGE
  const total = subtotal + shipping - (couponDiscount || cart?.couponDiscount || 0)

  const handleApplyCoupon = (e) => {
    e.preventDefault()
    if (!couponCode.trim()) return
    dispatch(applyCoupon(couponCode))
    setCouponCode('')
  }

  if (loading && !cart) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-red-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center max-w-md px-4">
          <div className="w-24 h-24 bg-gray-100 border border-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🔒</span>
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>Login to view cart</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">Please log in to view and manage your shopping cart.</p>
          <Link to="/login" className="inline-block bg-red-500 hover:bg-red-600 text-white font-bold text-sm uppercase tracking-widest px-8 py-4 transition-colors">
            Login to Account
          </Link>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center max-w-md px-4">
          <div className="w-24 h-24 bg-gray-100 border border-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🛒</span>
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>Your cart is empty</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">Looks like you haven't added anything yet. Discover our collections.</p>
          <Link to="/products" className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold text-sm uppercase tracking-widest px-8 py-4 transition-colors">
            <FiShoppingBag size={18} /> Start Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24 md:pb-8 lg:py-12">
        <div className="flex items-end justify-between border-b border-gray-200 pb-5 mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 uppercase tracking-wide" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Shopping Cart
          </h1>
          <span className="text-gray-500 text-sm">
            {items.length} {items.length === 1 ? 'Item' : 'Items'}
          </span>
        </div>

        <div className="flex flex-col lg:flex-row gap-10 xl:gap-12">
          {/* Cart Items List */}
          <div className="flex-1 space-y-6">
            <div className="hidden md:grid grid-cols-12 gap-4 pb-3 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-200">
              <div className="col-span-6">Product Details</div>
              <div className="col-span-3 text-center">Quantity</div>
              <div className="col-span-3 text-right">Total</div>
            </div>

            <div className="space-y-6 sm:space-y-8">
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={item._id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100, height: 0, marginTop: 0, marginBottom: 0, overflow: 'hidden' }}
                    transition={{ duration: 0.3 }}
                    className="group"
                  >
                    {/* Desktop View */}
                    <div className="hidden md:grid grid-cols-12 gap-6 items-center">
                      {/* Product Info */}
                      <div className="col-span-6 flex gap-6">
                        <Link to={`/product/${item.product?._id}`} className="shrink-0">
                          <div className="w-28 h-36 bg-gray-100 overflow-hidden border border-gray-200">
                            <img
                              src={
                                item.product?.images?.[0]?.url ||
                                item.product?.colors?.find(c => c.name === item.color)?.images?.[0]?.url ||
                                item.product?.colors?.find(c => c.name === item.color)?.image ||
                                item.product?.colors?.[0]?.images?.[0]?.url ||
                                item.product?.colors?.[0]?.image?.url
                              }
                              alt={item.product?.title}
                              className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                        </Link>

                        <div className="flex flex-col justify-center py-2 min-w-0">
                          <p className="text-xs text-red-500 font-semibold tracking-wider uppercase mb-1">
                            {item.product?.brand}
                          </p>
                          <Link
                            to={`/product/${item.product?._id}`}
                            className="text-gray-900 font-semibold text-base hover:text-red-500 transition-colors line-clamp-2 leading-snug mb-2"
                          >
                            {item.product?.title}
                          </Link>

                          <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                            {item.size && (
                              <span className="flex items-center gap-1">
                                <span className="text-gray-400">Size:</span>
                                <span className="text-gray-900 font-medium">{item.size}</span>
                              </span>
                            )}
                            {item.size && item.color && <span className="w-1 h-1 rounded-full bg-gray-300" />}
                            {item.color && (
                              <span className="flex items-center gap-1">
                                <span className="text-gray-400">Color:</span>
                                <span className="text-gray-900 font-medium">{item.color}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="col-span-3 flex justify-center items-center">
                        <div className="flex items-center border border-gray-300 rounded">
                          <button
                            onClick={() => dispatch(updateCartItem({ itemId: item._id, quantity: item.quantity - 1 }))}
                            disabled={item.quantity <= 1}
                            className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors disabled:opacity-40"
                          >
                            <FiMinus size={14} />
                          </button>
                          <span className="w-10 text-center text-gray-900 font-bold text-sm border-x border-gray-300 py-2">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => dispatch(updateCartItem({ itemId: item._id, quantity: item.quantity + 1 }))}
                            disabled={item.quantity >= (item.product?.stock || 10)}
                            className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors disabled:opacity-40"
                          >
                            <FiPlus size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Price & Actions */}
                      <div className="col-span-3 flex justify-end items-center gap-4">
                        <div className="text-right">
                          <p className="text-gray-900 font-bold text-lg">{formatPrice(item.price * item.quantity)}</p>
                          {item.quantity > 1 && (
                            <p className="text-gray-400 text-xs mt-0.5">{formatPrice(item.price)} each</p>
                          )}
                        </div>
                        <button
                          onClick={() => dispatch(removeCartItem(item._id))}
                          className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          title="Remove item"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Mobile View */}
                    <div className="flex gap-4 md:hidden pb-6 border-b border-gray-150 last:border-0 relative">
                      {/* Product Image on Left */}
                      <Link to={`/product/${item.product?._id}`} className="shrink-0">
                        <div className="w-24 h-32 bg-gray-100 overflow-hidden border border-gray-250 rounded-lg">
                          <img
                            src={
                              item.product?.images?.[0]?.url ||
                              item.product?.colors?.find(c => c.name === item.color)?.images?.[0]?.url ||
                              item.product?.colors?.find(c => c.name === item.color)?.image ||
                              item.product?.colors?.[0]?.images?.[0]?.url ||
                              item.product?.colors?.[0]?.image?.url
                            }
                            alt={item.product?.title}
                            className="w-full h-full object-cover object-top animate-fade-in"
                          />
                        </div>
                      </Link>

                      {/* Details on Right */}
                      <div className="flex-1 flex flex-col min-w-0 pr-6">
                        {/* Brand */}
                        <p className="text-[10px] text-red-500 font-bold tracking-wider uppercase mb-0.5">
                          {item.product?.brand}
                        </p>

                        {/* Title */}
                        <Link
                          to={`/product/${item.product?._id}`}
                          className="text-gray-900 font-semibold text-sm hover:text-red-500 transition-colors line-clamp-2 leading-snug mb-1"
                        >
                          {item.product?.title}
                        </Link>

                        {/* Attributes (Size, Color) */}
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                          {item.size && (
                            <span className="flex items-center gap-1">
                              <span className="text-gray-400">Size:</span>
                              <span className="text-gray-900 font-medium">{item.size}</span>
                            </span>
                          )}
                          {item.size && item.color && <span className="w-1 h-1 rounded-full bg-gray-300" />}
                          {item.color && (
                            <span className="flex items-center gap-1">
                              <span className="text-gray-400">Color:</span>
                              <span className="text-gray-900 font-medium">{item.color}</span>
                            </span>
                          )}
                        </div>

                        {/* Price & Quantity Adjuster Row */}
                        <div className="flex items-center justify-between mt-auto">
                          {/* Quantity selector */}
                          <div className="flex items-center border border-gray-300 rounded bg-white">
                            <button
                              onClick={() => dispatch(updateCartItem({ itemId: item._id, quantity: item.quantity - 1 }))}
                              disabled={item.quantity <= 1}
                              className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-40"
                            >
                              <FiMinus size={12} />
                            </button>
                            <span className="w-8 text-center text-gray-900 font-bold text-xs border-x border-gray-300 py-1">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => dispatch(updateCartItem({ itemId: item._id, quantity: item.quantity + 1 }))}
                              disabled={item.quantity >= (item.product?.stock || 10)}
                              className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-40"
                            >
                              <FiPlus size={12} />
                            </button>
                          </div>

                          {/* Total price for this item */}
                          <div className="text-right">
                            <p className="text-gray-900 font-extrabold text-base">{formatPrice(item.price * item.quantity)}</p>
                            {item.quantity > 1 && (
                              <p className="text-gray-400 text-[10px] mt-0.5">{formatPrice(item.price)} each</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => dispatch(removeCartItem(item._id))}
                        className="absolute top-0 right-0 p-1 text-gray-400 hover:text-red-500 transition-colors"
                        title="Remove item"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>

                    <div className="hidden md:block h-px w-full bg-gray-100 mt-6" />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="pt-6">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors group"
              >
                <FiArrowRight className="rotate-180 transition-transform group-hover:-translate-x-1" size={16} />
                Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary Pane */}
          <div className="w-full lg:w-[360px] xl:w-[400px] shrink-0">
            <div className="bg-gray-50 border border-gray-200 p-6 sticky top-20">
              <h3 className="text-lg font-black text-gray-900 uppercase tracking-widest mb-6" style={{ fontFamily: 'Outfit, sans-serif' }}>Order Summary</h3>

              {/* Coupon Input */}
              <div className="mb-6">
                {cart?.coupon || appliedCoupon ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 p-3">
                    <div className="flex items-center gap-2">
                      <FiCheckCircle className="text-green-500" size={16} />
                      <div>
                        <p className="text-green-700 text-sm font-bold uppercase">{appliedCoupon?.code || 'Coupon'}</p>
                        <p className="text-green-600 text-xs">Applied successfully</p>
                      </div>
                    </div>
                    <button onClick={() => dispatch(removeCoupon())} className="text-gray-500 hover:text-gray-900 text-xs underline">
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={e => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Promo Code"
                      className="flex-1 border border-gray-300 px-3 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-gray-500 uppercase"
                    />
                    <button
                      type="submit"
                      disabled={!couponCode.trim()}
                      className="px-4 bg-gray-900 disabled:bg-gray-300 text-white text-xs font-bold uppercase tracking-wider transition-colors hover:bg-black"
                    >
                      Apply
                    </button>
                  </form>
                )}
              </div>

              {/* Breakdown */}
              <div className="space-y-3 mb-5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="text-gray-900 font-medium">{formatPrice(subtotal)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Shipping</span>
                  {shipping === 0 ? (
                    <span className="text-green-600 font-bold text-xs uppercase">FREE</span>
                  ) : (
                    <span className="text-gray-900 font-medium">{formatPrice(shipping)}</span>
                  )}
                </div>

                {shipping > 0 && (
                  <div className="bg-blue-50 border border-blue-100 p-3 text-center">
                    <p className="text-xs text-blue-700">
                      Add <span className="font-bold">{formatPrice(SHIPPING_THRESHOLD - subtotal)}</span> more for free shipping!
                    </p>
                  </div>
                )}

                {(couponDiscount || cart?.couponDiscount) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Discount</span>
                    <span className="text-red-500 font-medium">-{formatPrice(couponDiscount || cart?.couponDiscount)}</span>
                  </div>
                )}
              </div>

              <div className="h-px bg-gray-200 mb-5" />

              <div className="flex justify-between items-center mb-6">
                <span className="text-gray-900 font-bold">Total</span>
                <span className="text-gray-900 font-black text-2xl">{formatPrice(total)}</span>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-bold text-sm uppercase tracking-widest py-4 transition-colors flex items-center justify-center gap-2"
              >
                Checkout Securely <FiArrowRight size={18} />
              </button>

              <div className="mt-5 flex items-center justify-center gap-4 text-gray-400 text-xs">
                <span className="flex items-center gap-1"><FiShield size={13} /> 256-bit SSL</span>
                <span className="flex items-center gap-1"><FiCheckCircle size={13} /> Safe Pay</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Mobile Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-250 p-4 flex items-center justify-between z-30 md:hidden shadow-[0_-5px_15px_rgba(0,0,0,0.06)]">
        <div className="flex flex-col">
          <span className="text-[10px] text-gray-400 uppercase tracking-widest font-black leading-tight">Total Amount</span>
          <span className="text-xl text-gray-900 font-black tracking-tight">{formatPrice(total)}</span>
        </div>
        <button
          onClick={() => navigate('/checkout')}
          className="bg-red-500 hover:bg-red-650 active:scale-95 text-white font-bold text-xs uppercase tracking-widest px-6 py-3.5 flex items-center gap-2 rounded-sm transition-all shadow-md"
        >
          Checkout <FiArrowRight size={14} />
        </button>
      </div>
    </div>
  )
}
