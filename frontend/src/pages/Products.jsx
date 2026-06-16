import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams, useLocation, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiFilter, FiX, FiChevronDown, FiSliders, FiChevronUp } from 'react-icons/fi'
import { fetchProducts, setFilters, clearFilters, setPage, fetchCategories } from '../redux/slices/productSlice'
import ProductCard from '../components/product/ProductCard'

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'Free Size']
const COLORS = [
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Navy Blue', hex: '#001F5B' },
  { name: 'Grey', hex: '#808080' },
  { name: 'Red', hex: '#FF0000' },
  { name: 'Blue', hex: '#4169E1' },
  { name: 'Green', hex: '#008000' },
  { name: 'Yellow', hex: '#FFD700' },
  { name: 'Pink', hex: '#FF69B4' },
]
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
]

function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-gray-200 py-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-gray-900 font-bold text-sm uppercase tracking-widest mb-0"
      >
        {title}
        {open ? <FiChevronUp size={16} className="text-gray-400" /> : <FiChevronDown size={16} className="text-gray-400" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden mt-3"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function FiltersContent({
  filters,
  categories,
  activeCategory,
  urlGender,
  priceRange,
  setPriceRange,
  handleFilterChange,
  handlePriceApply,
  handleClearFilters
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-gray-900 font-black text-base uppercase tracking-widest">Filters</h3>
        <button onClick={handleClearFilters} className="text-red-500 text-xs font-semibold hover:underline">
          Clear All
        </button>
      </div>

      {/* Category */}
      <FilterSection title="Category">
        <div className="space-y-2">
          {categories
            .filter(cat => {
              if (!urlGender) return true;
              return cat.gender === urlGender || cat.gender === 'unisex' || cat.gender === 'all';
            })
            .map(cat => (
              <label key={cat._id} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="radio"
                  name="category"
                  value={cat.slug}
                  checked={activeCategory === cat.slug}
                  onClick={() => handleFilterChange('category', activeCategory === cat.slug ? '' : cat.slug)}
                  onChange={() => { }}
                  className="accent-red-500 w-3.5 h-3.5"
                />
                <span className={`text-sm transition-colors ${activeCategory === cat.slug ? 'text-gray-900 font-semibold' : 'text-gray-500 group-hover:text-gray-900'}`}>
                  {cat.name}
                </span>
              </label>
            ))}
        </div>
      </FilterSection>

      {/* Price Range */}
      <FilterSection title="Price">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={priceRange[0]}
              onChange={e => setPriceRange([+e.target.value, priceRange[1]])}
              placeholder="Min"
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm text-gray-700 focus:outline-none focus:border-gray-500"
            />
            <span className="text-gray-400 text-sm">–</span>
            <input
              type="number"
              value={priceRange[1]}
              onChange={e => setPriceRange([priceRange[0], +e.target.value])}
              placeholder="Max"
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm text-gray-700 focus:outline-none focus:border-gray-500"
            />
          </div>
          <p className="text-gray-500 text-xs">₹{priceRange[0]} — ₹{priceRange[1]}</p>
          <button
            onClick={handlePriceApply}
            className="w-full border-2 border-gray-900 text-gray-900 text-xs font-bold uppercase tracking-widest py-2 hover:bg-gray-900 hover:text-white transition-colors"
          >
            Apply
          </button>
        </div>
      </FilterSection>

      {/* Size */}
      <FilterSection title="Size">
        <div className="flex flex-wrap gap-2">
          {SIZES.map(size => (
            <button
              key={size}
              onClick={() => handleFilterChange('size', filters.size === size ? '' : size)}
              className={`px-3 py-1.5 text-xs font-semibold border transition-all ${filters.size === size
                  ? 'bg-gray-900 border-gray-900 text-white'
                  : 'border-gray-300 text-gray-600 hover:border-gray-500 hover:text-gray-900'
                }`}
            >
              {size}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Color */}
      <FilterSection title="Color">
        <div className="flex flex-wrap gap-2">
          {COLORS.map(color => (
            <button
              key={color.name}
              title={color.name}
              onClick={() => handleFilterChange('color', filters.color === color.name ? '' : color.name)}
              className={`w-7 h-7 rounded-full border-2 transition-all hover:scale-110 ${filters.color === color.name ? 'border-red-500 scale-110' : 'border-gray-200'
                }`}
              style={{ backgroundColor: color.hex }}
            />
          ))}
        </div>
      </FilterSection>

      {/* Rating */}
      <FilterSection title="Rating">
        <div className="space-y-2">
          {[4, 3, 2, 1].map(r => (
            <label key={r} className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="radio"
                name="rating"
                checked={Number(filters.rating) === r}
                onClick={() => handleFilterChange('rating', Number(filters.rating) === r ? '' : r)}
                onChange={() => { }}
                className="accent-red-500 w-3.5 h-3.5"
              />
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={`text-xs ${i < r ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                ))}
                <span className="text-gray-500 text-xs ml-1">& above</span>
              </div>
            </label>
          ))}
        </div>
      </FilterSection>
    </div>
  )
}

export default function ProductsPage({ gender, category, pageTitle }) {
  const dispatch = useDispatch()
  const [searchParams, setSearchParams] = useSearchParams()
  const { products, loading, total, pages, filters, categories } = useSelector((s) => s.products)

  const [filterOpen, setFilterOpen] = useState(false)
  const [priceRange, setPriceRange] = useState([0, 5000])

  const location = useLocation()
  const isSearchPage = location.pathname === '/search'

  const urlKeyword = searchParams.get('q') || ''
  const urlCategory = searchParams.get('category') || category || ''
  const urlGender = searchParams.get('gender') || gender || ''

  const activeCategory = urlCategory || filters.category || ''
  const activeKeyword = urlKeyword || (!isSearchPage ? filters.keyword : '')

  useEffect(() => {
    dispatch(fetchCategories())
  }, [dispatch])

  // Sync local priceRange state with redux filters
  useEffect(() => {
    const min = filters.minPrice !== '' ? Number(filters.minPrice) : 0;
    const max = filters.maxPrice !== '' ? Number(filters.maxPrice) : 5000;
    setPriceRange([min, max]);
  }, [filters.minPrice, filters.maxPrice])

  useEffect(() => {
    const params = {
      keyword: urlKeyword,
      category: urlCategory || filters.category || '',
      gender: urlGender,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      color: filters.color,
      size: filters.size,
      rating: filters.rating,
      sort: filters.sort,
      page: filters.page,
      limit: filters.limit,
      featured: searchParams.get('featured') || '',
      trending: searchParams.get('trending') || '',
      newArrival: searchParams.get('newArrival') || '',
      bestSeller: searchParams.get('bestSeller') || '',
    }
    Object.keys(params).forEach(k => { if (params[k] === '' || params[k] === undefined) delete params[k] })
    dispatch(fetchProducts(params))
  }, [dispatch, filters, gender, searchParams, urlKeyword, urlCategory, urlGender])

  const handleFilterChange = (key, value) => dispatch(setFilters({ [key]: value }))

  const handlePriceApply = () => dispatch(setFilters({ minPrice: priceRange[0], maxPrice: priceRange[1] }))

  const handleClearFilters = () => {
    dispatch(clearFilters())
    setPriceRange([0, 5000])
    setSearchParams({})
  }

  const handleRemoveActiveFilter = (key) => {
    if (key === 'keyword') {
      const p = new URLSearchParams(searchParams); p.delete('q'); setSearchParams(p)
      dispatch(setFilters({ keyword: '' }))
    } else if (key === 'category') {
      const p = new URLSearchParams(searchParams); p.delete('category'); setSearchParams(p)
      dispatch(setFilters({ category: '' }))
    } else {
      handleFilterChange(key, '')
    }
  }

  const filtersContentProps = {
    filters,
    categories,
    activeCategory,
    urlGender,
    priceRange,
    setPriceRange,
    handleFilterChange,
    handlePriceApply,
    handleClearFilters
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb + Title */}
      <div className="bg-gray-50 border-b border-gray-200 py-3">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
            <Link to="/" className="hover:text-gray-700">Home</Link>
            <span>/</span>
            <span className="text-gray-700">{pageTitle || 'All Products'}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 uppercase tracking-wide" style={{ fontFamily: 'Outfit, sans-serif' }}>
            {isSearchPage && urlKeyword
              ? <>Results for "<span className="text-red-500">{urlKeyword}</span>"</>
              : pageTitle || 'All Products'
            }
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">{loading ? '...' : `${total} Products`}</p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Sort + Filter Controls */}
        <div className="flex items-center justify-between mb-5 gap-4">
          <button
            onClick={() => setFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:border-gray-500 transition-colors"
          >
            <FiSliders size={16} /> Filter
          </button>

          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-gray-500 hidden sm:block">Sort by:</span>
            <select
              value={filters.sort}
              onChange={e => handleFilterChange('sort', e.target.value)}
              className="border border-gray-300 text-sm text-gray-700 px-3 py-2 focus:outline-none focus:border-gray-500 rounded"
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filter Tags */}
        {(activeCategory || activeKeyword || filters.size || filters.color || filters.minPrice !== '' || filters.maxPrice !== '' || filters.rating) && (
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <span className="text-gray-500 text-xs">Active:</span>
            {activeKeyword && (
              <span className="flex items-center gap-1 bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1 rounded-full">
                "{activeKeyword}"
                <button onClick={() => handleRemoveActiveFilter('keyword')} className="ml-1 text-gray-400 hover:text-gray-700"><FiX size={12} /></button>
              </span>
            )}
            {activeCategory && (
              <span className="flex items-center gap-1 bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1 rounded-full">
                {activeCategory}
                <button onClick={() => handleRemoveActiveFilter('category')} className="ml-1 text-gray-400 hover:text-gray-700"><FiX size={12} /></button>
              </span>
            )}
            {(filters.minPrice !== '' || filters.maxPrice !== '') && (
              <span className="flex items-center gap-1 bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1 rounded-full">
                Price: ₹{filters.minPrice || 0} - ₹{filters.maxPrice || 5000}
                <button
                  onClick={() => {
                    dispatch(setFilters({ minPrice: '', maxPrice: '' }));
                    setPriceRange([0, 5000]);
                  }}
                  className="ml-1 text-gray-400 hover:text-gray-700"
                >
                  <FiX size={12} />
                </button>
              </span>
            )}
            {filters.size && (
              <span className="flex items-center gap-1 bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1 rounded-full">
                Size: {filters.size}
                <button onClick={() => handleFilterChange('size', '')} className="ml-1 text-gray-400 hover:text-gray-700"><FiX size={12} /></button>
              </span>
            )}
            {filters.color && (
              <span className="flex items-center gap-1 bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1 rounded-full">
                {filters.color}
                <button onClick={() => handleFilterChange('color', '')} className="ml-1 text-gray-400 hover:text-gray-700"><FiX size={12} /></button>
              </span>
            )}
            {filters.rating && (
              <span className="flex items-center gap-1 bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1 rounded-full">
                Rating: {filters.rating}★ & above
                <button onClick={() => handleFilterChange('rating', '')} className="ml-1 text-gray-400 hover:text-gray-700"><FiX size={12} /></button>
              </span>
            )}
          </div>
        )}

        <div className="flex gap-6 lg:gap-8">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-52 xl:w-60 shrink-0">
            <div className="sticky top-20">
              <FiltersContent {...filtersContentProps} />
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i}>
                    <div className="bg-gray-100 animate-pulse aspect-[3/4] mb-3" />
                    <div className="bg-gray-100 animate-pulse h-4 w-3/4 mb-2 rounded" />
                    <div className="bg-gray-100 animate-pulse h-4 w-1/2 rounded" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500 mb-6">Try adjusting your filters or search</p>
                <button
                  onClick={handleClearFilters}
                  className="border-2 border-gray-900 text-gray-900 font-bold text-sm uppercase tracking-widest px-8 py-3 hover:bg-gray-900 hover:text-white transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {products.map((product, i) => (
                  <ProductCard key={product._id} product={product} index={i} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {pages > 1 && !loading && (
              <div className="flex items-center justify-center gap-2 mt-10">
                {Array.from({ length: pages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => dispatch(setPage(i + 1))}
                    className={`w-9 h-9 text-sm font-semibold transition-all border ${filters.page === i + 1
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'border-gray-300 text-gray-600 hover:border-gray-500 hover:text-gray-900'
                      }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {filterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
              onClick={() => setFilterOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed left-0 top-0 bottom-0 w-80 bg-white z-50 overflow-y-auto p-5 lg:hidden"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-900 font-black text-lg">Filters</h3>
                <button onClick={() => setFilterOpen(false)} className="text-gray-500 hover:text-gray-900">
                  <FiX size={22} />
                </button>
              </div>
              <FiltersContent {...filtersContentProps} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
