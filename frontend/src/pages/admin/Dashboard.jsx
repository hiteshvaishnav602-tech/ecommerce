import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FiUsers, FiPackage, FiShoppingCart, FiDollarSign,
  FiTrendingUp, FiTrendingDown, FiAlertCircle, FiArrowRight
} from 'react-icons/fi'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'
import api from '../../services/api'
import AdminSidebar from '../../components/admin/AdminSidebar'

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const STATUS_COLORS = {
  pending:    '#f59e0b',
  processing: '#3b82f6',
  shipped:    '#8b5cf6',
  delivered:  '#10b981',
  cancelled:  '#ef4444',
}
const PIE_COLORS = ['#ef4444', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6']

const STATUS_BADGE = {
  pending:    'bg-yellow-50 text-yellow-700 border-yellow-200',
  processing: 'bg-blue-50 text-blue-700 border-blue-200',
  shipped:    'bg-purple-50 text-purple-700 border-purple-200',
  delivered:  'bg-green-50 text-green-700 border-green-200',
  cancelled:  'bg-red-50 text-red-700 border-red-200',
}

export default function AdminDashboard() {
  const [stats, setStats]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(({ data }) => setStats(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const formatINR = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

  const statCards = stats ? [
    {
      label: 'Total Revenue',
      value: formatINR(stats.stats.revenue),
      icon: FiDollarSign,
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200',
      trend: '+12.5%',
      up: true,
    },
    {
      label: 'Total Orders',
      value: stats.stats.totalOrders.toLocaleString(),
      icon: FiShoppingCart,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      trend: `${stats.stats.growth}%`,
      up: parseFloat(stats.stats.growth) >= 0,
    },
    {
      label: 'Total Users',
      value: stats.stats.totalUsers.toLocaleString(),
      icon: FiUsers,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      trend: '+8.2%',
      up: true,
    },
    {
      label: 'Products',
      value: stats.stats.totalProducts.toLocaleString(),
      icon: FiPackage,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      trend: 'Active',
      up: true,
    },
  ] : []

  const salesData = stats?.monthlySales?.map((m) => ({
    month: MONTH_NAMES[m._id.month - 1],
    revenue: m.revenue,
    orders: m.orders,
  })) || []

  const ordersByStatus = stats?.ordersByStatus || []

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />

      <main className="flex-1 overflow-auto min-w-0">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-xl font-black text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>Dashboard</h1>
            <p className="text-gray-500 text-xs mt-0.5">Welcome back, Admin 👋</p>
          </div>
          <Link
            to="/products"
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold uppercase tracking-widest px-4 py-2 transition-colors"
          >
            View Store <FiArrowRight size={14} />
          </Link>
        </div>

        <div className="p-6 space-y-6">
          {/* Pending Alert */}
          {stats?.stats?.pendingOrders > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 flex items-center gap-3 rounded-lg">
              <FiAlertCircle className="text-yellow-500 shrink-0" size={18} />
              <p className="text-yellow-800 text-sm">
                You have <strong>{stats.stats.pendingOrders}</strong> pending orders awaiting confirmation.
              </p>
              <Link to="/admin/orders" className="ml-auto text-yellow-700 text-xs font-bold hover:underline whitespace-nowrap">
                View Orders →
              </Link>
            </div>
          )}

          {/* Stats Cards */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 animate-pulse">
                  <div className="h-10 w-10 bg-gray-100 rounded-lg mb-4" />
                  <div className="h-6 bg-gray-100 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {statCards.map((card, i) => (
                <div key={card.label} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-10 h-10 ${card.bg} border ${card.border} rounded-lg flex items-center justify-center`}>
                      <card.icon size={18} className={card.color} />
                    </div>
                    <div className={`flex items-center gap-1 text-xs font-semibold ${card.up ? 'text-green-600' : 'text-red-500'}`}>
                      {card.up ? <FiTrendingUp size={12} /> : <FiTrendingDown size={12} />}
                      {card.trend}
                    </div>
                  </div>
                  <p className="text-2xl font-black text-gray-900 mb-0.5" style={{ fontFamily: 'Outfit, sans-serif' }}>{card.value}</p>
                  <p className="text-gray-500 text-xs">{card.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Charts Row */}
          {!loading && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Revenue Chart */}
              <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-black text-gray-900 text-sm uppercase tracking-wider" style={{ fontFamily: 'Outfit, sans-serif' }}>Monthly Revenue</h3>
                </div>
                <ResponsiveContainer width="100%" height={230}>
                  <AreaChart data={salesData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }}
                      formatter={(val) => [`₹${val.toLocaleString()}`, 'Revenue']}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#ef4444" strokeWidth={2} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Orders by Status Pie */}
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h3 className="font-black text-gray-900 text-sm uppercase tracking-wider mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>Order Status</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={ordersByStatus}
                      cx="50%" cy="50%"
                      innerRadius={45} outerRadius={72}
                      dataKey="count" nameKey="_id"
                    >
                      {ordersByStatus.map((entry, index) => (
                        <Cell key={entry._id} fill={STATUS_COLORS[entry._id] || PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-2">
                  {ordersByStatus.map((s) => (
                    <div key={s._id} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: STATUS_COLORS[s._id] || '#ef4444' }} />
                        <span className="text-gray-600 capitalize">{s._id}</span>
                      </div>
                      <span className="font-bold text-gray-900">{s.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Recent Orders & Top Products */}
          {!loading && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Recent Orders */}
              <div className="bg-white border border-gray-200 rounded-xl">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                  <h3 className="font-black text-gray-900 text-sm uppercase tracking-wider" style={{ fontFamily: 'Outfit, sans-serif' }}>Recent Orders</h3>
                  <Link to="/admin/orders" className="text-red-500 text-xs font-semibold hover:underline">View All</Link>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="px-5 py-3 text-gray-400 text-[10px] font-bold uppercase tracking-widest">Order</th>
                        <th className="px-5 py-3 text-gray-400 text-[10px] font-bold uppercase tracking-widest">Customer</th>
                        <th className="px-5 py-3 text-gray-400 text-[10px] font-bold uppercase tracking-widest">Amount</th>
                        <th className="px-5 py-3 text-gray-400 text-[10px] font-bold uppercase tracking-widest">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats?.recentOrders?.slice(0, 6).map((order) => (
                        <tr key={order._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-3 text-xs text-red-500 font-medium">{order.orderNumber}</td>
                          <td className="px-5 py-3">
                            <p className="text-gray-900 text-xs font-medium">{order.user?.name}</p>
                            <p className="text-gray-400 text-[10px]">{order.user?.email}</p>
                          </td>
                          <td className="px-5 py-3 text-gray-900 text-xs font-bold">₹{order.totalAmount?.toLocaleString()}</td>
                          <td className="px-5 py-3">
                            <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border rounded-full ${STATUS_BADGE[order.status] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Top Products */}
              <div className="bg-white border border-gray-200 rounded-xl">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                  <h3 className="font-black text-gray-900 text-sm uppercase tracking-wider" style={{ fontFamily: 'Outfit, sans-serif' }}>Top Selling Products</h3>
                  <Link to="/admin/products" className="text-red-500 text-xs font-semibold hover:underline">View All</Link>
                </div>
                <div className="divide-y divide-gray-50">
                  {stats?.topProducts?.map((product, i) => (
                    <div key={product._id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                      <span className="text-gray-300 font-black text-sm w-5">#{i + 1}</span>
                      <img
                        src={product.images?.[0]?.url}
                        alt={product.title}
                        className="w-10 h-10 object-cover object-top bg-gray-100 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 text-xs font-semibold line-clamp-1">{product.title}</p>
                        <p className="text-gray-400 text-[10px]">{product.soldCount} sold</p>
                      </div>
                      <p className="text-gray-900 font-black text-sm">₹{product.discountPrice?.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
