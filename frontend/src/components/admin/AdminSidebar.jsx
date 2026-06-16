import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import {
  FiGrid, FiPackage, FiTag, FiShoppingCart, FiUsers,
  FiPercent, FiImage, FiStar, FiLogOut, FiTrendingUp,
  FiMenu, FiX, FiExternalLink, FiChevronRight
} from 'react-icons/fi'
import { logoutUser } from '../../redux/slices/authSlice'

const menuItems = [
  { label: 'Dashboard',  icon: FiGrid,         href: '/admin/dashboard' },
  { label: 'Products',   icon: FiPackage,       href: '/admin/products' },
  { label: 'Categories', icon: FiTag,           href: '/admin/categories' },
  { label: 'Orders',     icon: FiShoppingCart,  href: '/admin/orders' },
  { label: 'Users',      icon: FiUsers,         href: '/admin/users' },
  { label: 'Coupons',    icon: FiPercent,       href: '/admin/coupons' },
  { label: 'Banners',    icon: FiImage,         href: '/admin/banners' },
  { label: 'Reviews',    icon: FiStar,          href: '/admin/reviews' },
]

export default function AdminSidebar() {
  const location = useLocation()
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => { dispatch(logoutUser()); navigate('/') }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-100">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-red-500 rounded-xl flex items-center justify-center shadow-md">
            <span className="text-white font-black text-lg" style={{ fontFamily: 'Outfit, sans-serif' }}>A</span>
          </div>
          <div>
            <p className="text-gray-900 font-black text-sm tracking-widest" style={{ fontFamily: 'Outfit, sans-serif' }}>AURA</p>
            <p className="text-gray-400 text-xs">Admin Panel</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {menuItems.map(({ label, icon: Icon, href }) => {
          const isActive = location.pathname === href
          return (
            <Link
              key={href}
              to={href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
                isActive
                  ? 'bg-red-50 text-red-600 border border-red-100'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon size={17} className={isActive ? 'text-red-500' : 'text-gray-400 group-hover:text-gray-600'} />
              <span className="flex-1">{label}</span>
              {isActive && <FiChevronRight size={13} className="text-red-400" />}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-gray-100 space-y-0.5">
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
        >
          <FiExternalLink size={17} className="text-gray-400" />
          <span>View Store</span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors"
        >
          <FiLogOut size={17} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Hamburger in top bar */}
      <button
        className="md:hidden fixed top-4 left-4 z-[60] w-9 h-9 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-gray-700 shadow-sm"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <FiX size={18} /> : <FiMenu size={18} />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-50
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
          w-56 transition-transform duration-250
          bg-white border-r border-gray-200 min-h-screen flex-shrink-0
        `}
      >
        <SidebarContent />
      </aside>
    </>
  )
}
