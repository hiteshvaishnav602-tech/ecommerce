import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiSearch, FiShoppingCart, FiHeart, FiUser, FiMenu,
  FiX, FiChevronDown, FiLogOut, FiPackage,
  FiMapPin, FiSettings, FiClock, FiTrendingUp, FiArrowRight, FiMic,
  FiInstagram, FiFacebook, FiTwitter, FiHelpCircle, FiCompass,
} from 'react-icons/fi'
import { logoutUser } from '../../redux/slices/authSlice'
import { selectCartItemCount } from '../../redux/slices/cartSlice'
import { clearFilters } from '../../redux/slices/productSlice'
import useDebounce from '../../hooks/useDebounce'
import api from '../../services/api'

const POPULAR_SEARCHES = ['T-Shirts', 'Jeans', 'Hoodies', 'Dresses', 'Joggers', 'Sneakers']
const RECENT_KEY = 'aura_recent_searches'
const MAX_RECENT = 6

const navLinks = [
  { label: 'MEN', href: '/men' },
  { label: 'WOMEN', href: '/women' },
  { label: 'SNEAKERS', href: '/sneakers' },
]

// Helpers
function getRecent() {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]') } catch { return [] }
}
function saveRecent(q) {
  const prev = getRecent().filter(s => s.toLowerCase() !== q.toLowerCase())
  localStorage.setItem(RECENT_KEY, JSON.stringify([q, ...prev].slice(0, MAX_RECENT)))
}
function removeRecent(q) {
  localStorage.setItem(RECENT_KEY, JSON.stringify(getRecent().filter(s => s !== q)))
}

