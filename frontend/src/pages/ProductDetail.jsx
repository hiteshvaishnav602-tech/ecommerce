import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiHeart, FiShoppingCart, FiChevronLeft, FiChevronRight, FiStar,
  FiCheck, FiTruck, FiRefreshCw, FiShield, FiChevronDown, FiChevronUp,
  FiShare2, FiX,
} from 'react-icons/fi'
import { fetchProduct, fetchRelatedProducts } from '../redux/slices/productSlice'
import { addToCart } from '../redux/slices/cartSlice'
import { toggleWishlist, fetchWishlist } from '../redux/slices/wishlistSlice'
import { selectWishlistProductIds } from '../redux/slices/wishlistSlice'
import ProductCard from '../components/product/ProductCard'
import StarRating from '../components/common/StarRating'
import { ProductDetailSkeleton } from '../components/common/Skeleton'
import api from '../services/api'
import toast from 'react-hot-toast'

const formatPrice = (p) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p)

/* ── Lightbox ── */
function Lightbox({ images, startIndex, onClose }) {
  const [idx, setIdx] = useState(startIndex)
  const prev = () => setIdx((i) => (i - 1 + images.length) % images.length)
  const next = () => setIdx((i) => (i + 1) % images.length)
  useEffect(() => {
    const handler = (e) => { if (e.key === 'ArrowLeft') prev(); if (e.key === 'ArrowRight') next(); if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[999] bg-black/95 flex items-center justify-center"
      onClick={onClose}
    >
      <button onClick={onClose} className="absolute top-5 right-5 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white z-10 transition-all">
        <FiX size={20} />
      </button>
      <button onClick={(e) => { e.stopPropagation(); prev() }} className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all">
        <FiChevronLeft size={22} />
      </button>
      <motion.img
        key={idx}
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        src={images[idx]?.url}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[88vh] max-w-[88vw] object-contain rounded-xl"
      />
      <button onClick={(e) => { e.stopPropagation(); next() }} className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all">
        <FiChevronRight size={22} />
      </button>
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, i) => (
          <button key={i} onClick={(e) => { e.stopPropagation(); setIdx(i) }}
            className={`h-1.5 rounded-full transition-all ${i === idx ? 'w-6 bg-white' : 'w-1.5 bg-white/40'}`}
          />
        ))}
      </div>
    </motion.div>
  )
}

