import { useEffect, useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiArrowLeft, FiArrowRight, FiHeart, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import ProductCard from '../components/product/ProductCard'
import { fetchCategories, fetchTrendingProducts, fetchNewArrivals, fetchBestSellers, fetchBanners } from '../redux/slices/productSlice'

// ─── Static Data (exactly like The Souled Store) ─────────────────────────────

// Hero Banner images (3-panel slider like TSS)
const HERO_BANNERS = [
  {
    images: [
      'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=520&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=520&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1492288991661-058aa541ff43?w=520&auto=format&fit=crop',
    ],
    label: 'EXPLORE SHIRTS',
    badge: 'SUMMER \'26',
    link: '/products?gender=men&category=shirts',
  },
  {
    images: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=520&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=520&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=520&auto=format&fit=crop',
    ],
    label: 'EXPLORE DRESSES',
    badge: 'NEW SEASON',
    link: '/products?gender=women&category=dresses',
  },
  {
    images: [
      'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=520&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=520&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=520&auto=format&fit=crop',
    ],
    label: 'SHOP BOTTOMS',
    badge: 'TRENDING',
    link: '/products?category=joggers',
  },
]

// Latest Drops full-width sliders
const LATEST_DROPS = [
  {
    title: 'WRAPPED IN THE POWER OF THE DRAGON',
    subtitle: 'Explore T-Shirts',
    bgColor: '#1a1a2e',
    textColor: '#fff',
    image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=1600&auto=format&fit=crop',
    link: '/products?category=t-shirts',
    buttonText: 'EXPLORE T-SHIRTS',
  },
  {
    title: 'EFFORTLESS STYLE, EVERY DAY',
    subtitle: 'Shop Shirts Collection',
    bgColor: '#f5f0e8',
    textColor: '#1a1a1a',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=1600&auto=format&fit=crop',
    link: '/products?category=shirts',
    buttonText: 'EXPLORE SHIRTS',
  },
  {
    title: 'COMFORT MEETS CULTURE',
    subtitle: 'Hoodie Season is Here',
    bgColor: '#0d1b2a',
    textColor: '#fff',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=1600&auto=format&fit=crop',
    link: '/products?category=hoodies-sweatshirts',
    buttonText: 'SHOP HOODIES',
  },
]

