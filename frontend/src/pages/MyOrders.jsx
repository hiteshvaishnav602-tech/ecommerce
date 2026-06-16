import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiPackage, FiChevronRight, FiX, FiSearch, FiRefreshCw, FiShoppingBag, FiInfo } from 'react-icons/fi'
import { fetchMyOrders, cancelOrder } from '../redux/slices/orderSlice'
import { addToCart } from '../redux/slices/cartSlice'
import toast from 'react-hot-toast'

const formatPrice = (p) => new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 0,
}).format(p)

const STATUS_COLORS = {
  pending: 'bg-amber-50 text-amber-700 border border-amber-250',
  processing: 'bg-blue-50 text-blue-700 border border-blue-250',
  shipped: 'bg-indigo-50 text-indigo-700 border border-indigo-250',
  delivered: 'bg-emerald-50 text-emerald-700 border border-emerald-250',
  cancelled: 'bg-rose-50 text-rose-700 border border-rose-250',
}

const STATUS_ICONS = {
  pending: '⏳',
  processing: '🔄',
  shipped: '🚚',
  delivered: '✅',
  cancelled: '❌',
}

const getActiveStepIndex = (status) => {
  if (status === 'pending') return 0;
  if (status === 'processing') return 1;
  if (status === 'shipped') return 2;
  if (status === 'delivered') return 3;
  return -1; // cancelled
}

