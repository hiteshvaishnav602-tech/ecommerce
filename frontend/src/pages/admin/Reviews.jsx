import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiTrash2, FiSearch } from 'react-icons/fi'
import AdminSidebar from '../../components/admin/AdminSidebar'
import api from '../../services/api'
import toast from 'react-hot-toast'
import StarRating from '../../components/common/StarRating'

export default function AdminReviews() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)

  useEffect(() => {
    fetchReviews()
  }, [page])

  const fetchReviews = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/reviews', {
        params: { page, limit: 15 }
      })
      setReviews(data.reviews)
      setTotal(data.total)
    } catch (e) {
      toast.error('Failed to load reviews')
    }
    setLoading(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this review?')) return
    try {
      await api.delete(`/reviews/${id}`)
      toast.success('Review deleted')
      fetchReviews()
    } catch (err) {
      toast.error('Delete failed')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      
      <main className="flex-1 min-w-0 p-4 md:p-8 space-y-6 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>Reviews</h1>
            <p className="text-gray-500 text-sm mt-0.5">{total} total customer reviews</p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-6 py-4 text-gray-500 text-[10px] font-bold uppercase tracking-widest">Product</th>
                  <th className="px-6 py-4 text-gray-500 text-[10px] font-bold uppercase tracking-widest">User</th>
                  <th className="px-6 py-4 text-gray-500 text-[10px] font-bold uppercase tracking-widest">Rating</th>
                  <th className="px-6 py-4 text-gray-500 text-[10px] font-bold uppercase tracking-widest">Review</th>
                  <th className="px-6 py-4 text-gray-500 text-[10px] font-bold uppercase tracking-widest">Date</th>
                  <th className="px-6 py-4 text-gray-500 text-[10px] font-bold uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-4 bg-gray-100 rounded animate-pulse w-2/3" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : reviews.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 text-sm">
                      No reviews found.
                    </td>
                  </tr>
                ) : reviews.map((review) => (
                  <tr key={review._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={review.product?.images?.[0]?.url || review.product?.colors?.[0]?.images?.[0]?.url || review.product?.colors?.[0]?.image?.url || 'https://placehold.co/100'}
                          alt={review.product?.title}
                          className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-gray-200"
                        />
                        <p className="text-gray-900 font-bold text-sm max-w-[150px] line-clamp-2">{review.product?.title || 'Unknown Product'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-900 font-bold text-sm">{review.user?.name || 'Anonymous'}</p>
                      <p className="text-gray-400 text-xs mt-0.5">{review.user?.email || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <StarRating rating={review.rating} size={14} />
                    </td>
                    <td className="px-6 py-4 max-w-[250px]">
                      <p className="text-gray-900 font-bold text-xs line-clamp-1">{review.title}</p>
                      <p className="text-gray-500 text-[11px] mt-0.5 line-clamp-2 leading-relaxed">{review.comment}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {new Date(review.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleDelete(review._id)} 
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Review"
                      >
                        <FiTrash2 size={15} />
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
      </main>
    </div>
  )
}