// Category grid (3 columns, portrait images - like TSS "CATEGORIES" section)
const MENS_CATEGORIES = [
  { label: 'T-SHIRTS', image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop', link: '/products?gender=men&category=t-shirts' },
  { label: 'SHIRTS', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop', link: '/products?gender=men&category=shirts' },
  { label: 'POLOS', image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&auto=format&fit=crop', link: '/products?gender=men&category=polos' },
  { label: 'JEANS', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&auto=format&fit=crop', link: '/products?gender=men&category=jeans' },
  { label: 'JOGGERS', image: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&auto=format&fit=crop', link: '/products?gender=men&category=joggers' },
  { label: 'HOODIES', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&auto=format&fit=crop', link: '/products?gender=men&category=hoodies-sweatshirts' },
]
const WOMENS_CATEGORIES = [
  { label: 'T-SHIRTS', image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&auto=format&fit=crop', link: '/products?gender=women&category=t-shirts' },
  { label: 'SHIRTS', image: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600&auto=format&fit=crop', link: '/products?gender=women&category=shirts' },
  { label: 'TOPS', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop', link: '/products?gender=women&category=tops' },
  { label: 'DRESSES', image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&auto=format&fit=crop', link: '/products?gender=women&category=dresses' },
  { label: 'JEANS', image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop', link: '/products?gender=women&category=jeans' },
  { label: 'CO-ORDS', image: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=600&auto=format&fit=crop', link: '/products?gender=women&category=co-ords' },
]

// Trending tab definitions (like TSS tab pills)
const MENS_TABS = ['Trending', 'T-Shirts', 'Shirts', 'Polos', 'Men Pants', 'Men Jeans', 'Men Joggers']
const WOMENS_TABS = ['Trending', 'T-Shirts', 'Shirts', 'Tops', 'Dresses', 'Co-ords', 'Jeans']

// ─── Hero 3-Panel Slider ──────────────────────────────────────────────────────
function HeroBannerSlider({ banners, gender, loading }) {
  const [current, setCurrent] = useState(0)

  const slides = banners && banners.length > 0
    ? banners
      .filter(b => b.position === 'hero')
      .filter(b => {
        if (gender === 'women') {
          return b.gender === 'women'
        }
        if (b.gender && b.gender !== 'all') {
          return b.gender === gender
        }
        if (!gender) return true
        const link = (b.link || '').toLowerCase()
        const title = (b.title || '').toLowerCase()
        const subtitle = (b.subtitle || '').toLowerCase()
        if (gender === 'men') {
          return !link.includes('gender=women') && !title.includes('women') && !subtitle.includes('women')
        }
        return true
      })
      .map(b => {
        const imgUrls = b.image?.url?.includes(',')
          ? b.image.url.split(',').map(u => u.trim())
          : [b.image?.url || 'https://placehold.co/600']
        return {
          images: imgUrls,
          label: b.title,
          badge: b.subtitle || 'HOT',
          link: gender ? `/products?gender=${gender}` : (b.link || '/products')
        }
      })
    : (loading
      ? []
      : (gender === 'women' || gender === 'sneakers' ? [] : HERO_BANNERS.filter(b => {
        if (!gender) return true
        if (gender === 'men') return b.link.includes('gender=men') || !b.link.includes('gender=')
        if (gender === 'women') return b.link.includes('gender=women') || !b.link.includes('gender=')
        return true
      }).map(b => ({
        ...b,
        link: gender ? `/products?gender=${gender}` : b.link
      }))))

  const total = slides.length

  useEffect(() => {
    if (current >= total) setCurrent(0)
  }, [total, current])

  useEffect(() => {
    if (total <= 1) return
    const timer = setInterval(() => setCurrent(c => (c + 1) % total), 5000)
    return () => clearInterval(timer)
  }, [total])

  if (loading && (!banners || banners.length === 0)) {
    return (
      <div className="w-full bg-white overflow-hidden select-none">
        <style dangerouslySetInnerHTML={{
          __html: `
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
          .animate-shimmer {
            background: linear-gradient(90deg, #f0f0f0 25%, #f7f7f7 50%, #f0f0f0 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite linear;
          }
        `}} />
        <div className="grid grid-cols-3 h-[160px] xs:h-[220px] sm:h-[320px] md:h-[420px] lg:h-[520px] gap-2 p-1 bg-gray-50">
          <div className="animate-shimmer h-full w-full rounded-md" />
          <div className="animate-shimmer h-full w-full rounded-md" />
          <div className="animate-shimmer h-full w-full rounded-md" />
        </div>
        <div className="w-full bg-white py-6 flex items-center justify-center">
          <div className="flex gap-1.5">
            <div className="h-2.5 w-6 rounded-full bg-gray-200" />
            <div className="h-2.5 w-2.5 rounded-full bg-gray-200" />
            <div className="h-2.5 w-2.5 rounded-full bg-gray-200" />
          </div>
        </div>
      </div>
    )
  }

  if (total === 0) return null

  const slide = slides[current] || HERO_BANNERS[0]
  const isSingle = slide ? slide.images.length === 1 : true

  return (
    <div className="relative w-full bg-white overflow-hidden">
      {/* Banner Area */}
      <div className="relative w-full" style={isSingle ? {} : { minHeight: '160px' }}>
        {isSingle ? (
          <Link to={slide.link} className="block w-full h-[180px] xs:h-[240px] sm:h-[360px] md:h-[480px] lg:h-[550px] relative overflow-hidden">
            <img
              src={slide.images[0]}
              alt={slide.label || ''}
              className="w-full h-full object-cover object-center transition-all duration-700"
            />
            {/* Logo Overlay */}
            <div className="absolute bottom-2 right-1 sm:bottom-2.5 sm:right-1 pointer-events-none z-10 select-none">
              <img
                src="/logo.png"
                alt="Aura Logo"
                className="w-14 sm:w-20 md:w-26 lg:w-32 object-contain"
                style={{ filter: 'drop-shadow(0px 2px 6px rgba(0,0,0,0.7)) drop-shadow(0px 4px 16px rgba(0,0,0,0.4))' }}
              />
            </div>
          </Link>
        ) : (
          <Link to={slide.link} className="grid grid-cols-3 h-[160px] xs:h-[220px] sm:h-[320px] md:h-[420px] lg:h-[520px] relative">
            {slide.images.map((img, i) => (
              <div key={i} className="relative overflow-hidden">
                <img
                  src={img}
                  alt=""
                  className="w-full h-full object-cover object-top transition-all duration-700"
                />
                {/* Label overlay on middle panel */}
                {i === 0 && slide.label && (
                  <div className="absolute inset-0 flex items-center justify-start p-6 sm:p-10 pointer-events-none">
                    <div className="bg-[#ffe600] text-black font-black text-xl sm:text-3xl lg:text-4xl px-4 sm:px-6 py-2 sm:py-3 rounded-lg shadow-xl tracking-tight leading-none" style={{ fontFamily: 'Outfit, sans-serif' }}>
                      {slide.label.split(' ').slice(0, 1).join(' ')}
                      <br />
                      <span className="text-lg sm:text-2xl font-black">{slide.label.split(' ').slice(1).join(' ')}</span>
                    </div>
                  </div>
                )}
                {/* Logo on third panel */}
                {i === 2 && (
                  <div className="absolute bottom-2.5 right-1 pointer-events-none z-10 select-none">
                    <img
                      src="/logo.png"
                      alt="Aura Logo"
                      className="w-14 sm:w-20 md:w-26 lg:w-32 object-contain"
                      style={{ filter: 'drop-shadow(0px 2px 6px rgba(0,0,0,0.7)) drop-shadow(0px 4px 16px rgba(0,0,0,0.4))' }}
                    />
                  </div>
                )}
              </div>
            ))}
          </Link>
        )}

        {total > 1 && (
          <>
            {/* Left Arrow */}
            <button
              onClick={() => setCurrent(c => (c - 1 + total) % total)}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-1.5 text-white/80 hover:text-white transition-all hover:scale-110 active:scale-95 z-10"
              aria-label="Previous slide"
            >
              <FiChevronLeft size={24} className="sm:size-8 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" />
            </button>
            {/* Right Arrow */}
            <button
              onClick={() => setCurrent(c => (c + 1) % total)}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-1.5 text-white/80 hover:text-white transition-all hover:scale-110 active:scale-95 z-10"
              aria-label="Next slide"
            >
              <FiChevronRight size={24} className="sm:size-8 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" />
            </button>
          </>
        )}
      </div>

      {/* Dots/Spacer Bar below the banner (exactly like The Souled Store) */}
      <div className="w-full bg-white py-6 flex items-center justify-center">
        {total > 1 ? (
          <div className="flex gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-2.5 rounded-full transition-all ${i === current
                  ? 'bg-[#147e85] w-6'
                  : 'bg-[#d1e7e9] hover:bg-[#b0d8db] w-2.5'
                  }`}
              />
            ))}
          </div>
        ) : (
          <div className="h-2.5" />
        )}
      </div>
    </div>
  )
}

// Custom vector SVGs for Benefits Strip to match The Souled Store
const CashbackIcon = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="w-6 h-6 xs:w-7 h-7 sm:w-11 sm:h-11 shrink-0 text-black">
    {/* Circular return arrow */}
    <path d="M20 6C28.28 6 35 12.72 35 21C35 29.28 28.28 36 20 36C13.2 36 7.48 31.45 5.58 25.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10 25.2H5.58V29.6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    {/* Rupee Symbol */}
    <path d="M16 15H24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16 19.5H24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16 15C21 15 23 16 23 19.5C23 23 20 24 16 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M19.5 24L24 30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    {/* Hand supporting from bottom left */}
    <path d="M4 31H8V36H4V31Z" fill="currentColor" />
    <path d="M8 33.5C11.5 33.5 13 32 15 30L12.5 27.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const ReturnsIcon = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="w-6 h-6 xs:w-7 h-7 sm:w-11 sm:h-11 shrink-0 text-black">
    {/* Circular return arrow counter-clockwise */}
    <path d="M20 6C28.28 6 35 12.72 35 21C35 29.28 28.28 36 20 36C12.5 36 6.2 30.5 5.1 23.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9.5 24.3H5.1V28.7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    {/* Package box in the center */}
    <path d="M20 13L27 16.5V24.5L20 28L13 24.5V16.5L20 13Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M20 13V28" stroke="currentColor" strokeWidth="1.8" />
    <path d="M13 16.5L20 20L27 16.5" stroke="currentColor" strokeWidth="1.8" />
  </svg>
)

const ShippingIcon = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="w-6 h-6 xs:w-7 h-7 sm:w-11 sm:h-11 shrink-0 text-black">
    {/* Speed lines */}
    <path d="M4 16H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M2 21H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M4 26H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    {/* Truck body */}
    <path d="M11 13H27V27H11V13Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="currentColor" fillOpacity="0.08" />
    {/* Truck cabin */}
    <path d="M27 17H33L36 21V27H27V17Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="currentColor" fillOpacity="0.08" />
    {/* Cabin window */}
    <path d="M29 19.5H32.5L34.5 22H29V19.5Z" fill="currentColor" />
    {/* Wheels */}
    <circle cx="16" cy="29" r="3.5" stroke="currentColor" strokeWidth="2" fill="white" />
    <circle cx="31" cy="29" r="3.5" stroke="currentColor" strokeWidth="2" fill="white" />
  </svg>
)

// ─── Benefits Strip ───────────────────────────────────────────────────────────
function BenefitsStrip() {
  return (
    <div className="bg-[#e8f6f8] border-y border-[#d5ebed] py-2.5 sm:py-5">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 grid grid-cols-3 gap-1 sm:gap-8 justify-items-center">
        {[
          { icon: <CashbackIcon />, label: '10% Cashback', sub: 'on all App orders' },
          { icon: <ReturnsIcon />, label: '30-Day Returns', sub: '& Exchanges' },
          { icon: <ShippingIcon />, label: 'Free Shipping', sub: 'On all orders' },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-1.5 sm:gap-4 max-w-full justify-center">
            {item.icon}
            <div className="text-left font-display" style={{ fontFamily: 'Outfit, sans-serif' }}>
              <p className="text-gray-900 font-extrabold text-[8.5px] xs:text-[10px] sm:text-[13px] md:text-[14px] leading-tight uppercase tracking-wider">
                {item.label}
              </p>
              <p className="hidden sm:block text-gray-800 font-semibold text-[11px] md:text-[12px] leading-tight mt-0.5">
                {item.sub}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Latest Drops Full-Width Slider ──────────────────────────────────────────
function LatestDropsSlider({ banners, gender, loading }) {
  const [current, setCurrent] = useState(0)

  const slides = banners && banners.length > 0
    ? banners
      .filter(b => b.position === 'drops')
      .filter(b => {
        if (gender === 'women') {
          return b.gender === 'women'
        }
        if (b.gender && b.gender !== 'all') {
          return b.gender === gender
        }
        if (!gender) return true
        const link = (b.link || '').toLowerCase()
        const title = (b.title || '').toLowerCase()
        const subtitle = (b.subtitle || '').toLowerCase()
        if (gender === 'men') {
          return !link.includes('gender=women') && !title.includes('women') && !subtitle.includes('women')
        }
        return true
      })
      .map(b => ({
        title: b.title,
        subtitle: b.subtitle || '',
        bgColor: b.bgColor || '#1a1a2e',
        textColor: b.textColor || '#ffffff',
        image: b.image?.url || 'https://placehold.co/1600',
        link: gender ? `/products?gender=${gender}` : (b.link || '/products'),
        buttonText: b.buttonText || 'Explore Now'
      }))
    : []

  const displaySlidesRaw = slides
  const displaySlides = (gender === 'women' || gender === 'sneakers')
    ? displaySlidesRaw
    : displaySlidesRaw.filter(s => {
      if (!gender) return true
      const link = (s.link || '').toLowerCase()
      const title = (s.title || '').toLowerCase()
      const subtitle = (s.subtitle || '').toLowerCase()
      if (gender === 'men') {
        return !link.includes('gender=women') && !title.includes('women') && !subtitle.includes('women')
      }
      return true
    })
  const total = displaySlides.length

  useEffect(() => {
    if (current >= total) setCurrent(0)
  }, [total, current])

  useEffect(() => {
    if (total <= 1) return
    const timer = setInterval(() => setCurrent(c => (c + 1) % total), 6000)
    return () => clearInterval(timer)
  }, [total])

  if (loading && (!banners || banners.length === 0)) {
    return (
      <section className="bg-white py-4 sm:py-8 select-none">
        <h2 className="text-center text-xl sm:text-2xl font-black text-gray-900 mb-3 sm:mb-5 tracking-wider uppercase" style={{ fontFamily: 'Outfit, sans-serif' }}>
          LATEST DROPS
        </h2>
        <div className="relative w-full overflow-hidden animate-shimmer bg-gray-100 h-[200px] xs:h-[250px] sm:h-[360px] md:h-[480px] lg:h-[550px]" />
      </section>
    )
  }

  if (total === 0) return null
  const drop = displaySlides[current] || LATEST_DROPS[0]

  const isLightBg = drop.bgColor && ['#f5f0e8', '#ffffff', '#fff', '#e8f6f8'].includes(drop.bgColor.toLowerCase().trim())

  return (
    <section className="bg-white py-4 sm:py-8">
      <h2 className="text-center text-xl sm:text-2xl font-black text-gray-900 mb-3 sm:mb-5 tracking-wider uppercase" style={{ fontFamily: 'Outfit, sans-serif' }}>
        LATEST DROPS
      </h2>

      <div className="relative w-full overflow-hidden h-[200px] xs:h-[250px] sm:h-[360px] md:h-[480px] lg:h-[550px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
            style={{ backgroundColor: drop.bgColor }}
          >
            <Link to={drop.link} className="block w-full h-full relative">
              <img
                src={drop.image}
                alt={drop.title}
                className="w-full h-full object-cover"
                style={{ opacity: isLightBg ? 0.9 : 0.7 }}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 sm:px-8">
                <p className="text-[10px] xs:text-xs sm:text-lg md:text-xl font-light mb-1 sm:mb-3 tracking-[0.2em] sm:tracking-[0.3em] uppercase" style={{ color: drop.textColor, opacity: 0.85 }}>
                  {drop.subtitle}
                </p>
                <h3 className="text-lg xs:text-2xl sm:text-4xl md:text-5xl font-black mb-2 sm:mb-6 uppercase tracking-tight leading-tight max-w-2xl" style={{ fontFamily: 'Outfit, sans-serif', color: drop.textColor }}>
                  {drop.title}
                </h3>
              </div>
            </Link>
            {/* Logo Overlay */}
            <div className="absolute bottom-2.5 right-1 pointer-events-none z-10 select-none">
              <img
                src="/logo.png"
                alt="Aura Logo"
                className="w-14 sm:w-20 md:w-26 lg:w-32 object-contain"
                style={{ filter: 'drop-shadow(0px 2px 6px rgba(0,0,0,0.7)) drop-shadow(0px 4px 16px rgba(0,0,0,0.4))' }}
              />
            </div>
          </motion.div>
        </AnimatePresence>

        {total > 1 && (
          <>
            <button
              onClick={() => setCurrent(c => (c - 1 + total) % total)}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-1.5 text-white/80 hover:text-white transition-all hover:scale-110 active:scale-95 z-10"
              aria-label="Previous slide"
            >
              <FiChevronLeft size={24} className="sm:size-8 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" />
            </button>
            <button
              onClick={() => setCurrent(c => (c + 1) % total)}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-1.5 text-white/80 hover:text-white transition-all hover:scale-110 active:scale-95 z-10"
              aria-label="Next slide"
            >
              <FiChevronRight size={24} className="sm:size-8 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" />
            </button>
          </>
        )}

        {/* Dots */}
        {total > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {displaySlides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-2 rounded-full transition-all ${i === current ? 'bg-white w-6' : 'bg-white/50 w-2'}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

// ─── Product Row Carousel ─────────────────────────────────────────────────────
function ProductCarousel({ title, products, loading, viewAllLink }) {
  if (!loading && (!products || products.length === 0)) return null;
  const scrollRef = useRef(null)

  const scroll = (dir) => {
    const container = scrollRef.current
    if (container) {
      const scrollAmount = dir * (container.clientWidth * 0.8)
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  return (
    <section className="py-10 bg-white border-t border-gray-100">
      <div className="max-w-full px-4 sm:px-6 lg:px-8">
        {/* Centered Title */}
        <h2
          className="text-center text-xl sm:text-[22px] font-black text-[#0f2a4a] uppercase tracking-[0.08em] mb-6"
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          {title}
        </h2>

        {/* Carousel Container */}
        <div className="relative group/carousel">
          {/* Left Arrow Button */}
          {products.length > 0 && !loading && (
            <button
              onClick={() => scroll(-1)}
              className="absolute -left-2 sm:-left-5 top-[38%] -translate-y-1/2 z-20 w-10 h-10 bg-white/95 hover:bg-white rounded-full hidden md:flex items-center justify-center text-gray-800 shadow-md hover:scale-105 border border-gray-150 transition-all opacity-0 group-hover/carousel:opacity-100"
            >
              <FiChevronLeft size={24} />
            </button>
          )}

          {/* Right Arrow Button */}
          {products.length > 0 && !loading && (
            <button
              onClick={() => scroll(1)}
              className="absolute -right-2 sm:-right-5 top-[38%] -translate-y-1/2 z-20 w-10 h-10 bg-white/95 hover:bg-white rounded-full hidden md:flex items-center justify-center text-gray-800 shadow-md hover:scale-105 border border-gray-150 transition-all opacity-0 group-hover/carousel:opacity-100"
            >
              <FiChevronRight size={24} />
            </button>
          )}

          {loading ? (
            <div className="flex gap-4 overflow-hidden">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex-shrink-0 w-[170px] xs:w-[195px] sm:w-[calc(50%-10px)] md:w-[calc(33.333%-16px)] lg:w-[calc(25%-18px)]">
                  <div className="bg-gray-100 animate-pulse aspect-[3/4] rounded-lg mb-3" />
                  <div className="bg-gray-100 animate-pulse h-4 w-3/4 rounded mb-2" />
                  <div className="bg-gray-100 animate-pulse h-4 w-1/2 rounded" />
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div ref={scrollRef} className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-none pb-4">
              {products.map((product) => (
                <div key={product._id} className="flex-shrink-0 w-[170px] xs:w-[195px] sm:w-[calc(50%-10px)] md:w-[calc(33.333%-16px)] lg:w-[calc(25%-18px)]">
                  <TSSProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">No products available.</div>
          )}
        </div>

        {viewAllLink && products.length > 0 && (
          <div className="text-center mt-4">
            <Link to={viewAllLink} className="inline-block border-2 border-gray-900 text-gray-900 font-bold text-xs uppercase tracking-[0.2em] px-8 py-3 hover:bg-gray-900 hover:text-white transition-colors">
              VIEW ALL
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}

// ─── TSS-Style Product Card ───────────────────────────────────────────────────
function TSSProductCard({ product }) {
  const [hovered, setHovered] = useState(false)
  const images = product.images || []
  const displayImage = hovered && images[1] ? images[1].url : images[0]?.url

  // Dynamically determine fit types (e.g. OVERSIZED, EASY, RELAXED, REGULAR)
  const hasOversized = product.title?.toLowerCase().includes('oversized') || product.fit?.toLowerCase().includes('oversized') || product.tags?.some(t => t.toLowerCase().includes('oversized'));
  const hasEasy = product.title?.toLowerCase().includes('easy') || product.fit?.toLowerCase().includes('easy') || product.tags?.some(t => t.toLowerCase().includes('easy'));
  const hasRelaxed = product.title?.toLowerCase().includes('relaxed') || product.fit?.toLowerCase().includes('relaxed') || product.tags?.some(t => t.toLowerCase().includes('relaxed'));
  const hasRegular = product.title?.toLowerCase().includes('regular') || product.fit?.toLowerCase().includes('regular') || product.tags?.some(t => t.toLowerCase().includes('regular'));
  const hasBaggy = product.title?.toLowerCase().includes('baggy') || product.fit?.toLowerCase().includes('baggy') || product.tags?.some(t => t.toLowerCase().includes('baggy'));

  let topLeftText = '';
  if (hasOversized) topLeftText = 'OVERSIZED\nFIT';
  else if (hasBaggy) topLeftText = 'BAGGY\nFIT';
  else if (hasEasy) topLeftText = 'EASY\nFIT';
  else if (hasRelaxed) topLeftText = 'RELAXED\nFIT';
  else if (hasRegular) topLeftText = 'REGULAR\nFIT';

  // Dynamically determine bottom banner badge
  const isTshirt = product.title?.toLowerCase().includes('t-shirt') || product.title?.toLowerCase().includes('tee') || product.category?.name?.toLowerCase().includes('t-shirts') || product.category?.name?.toLowerCase().includes('t-shirt');
  const isDenim = product.title?.toLowerCase().includes('denim') || product.title?.toLowerCase().includes('jeans') || product.category?.name?.toLowerCase().includes('jeans') || product.material?.toLowerCase().includes('denim');
  const isHoodie = product.title?.toLowerCase().includes('hoodie') || product.title?.toLowerCase().includes('pullover') || product.category?.name?.toLowerCase().includes('hoodies');

  let bottomText = '';
  if (hasBaggy) {
    bottomText = 'BAGGY FIT';
  } else if (isTshirt && (hasOversized || product.material?.toLowerCase().includes('cotton'))) {
    bottomText = 'PREMIUM HEAVY GAUGE FABRIC';
  } else if (isDenim) {
    bottomText = 'CLASSIC DENIM';
  } else if (isHoodie) {
    bottomText = 'SUPER SOFT FLEECE';
  }

  const categoryName = product.category?.name || 'T-Shirts';
  const fitPrefix = hasOversized ? 'Oversized ' : hasBaggy ? 'Baggy ' : hasEasy ? 'Easy ' : hasRelaxed ? 'Relaxed ' : '';
  const displayCategory = categoryName.toLowerCase().includes('t-shirt') || categoryName.toLowerCase().includes('shirt')
    ? `${fitPrefix}${categoryName}`
    : categoryName;

  return (
    <Link to={`/product/${product._id}`} className="block group">
      <div
        className="relative aspect-[3/4] bg-gray-150 overflow-hidden mb-3.5 border border-gray-100"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {displayImage ? (
          <img
            src={displayImage}
            alt={product.title}
            className="w-full h-full object-cover object-top transition-all duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <span className="text-gray-300 text-4xl">👕</span>
          </div>
        )}

        {/* Top-Left Fit Badge */}
        {topLeftText && (
          <div className="absolute top-2.5 left-2.5 bg-black/40 border border-white/20 text-white font-extrabold text-[9px] sm:text-[10px] tracking-widest px-2.5 py-1 uppercase text-left leading-[1.25] rounded-sm backdrop-blur-[1px] whitespace-pre-line z-10">
            {topLeftText}
          </div>
        )}

        {/* Bottom Full-width Badge */}
        {bottomText && (
          <div className="absolute bottom-0 left-0 right-0 bg-[#161616] text-white text-[9px] sm:text-[10px] font-black tracking-widest py-1.5 text-center uppercase z-10">
            {bottomText}
          </div>
        )}

        {/* Discount badge */}
        {product.discountPercent > 0 && (
          <div className="absolute top-2.5 right-2.5 z-10">
            <span className="bg-[#ffe600] text-black text-[10px] font-bold px-2 py-1">
              -{product.discountPercent}%
            </span>
          </div>
        )}

        {/* Wishlist */}
        <button className="absolute top-2.5 right-2.5 w-8 h-8 bg-white rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors shadow-sm opacity-100 md:opacity-0 md:group-hover:opacity-100 z-20">
          <FiHeart size={15} />
        </button>
      </div>

      <div className="text-left font-display" style={{ fontFamily: 'Outfit, sans-serif' }}>
        <p className="text-gray-900 font-extrabold text-[13px] sm:text-[14px] leading-tight truncate mb-0.5 uppercase tracking-wide">
          {product.title}
        </p>
        <p className="text-gray-500 font-semibold text-[11px] sm:text-[12px] leading-tight mb-1.5">
          {displayCategory}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-gray-900 font-black text-[13px] sm:text-[14px]">₹{product.discountPrice ?? product.price}</span>
          {product.discountPrice && (
            <span className="text-gray-400 text-xs line-through">₹{product.price}</span>
          )}
        </div>
      </div>
    </Link>
  )
}

// ─── Categories Grid (3-column portrait, like TSS "CATEGORIES") ───────────────
function CategoriesGrid({ categories }) {
  if (!categories || categories.length === 0) return null;
  return (
    <section className="py-8 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 md:px-10 lg:px-12">
        <h2 className="text-center text-xl sm:text-[22px] font-black text-[#0f2a4a] uppercase tracking-[0.08em] mb-6" style={{ fontFamily: 'Outfit, sans-serif' }}>
          CATEGORIES
        </h2>
        <div className="grid grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {categories.map((cat, i) => (
            <Link key={i} to={cat.link} className="group block">
              <div className="aspect-[9/10] bg-gray-100 overflow-hidden mb-3">
                <img
                  src={cat.image}
                  alt={cat.label}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <p className="text-left text-gray-900 font-bold text-sm sm:text-base uppercase tracking-[0.06em] mt-2.5" style={{ fontFamily: 'Outfit, sans-serif' }}>
                {cat.label}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Trending Tabs Section (exactly like TSS) ─────────────────────────────────
function TrendingTabsSection({ tabs, products, loading }) {
  if (!loading && (!products || products.length === 0)) return null;
  const [activeTab, setActiveTab] = useState(tabs[0])

  const filtered = activeTab === tabs[0]
    ? products
    : products.filter(p => {
      const cleanTab = activeTab.toLowerCase().replace(/\s+/g, '-').trim();
      const cleanSlug = (p.category?.slug || p.category?.name || p.category || '').toLowerCase().trim();
      const title = (p.title || '').toLowerCase();
      const fit = (p.fit || '').toLowerCase();
      const tags = (p.tags || []).map(t => t.toLowerCase());

      // Helper check: if tab keyword is found in title or tags
      const titleOrTagsMatch = (keyword) => {
        return title.includes(keyword) || tags.some(t => t.includes(keyword));
      };

      // 1. Special Case: T-Shirts (matches both regular, oversized, and polo t-shirts)
      if (cleanTab === 't-shirts') {
        return cleanSlug.includes('t-shirt') || cleanSlug.includes('tee') || cleanSlug.includes('polo') ||
          titleOrTagsMatch('t-shirt') || titleOrTagsMatch('tee') || titleOrTagsMatch('polo') ||
          tags.some(t => t.includes('t-shirt') || t.includes('tee') || t.includes('tshirts') || t.includes('polo'));
      }

      // 2. Special Case: Shirts (should not match T-Shirts)
      if (cleanTab === 'shirts') {
        const isShirt = cleanSlug === 'shirts' || cleanSlug === 'shirt' || cleanSlug.includes('shirt') || titleOrTagsMatch('shirt');
        const isTshirt = cleanSlug.includes('t-shirt') || cleanSlug.includes('tee') || titleOrTagsMatch('t-shirt') || titleOrTagsMatch('tee');
        return isShirt && !isTshirt;
      }

      // 3. Special Case: Polos
      if (cleanTab === 'polos') {
        return cleanSlug === 'polos' || cleanSlug === 'polo' || cleanSlug.includes('polo') || titleOrTagsMatch('polo');
      }

      // 4. Special Case: Men Pants / Jeans / Joggers / Tops / Dresses / Co-ords
      if (cleanTab === 'men-pants' || cleanTab === 'pants') {
        return cleanSlug.includes('pants') || cleanSlug.includes('trousers') || titleOrTagsMatch('pants') || titleOrTagsMatch('trouser') || titleOrTagsMatch('bottom');
      }
      if (cleanTab === 'men-jeans' || cleanTab === 'jeans') {
        return cleanSlug.includes('jeans') || cleanSlug.includes('denim') || titleOrTagsMatch('jeans') || titleOrTagsMatch('denim');
      }
      if (cleanTab === 'men-joggers' || cleanTab === 'joggers') {
        return cleanSlug.includes('joggers') || titleOrTagsMatch('jogger') || titleOrTagsMatch('track');
      }
      if (cleanTab === 'tops') {
        return cleanSlug.includes('top') || titleOrTagsMatch('top') || titleOrTagsMatch('crop');
      }
      if (cleanTab === 'dresses' || cleanTab === 'dress') {
        return cleanSlug.includes('dress') || titleOrTagsMatch('dress') || titleOrTagsMatch('frock');
      }
      if (cleanTab === 'co-ords' || cleanTab === 'co-ord') {
        return cleanSlug.includes('co-ord') || cleanSlug.includes('set') || titleOrTagsMatch('co-ord') || titleOrTagsMatch('set');
      }

      // 5. Default string matching with singular/plural support
      return cleanSlug.includes(cleanTab) ||
        cleanTab.includes(cleanSlug) ||
        (cleanSlug.endsWith('s') && cleanSlug.slice(0, -1) === cleanTab) ||
        (cleanTab.endsWith('s') && cleanTab.slice(0, -1) === cleanSlug) ||
        title.includes(cleanTab) ||
        tags.some(t => t.includes(cleanTab));
    })

  return (
    <section className="py-8 bg-white border-t border-gray-100">
      <div className="max-w-full px-4 sm:px-6 lg:px-8">
        {/* Tab Pills - horizontal scroll on mobile */}
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-2 mb-6">
          {tabs.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-[11px] sm:text-xs font-semibold uppercase tracking-wider border transition-all duration-200 ${activeTab === tab
                ? 'bg-gray-900 border-gray-900 text-white'
                : 'border-gray-300 text-gray-600 hover:border-gray-500 hover:text-gray-900 bg-white'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Products Grid - 4 columns */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i}>
                <div className="bg-gray-100 animate-pulse aspect-[3/4] mb-3" />
                <div className="bg-gray-100 animate-pulse h-4 w-3/4 mb-2 rounded" />
                <div className="bg-gray-100 animate-pulse h-4 w-1/2 rounded" />
              </div>
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.slice(0, 8).map(product => (
              <TSSProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">🛍️</p>
            <p>No products found in this category.</p>
            <Link to="/products" className="mt-4 inline-block text-red-600 font-semibold text-sm hover:underline">
              Browse All Products
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}

// ─── Brand Stats Strip (like TSS "Over 6 Million Happy Customers") ────────────
function BrandStats() {
  return (
    <div className="bg-white border-y border-gray-100 py-10">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <p className="text-red-600 text-xs font-bold tracking-[0.3em] uppercase mb-2">HOMEGROWN INDIAN BRAND</p>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-2">
          Over <span className="text-red-600">6 Million</span> Happy Customers
        </h2>
        <p className="text-gray-500 text-sm sm:text-base">India's most-loved fashion destination</p>

        <div className="grid grid-cols-3 gap-6 mt-10">
          {[
            { value: '6M+', label: 'Happy Customers' },
            { value: '1000+', label: 'Unique Designs' },
            { value: '30', label: 'Days Easy Returns' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-3xl sm:text-4xl font-black text-gray-900 mb-1">{stat.value}</p>
              <p className="text-gray-500 text-xs sm:text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Main Homepage Component ──────────────────────────────────────────────────
export default function HomePage({ gender }) {
  const dispatch = useDispatch()
  const { trending, newArrivals, bestSellers, banners, bannersLoading, categories: dbCategories, loading } = useSelector((s) => s.products)

  const isWomen = gender === 'women'
  const displayCategories = dbCategories && dbCategories.length > 0
    ? dbCategories
      .filter(cat => {
        if (gender === 'women') {
          return cat.gender === 'women'
        }
        if (gender === 'sneakers') {
          return cat.gender === 'sneakers'
        }
        if (!gender) return true
        return cat.gender === gender || cat.gender === 'unisex' || cat.gender === 'all'
      })
      .map(cat => ({
        label: cat.name.toUpperCase(),
        image: cat.image?.url || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600',
        link: gender
          ? `/products?gender=${gender}&category=${cat.slug}`
          : `/products?category=${cat.slug}`
      }))
    : []
  const trendingTabs = ['Trending', ...displayCategories.map(c => c.label)]

  // Filter by gender
  const filterByGender = (list) => {
    if (!gender || gender === 'accessories') return list
    if (gender === 'women') {
      return list.filter(p => p.gender === 'women')
    }
    if (gender === 'sneakers') {
      return list.filter(p => p.gender === 'sneakers')
    }
    return list.filter(p => !p.gender || p.gender === gender || p.gender === 'unisex')
  }

  useEffect(() => {
    dispatch(fetchTrendingProducts())
    dispatch(fetchNewArrivals())
    dispatch(fetchBestSellers())
    dispatch(fetchCategories())
    dispatch(fetchBanners())
  }, [dispatch])

  const trendingFiltered = filterByGender(trending)
  const newArrivalsFiltered = filterByGender(newArrivals)
  const bestSellersFiltered = filterByGender(bestSellers)

  // Use gender-filtered if available, else show all
  const trendingDisplay = trendingFiltered.length > 0 ? trendingFiltered : (gender === 'women' || gender === 'sneakers' ? [] : trending)
  const newArrivalsDisplay = newArrivalsFiltered.length > 0 ? newArrivalsFiltered : (gender === 'women' || gender === 'sneakers' ? [] : newArrivals)
  const bestSellersDisplay = bestSellersFiltered.length > 0 ? bestSellersFiltered : (gender === 'women' || gender === 'sneakers' ? [] : bestSellers)

  return (
    <div className="min-h-screen bg-white">

      {/* 1. Hero 3-Panel Slider */}
      <HeroBannerSlider banners={banners} gender={gender} loading={bannersLoading} />

      {/* 2. Benefits Strip */}
      <BenefitsStrip />

      {/* 3. Latest Drops Full-Width Slider */}
      <LatestDropsSlider banners={banners} gender={gender} loading={bannersLoading} />

      {/* 4. New Arrivals - Horizontal Scroll Carousel */}
      <ProductCarousel
        title="NEW ARRIVALS"
        products={newArrivalsDisplay}
        loading={loading}
      />

      {/* 5. Categories 3-Column Grid */}
      <CategoriesGrid categories={displayCategories} />

      {/* 6. Trending with Tab Pills + 4-column Grid */}
      <TrendingTabsSection
        tabs={trendingTabs}
        products={trendingDisplay}
        loading={loading}
      />

      {/* 7. Best Sellers Carousel */}
      <ProductCarousel
        title="BEST SELLERS"
        products={bestSellersDisplay}
        loading={loading}
        viewAllLink={`/products?bestSeller=true${gender ? `&gender=${gender}` : ''}`}
      />

      {/* 8. Brand Stats (like TSS "6 Million happy customers") */}
      <BrandStats />

    </div>
  )
}
