import { useEffect, useState } from 'react'
import { useParams, Link, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiCheck, FiPackage, FiTruck, FiMapPin, FiArrowRight,
  FiX, FiClock, FiDownload, FiTrash2, FiHelpCircle,
  FiChevronDown, FiChevronUp, FiAlertCircle
} from 'react-icons/fi'
import { fetchOrder, cancelOrder } from '../redux/slices/orderSlice'

const TSS_TEAL = '#009688'
const SHIPPING_CHARGE = 50

const formatPrice = (p) => new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 0,
}).format(p)

const STATUS_STEPS = [
  { key: 'pending', label: 'Order Placed', icon: '🧾', desc: 'Your order has been confirmed.' },
  { key: 'processing', label: 'Being Packed', icon: '📦', desc: 'Seller is packing your items.' },
  { key: 'shipped', label: 'Shipped', icon: '🚚', desc: 'Your order is on the way!' },
  { key: 'delivered', label: 'Delivered', icon: '✅', desc: 'Order delivered successfully.' },
]
const STATUS_ORDER = ['pending', 'processing', 'shipped', 'delivered']

// Pure JS dynamic confetti generator
const triggerConfetti = () => {
  const container = document.createElement('div')
  container.style.position = 'fixed'
  container.style.top = '0'
  container.style.left = '0'
  container.style.width = '100vw'
  container.style.height = '100vh'
  container.style.pointerEvents = 'none'
  container.style.zIndex = '9999'
  container.style.overflow = 'hidden'
  document.body.appendChild(container)

  const colors = [
    '#009688', '#00bcd4', '#2196f3', '#4caf50',
    '#ffeb3b', '#ff9800', '#e91e63', '#9c27b0'
  ]

  for (let i = 0; i < 120; i++) {
    const confetti = document.createElement('div')
    confetti.style.position = 'absolute'
    confetti.style.width = `${Math.random() * 8 + 4}px`
    confetti.style.height = `${Math.random() * 12 + 6}px`
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]
    confetti.style.top = '-5%'
    confetti.style.left = `${Math.random() * 100}%`
    confetti.style.opacity = Math.random()
    confetti.style.transform = `rotate(${Math.random() * 360}deg)`
    confetti.style.borderRadius = '2px'

    const duration = Math.random() * 2.5 + 1.5
    confetti.style.transition = `transform ${duration}s linear, top ${duration}s linear, opacity ${duration}s linear`
    container.appendChild(confetti)

    setTimeout(() => {
      confetti.style.top = '105%'
      confetti.style.transform = `rotate(${Math.random() * 720}deg) translateX(${Math.random() * 80 - 40}px)`
      confetti.style.opacity = '0'
    }, 50)
  }

  setTimeout(() => {
    container.remove()
  }, 4000)
}