/* ── Accordion row ── */
function AccordionItem({ title, children }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-gray-100">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left"
      >
        <span className="font-semibold text-gray-800 text-sm">{title}</span>
        {open ? <FiChevronUp size={16} className="text-gray-400" /> : <FiChevronDown size={16} className="text-gray-400" />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="pb-4 text-sm text-gray-600 leading-relaxed">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function ProductDetail() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { product, productLoading, related } = useSelector((s) => s.products)
  const { user } = useSelector((s) => s.auth)
  const wishlistIds = useSelector(selectWishlistProductIds)

  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [variantImagesOverride, setVariantImagesOverride] = useState(null)
  const [lightboxIdx, setLightboxIdx] = useState(null)
  const [addingToCart, setAddingToCart] = useState(false)
  const [activeTab, setActiveTab] = useState('description')
  const [reviews, setReviews] = useState([])
  const [reviewLoading, setReviewLoading] = useState(false)
  const [myRating, setMyRating] = useState(0)
  const [myComment, setMyComment] = useState('')
  const [myTitle, setMyTitle] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [activeSlideIdx, setActiveSlideIdx] = useState(0)

  const handleCarouselScroll = (e) => {
    const width = e.target.clientWidth
    if (width > 0) {
      const index = Math.round(e.target.scrollLeft / width)
      setActiveSlideIdx(index)
    }
  }

  const isInWishlist = wishlistIds.includes(product?._id)
  const images = variantImagesOverride || product?.images || []

  useEffect(() => { dispatch(fetchProduct(id)) }, [id, dispatch])

  useEffect(() => {
    if (product) {
      dispatch(fetchRelatedProducts(product._id))
      setSelectedSize(product.sizes?.[0]?.size || '')
      const defaultColor = product.colors?.find(c => c.isDefault) || product.colors?.[0]
      setSelectedColor(defaultColor?.name || '')
      if (defaultColor?.images?.length > 0) setVariantImagesOverride(defaultColor.images)
      else if (defaultColor?.image?.url) setVariantImagesOverride([{ url: defaultColor.image.url }])
      else setVariantImagesOverride(null)
      fetchReviews()
    }
  }, [product?._id])

  const fetchReviews = async () => {
    if (!id) return
    setReviewLoading(true)
    try { const { data } = await api.get(`/reviews/product/${id}`); setReviews(data.reviews) } catch (_) { }
    setReviewLoading(false)
  }

  const handleAddToCart = async () => {
    if (!user) return navigate('/login')
    if (product.sizes?.length > 0 && !selectedSize) return toast.error('Please select a size')
    setAddingToCart(true)
    await dispatch(addToCart({ productId: product._id, quantity, size: selectedSize, color: selectedColor }))
    setAddingToCart(false)
  }

  const handleWishlist = async () => {
    if (!user) return navigate('/login')
    await dispatch(toggleWishlist(product._id))
    dispatch(fetchWishlist())
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    if (myRating === 0) return toast.error('Please select a rating')
    setSubmittingReview(true)
    try {
      await api.post(`/reviews/product/${product._id}`, { rating: myRating, title: myTitle, comment: myComment })
      toast.success('Review submitted!')
      setMyRating(0); setMyComment(''); setMyTitle('')
      fetchReviews()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to submit review') }
    setSubmittingReview(false)
  }

  if (productLoading) return <div className="min-h-screen container-custom py-10"><ProductDetailSkeleton /></div>
  if (!product) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-7xl mb-6">😕</div>
        <h2 className="text-2xl font-bold mb-4">Product not found</h2>
        <Link to="/products" className="btn-primary">Browse Products</Link>
      </div>
    </div>
  )

  const discountPercent = product.discountPercent ||
    (product.price && product.discountPrice
      ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0)

  const displayPrice = product.discountPrice || product.price

  return (
    <div className="min-h-screen bg-white text-gray-900" style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIdx !== null && (
          <Lightbox images={images} startIndex={lightboxIdx} onClose={() => setLightboxIdx(null)} />
        )}
      </AnimatePresence>

      <div className="container-custom pt-4 pb-24 md:pb-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-6">
          <Link to="/" className="hover:text-gray-700 transition-colors">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-gray-700 transition-colors">Products</Link>
          <span>/</span>
          <span className="text-gray-700 font-medium truncate max-w-[200px]">{product.title}</span>
        </nav>

        {/* ── Main content ── */}
        <div className="flex flex-col lg:flex-row gap-10">

          {/* ══════════ LEFT: Image Gallery ══════════ */}
          <div className="lg:w-[55%] flex-shrink-0">
            {/* Mobile Swipeable Carousel (visible on mobile, hidden on desktop) */}
            <div className="block md:hidden relative select-none">
              {images.length === 0 ? (
                <div className="aspect-[3/4] bg-gray-150 rounded-lg flex items-center justify-center text-gray-400 font-medium text-xs">No Image</div>
              ) : (
                <div
                  className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none gap-0 rounded-lg"
                  onScroll={handleCarouselScroll}
                >
                  {images.map((img, i) => (
                    <div
                      key={i}
                      className="w-full aspect-[3/4] shrink-0 snap-center relative overflow-hidden bg-gray-50"
                      onClick={() => setLightboxIdx(i)}
                    >
                      <img
                        src={img.url}
                        alt={`${product.title} ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {/* Slide Indicator Badge */}
                      <div className="absolute bottom-4 right-4 bg-black/60 text-white text-[10px] font-extrabold px-3 py-1 rounded-full tracking-widest z-10 font-mono">
                        {i + 1}/{images.length}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Dots Indicators */}
              {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 bg-black/35 px-3 py-1.5 rounded-full backdrop-blur-[1px]">
                  {images.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 rounded-full transition-all duration-300 ${i === activeSlideIdx ? 'w-4 bg-white' : 'w-1.5 bg-white/50'
                        }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Desktop Grid (hidden on mobile, visible on desktop) */}
            <div className="hidden md:block">
              {images.length === 0 ? (
                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">No Image</div>
              ) : images.length === 1 ? (
                /* Single image */
                <div
                  className="aspect-square rounded-lg overflow-hidden cursor-zoom-in bg-gray-50"
                  onClick={() => setLightboxIdx(0)}
                >
                  <img src={images[0].url} alt={product.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
              ) : (
                /* Multi-image: Souled Store grid style */
                <div className="space-y-2">
                  {/* Top row: first 2 images side by side */}
                  <div className="grid grid-cols-2 gap-2">
                    {images.slice(0, 2).map((img, i) => (
                      <div
                        key={i}
                        className="aspect-[3/4] rounded-lg overflow-hidden cursor-zoom-in bg-gray-50 relative group"
                        onClick={() => setLightboxIdx(i)}
                      >
                        <img src={img.url} alt={`${product.title} ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    ))}
                  </div>
                  {/* Remaining images: 1 per row (full width) or 2-col grid */}
                  {images.length > 2 && (
                    <div className="grid grid-cols-2 gap-2">
                      {images.slice(2).map((img, i) => (
                        <div
                          key={i + 2}
                          className="aspect-[3/4] rounded-lg overflow-hidden cursor-zoom-in bg-gray-50 relative group"
                          onClick={() => setLightboxIdx(i + 2)}
                        >
                          <img src={img.url} alt={`${product.title} ${i + 3}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ══════════ RIGHT: Product Info ══════════ */}
          <div className="lg:w-[45%] lg:sticky lg:top-24 lg:self-start space-y-5">

            {/* Header Block */}
            <div className="space-y-3.5">
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1 min-w-0">
                  {product.brand && (
                    <p className="text-xs text-red-500 font-extrabold tracking-widest uppercase">{product.brand}</p>
                  )}
                  <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight uppercase tracking-tight truncate min-w-0" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {product.title}
                  </h1>
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">{product.category?.name}</p>
                </div>

                {/* Right-aligned Wishlist & Share actions */}
                <div className="flex gap-2 flex-shrink-0 pt-2">
                  <button
                    onClick={handleWishlist}
                    className={`w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center transition-all ${isInWishlist ? 'bg-red-50 border-red-200 text-red-500 shadow-sm' : 'bg-white hover:border-gray-450 text-gray-500'
                      }`}
                    title="Add to Wishlist"
                  >
                    <FiHeart size={17} fill={isInWishlist ? 'currentColor' : 'none'} strokeWidth={2.5} />
                  </button>
                  <button
                    onClick={async () => {
                      if (navigator.share) {
                        try {
                          await navigator.share({
                            title: product.title,
                            text: `Check out the ${product.title} on AURA!`,
                            url: window.location.href,
                          })
                        } catch (_) { }
                      } else {
                        navigator.clipboard.writeText(window.location.href);
                        toast.success('Link copied to clipboard!');
                      }
                    }}
                    className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:border-gray-450 transition-all"
                    title="Share Product"
                  >
                    <FiShare2 size={16} strokeWidth={2.5} />
                  </button>
                </div>
              </div>

              {/* Rating */}
              {product.numReviews > 0 && (
                <div className="flex items-center gap-2 pt-0.5">
                  <StarRating rating={product.ratings} size={14} showCount count={product.numReviews} />
                  <button onClick={() => setActiveTab('reviews')} className="text-xs text-red-500 hover:underline font-medium">
                    Read reviews
                  </button>
                </div>
              )}

              {/* Price */}
              <div className="space-y-1 pt-1">
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl sm:text-3xl font-black text-gray-900">{formatPrice(displayPrice)}</span>
                  {product.discountPrice && product.price > product.discountPrice && (
                    <>
                      <span className="text-base text-gray-400 line-through font-medium">{formatPrice(product.price)}</span>
                      <span className="text-sm font-bold text-green-600">({discountPercent}% OFF)</span>
                    </>
                  )}
                </div>
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Price Incl. of all taxes</p>
              </div>
            </div>

            <div className="h-px bg-gray-100" />

            {/* Variant / Color thumbnails — Souled Store style */}
            {product.colors?.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">Shop by Variant/Look</p>
                <div className="flex gap-3 flex-wrap">
                  {product.colors.map((color) => {
                    const thumbUrl = color.images?.[0]?.url || color.image?.url || images[0]?.url
                    const isSelected = selectedColor === color.name
                    return (
                      <button
                        key={color.name}
                        title={color.name}
                        onClick={() => {
                          setSelectedColor(color.name)
                          if (color.images?.length > 0) setVariantImagesOverride(color.images)
                          else if (color.image?.url) setVariantImagesOverride([{ url: color.image.url }])
                          else setVariantImagesOverride(null)
                        }}
                        className={`relative w-16 h-20 rounded-md overflow-hidden border-2 transition-all ${isSelected ? 'border-gray-900 shadow-md' : 'border-gray-200 hover:border-gray-400'
                          }`}
                      >
                        {thumbUrl ? (
                          <img src={thumbUrl} alt={color.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="w-full h-full flex items-center justify-center" style={{ background: color.hex || '#eee' }} />
                        )}
                        {isSelected && (
                          <span className="absolute top-1 right-1 w-4 h-4 bg-gray-900 rounded-full flex items-center justify-center">
                            <FiCheck size={9} className="text-white" strokeWidth={3} />
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Size selector */}
            {product.sizes?.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-gray-700">
                    Please select a size.
                  </p>
                  <button className="text-xs font-semibold text-gray-500 underline underline-offset-2 hover:text-gray-800">
                    SIZE CHART
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s.size}
                      onClick={() => s.stock > 0 && setSelectedSize(s.size)}
                      disabled={s.stock === 0}
                      className={`min-w-[48px] px-3 py-2 rounded border text-sm font-medium transition-all ${selectedSize === s.size
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : s.stock === 0
                            ? 'border-gray-200 text-gray-300 cursor-not-allowed line-through bg-gray-50'
                            : 'border-gray-300 text-gray-700 hover:border-gray-700 bg-white'
                        }`}
                    >
                      {s.size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-gray-700">Quantity</span>
              <select
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="border border-gray-300 rounded px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:border-gray-600 min-w-[80px]"
              >
                {Array.from({ length: Math.min(product.stock, 10) }, (_, i) => i + 1).map(n => (
                  <option key={n} value={n}>{String(n).padStart(2, '0')}</option>
                ))}
              </select>
              {product.stock > 0 ? (
                <span className="flex items-center gap-1.5 text-xs font-medium text-green-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  {product.stock < 10 ? `Only ${product.stock} left!` : 'In Stock'}
                </span>
              ) : (
                <span className="text-xs font-semibold text-red-500">Out of Stock</span>
              )}
            </div>

            {/* CTA Button */}
            <div>
              <motion.button
                whileTap={{ scale: 0.99 }}
                onClick={handleAddToCart}
                disabled={addingToCart || product.stock === 0}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-lg font-bold text-sm bg-red-500 hover:bg-red-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md tracking-widest uppercase"
              >
                {addingToCart
                  ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><FiShoppingCart size={16} strokeWidth={2.5} /> Add to Cart</>
                }
              </motion.button>
            </div>

            <div className="h-px bg-gray-100" />

            {/* Delivery Details Accordion */}
            <div>
              <AccordionItem title="Delivery Details">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <FiTruck size={16} className="text-gray-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-800 text-xs">Free Delivery on orders above ₹499</p>
                      <p className="text-gray-500 text-xs mt-0.5">Estimated delivery in 4–7 business days</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FiRefreshCw size={16} className="text-gray-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-800 text-xs">Easy 30-day Returns & Exchange</p>
                      <p className="text-gray-500 text-xs mt-0.5">Return or exchange within 30 days of delivery</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FiShield size={16} className="text-gray-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-800 text-xs">100% Secure Payment</p>
                      <p className="text-gray-500 text-xs mt-0.5">UPI, Cards, Net Banking, Wallets accepted</p>
                    </div>
                  </div>
                </div>
              </AccordionItem>

              <AccordionItem title="Product Details">
                <div className="space-y-2">
                  {[
                    ['Brand', product.brand],
                    ['Material', product.material || 'N/A'],
                    ['Gender', product.gender],
                    ['Fit', product.fit || 'N/A'],
                    ['SKU', product.sku || 'N/A'],
                    ['Care', product.careInstructions || 'Machine Washable'],
                  ].filter(([, v]) => v && v !== 'N/A' && v !== 'undefined').map(([k, v]) => (
                    <div key={k} className="flex justify-between text-xs">
                      <span className="text-gray-400">{k}</span>
                      <span className="text-gray-700 font-medium capitalize">{v}</span>
                    </div>
                  ))}
                </div>
              </AccordionItem>

              <AccordionItem title="Description">
                <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
              </AccordionItem>
            </div>

          </div>
        </div>

        {/* ── Tabs: Description / Details / Reviews ── */}
        <div className="mt-14 mb-12 border-t border-gray-100 pt-10">
          {/* Tab pills */}
          <div className="flex gap-1 mb-8 bg-gray-50 p-1.5 rounded-xl w-fit">
            {[
              { id: 'description', label: 'Description' },
              { id: 'details', label: 'Details' },
              { id: 'reviews', label: `Reviews (${reviews.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === tab.id
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-400 hover:text-gray-700'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'description' && (
              <motion.p key="desc"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="text-gray-600 leading-relaxed max-w-2xl text-sm"
              >
                {product.description}
              </motion.p>
            )}

            {activeTab === 'details' && (
              <motion.div key="det"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-0 max-w-xl border border-gray-100 rounded-xl overflow-hidden"
              >
                {[
                  ['Brand', product.brand],
                  ['Material', product.material || 'N/A'],
                  ['Gender', product.gender],
                  ['Fit', product.fit || 'N/A'],
                  ['SKU', product.sku || 'N/A'],
                  ['Care', product.careInstructions || 'Machine Washable'],
                ].map(([k, v], i) => (
                  <div key={k} className={`flex justify-between px-5 py-3.5 text-sm ${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'} border-b border-gray-100`}>
                    <span className="text-gray-400 font-medium">{k}</span>
                    <span className="text-gray-800 font-semibold capitalize">{v}</span>
                  </div>
                ))}
              </motion.div>
            )}

            {activeTab === 'reviews' && (
              <motion.div key="rev"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="space-y-6 max-w-2xl"
              >
                {/* Write review */}
                {user && (
                  <div className="border border-gray-200 rounded-xl p-6">
                    <h4 className="font-bold text-gray-900 mb-4">Write a Review</h4>
                    <form onSubmit={handleSubmitReview} className="space-y-4">
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Your Rating *</label>
                        <StarRating rating={myRating} editable onChange={setMyRating} size={26} />
                      </div>
                      <input
                        value={myTitle}
                        onChange={(e) => setMyTitle(e.target.value)}
                        placeholder="Review title"
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-gray-500"
                      />
                      <textarea
                        value={myComment}
                        onChange={(e) => setMyComment(e.target.value)}
                        placeholder="What did you like or dislike?"
                        rows={4}
                        required
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-gray-500 resize-none"
                      />
                      <button type="submit" disabled={submittingReview}
                        className="bg-gray-900 text-white font-bold py-2.5 px-8 rounded-lg text-sm hover:bg-gray-800 transition-colors"
                      >
                        {submittingReview ? 'Submitting…' : 'Submit Review'}
                      </button>
                    </form>
                  </div>
                )}

                {/* Reviews */}
                {reviewLoading ? (
                  <div className="space-y-3">{[1, 2].map(i => <div key={i} className="h-20 bg-gray-100 animate-pulse rounded-xl" />)}</div>
                ) : reviews.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <FiStar size={40} className="mx-auto mb-3 opacity-20" />
                    <p className="font-semibold">No reviews yet. Be the first!</p>
                  </div>
                ) : (
                  reviews.map((review, idx) => (
                    <motion.div key={review._id}
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                      className="border-b border-gray-100 pb-5"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-xs">{review.user?.name?.[0]?.toUpperCase()}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1 flex-wrap gap-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm text-gray-900">{review.user?.name}</span>
                              {review.isVerifiedPurchase && (
                                <span className="text-[10px] font-bold text-green-600 bg-green-50 border border-green-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <FiCheck size={8} strokeWidth={3} /> Verified
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-gray-400">
                              {new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                          <StarRating rating={review.rating} size={13} />
                          {review.title && <p className="font-semibold text-sm text-gray-800 mt-1.5">{review.title}</p>}
                          <p className="text-sm text-gray-600 mt-1 leading-relaxed">{review.comment}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Related Products ── */}
        {related.length > 0 && (
          <div className="border-t border-gray-100 pt-10 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 uppercase tracking-wide">You Might Also Like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {related.map((p, i) => <ProductCard key={p._id} product={p} index={i} />)}
            </div>
          </div>
        )}

      </div>

      {/* Mobile Sticky Add to Cart Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-250 p-4 flex items-center justify-between z-30 md:hidden shadow-[0_-5px_15px_rgba(0,0,0,0.06)]">
        <div className="flex flex-col min-w-0 pr-4">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-tight truncate">
            {selectedSize ? `Size: ${selectedSize}` : 'Select Size'}
          </span>
          <span className="text-xl text-gray-900 font-black tracking-tight">{formatPrice(displayPrice)}</span>
        </div>
        <button
          onClick={handleAddToCart}
          disabled={addingToCart || product.stock === 0}
          className="bg-red-500 hover:bg-red-600 active:scale-95 text-white font-bold text-xs uppercase tracking-widest px-6 py-3.5 flex items-center justify-center gap-2 rounded-sm transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
        >
          {addingToCart ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : product.stock === 0 ? (
            'Out of Stock'
          ) : (
            <><FiShoppingCart size={14} strokeWidth={2.5} /> Add to Cart</>
          )}
        </button>
      </div>
    </div>
  )
}