export default function MyOrdersPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { orders, loading, total } = useSelector((s) => s.orders)

  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    dispatch(fetchMyOrders())
  }, [dispatch])

  const handleCancel = (orderId) => {
    if (confirm('Are you sure you want to cancel this order?')) {
      dispatch(cancelOrder({ id: orderId, reason: 'Cancelled by customer' }))
        .unwrap()
        .then(() => toast.success('Order cancelled successfully'))
        .catch(() => toast.error('Failed to cancel order'))
    }
  }

  const handleReorder = async (e, order) => {
    e.preventDefault()
    e.stopPropagation()
    const loadingToastId = toast.loading('Adding past items back to cart...')
    try {
      for (const item of order.items) {
        await dispatch(addToCart({
          productId: item.product?._id || item.product,
          quantity: item.quantity,
          size: item.size || '',
          color: item.color || '',
        })).unwrap()
      }
      toast.success('All items added! Redirecting to checkout...', { id: loadingToastId })
      navigate('/cart')
    } catch (err) {
      toast.error('Reorder failed: Some products may be out of stock', { id: loadingToastId })
    }
  }

  const filteredOrders = orders.filter((order) => {
    // 1. Filter by Tab
    if (activeTab === 'active') {
      if (!['pending', 'processing', 'shipped'].includes(order.status)) return false;
    } else if (activeTab === 'delivered') {
      if (order.status !== 'delivered') return false;
    } else if (activeTab === 'cancelled') {
      if (order.status !== 'cancelled') return false;
    }

    // 2. Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchOrderNum = (order.orderNumber || '').toLowerCase().includes(q);
      const matchProduct = order.items.some((item) => (item.title || '').toLowerCase().includes(q));
      return matchOrderNum || matchProduct;
    }

    return true;
  });

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen pt-0 flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-[#e11b23] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-0 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 lg:py-16">

        {/* Header Block */}
        <div className="text-center md:text-left md:flex items-end justify-between border-b border-gray-200 pb-6 mb-8">
          <div>
            <h1
              className="text-3xl sm:text-4xl font-black text-[#0f2a4a] uppercase tracking-wider flex items-center justify-center md:justify-start gap-3"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              <FiPackage className="text-[#147e85]" />
              MY ORDERS
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">Manage and track your streetwear purchases</p>
          </div>
          <span
            className="inline-block mt-3 md:mt-0 px-4 py-1.5 bg-[#e8f6f8] text-[#147e85] font-extrabold text-xs uppercase tracking-wider rounded-full"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            {total} {total === 1 ? 'Order' : 'Orders'}
          </span>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20 bg-white border border-gray-150 rounded-3xl shadow-xl px-6">
            <div className="text-8xl mb-6">📦</div>
            <h2 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-wide" style={{ fontFamily: 'Outfit, sans-serif' }}>
              No orders yet
            </h2>
            <p className="text-gray-500 text-sm mb-8">Start shopping to see your streetwear orders here.</p>
            <Link
              to="/products"
              className="inline-flex items-center justify-center gap-2 bg-gray-900 hover:bg-[#e11b23] text-white font-bold text-xs uppercase tracking-widest py-4 px-8 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              Shop Now
            </Link>
          </div>
        ) : (
          <div className="space-y-6">

            {/* Search & Filter Controls Panel */}
            <div className="bg-white border border-gray-150 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                {/* Search Input Group */}
                <div className="relative flex-1 min-w-[260px] group">
                  <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#e11b23] transition-colors" size={16} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by Order # or Product name..."
                    className="w-full border border-gray-200 rounded-full pl-10 pr-4 py-2.5 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#e11b23] focus:ring-4 focus:ring-[#e11b23]/10 transition-all text-xs font-semibold"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-650"
                    >
                      <FiX size={14} />
                    </button>
                  )}
                </div>

                {/* Filter Tabs list */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'active', label: 'Active' },
                    { id: 'delivered', label: 'Delivered' },
                    { id: 'cancelled', label: 'Cancelled' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${activeTab === tab.id
                          ? 'bg-gray-900 text-white border-gray-900'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-450 hover:text-gray-900'
                        }`}
                      style={{ fontFamily: 'Outfit, sans-serif' }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Orders List container */}
            <div className="space-y-6">
              <AnimatePresence mode="popLayout">
                {filteredOrders.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-16 bg-white border border-gray-150 rounded-2xl p-6"
                  >
                    <div className="text-5xl mb-4">🔍</div>
                    <p className="text-gray-500 text-sm font-semibold">No orders matched your filters.</p>
                  </motion.div>
                ) : (
                  filteredOrders.map((order, i) => (
                    <motion.div
                      key={order._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-white border border-gray-150 shadow-md hover:shadow-lg rounded-2xl p-6 transition-all duration-300"
                    >
                      {/* Top bar info */}
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-100">
                        <div>
                          <p className="text-gray-900 font-extrabold text-sm sm:text-base">Order #{order.orderNumber}</p>
                          <p className="text-gray-500 text-xs mt-0.5 font-medium">
                            Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                              year: 'numeric', month: 'long', day: 'numeric',
                            })}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider border ${STATUS_COLORS[order.status]}`}
                            style={{ fontFamily: 'Outfit, sans-serif' }}
                          >
                            {STATUS_ICONS[order.status]} {order.status}
                          </span>
                          <span className="text-gray-950 font-black text-base sm:text-lg">{formatPrice(order.totalAmount)}</span>
                        </div>
                      </div>

                      {/* Items Preview */}
                      <div className="flex items-center gap-4 mb-6 overflow-x-auto no-scrollbar">
                        {order.items.slice(0, 4).map((item, idx) => (
                          <div key={idx} className="flex-shrink-0 relative">
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-16 h-16 rounded-xl object-cover border border-gray-100"
                            />
                            {item.quantity > 1 && (
                              <span className="absolute -top-1.5 -right-1.5 bg-[#e11b23] text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                                {item.quantity}
                              </span>
                            )}
                          </div>
                        ))}
                        {order.items.length > 4 && (
                          <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-150 flex items-center justify-center text-gray-500 font-extrabold text-xs">
                            +{order.items.length - 4}
                          </div>
                        )}
                        <div className="flex-1 min-w-0 ml-2">
                          <p className="text-gray-900 text-sm font-semibold truncate leading-snug">{order.items[0]?.title}</p>
                          {order.items.length > 1 && (
                            <p className="text-gray-500 text-xs font-semibold mt-0.5">+{order.items.length - 1} more items</p>
                          )}
                          <p className="text-gray-400 text-[10px] mt-1.5 font-bold uppercase tracking-wider">
                            Method: {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                          </p>
                        </div>
                      </div>

                      {/* Visual Status Progress Tracker */}
                      {order.status !== 'cancelled' ? (
                        <div className="my-6 px-1 sm:px-2">
                          {/* Step Labels */}
                          <div className="flex justify-between text-[9px] sm:text-xs font-black text-gray-400 mb-3 uppercase tracking-widest">
                            <span className={getActiveStepIndex(order.status) >= 0 ? "text-[#147e85]" : ""}>Placed</span>
                            <span className={getActiveStepIndex(order.status) >= 1 ? "text-[#147e85]" : ""}>Processing</span>
                            <span className={getActiveStepIndex(order.status) >= 2 ? "text-[#147e85]" : ""}>Shipped</span>
                            <span className={getActiveStepIndex(order.status) >= 3 ? "text-[#147e85]" : ""}>Delivered</span>
                          </div>

                          {/* Bar Graphics */}
                          <div className="relative flex items-center justify-between">
                            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-gray-100 z-0 rounded-full" />
                            <div
                              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#147e85] z-0 rounded-full transition-all duration-500"
                              style={{
                                width: `${(getActiveStepIndex(order.status) / 3) * 100}%`
                              }}
                            />

                            {[0, 1, 2, 3].map((stepIdx) => {
                              const isCompleted = getActiveStepIndex(order.status) >= stepIdx;
                              return (
                                <div key={stepIdx} className="relative z-10">
                                  <div
                                    className={`w-5.5 h-5.5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center border-2 transition-all ${isCompleted
                                        ? 'bg-white border-[#147e85] text-[#147e85] scale-105 shadow-sm'
                                        : 'bg-white border-gray-200 text-gray-300'
                                      }`}
                                  >
                                    {isCompleted ? (
                                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                                        <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                                      </svg>
                                    ) : (
                                      <div className="w-1.5 h-1.5 bg-gray-200 rounded-full" />
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="my-6 p-4 bg-rose-50 border border-rose-100 rounded-xl text-left flex items-start gap-3">
                          <div className="p-1.5 bg-rose-100 text-rose-600 rounded-lg shrink-0 mt-0.5">
                            <FiInfo size={16} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-rose-800 text-xs font-black uppercase tracking-wider">
                              ORDER CANCELLED
                            </p>
                            {order.cancellationReason && (
                              <p className="text-gray-650 text-xs mt-1 font-semibold">
                                Reason: "{order.cancellationReason}"
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Footer Actions */}
                      <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-6">
                        <div className="flex items-center gap-5">
                          <Link
                            to={`/order/${order._id}`}
                            className="flex items-center gap-1 text-[#147e85] hover:text-[#0f6065] text-xs font-black uppercase tracking-wider transition-colors"
                            style={{ fontFamily: 'Outfit, sans-serif' }}
                          >
                            View Details <FiChevronRight size={14} className="mt-px" />
                          </Link>
                          {order.status !== 'cancelled' && (
                            <button
                              onClick={(e) => handleReorder(e, order)}
                              className="flex items-center gap-1.5 text-gray-700 hover:text-[#e11b23] text-xs font-black uppercase tracking-wider transition-colors"
                              style={{ fontFamily: 'Outfit, sans-serif' }}
                            >
                              <FiRefreshCw size={13} /> Buy Again
                            </button>
                          )}
                        </div>
                        {['pending', 'processing'].includes(order.status) && (
                          <button
                            onClick={() => handleCancel(order._id)}
                            className="flex items-center gap-1.5 text-red-500 hover:text-red-750 text-xs font-black uppercase tracking-wider transition-colors"
                            style={{ fontFamily: 'Outfit, sans-serif' }}
                          >
                            <FiX size={14} /> Cancel Order
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

          </div>
        )}
      </div>
    </div>
  )
}