export default function OrderSuccess() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const location = useLocation()

  const { order, orderLoading } = useSelector((s) => s.orders)
  const isDetailsView = location.pathname.startsWith('/order/')

  const [hasFiredConfetti, setHasFiredConfetti] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('Ordered by mistake')
  const [customReason, setCustomReason] = useState('')
  const [cancelling, setCancelling] = useState(false)
  const [openFaq, setOpenFaq] = useState(null)

  useEffect(() => {
    if (id) dispatch(fetchOrder(id))
  }, [id, dispatch])

  // Fire confetti on successful checkout page mount
  useEffect(() => {
    if (order && !isDetailsView && !hasFiredConfetti && order.status !== 'cancelled') {
      triggerConfetti()
      setHasFiredConfetti(true)
    }
  }, [order, isDetailsView, hasFiredConfetti])

  if (orderLoading) {
    return (
      <div className="min-h-screen pt-4 flex items-center justify-center bg-[#f5f5f5]">
        <div className="w-8 h-8 border-[3px] border-gray-200 border-t-[#009688] rounded-full animate-spin" />
      </div>
    )
  }

  const currentIdx = order ? STATUS_ORDER.indexOf(order.status) : -1
  const isCancelled = order?.status === 'cancelled'
  const canCancel = order && ['pending', 'processing'].includes(order.status)

  const handleCancelOrder = async () => {
    setCancelling(true)
    const reason = cancelReason === 'Other' ? customReason : cancelReason
    try {
      await dispatch(cancelOrder({ id: order._id, reason })).unwrap()
      setShowCancelModal(false)
    } catch (_) {
      // Errors handled by slice/toast
    } finally {
      setCancelling(false)
    }
  }

  const handleDownloadInvoice = () => {
    if (!order) return

    const printWindow = window.open('', '_blank')
    const itemsHtml = order.items.map(item => `
      <tr>
        <td style="padding: 12px 10px; border-bottom: 1px solid #eee;">
          <strong style="color: #111;">${item.title}</strong><br>
          <span style="font-size: 11px; color: #666;">Size: ${item.size || 'N/A'} | Qty: ${item.quantity}</span>
        </td>
        <td style="padding: 12px 10px; border-bottom: 1px solid #eee; text-align: right;">${formatPrice(item.price)}</td>
        <td style="padding: 12px 10px; border-bottom: 1px solid #eee; text-align: right;">${formatPrice(item.price * item.quantity)}</td>
      </tr>
    `).join('')

    const invoiceHtml = `
      <html>
        <head>
          <title>Invoice - Order #${order.orderNumber}</title>
          <style>
            body { font-family: 'Segoe UI', Roboto, sans-serif; color: #333; margin: 40px; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #009688; padding-bottom: 20px; }
            .logo { font-size: 32px; font-weight: 900; color: #009688; letter-spacing: 1.5px; }
            .invoice-title { font-size: 20px; font-weight: 800; text-align: right; line-height: 1.4; }
            .details { display: flex; justify-content: space-between; margin-top: 40px; }
            .block { width: 45%; }
            .block h3 { border-bottom: 1px solid #e0e0e0; padding-bottom: 6px; margin-bottom: 12px; color: #555; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; }
            .block p { font-size: 13px; line-height: 1.6; margin: 0 0 4px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 40px; }
            th { background: #f9f9f9; padding: 12px 10px; text-align: left; font-size: 11px; text-transform: uppercase; border-bottom: 2px solid #ddd; letter-spacing: 0.5px; color: #555; }
            td { font-size: 13px; }
            .summary { float: right; width: 320px; margin-top: 30px; font-size: 13px; }
            .summary-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f5f5f5; }
            .summary-row.total { border-top: 2px solid #009688; font-weight: bold; font-size: 17px; padding-top: 12px; margin-top: 5px; border-bottom: none; }
            .footer { text-align: center; margin-top: 100px; font-size: 12px; color: #888; border-top: 1px solid #eee; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">AURA</div>
              <div style="font-size: 11px; color: #666; margin-top: 4px; font-weight: 600;">THE NEW STANDARD STREETWEAR</div>
            </div>
            <div class="invoice-title">
              RETAIL INVOICE<br>
              <span style="font-size: 13px; font-weight: normal; color: #555;">Order ID: #${order.orderNumber}</span><br>
              <span style="font-size: 13px; font-weight: normal; color: #555;">Date: ${new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
          </div>
          
          <div class="details">
            <div class="block">
              <h3>Shipping & Billing Address</h3>
              <p><strong>${order.shippingAddress?.name}</strong></p>
              <p>${order.shippingAddress?.addressLine1}</p>
              <p>${order.shippingAddress?.city}, ${order.shippingAddress?.state} - ${order.shippingAddress?.pincode}</p>
              <p>Phone: ${order.shippingAddress?.phone}</p>
            </div>
            <div class="block" style="text-align: right;">
              <h3>Payment & Summary</h3>
              <p>Payment Method: <strong>${order.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Paid Online (Razorpay)'}</strong></p>
              <p>Payment Status: <strong style="color: ${order.paymentStatus === 'paid' ? '#4caf50' : '#ff9800'}">${order.paymentStatus.toUpperCase()}</strong></p>
              ${order.razorpayPaymentId ? `<p>Payment ID: <code>${order.razorpayPaymentId}</code></p>` : ''}
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Product Information</th>
                <th style="text-align: right; width: 120px;">Unit Price</th>
                <th style="text-align: right; width: 120px;">Item Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <div class="summary">
            <div class="summary-row">
              <span>Items Total (MRP):</span>
              <span>${formatPrice(order.itemsTotal + (order.couponDiscount || 0))}</span>
            </div>
            ${order.couponDiscount > 0 ? `
            <div class="summary-row" style="color: #009688; font-weight: 600;">
              <span>Coupon Discount:</span>
              <span>- ${formatPrice(order.couponDiscount)}</span>
            </div>
            ` : ''}
            <div class="summary-row">
              <span>Shipping Fee:</span>
              <span>${order.shippingCharge === 0 ? 'FREE' : formatPrice(order.shippingCharge)}</span>
            </div>
            <div class="summary-row total">
              <span>Total Paid Amount:</span>
              <span>${formatPrice(order.totalAmount)}</span>
            </div>
          </div>
          
          <div style="clear: both;"></div>
          
          <div class="footer">
            <p>Thank you for choosing AURA!</p>
            <p>For return or support queries, please visit aura.com/support or write to support@aura.com</p>
            <p style="font-size: 10px; color: #aaa; margin-top: 15px;">This is a system-generated document. No signature required.</p>
          </div>
          
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `
    printWindow.document.write(invoiceHtml)
    printWindow.document.close()
  }

  const FAQS = [
    { q: "Can I modify my delivery address?", a: "Yes, you can request address changes if your order is still in the 'Placed' (pending) status. Simply contact support with your order number." },
    { q: "How do I return or exchange my items?", a: "AURA offers a hassle-free 15-day return policy. Once your status shows 'Delivered', you can initiate a return directly from the 'My Orders' portal." },
    { q: "When will I receive my refund?", a: "For cancelled or returned orders, online payments are refunded to the source account within 5-7 business days. COD orders are refunded via UPI or Bank Transfer." },
    { q: "Who can I contact for urgent issues?", a: "For urgent delivery or tracking inquiries, you can reach out directly to support@aura.com or phone our support hotline on +91 78776 13156." }
  ]

  return (
    <div className="min-h-screen bg-[#f5f5f5] pt-0">
      {/* Step progress bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-center gap-0">
          {['MY BAG', 'ADDRESS', 'PAYMENT'].map((s, i) => (
            <div key={s} className="flex items-center">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider sm:tracking-widest px-0.5 sm:px-1" style={{ color: TSS_TEAL, fontFamily: 'Outfit, sans-serif' }}>{s}</span>
              {i < 2 && (
                <div className="mx-1.5 sm:mx-3 h-[2px] w-6 sm:w-12 rounded-full bg-[#009688]" />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-5 items-start">

          {/* ── LEFT COLUMN ── */}
          <div className="flex-1 min-w-0 space-y-4 w-full">

            {/* Success/Cancelled Status Card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className={`p-5 border flex items-start gap-4 ${isCancelled ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}`}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.1, stiffness: 260 }}
                className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 border-4 ${isCancelled ? 'bg-red-100 border-red-400' : 'bg-green-100 border-green-500'
                  }`}
              >
                {isCancelled ? (
                  <FiX size={26} className="text-red-500" strokeWidth={2.5} />
                ) : (
                  <FiCheck size={26} className="text-green-600" strokeWidth={2.5} />
                )}
              </motion.div>
              <div>
                <h1 className="text-xl font-black text-gray-900 uppercase tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {isCancelled ? 'Order Cancelled' : isDetailsView ? 'Order Details' : 'ORDER PLACED SUCCESSFULLY! 🎉'}
                </h1>
                <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                  {isCancelled ? (
                    <span>Order <b>#{order?.orderNumber}</b> has been cancelled. {order?.cancellationReason && <span>Reason: <i>{order.cancellationReason}</i></span>}</span>
                  ) : (
                    <span>Thank you! Order <b>#{order?.orderNumber}</b> is confirmed. We will dispatch it shortly.</span>
                  )}
                </p>
                {!isCancelled && (
                  <p className="text-xs mt-2 font-bold flex items-center gap-1.5" style={{ color: TSS_TEAL }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                    Confirmation sent to {order?.user?.email || 'your email'}
                  </p>
                )}
              </div>
            </motion.div>

            {/* Order Items List */}
            {order && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-white border border-gray-200"
              >
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <p className="text-sm font-bold text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {order.items?.length} Item{order.items?.length !== 1 ? 's' : ''} Ordered
                  </p>
                  <span className={`text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded ${isCancelled
                      ? 'bg-red-100 text-red-600'
                      : order.status === 'delivered'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-teal-50 text-teal-700'
                    }`}>
                    {order.status}
                  </span>
                </div>
                <div className="divide-y divide-gray-100">
                  {order.items?.map((item, i) => (
                    <div key={i} className="flex gap-4 p-4 items-start hover:bg-gray-50 transition-colors">
                      <div className="w-[80px] h-[95px] bg-gray-100 border border-gray-100 overflow-hidden flex-shrink-0">
                        {item.image ? (
                          <img src={item.image} alt={item.title} className="w-full h-full object-cover object-top" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl text-gray-300">👕</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 line-clamp-2" style={{ fontFamily: 'Outfit, sans-serif' }}>{item.title}</p>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                          {item.size && <span className="border border-gray-200 px-2 py-0.5 bg-gray-50">Size: <b>{item.size}</b></span>}
                          <span className="border border-gray-200 px-2 py-0.5 bg-gray-50">Qty: <b>{item.quantity}</b></span>
                          {item.color && <span className="capitalize">{item.color}</span>}
                        </div>
                        {!isCancelled && (
                          <p className="text-xs text-gray-400 mt-2.5 flex items-center gap-1.5">
                            <FiClock size={12} className="text-gray-400" />
                            Est. delivery by{' '}
                            <span className="font-bold text-gray-700">
                              {new Date(new Date(order.createdAt).getTime() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </span>
                          </p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-black text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Tracking Stepper & Detailed History */}
            {order && !isCancelled && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="bg-white border border-gray-200 p-5 space-y-5"
              >
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <p className="text-xs font-black uppercase tracking-widest text-gray-500" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    TRACK SHIPMENT
                  </p>
                  {order.trackingNumber && (
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="text-gray-400">Tracking ID:</span>
                      <span className="font-mono font-bold text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded">{order.trackingNumber}</span>
                    </div>
                  )}
                </div>

                <div className="relative pt-2">
                  {/* Stepper progress line */}
                  <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-100">
                    <div
                      className="h-full transition-all duration-700"
                      style={{
                        width: `${Math.max(0, (currentIdx / (STATUS_STEPS.length - 1)) * 100)}%`,
                        backgroundColor: TSS_TEAL,
                      }}
                    />
                  </div>

                  {/* Stepper Circles */}
                  <div className="grid grid-cols-4 gap-2 relative">
                    {STATUS_STEPS.map((s, idx) => {
                      const done = currentIdx >= idx
                      const active = currentIdx === idx
                      const historyItem = order.statusHistory?.find(h => h.status === s.key)
                      const dateStr = historyItem
                        ? new Date(historyItem.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                        : idx === 0 ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : null

                      return (
                        <div key={s.key} className="flex flex-col items-center text-center">
                          <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-lg mb-2 transition-all duration-500 ${done ? 'border-[#009688] bg-[#009688]' : 'border-gray-200 bg-white'
                            }`}>
                            {done ? (
                              <FiCheck size={16} className="text-white" strokeWidth={3} />
                            ) : (
                              <span className="text-sm grayscale opacity-50">{s.icon}</span>
                            )}
                          </div>
                          <p className={`text-[10px] font-bold uppercase tracking-wider ${done ? 'text-gray-900' : 'text-gray-400'}`} style={{ fontFamily: 'Outfit, sans-serif' }}>
                            {s.label}
                          </p>
                          {dateStr && <p className="text-[9px] text-gray-400 mt-0.5">{dateStr}</p>}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Subtext about current status */}
                <div className="bg-teal-50/50 border border-teal-100/50 rounded p-3 flex items-center gap-3">
                  <FiTruck size={18} className="text-[#009688]" />
                  <div className="text-xs">
                    <p className="font-bold text-gray-800">
                      Current Status: {STATUS_STEPS[currentIdx]?.label || 'Processing'}
                    </p>
                    <p className="text-gray-500 mt-0.5">
                      {STATUS_STEPS[currentIdx]?.desc || 'Your order package is being prepared by our seller.'}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Delivery Address Details */}
            {order && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white border border-gray-200 p-4 flex items-start gap-3"
              >
                <FiMapPin size={18} className="text-[#009688] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>Delivery Address</p>
                  <p className="text-sm font-bold text-gray-900">{order.shippingAddress?.name}</p>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    {order.shippingAddress?.addressLine1}, {order.shippingAddress?.city}, {order.shippingAddress?.state} — {order.shippingAddress?.pincode}
                  </p>
                  {order.shippingAddress?.phone && (
                    <p className="text-xs text-gray-400 mt-1">📞 {order.shippingAddress.phone}</p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Action Buttons: Responsive & Fully Loaded */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="space-y-2 w-full"
            >
              {/* Primary Row: Shop & Invoice */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Link
                  to="/products"
                  className="py-3.5 text-center text-white font-black text-xs uppercase tracking-widest transition-all hover:bg-opacity-90 flex items-center justify-center gap-2"
                  style={{ backgroundColor: TSS_TEAL, fontFamily: 'Outfit, sans-serif' }}
                >
                  Continue Shopping <FiArrowRight size={14} />
                </Link>

                <button
                  onClick={handleDownloadInvoice}
                  className="py-3.5 border-2 text-center font-black text-xs uppercase tracking-widest transition-all hover:bg-gray-50 flex items-center justify-center gap-2"
                  style={{ borderColor: TSS_TEAL, color: TSS_TEAL, fontFamily: 'Outfit, sans-serif' }}
                >
                  <FiDownload size={14} /> Download Invoice
                </button>

                <Link
                  to="/my-orders"
                  className="py-3.5 border-2 border-gray-300 text-gray-700 text-center font-black text-xs uppercase tracking-widest transition-all hover:bg-gray-50 flex items-center justify-center gap-2"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  <FiPackage size={14} /> View All Orders
                </Link>
              </div>

              {/* Danger Row: Cancel Order if valid */}
              {canCancel && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="w-full py-3 border border-red-200 hover:border-red-300 bg-red-50/20 text-red-600 font-bold text-xs uppercase tracking-widest transition-all rounded hover:bg-red-50 flex items-center justify-center gap-2"
                >
                  <FiTrash2 size={13} /> Cancel Order
                </button>
              )}
            </motion.div>
          </div>

          {/* ── RIGHT COLUMN: Billing & FAQs ── */}
          {order && (
            <div className="w-full lg:w-[320px] flex-shrink-0 space-y-4 font-sans">

              {/* Billing details card */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white border border-gray-200"
              >
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    BILLING DETAILS
                  </p>
                </div>
                <div className="p-4 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-xs font-semibold">Cart Total</span>
                    <span className="text-gray-800 font-medium">{formatPrice(order.itemsTotal + (order.couponDiscount || 0))}</span>
                  </div>
                  {order.couponDiscount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-xs font-semibold">Coupon Savings</span>
                      <span className="font-semibold text-xs" style={{ color: TSS_TEAL }}>− {formatPrice(order.couponDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-xs font-semibold">Shipping Fee</span>
                    {order.shippingCharge === 0 ? (
                      <span className="font-bold text-xs text-[#009688]">FREE <span className="text-gray-400 line-through ml-1">₹{SHIPPING_CHARGE}</span></span>
                    ) : (
                      <span className="text-gray-800 font-medium">{formatPrice(order.shippingCharge)}</span>
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-xs font-semibold">Payment Method</span>
                    <span className="text-gray-700 capitalize text-xs font-semibold">
                      {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Razorpay (Online)'}
                    </span>
                  </div>

                  <div className="border-t border-gray-100 pt-2.5">
                    <div className="flex justify-between items-baseline">
                      <span className="text-gray-900 font-bold text-xs">Total Amount <span className="text-[9px] font-normal text-gray-400">(GST Incl.)</span></span>
                      <span className="font-black text-lg text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>{formatPrice(order.totalAmount)}</span>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-3 mt-1">
                    <div className={`flex items-center gap-2 p-2 text-xs font-semibold rounded ${order.paymentStatus === 'paid'
                        ? 'bg-green-50 border border-green-100 text-green-700'
                        : 'bg-yellow-50 border border-yellow-100 text-yellow-700'
                      }`}>
                      <div className={`w-2 h-2 rounded-full ${order.paymentStatus === 'paid' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500 animate-bounce'}`} />
                      Payment Status: <span className="capitalize ml-0.5 font-bold">{order.paymentStatus}</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Customer Help & Accordion FAQs */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white border border-gray-200"
              >
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                  <FiHelpCircle className="text-gray-500" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    SUPPORT & FAQS
                  </p>
                </div>
                <div className="divide-y divide-gray-100">
                  {FAQS.map((faq, idx) => {
                    const open = openFaq === idx
                    return (
                      <div key={idx} className="p-3">
                        <button
                          onClick={() => setOpenFaq(open ? null : idx)}
                          className="w-full flex justify-between items-start text-left text-xs font-bold text-gray-700 hover:text-teal-600 transition-colors"
                        >
                          <span className="pr-4 leading-tight">{faq.q}</span>
                          {open ? <FiChevronUp className="flex-shrink-0" /> : <FiChevronDown className="flex-shrink-0" />}
                        </button>
                        <AnimatePresence initial={false}>
                          {open && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <p className="text-[11px] text-gray-500 mt-2 leading-relaxed pl-1 border-l-2 border-teal-500 bg-teal-50/20 p-1.5">
                                {faq.a}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )
                  })}
                </div>
              </motion.div>

            </div>
          )}

        </div>
      </div>

      {/* ── CANCEL ORDER MODAL (Glassmorphism overlay & elegant dialog) ── */}
      <AnimatePresence>
        {showCancelModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCancelModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white max-w-md w-full p-6 rounded relative z-10 border border-gray-100 shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3 text-red-600">
                <FiAlertCircle size={22} />
                <h3 className="text-lg font-black uppercase tracking-wide" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Cancel Your Order?
                </h3>
              </div>

              <p className="text-xs text-gray-500 leading-relaxed">
                We begin processing orders immediately. Are you sure you want to cancel order <b>#{order?.orderNumber}</b>? Stock will be restored automatically.
              </p>

              {/* Reasons Selection */}
              <div className="space-y-3 font-sans">
                <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">
                  Select Cancellation Reason
                </label>
                <div className="space-y-2">
                  {[
                    'Ordered by mistake',
                    'Changed my mind / Want to purchase something else',
                    'Incorrect size or color selected',
                    'Delivery time is too long',
                    'Other'
                  ].map((reason) => (
                    <label
                      key={reason}
                      className={`flex items-start gap-2.5 p-2.5 border rounded cursor-pointer transition-all ${cancelReason === (reason === 'Other' ? 'Other' : reason)
                          ? 'border-[#009688] bg-teal-50/20'
                          : 'border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                      <input
                        type="radio"
                        name="cancel_reason"
                        value={reason === 'Other' ? 'Other' : reason}
                        checked={cancelReason === (reason === 'Other' ? 'Other' : reason)}
                        onChange={(e) => setCancelReason(e.target.value)}
                        className="mt-0.5 text-teal-600 focus:ring-[#009688]"
                      />
                      <span className="text-xs text-gray-700 leading-tight">{reason}</span>
                    </label>
                  ))}
                </div>

                {/* Custom reason textbox */}
                {cancelReason === 'Other' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="pt-1.5"
                  >
                    <textarea
                      placeholder="Please tell us why you are cancelling..."
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                      rows={3}
                      className="w-full text-xs p-2 border border-gray-300 focus:outline-none focus:border-[#009688] rounded"
                      required
                    />
                  </motion.div>
                )}
              </div>

              {/* Confirm Buttons */}
              <div className="flex gap-2.5 pt-2">
                <button
                  onClick={() => setShowCancelModal(false)}
                  disabled={cancelling}
                  className="flex-1 py-2.5 border-2 border-gray-200 text-gray-700 hover:bg-gray-50 font-bold text-xs uppercase tracking-widest transition-all rounded"
                >
                  Go Back
                </button>
                <button
                  onClick={handleCancelOrder}
                  disabled={cancelling || (cancelReason === 'Other' && !customReason.trim())}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-widest transition-all rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                >
                  {cancelling ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Confirm Cancel</span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
