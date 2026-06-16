import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiHeart, FiShoppingCart, FiTrash2, FiShoppingBag, FiArrowRight } from 'react-icons/fi'
import { fetchWishlist, toggleWishlist } from '../redux/slices/wishlistSlice'
import { addToCart } from '../redux/slices/cartSlice'

export default function WishlistPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { token } = useSelector((s) => s.auth)
  const { wishlist, loading } = useSelector((s) => s.wishlist)

  const products = wishlist?.products || []

  useEffect(() => {
    if (token) {
      dispatch(fetchWishlist())
    }
  }, [dispatch, token])

  const handleRemove = (e, productId) => {
    e.preventDefault()
    e.stopPropagation()
    dispatch(toggleWishlist(productId)).then(() => dispatch(fetchWishlist()))
  }

  const handleAddToCart = (e, product) => {
    e.preventDefault()
    e.stopPropagation()
    if (product.sizes && product.sizes.length > 0) {
      navigate(`/product/${product._id}`)
      return
    }
    dispatch(addToCart({ productId: product._id, quantity: 1 }))
  }

  if (loading && !wishlist) {
    return (
      <div className="min-h-screen pt-0 flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-[#e11b23] rounded-full animate-spin" />
      </div>
    )
  }

  // Not logged in State
  if (!token) {
    return (
      <div className="min-h-screen pt-0 flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md px-6 py-12 bg-white border border-gray-150 rounded-3xl shadow-xl">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 bg-red-50 border border-red-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md"
          >
            <FiHeart size={36} className="text-[#e11b23]" />
          </motion.div>
          <h2 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-wide" style={{ fontFamily: 'Outfit, sans-serif' }}>
            YOUR WISHLIST
          </h2>
          <p className="text-gray-500 text-sm mb-8 leading-relaxed">Please log in to your account to view your saved items and build your streetwear collection.</p>
          <Link
            to="/login"
            className="w-full inline-flex items-center justify-center gap-2 bg-gray-900 hover:bg-[#e11b23] text-white font-bold text-xs uppercase tracking-widest py-4 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            Login to Account <FiArrowRight size={14} />
          </Link>
        </div>
      </div>
    )
  }

  // Empty State
  if (products.length === 0) {
    return (
      <div className="min-h-screen pt-0 flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md px-6 py-12 bg-white border border-gray-150 rounded-3xl shadow-xl">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm animate-pulse"
          >
            <FiHeart size={36} className="text-gray-300" />
          </motion.div>
          <h2 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-wide" style={{ fontFamily: 'Outfit, sans-serif' }}>
            WISHLIST IS EMPTY
          </h2>
          <p className="text-gray-500 text-sm mb-8 leading-relaxed">Save your favorite items here to keep track of them and buy them later.</p>
          <Link
            to="/products"
            className="w-full inline-flex items-center justify-center gap-2 bg-gray-900 hover:bg-[#e11b23] text-white font-bold text-xs uppercase tracking-widest py-4 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            <FiShoppingBag size={14} /> Discover Collections
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-0 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">

        {/* Header Block */}
        <div className="text-center md:text-left md:flex items-end justify-between border-b border-gray-200 pb-6 mb-10">
          <div>
            <h1
              className="text-3xl sm:text-4xl font-black text-[#0f2a4a] uppercase tracking-wider flex items-center justify-center md:justify-start gap-3"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              <FiHeart className="text-[#e11b23] fill-[#e11b23]" />
              MY WISHLIST
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">Keep track of the fits and accessories you love</p>
          </div>
          <span
            className="inline-block mt-3 md:mt-0 px-4 py-1.5 bg-[#e8f6f8] text-[#147e85] font-extrabold text-xs uppercase tracking-wider rounded-full"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            {products.length} {products.length === 1 ? 'Item Saved' : 'Items Saved'}
          </span>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          <AnimatePresence>
            {products.map((product, index) => {
              const discountPercent = product.discountPercent ||
                (product.price && product.discountPrice
                  ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
                  : 0);

              const hasOversized = product.title?.toLowerCase().includes('oversized') || product.fit?.toLowerCase().includes('oversized') || product.tags?.some(t => t.toLowerCase().includes('oversized'));
              const hasBaggy = product.title?.toLowerCase().includes('baggy') || product.fit?.toLowerCase().includes('baggy');
              const hasRelaxed = product.title?.toLowerCase().includes('relaxed') || product.fit?.toLowerCase().includes('relaxed');

              let fitTag = '';
              if (hasOversized) fitTag = 'OVERSIZED FIT';
              else if (hasBaggy) fitTag = 'BAGGY FIT';
              else if (hasRelaxed) fitTag = 'RELAXED FIT';

              return (
                <motion.div
                  key={product._id}
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="group relative flex flex-col bg-white border border-gray-150 rounded-2xl overflow-hidden hover:shadow-lg transition-all"
                >
                  {/* Image Container */}
                  <Link to={`/product/${product._id}`} className="relative aspect-[3/4] overflow-hidden block bg-gray-100">
                    <img
                      src={
                        product.images?.[0]?.url ||
                        product.colors?.[0]?.images?.[0]?.url ||
                        product.colors?.[0]?.image?.url ||
                        'https://placehold.co/600'
                      }
                      alt={product.title}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500 ease-out"
                    />

                    {/* Left Top Fit Tag */}
                    {fitTag && (
                      <div className="absolute top-3 left-3 bg-black/40 border border-white/20 text-white font-extrabold text-[9px] sm:text-[10px] tracking-widest px-2.5 py-1 uppercase rounded-sm backdrop-blur-[1px] z-10">
                        {fitTag}
                      </div>
                    )}



                    {/* Floating Bottom Overlay for logo branding */}
                    <div className="absolute bottom-2 right-2 pointer-events-none z-10 select-none opacity-0 group-hover:opacity-100 transition-opacity">
                      <img
                        src="/logo.png"
                        alt="Aura Logo"
                        className="w-12 object-contain"
                        style={{ filter: 'drop-shadow(0px 1px 3px rgba(0,0,0,0.5))' }}
                      />
                    </div>
                  </Link>

                  {/* Info details */}
                  <div className="p-4 flex flex-col flex-grow bg-white border-t border-gray-100 font-display" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-gray-900 font-extrabold text-[13px] sm:text-[14px] leading-tight truncate uppercase tracking-wide flex-1">
                        {product.title}
                      </p>
                      {/* Trash Icon Button */}
                      <button
                        onClick={(e) => handleRemove(e, product._id)}
                        className="text-gray-400 hover:text-[#e11b23] p-0.5 rounded transition-colors shrink-0"
                        title="Remove from Wishlist"
                      >
                        <FiTrash2 size={15} />
                      </button>
                    </div>

                    <p className="text-gray-500 font-semibold text-[11px] sm:text-[12px] leading-tight mb-3">
                      {product.brand || 'AURA'} · {product.category?.name || 'Streetwear'}
                    </p>

                    {/* Price and Add to bag button */}
                    <div className="mt-auto space-y-3.5">
                      <div className="flex items-baseline gap-2">
                        <span className="text-gray-950 font-black text-[15px] sm:text-[16px]">
                          ₹{product.discountPrice || product.price}
                        </span>
                        {product.discountPrice && product.price > product.discountPrice && (
                          <span className="text-gray-400 text-xs line-through">
                            ₹{product.price}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={(e) => handleAddToCart(e, product)}
                        disabled={product.stock === 0}
                        className="w-full bg-gray-900 hover:bg-[#e11b23] text-white font-black text-[10px] sm:text-[11px] uppercase tracking-wider py-3.5 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:hover:bg-gray-900 disabled:hover:text-white flex items-center justify-center gap-1.5"
                      >
                        {product.stock === 0 ? (
                          'Out of Stock'
                        ) : (
                          <>
                            <FiShoppingCart size={13} /> ADD TO BAG
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
