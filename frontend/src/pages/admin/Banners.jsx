import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiPlus, FiEdit2, FiTrash2, FiX, FiCheckCircle, FiImage, FiToggleLeft, FiToggleRight } from 'react-icons/fi'
import AdminSidebar from '../../components/admin/AdminSidebar'
import api from '../../services/api'
import toast from 'react-hot-toast'

export default function AdminBanners() {
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editBanner, setEditBanner] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    title: '', subtitle: '', link: '', buttonText: '',
    position: 'hero', order: 0, bgColor: '', isActive: true,
    gender: 'all'
  })
  const [imageFile, setImageFile] = useState(null)

  useEffect(() => {
    fetchBanners()
  }, [])

  const fetchBanners = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/banners/all')
      setBanners(data.banners)
    } catch (e) {
      toast.error('Failed to load banners')
    }
    setLoading(false)
  }

  const openCreate = () => {
    setEditBanner(null)
    setForm({
      title: '', subtitle: '', link: '', buttonText: '',
      position: 'hero', order: 0, bgColor: '', isActive: true,
      gender: 'all'
    })
    setImageFile(null)
    setShowModal(true)
  }

  const openEdit = (banner) => {
    setEditBanner(banner)
    setForm({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      link: banner.link || '',
      buttonText: banner.buttonText || '',
      position: banner.position || 'hero',
      order: banner.order || 0,
      bgColor: banner.bgColor || '',
      isActive: banner.isActive !== false,
      gender: banner.gender || 'all'
    })
    setImageFile(null)
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!editBanner && !imageFile) return toast.error('Banner image is required')
    if (editBanner && !imageFile && !editBanner.image?.url) return toast.error('Banner image is required')

    setSubmitting(true)
    const formData = new FormData()
    Object.entries(form).forEach(([key, val]) => formData.append(key, val))
    if (imageFile) {
      formData.append('image', imageFile)
    }

    try {
      if (editBanner) {
        await api.put(`/banners/${editBanner._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        toast.success('Banner updated!')
      } else {
        await api.post('/banners', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        toast.success('Banner created!')
      }
      setShowModal(false)
      fetchBanners()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    }
    setSubmitting(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this banner?')) return
    try {
      await api.delete(`/banners/${id}`)
      toast.success('Banner deleted')
      fetchBanners()
    } catch (err) {
      toast.error('Delete failed')
    }
  }

  const handleToggleActive = async (id) => {
    try {
      await api.put(`/banners/${id}/toggle`)
      fetchBanners()
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
            <h1 className="text-2xl font-black text-gray-900 tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>Banners</h1>
            <p className="text-gray-500 text-sm mt-0.5">{banners.length} total active promotional banners</p>
          </div>
          <button
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold px-5 py-2.5 rounded-lg text-sm tracking-wide transition-colors shadow-sm"
          >
            <FiPlus size={16} /> Add Banner
          </button>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-6 py-4 text-gray-500 text-[10px] font-bold uppercase tracking-widest">Banner</th>
                  <th className="px-6 py-4 text-gray-500 text-[10px] font-bold uppercase tracking-widest">Position</th>
                  <th className="px-6 py-4 text-gray-500 text-[10px] font-bold uppercase tracking-widest">Gender</th>
                  <th className="px-6 py-4 text-gray-500 text-[10px] font-bold uppercase tracking-widest">Order</th>
                  <th className="px-6 py-4 text-gray-500 text-[10px] font-bold uppercase tracking-widest">Active</th>
                  <th className="px-6 py-4 text-gray-500 text-[10px] font-bold uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-4 bg-gray-100 rounded animate-pulse w-2/3" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : banners.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 text-sm">
                      No banners found. Add a banner to display promotions on the home slider.
                    </td>
                  </tr>
                ) : banners.map((banner) => (
                  <tr key={banner._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={banner.image?.url}
                          alt={banner.title}
                          className="w-20 h-11 rounded-lg object-cover flex-shrink-0 border border-gray-200 shadow-sm bg-gray-50"
                        />
                        <div className="min-w-0">
                          <p className="text-gray-900 font-bold text-sm truncate max-w-[250px]">{banner.title}</p>
                          <p className="text-gray-400 text-xs mt-0.5 truncate max-w-[200px]">{banner.link}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-155 uppercase">
                        {banner.position}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold uppercase border ${
                        banner.gender === 'women'
                          ? 'bg-purple-50 text-purple-700 border-purple-150'
                          : banner.gender === 'men'
                            ? 'bg-blue-50 text-blue-700 border-blue-150'
                            : 'bg-gray-50 text-gray-700 border-gray-150'
                      }`}>
                        {banner.gender || 'all'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700 text-sm">{banner.order}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(banner._id)}
                        className={`transition-colors focus:outline-none ${banner.isActive ? 'text-red-500' : 'text-gray-300 hover:text-gray-400'}`}
                      >
                        {banner.isActive ? <FiToggleRight size={24} /> : <FiToggleLeft size={24} />}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(banner)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <FiEdit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(banner._id)}
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
                    {editBanner ? 'Edit Banner' : 'Add New Banner'}
                  </h2>
                  <button
                    onClick={() => !submitting && setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-50 transition-colors"
                  >
                    <FiX size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-gray-700 text-xs font-bold mb-1.5 block">Title *</label>
                      <input
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        required
                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      />
                    </div>
                    <div>
                      <label className="text-gray-700 text-xs font-bold mb-1.5 block">Subtitle</label>
                      <input
                        value={form.subtitle}
                        onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      />
                    </div>
                    <div>
                      <label className="text-gray-700 text-xs font-bold mb-1.5 block">Link *</label>
                      <input
                        value={form.link}
                        onChange={(e) => setForm({ ...form, link: e.target.value })}
                        required
                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                        placeholder="e.g. /men"
                      />
                    </div>
                    <div>
                      <label className="text-gray-700 text-xs font-bold mb-1.5 block">Button Text</label>
                      <input
                        value={form.buttonText}
                        onChange={(e) => setForm({ ...form, buttonText: e.target.value })}
                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                        placeholder="e.g. Shop Now"
                      />
                    </div>
                    <div>
                      <label className="text-gray-700 text-xs font-bold mb-1.5 block">Position</label>
                      <select
                        value={form.position}
                        onChange={(e) => setForm({ ...form, position: e.target.value })}
                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      >
                        <option value="hero">Hero Slider</option>
                        <option value="drops">Latest Drops</option>
                        <option value="promo">Promo Section</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-gray-700 text-xs font-bold mb-1.5 block">Order</label>
                      <input
                        type="number"
                        value={form.order}
                        onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      />
                    </div>
                    <div>
                      <label className="text-gray-700 text-xs font-bold mb-1.5 block">Gender Target</label>
                      <select
                        value={form.gender || 'all'}
                        onChange={(e) => setForm({ ...form, gender: e.target.value })}
                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      >
                        <option value="all">All / Unisex</option>
                        <option value="men">Men</option>
                        <option value="women">Women</option>
                        <option value="sneakers">Sneakers</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-gray-700 text-xs font-bold mb-1.5 block">Background Color (Hex)</label>
                    <input
                      type="color"
                      value={form.bgColor || '#ef4444'}
                      onChange={(e) => setForm({ ...form, bgColor: e.target.value })}
                      className="w-full h-10 rounded-lg cursor-pointer bg-white border border-gray-300 p-1"
                    />
                  </div>

                  <div>
                    <label className="text-gray-700 text-xs font-bold mb-1.5 block">Banner Image *</label>
                    {imageFile || (editBanner && editBanner.image?.url) ? (
                      <div className="relative rounded-xl overflow-hidden border border-gray-200 aspect-[21/9] bg-gray-50 flex items-center justify-center">
                        <img
                          src={imageFile ? URL.createObjectURL(imageFile) : editBanner.image.url}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        {/* Logo overlay on preview */}
                        <div className="absolute bottom-1.5 right-0.5 pointer-events-none z-10 select-none">
                          <img
                            src="/logo.png"
                            alt="Aura Logo"
                            className="w-10 sm:w-14 object-contain"
                            style={{ filter: 'drop-shadow(0px 2px 5px rgba(0,0,0,0.7)) drop-shadow(0px 4px 12px rgba(0,0,0,0.45))' }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setImageFile(null);
                            if (editBanner && editBanner.image) {
                              editBanner.image.url = '';
                            }
                          }}
                          className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 rounded-full text-white transition-colors z-20"
                        >
                          <FiX size={16} />
                        </button>
                      </div>
                    ) : (
                      <div
                        className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-red-500/50 bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => document.getElementById('bannerImage').click()}
                      >
                        <FiImage className="mx-auto text-gray-400 mb-2" size={28} />
                        <p className="text-gray-750 font-bold text-sm mb-1">Click to upload image</p>
                        <p className="text-gray-400 text-xs">Supports JPG, JPEG, PNG, GIF, WEBP (Max 5MB)</p>
                      </div>
                    )}
                    <input
                      id="bannerImage"
                      type="file"
                      accept="image/png, image/jpeg, image/jpg, image/gif, image/webp"
                      hidden
                      onChange={e => {
                        if (e.target.files?.[0]) {
                          setImageFile(e.target.files[0])
                        }
                      }}
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
                    {editBanner ? 'Update Banner' : 'Create Banner'}
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
