import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { fetchCategories } from '../../redux/slices/productSlice'

const categoryFallbacks = {
  't-shirts': 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400',
  'shirts': 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400',
  'jeans': 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400',
  'hoodies-sweatshirts': 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400',
  'joggers': 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=400',
  'dresses': 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400',
  'tops': 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400',
  'caps-hats': 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400',
  'backpacks': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
  'mobile-covers': 'https://images.unsplash.com/photo-1601593346740-925612772716?w=400',
}

const defaultFallback = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400';

export default function CategoryCards() {
  const dispatch = useDispatch()
  const { categories, loading } = useSelector((s) => s.products)

  useEffect(() => {
    dispatch(fetchCategories())
  }, [dispatch])

  // Filter to show only active categories
  const activeCategories = categories.filter(c => c.isActive !== false)

  return (
    <section className="py-20 container-custom bg-dark-950">
      {/* Section Title */}
      <div className="max-w-6xl mx-auto px-4 md:px-0 mb-16 text-left">
        <span className="text-primary-400 font-medium tracking-[0.25em] uppercase text-xs mb-3 block">
          Collections
        </span>
        <h2 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight">
          Shop by category
        </h2>
        <div className="w-12 h-[2px] bg-primary-500 mt-4 rounded-full" />
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-6 lg:gap-8 max-w-6xl mx-auto px-4 md:px-0">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="skeleton aspect-square w-full rounded-2xl" />
              <div className="skeleton h-4 w-2/3 mt-3 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-6 md:gap-8 max-w-6xl mx-auto px-4 md:px-0 mb-24">
          {activeCategories.map((cat, index) => {
            const imageUrl = cat.image?.url || categoryFallbacks[cat.slug] || defaultFallback;
            return (
              <motion.div
                key={cat._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="flex flex-col items-center group cursor-pointer"
              >
                <Link to={`/products?category=${cat.slug}`} className="w-full flex flex-col items-center">
                  {/* Premium Image Container with Glassmorphism Border & Subtle Glow */}
                  <div className="aspect-square w-full bg-dark-900 rounded-2xl overflow-hidden flex items-center justify-center border border-white/10 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.7)] group-hover:border-primary-500/30 group-hover:shadow-[0_15px_35px_-10px_rgba(249,136,34,0.15)] transition-all duration-500 ease-out">
                    <img
                      src={imageUrl}
                      alt={cat.name}
                      className="w-full h-full object-cover scale-[1.01] group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                  </div>
                  {/* Refined Category Name */}
                  <span className="text-white/85 font-display font-medium text-center mt-4 text-[11px] sm:text-xs tracking-[0.2em] uppercase transition-colors duration-300 group-hover:text-primary-400 leading-none">
                    {cat.name}
                  </span>
                </Link>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Premium Dark Luxury Editorial Offer Banner - Sleek, Compact Widescreen Strip with No Glowing Borders */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-6xl mx-auto px-4 md:px-0"
      >
        <div className="relative rounded-[2rem] bg-gradient-to-r from-neutral-900 via-neutral-900/95 to-neutral-950 p-6 md:py-8 md:px-12 flex flex-col md:flex-row items-center justify-between min-h-[180px] shadow-card border border-white/10 overflow-hidden group select-none">
          {/* Elegant gold lighting effect in corner */}
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-primary-500/10 rounded-full blur-[120px] pointer-events-none" />

          {/* High-quality background fashion editorial photo */}
          <div className="absolute right-0 top-0 bottom-0 w-full md:w-1/2 overflow-hidden h-full pointer-events-none">
            <img
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&auto=format"
              alt="Luxury Michael Kors Banner"
              className="w-full h-full object-cover opacity-20 md:opacity-75 object-right md:rounded-l-[4rem] scale-102 group-hover:scale-106 transition-transform duration-[1.2s] ease-out"
            />
            {/* Cinematic dark smooth blend gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-neutral-900 via-neutral-900/80 to-transparent hidden md:block" />
          </div>

          {/* Luxury Editorial Typography Content */}
          <div className="relative z-10 max-w-xl md:text-left text-center flex flex-col items-center md:items-start">
            {/* Tagline privilege */}
            <span className="text-primary-400 font-bold tracking-[0.3em] uppercase text-[9px] sm:text-[10px] mb-1.5 font-sans">
              Limited Time Privilege
            </span>

            {/* Compact Title with Gold Highlighting */}
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-display font-black text-slate-50 mb-1.5 tracking-tight leading-none drop-shadow-md">
              Couture Edit. <span className="text-primary-500 font-serif italic font-normal ml-1 sm:ml-2">25% Off</span>
            </h3>

            {/* Elegant description subtext */}
            <p className="text-slate-200 font-sans font-light text-xs sm:text-sm lg:text-base mb-2 tracking-wide drop-shadow-sm max-w-md leading-relaxed">
              Experience the timeless silhouette of <span className="font-serif italic font-semibold text-slate-50">Michael Kors</span> for her.
            </p>

            {/* Caption terms */}
            <p className="text-slate-400 text-[10px] sm:text-xs tracking-wider">
              Exclusive online access. Ends 5/15. *T&C Apply.
            </p>
          </div>

          {/* Upgraded Premium Compact Action Button (No Glowing Hover Border) */}
          <div className="relative z-10 mt-6 md:mt-0 flex-shrink-0">
            <Link
              to="/products?category=dresses"
              className="relative overflow-hidden group bg-slate-50 hover:bg-primary-500 text-neutral-950 hover:text-white font-bold py-2.5 px-7 rounded-lg text-xs uppercase tracking-[0.2em] transition-all duration-300 shadow-md hover:-translate-y-0.5 active:translate-y-0 block text-center"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