// Search Dropdown (dark, premium)
function SearchDropdown({ query, suggestions, suggestLoading, onSelect, onClearRecent, onRemoveRecent }) {
  const recent = getRecent()
  const showRecent = !query && recent.length > 0
  const showPopular = !query
  const showResults = !!query

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.15 }}
      className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-y-auto max-h-[60vh] md:max-h-[75vh] z-[100]"
    >
      {suggestLoading && (
        <div className="px-4 pt-4 pb-2 space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-10 h-10 rounded-lg bg-gray-100 shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-gray-100 rounded w-3/4" />
                <div className="h-2.5 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {showResults && !suggestLoading && (
        <>
          {suggestions.categories?.length > 0 && (
            <div className="px-4 pt-4 pb-2">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-2">Categories</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.categories.map(cat => (
                  <button
                    key={cat._id}
                    onClick={() => onSelect(`/products?category=${cat.slug}`, null)}
                    className="text-xs px-3 py-1 rounded-full bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors"
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          {suggestions.products?.length > 0 ? (
            <div className="px-2 py-2">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-1 px-2">Products</p>
              {suggestions.products.map(product => (
                <button
                  key={product._id}
                  onClick={() => onSelect(`/product/${product.slug || product._id}`, null)}
                  className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors group text-left"
                >
                  <div className="w-11 h-11 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                    {product.images?.[0]?.url
                      ? <img src={product.images[0].url} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      : <div className="w-full h-full bg-gray-200" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 text-sm font-medium truncate">{product.title}</p>
                    <p className="text-gray-505 text-xs truncate">{product.category?.name} · {product.brand}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-red-600 font-bold text-sm">₹{product.discountPrice ?? product.price}</p>
                    {product.discountPercent > 0 && (
                      <p className="text-gray-400 text-xs line-through">₹{product.price}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            !suggestLoading && (
              <div className="px-4 py-6 text-center">
                <p className="text-3xl mb-2">🔍</p>
                <p className="text-gray-505 text-sm">No products for "<span className="text-gray-800">{query}</span>"</p>
              </div>
            )
          )}
          {suggestions.products?.length > 0 && (
            <button
              onClick={() => onSelect(null, query)}
              className="flex items-center justify-center gap-2 w-full py-3 border-t border-gray-100 text-red-600 hover:text-red-700 text-sm font-semibold transition-colors hover:bg-red-50"
            >
              See all results for "{query}" <FiArrowRight size={14} />
            </button>
          )}
        </>
      )}

      {(showRecent || showPopular) && !suggestLoading && (
        <div className="p-4 space-y-4">
          {showRecent && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold flex items-center gap-1">
                  <FiClock size={10} /> Recent
                </p>
                <button onClick={onClearRecent} className="text-[10px] text-gray-405 hover:text-gray-700 transition-colors">Clear all</button>
              </div>
              <div className="space-y-0.5">
                {recent.map(term => (
                  <div key={term} className="flex items-center gap-2 group">
                    <button
                      onClick={() => onSelect(null, term)}
                      className="flex-1 flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors text-left"
                    >
                      <FiClock size={13} className="text-gray-400 shrink-0" />
                      <span className="text-gray-650 text-sm group-hover:text-gray-900 transition-colors">{term}</span>
                    </button>
                    <button
                      onClick={() => onRemoveRecent(term)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-700 transition-all rounded"
                    >
                      <FiX size={11} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {showPopular && (
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold flex items-center gap-1 mb-2">
                <FiTrendingUp size={10} /> Popular
              </p>
              <div className="flex flex-wrap gap-2">
                {POPULAR_SEARCHES.map(term => (
                  <button
                    key={term}
                    onClick={() => onSelect(null, term)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-all"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}

// ─── Main Navbar ───────────────────────────────────────────────────────────────
export default function Navbar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  const { user } = useSelector((s) => s.auth)
  const { wishlist } = useSelector((s) => s.wishlist)
  const wishlistCount = wishlist?.length || 0
  const cartCount = useSelector(selectCartItemCount)

  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [megaMenuOpen, setMegaMenuOpen] = useState(null)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [suggestions, setSuggestions] = useState({ products: [], categories: [] })
  const [suggestLoading, setSuggestLoading] = useState(false)
  const [recentVersion, setRecentVersion] = useState(0)

  const searchRef = useRef(null)
  const searchWrapperRef = useRef(null)
  const mobileSearchWrapperRef = useRef(null)
  const mobileSearchButtonRef = useRef(null)
  const mobileSearchInputRef = useRef(null)
  const userMenuRef = useRef(null)
  const debouncedQuery = useDebounce(searchQuery, 300)

  // Auto-focus mobile search input when opened
  useEffect(() => {
    if (mobileSearchOpen) {
      setTimeout(() => {
        mobileSearchInputRef.current?.focus()
      }, 100)
    }
  }, [mobileSearchOpen])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : 'unset'
    return () => { document.body.style.overflow = 'unset' }
  }, [mobileOpen])

  // Close on route change
  useEffect(() => {
    setMobileOpen(false)
    setUserMenuOpen(false)
    setMegaMenuOpen(null)
    setDropdownOpen(false)
    setMobileSearchOpen(false)
    setSearchQuery('')
  }, [location])

  // Click outside
  useEffect(() => {
    const handler = (e) => {
      const clickInDesktopSearch = searchWrapperRef.current && searchWrapperRef.current.contains(e.target)
      const clickInMobileSearch = mobileSearchWrapperRef.current && mobileSearchWrapperRef.current.contains(e.target)
      const clickInMobileButton = mobileSearchButtonRef.current && mobileSearchButtonRef.current.contains(e.target)

      if (!clickInDesktopSearch && !clickInMobileSearch && !clickInMobileButton) {
        setDropdownOpen(false)
        setMobileSearchOpen(false)
        setSearchQuery('')
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Ctrl+K shortcut
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        searchRef.current?.focus()
        setDropdownOpen(true)
      }
      if (e.key === 'Escape') { setDropdownOpen(false); setSearchQuery('') }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  // Live suggestions
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setSuggestions({ products: [], categories: [] })
      setSuggestLoading(false)
      return
    }
    setSuggestLoading(true)
    api.get('/products/suggestions', { params: { q: debouncedQuery.trim() } })
      .then(res => setSuggestions(res.data))
      .catch(() => setSuggestions({ products: [], categories: [] }))
      .finally(() => setSuggestLoading(false))
  }, [debouncedQuery])

  const handleSuggestionSelect = useCallback((url, term) => {
    if (url) {
      navigate(url)
    } else if (term) {
      saveRecent(term)
      dispatch(clearFilters())
      navigate(`/search?q=${encodeURIComponent(term.trim())}`)
    }
    setDropdownOpen(false)
    setMobileSearchOpen(false)
    setSearchQuery('')
    setRecentVersion(v => v + 1)
  }, [navigate, dispatch])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) handleSuggestionSelect(null, searchQuery.trim())
  }

  const handleClearRecent = () => { localStorage.removeItem(RECENT_KEY); setRecentVersion(v => v + 1) }
  const handleRemoveRecent = (term) => { removeRecent(term); setRecentVersion(v => v + 1) }
  const handleLogout = () => { dispatch(logoutUser()); navigate('/') }

  return (
    <>
      {/* ── Announcement Bar ── */}
      <div className="bg-[#121212] text-white text-center text-[10px] xs:text-[11px] sm:text-xs py-2 px-4 font-extrabold border-b border-[#222] uppercase announcement-bar">
        Now Shopping At <span className="text-[#e11b23]">Membership</span> Prices
      </div>

      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-[0_2px_4px_rgba(0,0,0,0.15)]">
        <nav className="px-4 sm:px-6 lg:px-8 max-w-full relative">
          <div className="flex items-center justify-between h-16 sm:h-[84px] lg:h-[92px] gap-4">

            <div className="flex items-center gap-4">
              {/* Hamburger menu button (Mobile only) */}
              <button
                className="lg:hidden p-1 text-gray-500 hover:text-gray-900 transition-colors focus:outline-none flex items-center justify-center"
                onClick={() => {
                  setMobileOpen(!mobileOpen)
                  if (!mobileOpen) setMobileSearchOpen(false)
                }}
                aria-label="Toggle menu"
              >
                {mobileOpen ? (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                ) : (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="4" y1="6" x2="20" y2="6" />
                    <line x1="4" y1="12" x2="20" y2="12" />
                    <line x1="4" y1="18" x2="20" y2="18" />
                  </svg>
                )}
              </button>

              {/* Desktop Navigation */}
              <ul className="hidden lg:flex items-stretch h-16 sm:h-[84px] lg:h-[92px]">
                {navLinks.map(link => {
                  const isActive = location.pathname === link.href || (link.href !== '/' && location.pathname.startsWith(link.href))
                  return (
                    <li
                      key={link.label}
                      className="relative flex items-stretch"
                    >
                      <Link
                        to={link.href}
                        className={`relative flex items-center px-5 font-black text-[20px] tracking-wider transition-colors duration-200 ${isActive
                          ? 'text-gray-955'
                          : 'text-gray-707 hover:text-gray-955'
                          }`}
                        style={{ fontFamily: 'Outfit, sans-serif' }}
                      >
                        {link.label}
                        {isActive && (
                          <span className="absolute bottom-0 left-5 right-5 h-[4px] bg-[#e11b23] rounded-t-sm" />
                        )}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>

            {/* Center: Brand Logo (Centered Absolutely and properly scaled) */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex items-center justify-center">
              <Link to="/" className="flex items-center shrink-0">
                <img
                  src="/logo.png"
                  alt="Aura Logo"
                  className="w-[130px] h-[60px] sm:w-[100px] sm:h-[72px] lg:w-[210px] lg:h-[130px] object-contain py-0.5 sm:py-2 lg:pt-6"
                />
              </Link>
            </div>

            {/* Right: Search + Icons */}
            <div className="flex items-center gap-1 sm:gap-3 ml-auto z-20">

              {/* Search Bar (desktop) */}
              <div ref={searchWrapperRef} className="relative hidden md:block">
                <form onSubmit={handleSearch} className="flex items-center gap-2 px-4 py-1.5 bg-white border border-gray-300 rounded-full w-60 lg:w-72 hover:border-gray-400 focus-within:border-gray-500 transition-all">
                  <input
                    ref={searchRef}
                    type="text"
                    value={searchQuery}
                    onChange={e => { setSearchQuery(e.target.value); setDropdownOpen(true) }}
                    onFocus={() => setDropdownOpen(true)}
                    placeholder="What are you looking for?"
                    className="flex-1 bg-transparent border-none text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-0 text-xs lg:text-sm min-w-0"
                    autoComplete="off"
                  />
                  <button type="button" className="text-gray-550 hover:text-gray-855 transition-colors shrink-0">
                    <FiMic size={16} />
                  </button>
                  <button type="submit" className="text-gray-550 hover:text-gray-855 transition-colors shrink-0">
                    <FiSearch size={16} />
                  </button>
                </form>

                <AnimatePresence>
                  {dropdownOpen && (searchQuery || true) && (
                    <SearchDropdown
                      key={recentVersion}
                      query={searchQuery}
                      suggestions={suggestions}
                      suggestLoading={suggestLoading}
                      onSelect={handleSuggestionSelect}
                      onClearRecent={handleClearRecent}
                      onRemoveRecent={handleRemoveRecent}
                    />
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile search icon */}
              <button
                ref={mobileSearchButtonRef}
                onClick={() => {
                  const nextState = !mobileSearchOpen
                  setMobileSearchOpen(nextState)
                  if (nextState) {
                    setMobileOpen(false)
                    setDropdownOpen(true)
                  }
                }}
                className={`md:hidden p-1.5 sm:p-2 rounded-full transition-all ${mobileSearchOpen
                  ? 'text-[#e11b23] bg-red-50'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                aria-label="Search"
              >
                <FiSearch size={24} />
              </button>

              {/* User (Desktop only, mobile user info is in side menu) */}
              {user ? (
                <div ref={userMenuRef} className="relative hidden md:block">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="p-1 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all flex items-center gap-1.5"
                  >
                    <div className="w-8 h-8 rounded-full bg-red-100 border border-red-250 flex items-center justify-center overflow-hidden">
                      {user.avatar?.url
                        ? <img src={user.avatar.url} alt={user.name} className="w-full h-full object-cover" />
                        : <span className="text-[#e11b23] font-black text-sm">{user.name?.[0]?.toUpperCase()}</span>
                      }
                    </div>
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-2xl shadow-xl py-2 z-[60]"
                      >
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-gray-900 font-semibold text-sm">{user.name}</p>
                          <p className="text-gray-500 text-xs mt-0.5 truncate">{user.email}</p>
                        </div>
                        {user.role === 'admin' && (
                          <Link to="/admin/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#e11b23] hover:bg-red-50 transition-colors font-medium">
                            <FiSettings size={15} /> Admin Panel
                          </Link>
                        )}
                        <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors">
                          <FiUser size={15} /> My Profile
                        </Link>
                        <Link to="/my-orders" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-650 hover:text-gray-900 hover:bg-gray-50 transition-colors">
                          <FiPackage size={15} /> My Orders
                        </Link>
                        <Link to="/settings" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors">
                          <FiSettings size={15} /> Settings
                        </Link>
                        <div className="border-t border-gray-100 mt-1 pt-1">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <FiLogOut size={15} /> Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link to="/login" className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all hidden md:block">
                  <FiUser size={24} />
                </Link>
              )}

              {/* Wishlist */}
              <Link to="/wishlist" className="relative p-1.5 sm:p-2 text-gray-500 hover:text-[#e11b23] hover:bg-red-50 rounded-full transition-all">
                <FiHeart size={24} />
                {wishlistCount > 0 && (
                  <span className="absolute top-0 right-0 bg-[#e11b23] text-white text-[10px] font-bold w-[18px] h-[18px] flex items-center justify-center rounded-full shadow-sm">
                    {wishlistCount > 9 ? '9+' : wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link to="/cart" className="relative p-1.5 sm:p-2 text-gray-500 hover:text-[#e11b23] hover:bg-red-50 rounded-full transition-all">
                <FiShoppingCart size={24} />
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-0 right-0 bg-[#e11b23] text-white text-[10px] font-bold w-[18px] h-[18px] flex items-center justify-center rounded-full"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </Link>
            </div>
          </div>
        </nav>

        {/* Mobile Search Overlay Panel */}
        <AnimatePresence>
          {mobileSearchOpen && (
            <motion.div
              ref={mobileSearchWrapperRef}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="md:hidden border-t border-gray-150 bg-white px-4 py-3 shadow-inner relative z-50 overflow-visible"
            >
              <form onSubmit={handleSearch} className="flex items-center gap-2 px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-full focus-within:border-gray-400 transition-all">
                <FiSearch size={18} className="text-gray-400 shrink-0" />
                <input
                  ref={mobileSearchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setDropdownOpen(true) }}
                  onFocus={() => setDropdownOpen(true)}
                  placeholder="What are you looking for?"
                  className="flex-1 bg-transparent border-none text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-0 text-sm p-0"
                  autoComplete="off"
                />
                {searchQuery && (
                  <button type="button" onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-650 transition-colors">
                    <FiX size={16} />
                  </button>
                )}
              </form>

              {/* Dropdown for suggestions in mobile search */}
              <AnimatePresence>
                {dropdownOpen && (
                  <div className="relative mt-2">
                    <SearchDropdown
                      key={recentVersion}
                      query={searchQuery}
                      suggestions={suggestions}
                      suggestLoading={suggestLoading}
                      onSelect={handleSuggestionSelect}
                      onClearRecent={handleClearRecent}
                      onRemoveRecent={handleRemoveRecent}
                    />
                  </div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── Mobile Menu (Drawer) ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm lg:hidden"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[75vw] max-w-[290px] z-[100] bg-white lg:hidden flex flex-col shadow-2xl border-r border-gray-100"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between h-20 px-6 border-b border-gray-100 shrink-0">
                <Link to="/" onClick={() => setMobileOpen(false)} className="flex items-center">
                  <img
                    src="/logo.png"
                    alt="Aura Logo"
                    className="h-11 w-auto object-contain"
                  />
                </Link>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1.5 text-gray-500 hover:text-gray-900 transition-colors focus:outline-none flex items-center justify-center rounded-full hover:bg-gray-100"
                  aria-label="Close menu"
                >
                  <FiX size={24} />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto py-6">
                {/* Nav Links */}
                <div className="space-y-0.5">
                  {navLinks.map(link => {
                    const isActive = location.pathname === link.href
                    return (
                      <Link
                        key={link.label}
                        to={link.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center justify-between py-4 pr-6 pl-5 border-l-4 transition-all duration-200 text-[17px] tracking-[0.12em] ${isActive
                          ? 'border-[#e11b23] text-[#e11b23] bg-red-50/15 font-black'
                          : 'border-transparent text-gray-800 hover:text-[#e11b23] hover:bg-gray-50/50 font-bold'
                          }`}
                        style={{ fontFamily: 'Outfit, sans-serif' }}
                      >
                        <span>{link.label}</span>
                        <FiArrowRight size={15} className={`opacity-60 transition-transform ${isActive ? 'translate-x-1 text-[#e11b23] opacity-100' : ''}`} />
                      </Link>
                    )
                  })}
                </div>
              </div>

              {/* Footer Section (Sticky at bottom) */}
              {user ? (
                <div className="px-5 py-5 border-t border-gray-100 bg-gray-50/50 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] shrink-0 flex flex-col gap-4">
                  {/* Logged in User Card Box */}
                  <div className="bg-black text-white p-5 rounded-2xl relative overflow-hidden shadow-md flex flex-col gap-4">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent pointer-events-none" />

                    {/* User Profile Header */}
                    <div className="flex items-center gap-3.5 border-b border-white/10 pb-3 z-10">
                      <div className="w-11 h-11 rounded-full bg-white text-black flex items-center justify-center shrink-0 shadow-sm font-black text-base overflow-hidden">
                        {user.avatar?.url ? (
                          <img src={user.avatar.url} alt={user.name} className="w-full h-full object-cover rounded-full" />
                        ) : (
                          <span className="text-black font-black text-base">{user.name?.[0]?.toUpperCase()}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white font-extrabold text-sm truncate">{user.name}</p>
                        <p className="text-gray-400 text-xs truncate mt-0.5">{user.email}</p>
                      </div>
                    </div>

                    {/* Action Grid */}
                    <div className="grid grid-cols-2 gap-2 z-10">
                      <Link
                        to="/my-orders"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl transition-all shadow-sm"
                      >
                        <FiPackage size={14} /> Orders
                      </Link>
                      {user.role === 'admin' ? (
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-bold text-white bg-[#e11b23] hover:bg-red-650 rounded-xl transition-all shadow-sm"
                        >
                          <FiSettings size={14} /> Admin
                        </Link>
                      ) : (
                        <Link
                          to="/profile"
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl transition-all shadow-sm"
                        >
                          <FiUser size={14} /> Profile
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          setMobileOpen(false)
                          handleLogout()
                        }}
                        className="col-span-2 flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-bold text-red-400 border border-red-500/20 hover:bg-red-500/10 rounded-xl transition-all mt-1"
                      >
                        <FiLogOut size={14} /> Logout
                      </button>
                    </div>
                  </div>

                  {/* Social media links inside footer */}
                  <div className="flex items-center justify-center gap-6 mt-1 border-t border-gray-150/60 pt-3">
                    <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-gray-900 transition-colors">
                      <FiInstagram size={18} />
                    </a>
                    <a href="https://facebook.com" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-gray-900 transition-colors">
                      <FiFacebook size={18} />
                    </a>
                    <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-gray-900 transition-colors">
                      <FiTwitter size={18} />
                    </a>
                  </div>
                  <p className="text-[9px] text-gray-400 text-center tracking-widest font-bold uppercase mt-1">© 2026 AURA STUDIO · V1.0.0</p>
                </div>
              ) : (
                <div className="px-5 py-5 border-t border-gray-100 bg-gray-50/50 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] shrink-0 flex flex-col gap-4">
                  <div className="bg-black text-white p-5 rounded-2xl relative overflow-hidden shadow-md">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent pointer-events-none" />
                    <p className="text-[10px] text-red-500 font-extrabold uppercase tracking-widest mb-1">AURA MEMBERSHIP</p>
                    <p className="text-xs font-bold leading-snug mb-3">Join to shop at exclusive membership prices.</p>
                    <div className="flex gap-2">
                      <Link
                        to="/login"
                        onClick={() => setMobileOpen(false)}
                        className="flex-1 text-center py-2 bg-white text-black text-xs font-extrabold rounded-lg hover:bg-gray-100 transition-all text-gray-900"
                      >
                        Log In
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setMobileOpen(false)}
                        className="flex-1 text-center py-2 bg-[#e11b23] text-white text-xs font-extrabold rounded-lg hover:bg-red-650 transition-all"
                      >
                        Join Now
                      </Link>
                    </div>
                  </div>
                  {/* Social media links inside footer */}
                  <div className="flex items-center justify-center gap-6 mt-1 border-t border-gray-150/60 pt-3">
                    <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-gray-900 transition-colors">
                      <FiInstagram size={18} />
                    </a>
                    <a href="https://facebook.com" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-gray-900 transition-colors">
                      <FiFacebook size={18} />
                    </a>
                    <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-gray-900 transition-colors">
                      <FiTwitter size={18} />
                    </a>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
