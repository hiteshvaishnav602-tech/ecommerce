import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiSearch, FiEdit2, FiX, FiCheckCircle } from 'react-icons/fi'
import AdminSidebar from '../../components/admin/AdminSidebar'
import api from '../../services/api'
import toast from 'react-hot-toast'

const STATUS_BADGE = {
  pending:    'bg-yellow-50 text-yellow-700 border border-yellow-150',
  processing: 'bg-blue-50 text-blue-700 border border-blue-150',
  shipped:    'bg-purple-50 text-purple-700 border border-purple-150',
  delivered:  'bg-green-50 text-green-700 border border-green-150',
  cancelled:  'bg-red-50 text-red-700 border border-red-150',
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editOrder, setEditOrder] = useState(null)
  const [status, setStatus] = useState('')

  useEffect(() => {
    fetchOrders()
  }, [page])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/orders', {
        params: { page, limit: 15, search }
      })
      setOrders(data.orders)
      setTotal(data.total)
    } catch (e) {
      toast.error('Failed to load orders')
    }
    setLoading(false)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    fetchOrders()
  }

  const openEdit = (order) => {
    setEditOrder(order)
    setStatus(order.status)
    setShowModal(true)
  }

  const handleUpdateStatus = async (e) => {
    e.preventDefault()
    try {
      await api.put(`/orders/${editOrder._id}/status`, { status })
      toast.success('Order status updated!')
      setShowModal(false)
      fetchOrders()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update')
    }
  }

  const formatPrice = (p) => p ? `₹${parseInt(p).toLocaleString()}` : '—'

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      
      <main className="flex-1 min-w-0 p-4 md:p-8 space-y-6 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>Orders</h1>
            <p className="text-gray-500 text-sm mt-0.5">{total} orders found</p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <form onSubmit={handleSearch} className="relative">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order ID or user email..."
              className="w-full bg-white border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
            />
          </form>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-6 py-4 text-gray-500 text-[10px] font-bold uppercase tracking-widest">Order ID</th>
                  <th className="px-6 py-4 text-gray-500 text-[10px] font-bold uppercase tracking-widest">Customer</th>
                  <th className="px-6 py-4 text-gray-500 text-[10px] font-bold uppercase tracking-widest">Date</th>
                  <th className="px-6 py-4 text-gray-500 text-[10px] font-bold uppercase tracking-widest">Total</th>
                  <th className="px-6 py-4 text-gray-500 text-[10px] font-bold uppercase tracking-widest">Payment</th>
                  <th className="px-6 py-4 text-gray-500 text-[10px] font-bold uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-gray-500 text-[10px] font-bold uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-4 bg-gray-100 rounded animate-pulse w-2/3" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500 text-sm">
                      No orders found.
                    </td>
                  </tr>
                ) : orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-red-500 font-bold text-xs">{order.orderNumber}</td>
                    <td className="px-6 py-4">
                      <p className="text-gray-900 font-bold text-sm">{order.user?.name || 'Unknown'}</p>
                      <p className="text-gray-400 text-xs mt-0.5">{order.user?.email || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-gray-900 font-bold text-sm">{formatPrice(order.totalAmount)}</td>
                    <td className="px-6 py-4">
                      <p className="text-gray-700 text-xs font-bold uppercase">{order.paymentMethod}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5 capitalize">{order.paymentStatus}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                        STATUS_BADGE[order.status] || 'bg-gray-50 text-gray-700 border border-gray-150'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => openEdit(order)} 
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Update Status"
                      >
                        <FiEdit2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {Math.ceil(total / 15) > 1 && (
          <div className="flex justify-center gap-1.5 mt-6">
            {Array.from({ length: Math.ceil(total / 15) }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-9 h-9 rounded-lg text-sm font-bold transition-all border ${
                  page === i + 1 
                    ? 'bg-red-500 text-white border-red-500 shadow-sm' 
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}

        {/* Edit Modal */}
        <AnimatePresence>
          {showModal && editOrder && (
            <>
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                onClick={() => setShowModal(false)}
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.98 }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl z-50 overflow-hidden shadow-2xl border border-gray-150"
              >
                <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white">
                  <h2 className="text-xl font-black text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>Update Order Status</h2>
                  <button 
                    onClick={() => setShowModal(false)} 
                    className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-50 transition-colors"
                  >
                    <FiX size={20} />
                  </button>
                </div>

                <div className="p-6 space-y-5">
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-sm">
                    <p className="text-gray-500">Order Number: <span className="text-gray-900 font-bold ml-1">{editOrder.orderNumber}</span></p>
                    <p className="text-gray-500 mt-1.5">Customer: <span className="text-gray-900 font-bold ml-1">{editOrder.user?.name}</span></p>
                    <p className="text-gray-500 mt-1.5">Amount: <span className="text-gray-900 font-bold ml-1">{formatPrice(editOrder.totalAmount)}</span></p>
                  </div>

                  <form onSubmit={handleUpdateStatus} className="space-y-5">
                    <div>
                      <label className="text-gray-700 text-xs font-bold mb-1.5 block">Update Status</label>
                      <select 
                        value={status} 
                        onChange={(e) => setStatus(e.target.value)} 
                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 uppercase font-bold"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>

                    <button 
                      type="submit" 
                      className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors"
                    >
                      <FiCheckCircle size={16} /> Save Changes
                    </button>
                  </form>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
