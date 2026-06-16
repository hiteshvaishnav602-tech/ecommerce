import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiHeart, FiShoppingCart } from 'react-icons/fi'
import { useDispatch, useSelector } from 'react-redux'
import { addToCart } from '../../redux/slices/cartSlice'
import { toggleWishlist, fetchWishlist, selectWishlistProductIds } from '../../redux/slices/wishlistSlice'

export default function ProductCard({ product, index = 0 }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((s) => s.auth)
  const wishlistIds = useSelector(selectWishlistProductIds)

  const [hovered, setHovered] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  const isInWishlist = wishlistIds.includes(product._id)
  const discountPercent = product.discountPercent ||
    (product.price && product.discountPrice
      ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
      : 0)

  const defaultColor = product.colors?.find(c => c.isDefault) || product.colors?.[0]
  const images = (product.images && product.images.length > 0)
    ? product.images
    : (defaultColor?.images && defaultColor.images.length > 0)
      ? defaultColor.images
      : defaultColor?.image?.url
        ? [{ url: defaultColor.image.url }]
        : []
  const primaryImage = images[0]?.url
  const secondaryImage = images[1]?.url

  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) { navigate('/login'); return }
    if (product.sizes && product.sizes.length > 0) {
      navigate(`/product/${product._id}`)
      return
    }
    setIsAddingToCart(true)
    await dispatch(addToCart({ productId: product._id, quantity: 1 }))
    setIsAddingToCart(false)
  }

  const handleWishlist = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) { navigate('/login'); return }
    await dispatch(toggleWishlist(product._id))
    dispatch(fetchWishlist())
  }

  return (
    <Link to={`/product/${product._id}`} className="block group">
      {/* Image */}
      <div
        className="relative aspect-[3/4] bg-gray-100 overflow-hidden mb-2 sm:mb-3"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {primaryImage ? (
          <img
            src={hovered && secondaryImage ? secondaryImage : primaryImage}
            alt={product.title}
            className="w-full h-full object-cover object-top transition-all duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <span className="text-gray-300 text-5xl">👕</span>
          </div>
        )}

        {/* Fit tag */}
        {product.fit && (
          <div className="absolute top-2 left-2">
            <span className="bg-white text-gray-700 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 leading-none shadow-sm">
              {product.fit} FIT
            </span>
          </div>
        )}

        {/* Discount badge */}
        {discountPercent > 0 && (
          <div className="absolute top-2 left-2" style={{ top: product.fit ? '28px' : '8px' }}>
            <span className="bg-[#ffe600] text-black text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 leading-none">
              -{discountPercent}%
            </span>
          </div>
        )}

        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          className={`absolute top-2 right-2 w-7 h-7 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center shadow-md transition-all duration-200 ${isInWishlist ? 'text-red-500 opacity-100' : 'text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100'
            }`}
        >
          <FiHeart size={14} fill={isInWishlist ? 'currentColor' : 'none'} />
        </button>

        {/* Add to cart (hover) */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart}
            className="w-full bg-gray-900 hover:bg-black text-white text-[10px] sm:text-xs font-bold uppercase tracking-widest py-2.5 sm:py-3 transition-colors flex items-center justify-center gap-2"
          >
            {isAddingToCart ? (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <FiShoppingCart size={13} />
                {product.sizes?.length > 0 ? 'SELECT SIZE' : 'ADD TO CART'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="px-0.5">
        <p className="text-gray-900 font-semibold text-xs sm:text-sm leading-tight mb-0.5 line-clamp-1">{product.title}</p>
        <p className="text-gray-500 text-[10px] sm:text-xs mb-1">{product.category?.name}</p>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-gray-900 font-bold text-sm">₹{product.discountPrice ?? product.price}</span>
          {product.discountPrice && product.discountPrice < product.price && (
            <span className="text-gray-400 text-xs line-through">₹{product.price}</span>
          )}
          {discountPercent > 0 && (
            <span className="text-green-600 text-[10px] font-semibold">({discountPercent}% OFF)</span>
          )}
        </div>
      </div>
    </Link>
  )
}
