import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiArrowRight } from 'react-icons/fi'
import { fetchBanners } from '../../redux/slices/productSlice'

// Minimalist, high-fashion editorial imagery & luxury copywriting (All Left Aligned)
const DEFAULT_SLIDES = [
  {
    tagline: 'PRE-FALL COLLECTION • VOL. 08',
    title: 'Modern Silhouette.',
    subtitle: 'Curated high-fashion cuts crafted with certified organic cottons, structural tailoring, and minimalist draping.',
    link: '/products',
    buttonText: 'Explore Collection',
    image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=1800&auto=format&fit=crop&q=85',
    align: 'left',
    accentText: 'Streetwear Redefined'
  },
  {
    tagline: 'EXCLUSIVE COUTURE',
    title: 'Noir Atelier.',
    subtitle: 'Where technical avant-garde engineering meets ultimate daily luxury. Tailored for effortless street statements.',
    link: '/products',
    buttonText: 'Shop the Look',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1800&auto=format&fit=crop&q=85',
    align: 'left',
    accentText: 'Avant-Garde Luxury'
  },
  {
    tagline: 'THE NEW STANDARD',
    title: 'Pure Essence.',
    subtitle: 'Elevated essentials designed for effortless, everyday grace. Created with high-grade, sustainable linens.',
    link: '/products',
    buttonText: 'Shop Minimalist',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1800&auto=format&fit=crop&q=85',
    align: 'left',
    accentText: 'Timeless Quality'
  },
  {
    tagline: 'HIGH-CULTURE ATHLETICS',
    title: 'Active Contour.',
    subtitle: 'A technical exploration of modern movement. High-performance microfibers engineered for fluid lightness.',
    link: '/products',
    buttonText: 'Shop Activewear',
    image: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?w=1800&auto=format&fit=crop&q=85',
    align: 'left',
    accentText: 'Technical Contour'
  },
  {
    tagline: 'SUN-DRENCHED ESCAPADE',
    title: 'Resort Edit.',
    subtitle: 'Lightweight Italian linen suiting and flowing silk garments tailored specifically for warm ocean breezes.',
    link: '/products',
    buttonText: 'Discover Resort',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1800&auto=format&fit=crop&q=85',
    align: 'left',
    accentText: 'Linen & Silk Couture'
  }
]

export default function HeroSlider() {
  const dispatch = useDispatch()
  const { banners } = useSelector((s) => s.products)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  // Map API banners or use defaults defensively (All Left Aligned)
  const slides = banners.length > 0
    ? banners.map((b) => ({
      tagline: b.bgColor ? `EXCLUSIVE COLLECTION • ${b.bgColor}` : 'NEW SELECTION ARRIVAL',
      title: b.title,
      subtitle: b.subtitle,
      link: b.link || '/products',
      buttonText: b.buttonText || 'Discover More',
      image: b.image?.url || 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=1800&auto=format&fit=crop&q=85',
      align: 'left',
      accentText: 'Premium Select'
    }))
    : DEFAULT_SLIDES

  const slideCount = slides.length

  useEffect(() => {
    dispatch(fetchBanners({ position: 'hero' }))
  }, [dispatch])

  // Safeguard if slide count drops or updates asynchronously
  useEffect(() => {
    if (currentSlide >= slideCount) {
      setCurrentSlide(0)
    }
  }, [slideCount, currentSlide])

  // Clean, lightweight slide cycle auto-scroll timer
  useEffect(() => {
    if (isPaused) return
    const timer = setInterval(() => {
      setCurrentSlide((curr) => (curr + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [slides.length, isPaused])

  const slide = slides[currentSlide] || DEFAULT_SLIDES[0]

  return (
    <div
      className="relative overflow-hidden h-[75vh] min-h-[500px] md:h-[100vh] md:min-h-[700px] max-h-[1080px] bg-neutral-950 flex items-center"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Cinematic Edge-to-Edge Image with Framer Motion Cross-fade & Ken Burns Zoom */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        <AnimatePresence>
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            <motion.img
              src={slide.image}
              alt={slide.title}
              initial={{ scale: 1 }}
              animate={{ scale: 1.08 }}
              transition={{ duration: 5.5, ease: "linear" }}
              className="w-full h-full object-cover object-center"
            />
            {/* Left-oriented multi-layered cinematic gradients to maximize legibility for left typography */}
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent md:bg-gradient-to-tr" />
            <div className="absolute inset-0 bg-neutral-950/35 md:bg-gradient-to-r md:from-neutral-950/95 md:via-neutral-950/40 md:to-transparent" />
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
      </div>

      {/* Magazine-Style Clean Content Typography Overlay (Left Aligned & Shifted Closer to the Edge) */}
      <div className="relative z-10 w-full h-full flex flex-col justify-center container-custom py-16 md:py-24 items-start pr-6 sm:pr-8 pl-4 sm:pl-6 md:pl-8 lg:pl-8 xl:pl-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-xl md:max-w-3xl flex flex-col text-left items-start mr-auto"
          >
            {/* Tagline Indicator */}
            <div className="flex items-center gap-2 mb-3 md:mb-5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary-500 shadow-glow" />
              <p className="text-[10px] md:text-xs font-bold tracking-[0.3em] text-primary-400 uppercase font-sans drop-shadow-sm">
                {slide.tagline}
              </p>
            </div>

            {/* Large Editorial Title - Explicit slate colors for premium legibility over photoreal elements */}
            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-display font-black text-slate-50 tracking-tighter leading-[1.05] mb-5 sm:mb-7 drop-shadow-md">
              {slide.title.split(' ').map((word, i) => {
                const isLast = i === slide.title.split(' ').length - 1;
                return (
                  <span key={i} className={isLast ? 'text-primary-500 font-serif italic font-normal ml-1 sm:ml-2' : ''}>
                    {word}{' '}
                  </span>
                )
              })}
            </h1>

            {/* Editorial Description - Crisp and readable light gray text */}
            <p className="text-slate-200 text-sm sm:text-base md:text-xl font-light leading-relaxed mb-8 sm:mb-10 font-sans tracking-wide drop-shadow-sm max-w-2xl">
              {slide.subtitle}
            </p>

            {/* Interactive Luxury Action Row */}
            <div className="flex flex-wrap gap-4 items-center">
              <Link
                to={slide.link}
                className="relative overflow-hidden group bg-primary-500 hover:bg-primary-400 text-dark-950 font-bold px-6 py-3.5 sm:px-8 sm:py-4 rounded-full flex items-center gap-3 transition-all duration-300 shadow-glow hover:shadow-glow-lg text-xs sm:text-sm uppercase tracking-widest"
              >
                <span>{slide.buttonText}</span>
                <FiArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform duration-300" />
              </Link>

              <div className="hidden xs:flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-[11px] text-slate-300 tracking-wider uppercase font-semibold backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                <span>{slide.accentText}</span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
