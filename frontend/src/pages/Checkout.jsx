import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiMapPin, FiCheck, FiTruck, FiTag, FiChevronDown,
  FiMail, FiUser, FiPlus, FiX, FiShoppingBag,
  FiCreditCard, FiSmartphone, FiAlertCircle, FiDollarSign,
  FiEdit2, FiTrash2
} from 'react-icons/fi'
import { createOrder, createPaymentOrder, verifyPayment } from '../redux/slices/orderSlice'
import { selectCartSubtotal, applyCoupon, removeCoupon } from '../redux/slices/cartSlice'
import { addAddress, updateAddress, deleteAddress } from '../redux/slices/authSlice'
import toast from 'react-hot-toast'
import api from '../services/api'
import { useForm } from 'react-hook-form'

const TSS_TEAL = '#009688'

const formatPrice = (p) => new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 0,
}).format(p)

const SHIPPING_THRESHOLD = 499
const SHIPPING_CHARGE = 50

// ─── Step Progress Bar (TSS style) ───────────────────────────────────────────
function StepBar({ step }) {
  const steps = ['MY BAG', 'ADDRESS', 'PAYMENT']
  const currentIdx = step === 1 ? 1 : 2
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-center gap-0">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center">
            <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider sm:tracking-widest px-0.5 sm:px-1 transition-colors duration-200 ${i <= currentIdx ? 'text-[#009688]' : 'text-gray-400'
              }`} style={{ fontFamily: 'Outfit, sans-serif' }}>
              {s}
            </span>
            {i < steps.length - 1 && (
              <div className={`mx-1.5 sm:mx-3 h-[2px] w-6 sm:w-12 rounded-full transition-colors duration-200 ${i < currentIdx ? 'bg-[#009688]' : 'bg-gray-200'
                }`} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Accordion Row ────────────────────────────────────────────────────────────
function AccordionRow({ icon, label, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {icon && <span className="text-gray-500">{icon}</span>}
          <span className="text-sm font-semibold text-gray-800">{label}</span>
        </div>
        <FiChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
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
            <div className="px-4 pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function CheckoutPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { cart, couponDiscount: reduxCouponDiscount, appliedCoupon } = useSelector((s) => s.cart)
  const { user } = useSelector((s) => s.auth)
  const { orderLoading } = useSelector((s) => s.orders)
  const subtotal = useSelector(selectCartSubtotal)
  const { register, handleSubmit, formState: { errors }, reset } = useForm()

  // step: 1 = Address+Summary, 2 = Payment
  const [step, setStep] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [showMockModal, setShowMockModal] = useState(false)
  const [mockPaymentData, setMockPaymentData] = useState(null)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [editAddressId, setEditAddressId] = useState(null)
  const [couponCode, setCouponCode] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false) // prevent cart-empty redirect mid-payment

  const [selectedAddressId, setSelectedAddressId] = useState(
    user?.addresses?.length > 0 ? user.addresses[0]._id : null
  )
  const [shippingAddress, setShippingAddress] = useState(
    user?.addresses?.length > 0 ? user.addresses[0] : null
  )

  useEffect(() => {
    if (user?.addresses?.length > 0 && !shippingAddress) {
      setSelectedAddressId(user.addresses[0]._id)
      setShippingAddress(user.addresses[0])
    }
  }, [user, shippingAddress])

  // Load Razorpay script dynamically
  useEffect(() => {
    const existing = document.getElementById('razorpay-script')
    if (!existing) {
      const script = document.createElement('script')
      script.id = 'razorpay-script'
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.async = true
      document.body.appendChild(script)
    }
  }, [])

  const items = cart?.items || []
  const shipping = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_CHARGE
  const couponDiscount = reduxCouponDiscount || cart?.couponDiscount || 0
  const totalMrp = items.reduce((acc, item) => {
    const mrp = (item.product?.price && item.product.price > item.price) ? item.product.price : item.price
    return acc + mrp * item.quantity
  }, 0)
  const productDiscountSavings = totalMrp - subtotal
  const total = subtotal + shipping - couponDiscount

  const handleApplyCoupon = async (e) => {
    e.preventDefault()
    if (!couponCode.trim()) return
    setCouponLoading(true)
    await dispatch(applyCoupon(couponCode))
    setCouponLoading(false)
    setCouponCode('')
  }

  const handleAddressSubmit = async (data) => {
    const newAddr = {
      name: data.name, phone: data.phone,
      addressLine1: data.addressLine1, addressLine2: data.addressLine2,
      city: data.city, state: data.state, pincode: data.pincode,
    }
    if (editAddressId) {
      try {
        const actionResult = await dispatch(updateAddress({ id: editAddressId, address: newAddr }))
        if (!actionResult.error) {
          const addrs = actionResult.payload
          const updated = addrs?.find(a => a._id === editAddressId)
          if (updated) {
            setShippingAddress(updated)
          }
        }
      } catch { toast.error('Failed to update address') }
      setEditAddressId(null)
    } else if (data.saveAddress) {
      try {
        const actionResult = await dispatch(addAddress(newAddr))
        if (!actionResult.error) {
          const addrs = actionResult.payload
          if (addrs?.length > 0) {
            const added = addrs[addrs.length - 1]
            setSelectedAddressId(added._id)
            setShippingAddress(added)
          }
        }
      } catch { toast.error('Failed to save address') }
    } else {
      setShippingAddress(newAddr)
    }
    reset()
    setShowAddressForm(false)
  }

  const handleEditAddress = (addr) => {
    setEditAddressId(addr._id)
    reset({
      name: addr.name,
      phone: addr.phone,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2 || '',
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      saveAddress: true
    })
  }

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return
    try {
      const actionResult = await dispatch(deleteAddress(id))
      if (!actionResult.error) {
        if (selectedAddressId === id) {
          const remainingAddrs = actionResult.payload || []
          if (remainingAddrs.length > 0) {
            setSelectedAddressId(remainingAddrs[0]._id)
            setShippingAddress(remainingAddrs[0])
          } else {
            setSelectedAddressId(null)
            setShippingAddress(null)
          }
        }
      }
    } catch {
      toast.error('Failed to delete address')
    }
  }

  const toggleAddressForm = () => {
    if (showAddressForm) {
      reset()
      setEditAddressId(null)
    }
    setShowAddressForm(!showAddressForm)
  }

  const handleMockPaymentSuccess = async () => {
    if (!mockPaymentData) return
    const verifyResult = await dispatch(verifyPayment({
      razorpay_order_id: mockPaymentData.razorpayOrderId,
      razorpay_payment_id: `pay_mock_${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      razorpay_signature: 'mock_signature_success',
      orderId: mockPaymentData.orderId,
    }))
    if (!verifyResult.error) {
      setShowMockModal(false)
      navigate(`/order-success/${mockPaymentData.orderId}`)
    }
  }

  const handlePlaceOrder = async () => {
    if (!shippingAddress) {
      toast.error('Please select a delivery address')
      setStep(1)
      return
    }
    setOrderPlaced(true) // prevent cart-empty redirect
    const result = await dispatch(createOrder({ shippingAddress, paymentMethod }))
    if (!result.error) {
      const order = result.payload.order
      if (paymentMethod === 'cod') {
        navigate(`/order-success/${order._id}`)
        return
      }
      try {
        const { data: keyData } = await api.get('/payment/key')
        const paymentResult = await dispatch(createPaymentOrder(order._id))
        if (paymentResult.error) return
        const { razorpayOrder } = paymentResult.payload
        if (keyData.key === 'rzp_test_demo') {
          setMockPaymentData({ orderId: order._id, razorpayOrderId: razorpayOrder.id, totalAmount: order.totalAmount, orderNumber: order.orderNumber })
          setShowMockModal(true)
          return
        }
        const isLocalHost =
          window.location.hostname === 'localhost' ||
          window.location.hostname === '127.0.0.1' ||
          window.location.hostname.startsWith('192.168.') ||
          window.location.hostname.startsWith('10.') ||
          window.location.hostname.startsWith('172.')

        const logoUrl = isLocalHost
          ? 'https://placehold.co/200x200/009688/ffffff?text=AURA'
          : window.location.origin + '/logo.png'

        const options = {
          key: keyData.key, amount: razorpayOrder.amount, currency: 'INR',
          name: 'AURA', description: `Order ${order.orderNumber}`, image: logoUrl,
          order_id: razorpayOrder.id,
          handler: async (response) => {
            const vr = await dispatch(verifyPayment({ ...response, orderId: order._id }))
            if (!vr.error) navigate(`/order-success/${order._id}`)
          },
          prefill: { name: user?.name, email: user?.email, contact: shippingAddress?.phone },
          theme: { color: TSS_TEAL },
        }
        new window.Razorpay(options).open()
      } catch { toast.error('Payment initialization failed') }
    }
  }

  if (items.length === 0 && !orderPlaced) { navigate('/cart'); return null }

  // ─── Billing Sidebar ─────────────────────────────────────────────────────────
  const BillingSidebar = ({ showButton = true }) => (
    <div className="bg-white border border-gray-200">
      {/* Coupon Section */}
      {step === 1 && (
        <div className="border-b border-gray-200">
          <AccordionRow icon={<FiTag size={16} />} label="Apply Coupon">
            {(appliedCoupon || cart?.coupon) ? (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 p-3 rounded">
                <div className="flex items-center gap-2">
                  <FiCheck size={14} className="text-green-600" />
                  <div>
                    <p className="text-green-700 text-xs font-bold uppercase">{appliedCoupon?.code || 'Coupon Applied'}</p>
                    <p className="text-green-600 text-[10px]">Saving {formatPrice(couponDiscount)}</p>
                  </div>
                </div>
                <button onClick={() => dispatch(removeCoupon())} className="text-gray-400 hover:text-teal-500 p-1">
                  <FiX size={13} />
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text" value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Enter coupon code"
                  className="flex-1 border border-gray-300 px-3 py-2 text-sm text-gray-700 uppercase focus:outline-none focus:border-[#009688] transition-colors"
                />
                <button type="submit" disabled={!couponCode.trim() || couponLoading}
                  className="px-4 bg-[#009688] disabled:bg-gray-300 text-white text-xs font-bold uppercase tracking-wider transition-colors hover:bg-[#00796b]">
                  {couponLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Apply'}
                </button>
              </form>
            )}
          </AccordionRow>
        </div>
      )}

      {/* Billing Details */}
      <div className="p-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
          BILLING DETAILS
        </p>
        <div className="space-y-2.5 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Cart Total <span className="text-[10px] text-gray-400">(incl. of all taxes)</span></span>
            <span className="text-gray-900 font-medium">{formatPrice(totalMrp)}</span>
          </div>
          {productDiscountSavings > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Product Discount</span>
              <span className="text-[#009688] font-semibold">− {formatPrice(productDiscountSavings)}</span>
            </div>
          )}
          {couponDiscount > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Coupon Savings</span>
              <span className="text-[#009688] font-semibold">− {formatPrice(couponDiscount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-600">Shipping Charges</span>
            <div className="text-right">
              {shipping === 0
                ? <span className="text-[#009688] font-bold text-xs">Free <span className="text-gray-400 line-through ml-1">₹{SHIPPING_CHARGE}</span></span>
                : <span className="text-gray-900 font-medium">{formatPrice(shipping)}</span>
              }
            </div>
          </div>
          <div className="border-t border-gray-200 pt-2.5 mt-1">
            <div className="flex justify-between">
              <span className="text-gray-900 font-bold text-sm">Total Amount <span className="text-[10px] font-normal text-gray-400">(Incl. of GST)</span></span>
              <span className="text-gray-900 font-black text-base" style={{ fontFamily: 'Outfit, sans-serif' }}>{formatPrice(Math.max(0, total))}</span>
            </div>
          </div>
        </div>

        {showButton && (
          <button
            onClick={step === 1 ? () => { if (!shippingAddress) { toast.error('Select a delivery address'); return } setStep(2) } : handlePlaceOrder}
            disabled={orderLoading}
            className="w-full mt-4 py-3.5 text-white font-black text-sm uppercase tracking-widest transition-all disabled:opacity-60 flex items-center justify-center gap-2 hover:opacity-90"
            style={{ backgroundColor: TSS_TEAL, fontFamily: 'Outfit, sans-serif' }}
          >
            {orderLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : step === 1 ? (
              'PROCEED TO PAYMENT'
            ) : (
              'CONFIRM ORDER'
            )}
          </button>
        )}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#f5f5f5] pt-0 pb-24 md:pb-8">
      <StepBar step={step} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 lg:py-8">
        <div className="flex flex-col lg:flex-row gap-5 lg:items-start">

          {/* ── LEFT COLUMN ── */}
          <div className="w-full flex-1 min-w-0 space-y-4">

            {/* Delivery Address Card */}
            <div className="bg-white border border-gray-200">
              <div className="px-4 py-3.5 flex items-start justify-between gap-4">
                <div className="flex items-start gap-2.5 min-w-0">
                  <FiMapPin size={15} className="mt-0.5 flex-shrink-0 text-gray-500" />
                  <div className="min-w-0">
                    {shippingAddress ? (
                      <>
                        <p className="text-sm font-bold text-gray-900">
                          Deliver To: {shippingAddress.name},&nbsp;
                          <span className="font-normal text-gray-700">{shippingAddress.pincode}</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                          {shippingAddress.addressLine1}
                          {shippingAddress.addressLine2 ? `, ${shippingAddress.addressLine2}` : ''}<br />
                          {shippingAddress.city}, {shippingAddress.state}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-1">📞 {shippingAddress.phone}</p>
                      </>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No address selected</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={toggleAddressForm}
                  className="text-sm font-bold flex-shrink-0 transition-colors hover:opacity-80"
                  style={{ color: TSS_TEAL }}
                >
                  {showAddressForm ? 'CANCEL' : 'CHANGE'}
                </button>
              </div>

              {/* Address change panel */}
              <AnimatePresence initial={false}>
                {showAddressForm && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden border-t border-gray-100"
                  >
                    <div className="p-4 space-y-4">
                      {/* Saved addresses */}
                      {user?.addresses?.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400" style={{ fontFamily: 'Outfit, sans-serif' }}>Saved Addresses</p>
                          {user.addresses.map((addr) => {
                            const isSelected = selectedAddressId === addr._id
                            return (
                              <div
                                key={addr._id}
                                className={`flex items-start justify-between gap-3 p-3 border cursor-pointer transition-colors ${isSelected ? 'border-[#009688] bg-teal-50/40' : 'border-gray-200 hover:border-gray-300'}`}
                                onClick={() => { setSelectedAddressId(addr._id); setShippingAddress(addr) }}
                              >
                                <div className="flex items-start gap-3">
                                  <input
                                    type="radio" name="savedAddr" checked={isSelected}
                                    onChange={() => { setSelectedAddressId(addr._id); setShippingAddress(addr) }}
                                    className="mt-0.5 accent-[#009688]"
                                  />
                                  <div>
                                    <p className="text-sm font-semibold text-gray-900">{addr.name} <span className="font-normal text-gray-500">— {addr.pincode}</span></p>
                                    <p className="text-xs text-gray-500 mt-0.5">{addr.addressLine1}, {addr.city}, {addr.state}</p>
                                    <p className="text-[11px] text-gray-400 mt-0.5">📞 {addr.phone}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleEditAddress(addr);
                                    }}
                                    className="p-1.5 text-gray-400 hover:text-[#009688] hover:bg-gray-150 rounded transition-colors"
                                    title="Edit Address"
                                  >
                                    <FiEdit2 size={13} />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleDeleteAddress(addr._id);
                                    }}
                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-gray-150 rounded transition-colors"
                                    title="Delete Address"
                                  >
                                    <FiTrash2 size={13} />
                                  </button>
                                </div>
                              </div>
                            )
                          })}
                          <button
                            onClick={() => { setShowAddressForm(false) }}
                            className="w-full py-2.5 text-white text-xs font-black uppercase tracking-widest transition-all hover:opacity-90"
                            style={{ backgroundColor: TSS_TEAL, fontFamily: 'Outfit, sans-serif' }}
                          >
                            DELIVER HERE
                          </button>
                        </div>
                      )}

                      {/* New address form */}
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 mb-3" style={{ color: TSS_TEAL }}>
                          {editAddressId ? (
                            <>
                              <FiEdit2 size={13} /> Edit Address
                            </>
                          ) : (
                            <>
                              <FiPlus size={13} /> Add New Address
                            </>
                          )}
                        </p>
                        <form onSubmit={handleSubmit(handleAddressSubmit)} className="space-y-3 border border-gray-200 p-4 bg-gray-50">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Full Name *</label>
                              <input 
                                {...register('name', { required: 'Full name is required' })} 
                                className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#009688] bg-white" 
                                placeholder="Full Name" 
                              />
                              {errors.name && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.name.message}</p>}
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Phone *</label>
                              <input 
                                {...register('phone', { 
                                  required: 'Phone number is required',
                                  pattern: {
                                    value: /^[6-9]\d{9}$/,
                                    message: 'Must be 10 digits starting with 6-9'
                                  }
                                })} 
                                onInput={(e) => {
                                  e.target.value = e.target.value.replace(/[^0-9]/g, '');
                                }}
                                maxLength={10}
                                className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#009688] bg-white" 
                                placeholder="10-digit number" 
                              />
                              {errors.phone && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.phone.message}</p>}
                            </div>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Address Line 1 *</label>
                            <input 
                              {...register('addressLine1', { required: 'Address is required' })} 
                              className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#009688] bg-white" 
                              placeholder="Flat, House no., Street" 
                            />
                            {errors.addressLine1 && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.addressLine1.message}</p>}
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Address Line 2</label>
                            <input {...register('addressLine2')} className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#009688] bg-white" placeholder="Landmark (optional)" />
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">City *</label>
                              <input 
                                {...register('city', { required: 'City is required' })} 
                                className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#009688] bg-white" 
                                placeholder="City" 
                              />
                              {errors.city && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.city.message}</p>}
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">State *</label>
                              <input 
                                {...register('state', { required: 'State is required' })} 
                                className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#009688] bg-white" 
                                placeholder="State" 
                              />
                              {errors.state && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.state.message}</p>}
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Pincode *</label>
                              <input 
                                {...register('pincode', { 
                                  required: 'Pincode is required',
                                  pattern: {
                                    value: /^\d{6}$/,
                                    message: 'Must be exactly 6 digits'
                                  }
                                })} 
                                onInput={(e) => {
                                  e.target.value = e.target.value.replace(/[^0-9]/g, '');
                                }}
                                className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#009688] bg-white" 
                                placeholder="6-digit PIN" 
                                maxLength={6} 
                              />
                              {errors.pincode && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.pincode.message}</p>}
                            </div>
                          </div>
                          {!editAddressId && (
                            <div className="flex items-center gap-2">
                              <input type="checkbox" id="saveAddr" {...register('saveAddress')} defaultChecked className="accent-[#009688]" />
                              <label htmlFor="saveAddr" className="text-xs text-gray-500">Save to my profile</label>
                            </div>
                          )}
                          <div className="flex gap-2">
                            <button
                              type="submit"
                              className="flex-grow py-2.5 text-white text-xs font-black uppercase tracking-widest"
                              style={{ backgroundColor: TSS_TEAL }}
                            >
                              {editAddressId ? 'UPDATE & DELIVER' : 'SAVE & DELIVER'}
                            </button>
                            {editAddressId && (
                              <button
                                type="button"
                                onClick={() => {
                                  reset()
                                  setEditAddressId(null)
                                }}
                                className="px-4 py-2.5 border border-gray-300 text-gray-700 bg-white text-xs font-bold uppercase hover:bg-gray-100 transition-colors"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </form>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── STEP 1: Items Summary ── */}
            {step === 1 && (
              <div className="bg-white border border-gray-200">
                {/* Items Header */}
                <div className="px-4 py-3 border-b border-gray-150 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-755">
                      ITEMS SUMMARY
                    </span>
                    <span className="text-xs text-gray-400">
                      ({items.reduce((a, c) => a + c.quantity, 0)} {items.reduce((a, c) => a + c.quantity, 0) > 1 ? 'items' : 'item'} · total {formatPrice(subtotal)})
                    </span>
                  </div>
                </div>

                {/* Items List */}
                <div className="divide-y divide-gray-100">
                  {items.map((item) => {
                    const itemImg =
                      item.product?.images?.[0]?.url ||
                      item.product?.colors?.find(c => c.name === item.color)?.images?.[0]?.url ||
                      item.product?.colors?.[0]?.images?.[0]?.url ||
                      ''
                    const itemMrp = (item.product?.price && item.product.price > item.price) ? item.product.price : null
                    const savings = itemMrp ? itemMrp - item.price : 0

                    return (
                      <div key={item._id} className="flex gap-4 p-4 items-start">
                        {/* Image */}
                        <div className="w-20 h-26 sm:w-24 sm:h-32 bg-gray-50 border border-gray-150 rounded-lg overflow-hidden flex-shrink-0">
                          {itemImg
                            ? <img src={itemImg} alt={item.product?.title} className="w-full h-full object-cover object-top" />
                            : <div className="w-full h-full flex items-center justify-center text-gray-300 text-3xl">👕</div>
                          }
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch">
                          <div>
                            <p className="text-sm font-bold text-gray-900 line-clamp-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
                              {item.product?.title}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5 capitalize">
                              {item.product?.brand || 'AURA'} · {item.product?.category?.name || ''}
                            </p>

                            {/* Size / Qty / Color Chips */}
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              {item.size && (
                                <span className="text-[10px] font-bold bg-neutral-100 text-neutral-600 px-2.5 py-0.5 rounded">
                                  Size: {item.size}
                                </span>
                              )}
                              <span className="text-[10px] font-bold bg-neutral-100 text-neutral-600 px-2.5 py-0.5 rounded">
                                Qty: {item.quantity}
                              </span>
                              {item.color && (
                                <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 bg-neutral-100 px-2.5 py-0.5 rounded">
                                  <span className="w-2.5 h-2.5 rounded-full border border-neutral-300 inline-block" style={{ backgroundColor: item.color.toLowerCase() }} />
                                  {item.color}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Price details line */}
                          <div className="mt-auto pt-3 flex items-baseline justify-between gap-2">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-sm font-bold text-neutral-900">{formatPrice(item.price * item.quantity)}</span>
                              {item.quantity > 1 && (
                                <span className="text-[10px] text-neutral-400">({formatPrice(item.price)} each)</span>
                              )}
                              {itemMrp && (
                                <span className="text-xs text-neutral-400 line-through">
                                  {formatPrice(itemMrp * item.quantity)}
                                </span>
                              )}
                            </div>

                            {itemMrp && savings > 0 && (
                              <span className="text-[10px] text-green-600 font-semibold hidden sm:inline">
                                Saved {formatPrice(savings * item.quantity)}
                              </span>
                            )}
                          </div>

                          {/* Delivery estimate */}
                          <p className="text-[10px] text-gray-450 mt-1.5 flex items-center gap-1">
                            <span>🚚</span> Estimated delivery by{' '}
                            <span className="font-semibold text-gray-700">
                              {new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </span>
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ── STEP 2: Payment Options ── */}
            {step === 2 && (
              <div className="bg-white border border-gray-200">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-bold text-gray-900">Payment Options</p>
                </div>

                {/* UPI */}
                <label className="flex items-center gap-3 px-4 py-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="radio" name="payment" value="razorpay" checked={paymentMethod === 'razorpay'} onChange={() => setPaymentMethod('razorpay')} className="accent-[#009688]" />
                  <FiSmartphone size={18} className="text-gray-500" />
                  <div className="flex-1">
                    <span className="text-sm font-semibold text-gray-800">Pay with any UPI App</span>
                    <p className="text-[11px] text-gray-400 mt-0.5">PhonePe, Google Pay, Paytm, BHIM & more</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {['G', 'P', 'B'].map((l, i) => (
                      <div key={i} className="w-6 h-6 rounded-full border border-gray-200 bg-gray-100 flex items-center justify-center text-[9px] font-bold text-gray-500">{l}</div>
                    ))}
                  </div>
                </label>

                {/* Wallets */}
                <AccordionRow label="Wallets" icon={<FiDollarSign size={16} />}>
                  <div className="space-y-2 text-sm text-gray-500">
                    {['Paytm Wallet', 'PhonePe Wallet', 'Amazon Pay'].map(w => (
                      <label key={w} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="payment" value={w} className="accent-[#009688]" onChange={() => setPaymentMethod('razorpay')} />
                        {w}
                      </label>
                    ))}
                  </div>
                </AccordionRow>

                {/* Cards */}
                <AccordionRow label="Credit & Debit Cards" icon={<FiCreditCard size={16} />}>
                  <div className="space-y-2 text-sm text-gray-500">
                    <p className="text-xs text-gray-400">Card payments are processed securely via Razorpay.</p>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="payment" value="card" className="accent-[#009688]" onChange={() => setPaymentMethod('razorpay')} />
                      Pay via Debit / Credit Card
                    </label>
                  </div>
                </AccordionRow>

                {/* Netbanking */}
                <AccordionRow label="Netbanking" icon={<span className="text-base">🏦</span>}>
                  <div className="text-sm text-gray-500 space-y-2">
                    {['HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank'].map(b => (
                      <label key={b} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="payment" value={b} className="accent-[#009688]" onChange={() => setPaymentMethod('razorpay')} />
                        {b}
                      </label>
                    ))}
                  </div>
                </AccordionRow>

                {/* COD */}
                <label className="flex items-start gap-3 px-4 py-4 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100">
                  <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="accent-[#009688] mt-0.5" />
                  <FiTruck size={18} className="text-gray-500 mt-0.5" />
                  <div>
                    <span className="text-sm font-semibold text-gray-800">Cash on Delivery</span>
                    <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1">
                      <FiAlertCircle size={11} /> We recommend prepaid payments for faster delivery.
                    </p>
                  </div>
                </label>


              </div>
            )}
          </div>

          {/* ── RIGHT COLUMN: Billing Sidebar ── */}
          <div className="w-full lg:w-[320px] flex-shrink-0 space-y-4">
            <BillingSidebar showButton={true} />
          </div>

        </div>
      </div>

      {/* Mobile Sticky CTA Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex items-center justify-between z-30 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] md:hidden">
        <div className="flex flex-col">
          <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider">Total Amount</p>
          <p className="text-gray-900 font-black text-lg leading-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
            {formatPrice(Math.max(0, total))}
          </p>
        </div>

        <button
          onClick={step === 1 ? () => { if (!shippingAddress) { toast.error('Please select a delivery address'); return } setStep(2) } : handlePlaceOrder}
          disabled={orderLoading}
          className="px-6 py-3 bg-[#009688] hover:bg-[#00796b] text-white text-xs font-black uppercase tracking-widest rounded transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          {orderLoading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : step === 1 ? (
            'PROCEED TO PAY'
          ) : (
            'PLACE ORDER'
          )}
        </button>
      </div>

      {/* ── Mock Payment Modal ── */}
      <AnimatePresence>
        {showMockModal && mockPaymentData && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-[100]"
              onClick={() => { toast.error('Payment cancelled'); setShowMockModal(false) }}
            />
            <div className="fixed inset-0 flex items-center justify-center p-4 z-[101] pointer-events-none">
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 16 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 16 }}
                transition={{ type: 'spring', duration: 0.4 }}
                className="w-full max-w-sm bg-white shadow-2xl pointer-events-auto"
              >
                {/* Timer header */}
                <div className="p-4 text-center border-b border-gray-100">
                  <p className="text-[#009688] font-bold text-sm">🔒 Secure Sandbox Payment</p>
                  <h3 className="text-lg font-black text-gray-900 mt-1" style={{ fontFamily: 'Outfit, sans-serif' }}>PAY via UPI / Card</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Order #{mockPaymentData.orderNumber}</p>
                </div>

                {/* QR Code area */}
                <div className="p-5 text-center">
                  <div className="w-40 h-40 mx-auto bg-gray-100 border border-gray-200 flex items-center justify-center mb-4 rounded">
                    <div className="text-5xl">📱</div>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed mb-1">
                    Scan the QR from your mobile using any UPI app such as PhonePe, Google Pay, Paytm, CRED, Amazon Pay, BHIM etc.
                  </p>

                  {/* Amount */}
                  <div className="bg-gray-50 border border-gray-200 p-3 mt-4 flex justify-between items-center">
                    <span className="text-sm text-gray-600">Amount Payable</span>
                    <span className="text-lg font-black text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
                      {formatPrice(mockPaymentData.totalAmount)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="px-5 pb-5 space-y-2.5">
                  <button
                    onClick={handleMockPaymentSuccess}
                    className="w-full py-3.5 text-white font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-all"
                    style={{ backgroundColor: TSS_TEAL, fontFamily: 'Outfit, sans-serif' }}
                  >
                    <FiCheck size={15} /> SIMULATE PAYMENT SUCCESS
                  </button>
                  <button
                    onClick={() => { toast.error('Payment cancelled'); setShowMockModal(false) }}
                    className="w-full py-3 text-gray-700 font-semibold text-xs uppercase tracking-widest border border-gray-300 hover:border-gray-500 transition-colors"
                  >
                    Back To Payment Screen
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      <script src="https://checkout.razorpay.com/v1/checkout.js" async />
    </div>
  )
}
