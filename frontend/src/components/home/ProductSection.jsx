import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiArrowRight } from 'react-icons/fi'
import ProductCard from '../product/ProductCard'
import { ProductCardSkeleton } from '../common/Skeleton'

export default function ProductSection({
  title,
  subtitle,
  products = [],
  loading = false,
  viewAllLink = '/products',
  viewAllLabel = 'View All',
  emptyMessage = 'No products found',
}) {
  const skeletonCount = 8

  return (
    <section className="py-12">
      <div className="container-custom">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="section-title">{title}</h2>
            {subtitle && <p className="section-subtitle mt-1">{subtitle}</p>}
          </div>
          <Link
            to={viewAllLink}
            className="flex items-center gap-2 text-primary-400 hover:text-primary-300 font-medium text-sm transition-colors group"
          >
            {viewAllLabel}
            <FiArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: skeletonCount }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 text-dark-400">
            <div className="text-5xl mb-4">🛍️</div>
            <p>{emptyMessage}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map((product, index) => (
              <ProductCard key={product._id} product={product} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
