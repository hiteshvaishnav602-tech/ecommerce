import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { getProfile } from './redux/slices/authSlice'
import { AnimatePresence, motion } from 'framer-motion'

// ScrollToTop Component
const ScrollToTop = () => {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])
  return null
}

// Layouts
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'

// Pages
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Wishlist from './pages/Wishlist'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import Checkout from './pages/Checkout'
import OrderSuccess from './pages/OrderSuccess'
import MyOrders from './pages/MyOrders'
import Settings from './pages/Settings'
import NotFound from './pages/NotFound'

// Admin Pages
import Dashboard from './pages/admin/Dashboard'
import AdminProducts from './pages/admin/Products'
import AdminOrders from './pages/admin/Orders'
import AdminCategories from './pages/admin/Categories'
import AdminUsers from './pages/admin/Users'
import AdminCoupons from './pages/admin/Coupons'
import AdminBanners from './pages/admin/Banners'
import AdminReviews from './pages/admin/Reviews'

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, token, profileLoading } = useSelector((s) => s.auth)

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-950">
        <div className="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (!token) return <Navigate to="/login" />
  if (adminOnly && user?.role !== 'admin') return <Navigate to="/" />

  return children
}

const AppLayout = ({ children }) => {
  const location = useLocation()
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="flex-grow"
        >
          {children}
        </motion.main>
      </AnimatePresence>
      <Footer />
    </div>
  )
}

export default function App() {
  const dispatch = useDispatch()
  const { token } = useSelector((s) => s.auth)

  useEffect(() => {
    // Sync theme on first React load
    const theme = localStorage.getItem('theme') || 'dark'
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
      root.classList.remove('light')
    } else if (theme === 'light') {
      root.classList.add('light')
      root.classList.remove('dark')
    } else {
      const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (isSystemDark) {
        root.classList.add('dark')
        root.classList.remove('light')
      } else {
        root.classList.add('light')
        root.classList.remove('dark')
      }
    }
  }, [])

  useEffect(() => {
    if (token) dispatch(getProfile())
  }, [dispatch, token])

  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<AppLayout><Home gender="men" /></AppLayout>} />
        <Route path="/products" element={<AppLayout><Products pageTitle="All Products" /></AppLayout>} />
        <Route path="/search" element={<AppLayout><Products pageTitle="Search Results" /></AppLayout>} />
        <Route path="/men" element={<AppLayout><Home gender="men" /></AppLayout>} />
        <Route path="/women" element={<AppLayout><Home gender="women" /></AppLayout>} />
        <Route path="/sneakers" element={<AppLayout><Home gender="sneakers" /></AppLayout>} />
        <Route path="/product/:id" element={<AppLayout><ProductDetail /></AppLayout>} />
        <Route path="/cart" element={<AppLayout><Cart /></AppLayout>} />
        <Route path="/login" element={<AppLayout><Login /></AppLayout>} />
        <Route path="/register" element={<AppLayout><Register /></AppLayout>} />

        {/* Protected Routes */}
        <Route path="/wishlist" element={
          <ProtectedRoute>
            <AppLayout><Wishlist /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <AppLayout><Profile /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/checkout" element={
          <ProtectedRoute>
            <AppLayout><Checkout /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/order-success/:id" element={
          <ProtectedRoute>
            <AppLayout><OrderSuccess /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/order/:id" element={
          <ProtectedRoute>
            <AppLayout><OrderSuccess /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/my-orders" element={
          <ProtectedRoute>
            <AppLayout><MyOrders /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <AppLayout><Settings /></AppLayout>
          </ProtectedRoute>
        } />

        {/* Admin Routes (No Layout) */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute adminOnly>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/products" element={
          <ProtectedRoute adminOnly>
            <AdminProducts />
          </ProtectedRoute>
        } />
        <Route path="/admin/orders" element={
          <ProtectedRoute adminOnly>
            <AdminOrders />
          </ProtectedRoute>
        } />
        <Route path="/admin/categories" element={
          <ProtectedRoute adminOnly>
            <AdminCategories />
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute adminOnly>
            <AdminUsers />
          </ProtectedRoute>
        } />
        <Route path="/admin/coupons" element={
          <ProtectedRoute adminOnly>
            <AdminCoupons />
          </ProtectedRoute>
        } />
        <Route path="/admin/banners" element={
          <ProtectedRoute adminOnly>
            <AdminBanners />
          </ProtectedRoute>
        } />
        <Route path="/admin/reviews" element={
          <ProtectedRoute adminOnly>
            <AdminReviews />
          </ProtectedRoute>
        } />

        {/* 404 */}
        <Route path="*" element={<AppLayout><NotFound /></AppLayout>} />
      </Routes>
    </Router>
  )
}
