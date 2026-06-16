import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiPlus, FiEdit2, FiTrash2, FiX, FiCheckCircle, FiToggleLeft, FiToggleRight } from 'react-icons/fi'
import AdminSidebar from '../../components/admin/AdminSidebar'
import api from '../../services/api'
import toast from 'react-hot-toast'

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editCoupon, setEditCoupon] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    code: '', description: '', discountType: 'percentage', discountValue: '',
    maxDiscountAmount: '', minOrderAmount: '', expiresAt: '', isActive: true
  })

  useEffect(() => {
    fetchCoupons()
  }, [])

  const fetchCoupons = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/coupons')
      setCoupons(data.coupons)
    } catch (e) {
      toast.error('Failed to load coupons')
    }
    setLoading(false)
  }

  const openCreate = () => {
    setEditCoupon(null)
    setForm({
      code: '', description: '', discountType: 'percentage', discountValue: '',
      maxDiscountAmount: '', minOrderAmount: '', expiresAt: '', isActive: true
    })
    setShowModal(true)
  }

  const openEdit = (coupon) => {
    setEditCoupon(coupon)
    setForm({
      code: coupon.code || '',
      description: coupon.description || '',
      discountType: coupon.discountType || 'percentage',
      discountValue: coupon.discountValue || '',
      maxDiscountAmount: coupon.maxDiscountAmount || '',
      minOrderAmount: coupon.minOrderAmount || '',
      expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().split('T')[0] : '',
      isActive: coupon.isActive !== false
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (editCoupon) {
        await api.put(`/coupons/${editCoupon._id}`, form)
        toast.success('Coupon updated!')
      } else {
        await api.post('/coupons', form)
        toast.success('Coupon created!')
      }
      setShowModal(false)
      fetchCoupons()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    }
    setSubmitting(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return
    try {
      await api.delete(`/coupons/${id}`)
      toast.success('Coupon deleted')
      fetchCoupons()
    } catch (err) {
      toast.error('Delete failed')
    }
  }

  const handleToggleActive = async (id) => {
    try {
      const coupon = coupons.find(c => c._id === id);
      await api.put(`/coupons/${id}`, { isActive: !coupon.isActive })
      fetchCoupons()
    } catch (err) {
      toast.error('Toggle failed')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      
      <main className="flex-1 min-w-0 p-4 md:p-8 space-y-6 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>Coupons</h1>
            <p className="text-gray-500 text-sm mt-0.5">{coupons.length} total active coupons</p>
          </div>
          <button 
            onClick={openCreate} 
            className="inline-flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold px-5 py-2.5 rounded-lg text-sm tracking-wide transition-colors shadow-sm"
          >
            <FiPlus size={16} /> Add Coupon
          </button>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-6 py-4 text-gray-500 text-[10px] font-bold uppercase tracking-widest">Code</th>
                  <th className="px-6 py-4 text-gray-500 text-[10px] font-bold uppercase tracking-widest">Type & Value</th>
                  <th className="px-6 py-4 text-gray-500 text-[10px] font-bold uppercase tracking-widest">Min Order</th>
                  <th className="px-6 py-4 text-gray-500 text-[10px] font-bold uppercase tracking-widest">Expiry Date</th>
                  <th className="px-6 py-4 text-gray-500 text-[10px] font-bold uppercase tracking-widest">Active</th>
                  <th className="px-6 py-4 text-gray-500 text-[10px] font-bold uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-4 bg-gray-100 rounded animate-pulse w-2/3" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : coupons.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 text-sm">
                      No coupons found. Add a coupon to run marketing promotions.
                    </td>
                  </tr>
                ) : coupons.map((coupon) => (
                  <tr key={coupon._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="inline-flex px-3 py-1 rounded-lg text-xs font-black tracking-widest bg-red-50 text-red-700 border border-red-150 uppercase">
                        {coupon.code}
                      </span>
                      <p className="text-gray-400 text-xs mt-1">{coupon.description}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-900 font-bold text-sm">
                        {coupon.discountType === 'percentage' ? `${coupon.discountValue}% Off` : `₹${coupon.discountValue} Off`}
                      </span>
                      {coupon.maxDiscountAmount && (
                        <p className="text-gray-400 text-[10px] mt-0.5">Upto ₹{coupon.maxDiscountAmount}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-700 text-sm">₹{coupon.minOrderAmount}</td>
                    <td className="px-6 py-4 text-gray-600 text-sm">
                      {new Date(coupon.expiresAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleToggleActive(coupon._id)} 
                        className={`transition-colors focus:outline-none ${coupon.isActive ? 'text-red-500' : 'text-gray-300 hover:text-gray-400'}`}
                      >
                        {coupon.isActive ? <FiToggleRight size={24} /> : <FiToggleLeft size={24} />}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => openEdit(coupon)} 
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <FiEdit2 size={15} />
                        </button>
                        <button 
                          onClick={() => handleDelete(coupon._id)} 
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <FiTrash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        <AnimatePresence>
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm -z-10"
                onClick={() => !submitting && setShowModal(false)}
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.98 }}
                className="w-full max-w-lg bg-white rounded-2xl overflow-hidden shadow-2xl my-auto border border-gray-150"
              >
                <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white">
                  <h2 className="text-xl font-black text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {editCoupon ? 'Edit Coupon' : 'Add New Coupon'}
                  </h2>
                  <button 
                    onClick={() => !submitting && setShowModal(false)} 
                    className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-50 transition-colors"
                  >
                    <FiX size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                  <div>
                    <label className="text-gray-700 text-xs font-bold mb-1.5 block">Coupon Code *</label>
                    <input
                      value={form.code}
                      onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                      required
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 uppercase font-black tracking-widest"
                      placeholder="e.g. SUMMER50"
                    />
                  </div>
                  <div>
                    <label className="text-gray-700 text-xs font-bold mb-1.5 block">Description *</label>
                    <input
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      required
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      placeholder="e.g. 50% off on summer wear"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-gray-700 text-xs font-bold mb-1.5 block">Discount Type *</label>
                      <select
                        value={form.discountType}
                        onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="flat">Flat Amount (₹)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-gray-700 text-xs font-bold mb-1.5 block">Discount Value *</label>
                      <input
                        type="number"
                        value={form.discountValue}
                        onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                        required
                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                        placeholder="e.g. 50"
                        min="1"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-gray-700 text-xs font-bold mb-1.5 block">Max Discount Amount (₹)</label>
                      <input
                        type="number"
                        value={form.maxDiscountAmount}
                        onChange={(e) => setForm({ ...form, maxDiscountAmount: e.target.value })}
                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                        placeholder="Leave empty for none"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="text-gray-700 text-xs font-bold mb-1.5 block">Min Order Amount (₹) *</label>
                      <input
                        type="number"
                        value={form.minOrderAmount}
                        onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
                        required
                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                        placeholder="e.g. 999"
                        min="0"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-700 text-xs font-bold mb-1.5 block">Expiry Date *</label>
                    <input
                      type="date"
                      value={form.expiresAt}
                      onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                      required
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={form.isActive}
                      onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                      className="accent-red-500 w-4 h-4 rounded"
                    />
                    <label htmlFor="isActive" className="text-gray-750 text-xs font-bold cursor-pointer select-none">Set as Active</label>
                  </div>

                  <button 
                    type="submit" 
                    disabled={submitting} 
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-xl w-full flex items-center justify-center gap-2 mt-4 shadow-sm transition-colors"
                  >
                    {submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                    {editCoupon ? 'Update Coupon' : 'Create Coupon'}
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
