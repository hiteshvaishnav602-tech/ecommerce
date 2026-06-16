import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiPlus, FiEdit2, FiTrash2, FiX, FiCheckCircle, FiImage } from 'react-icons/fi'
import AdminSidebar from '../../components/admin/AdminSidebar'
import api from '../../services/api'
import toast from 'react-hot-toast'

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editCategory, setEditCategory] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [categoryToDelete, setCategoryToDelete] = useState(null)

  const [form, setForm] = useState({
    name: '', description: '', gender: 'unisex', order: 0
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/categories/all')
      setCategories(data.categories)
    } catch (e) {
      toast.error('Failed to load categories')
    }
    setLoading(false)
  }

  const openCreate = () => {
    setEditCategory(null)
    setForm({ name: '', description: '', gender: 'unisex', order: 0 })
    setImageFile(null)
    setShowModal(true)
  }

  const openEdit = (cat) => {
    setEditCategory(cat)
    setForm({
      name: cat.name,
      description: cat.description || '',
      gender: cat.gender || 'unisex',
      order: cat.order || 0
    })
    setImageFile(null)
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    const formData = new FormData()
    Object.entries(form).forEach(([key, val]) => formData.append(key, val))
    if (imageFile) {
      formData.append('image', imageFile)
    }

    try {
      if (editCategory) {
        await api.put(`/categories/${editCategory._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        toast.success('Category updated!')
      } else {
        await api.post('/categories', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        toast.success('Category created!')
      }
      setShowModal(false)
      fetchCategories()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    }
    setSubmitting(false)
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/categories/${id}`)
      toast.success('Category deleted successfully')
      fetchCategories()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed. Ensure no products are linked to it.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      
      <main className="flex-1 min-w-0 p-4 md:p-8 space-y-6 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>Categories</h1>
            <p className="text-gray-500 text-sm mt-0.5">{categories.length} total categories</p>
          </div>
          <button 
            onClick={openCreate} 
            className="inline-flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold px-5 py-2.5 rounded-lg text-sm tracking-wide transition-colors shadow-sm"
          >
            <FiPlus size={16} /> Add Category
          </button>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-6 py-4 text-gray-500 text-[10px] font-bold uppercase tracking-widest">Name</th>
                  <th className="px-6 py-4 text-gray-500 text-[10px] font-bold uppercase tracking-widest">Slug</th>
                  <th className="px-6 py-4 text-gray-500 text-[10px] font-bold uppercase tracking-widest">Gender</th>
                  <th className="px-6 py-4 text-gray-500 text-[10px] font-bold uppercase tracking-widest">Order</th>
                  <th className="px-6 py-4 text-gray-500 text-[10px] font-bold uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-4 bg-gray-100 rounded animate-pulse w-2/3" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : categories.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 text-sm">
                      No categories found. Add a category to start grouping products.
                    </td>
                  </tr>
                ) : categories.map((cat) => (
                  <tr key={cat._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={cat.image?.url || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=100'} 
                          alt={cat.name} 
                          className="w-10 h-10 rounded-lg object-cover bg-white border border-gray-200 shadow-sm" 
                        />
                        <span className="text-gray-900 font-bold text-sm">{cat.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">{cat.slug}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-150 uppercase">
                        {cat.gender}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700 text-sm">{cat.order}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => openEdit(cat)} 
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <FiEdit2 size={15} />
                        </button>
                        <button 
                          onClick={() => setCategoryToDelete(cat)} 
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
                className="w-full max-w-md bg-white rounded-2xl overflow-hidden shadow-2xl my-auto border border-gray-150"
              >
                <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white">
                  <h2 className="text-xl font-black text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {editCategory ? 'Edit Category' : 'Add Category'}
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
                    <label className="text-gray-700 text-xs font-bold mb-1.5 block">Name *</label>
                    <input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      placeholder="e.g. T-Shirts"
                    />
                  </div>
                  <div>
                    <label className="text-gray-700 text-xs font-bold mb-1.5 block">Description</label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 resize-none"
                      rows={2}
                      placeholder="Category description..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-gray-700 text-xs font-bold mb-1.5 block">Gender</label>
                      <select
                        value={form.gender}
                        onChange={(e) => setForm({ ...form, gender: e.target.value })}
                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      >
                        <option value="men">Men</option>
                        <option value="women">Women</option>
                        <option value="unisex">Unisex</option>
                        <option value="kids">Kids</option>
                        <option value="sneakers">Sneakers</option>
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
                  </div>

                  <div>
                    <label className="text-gray-700 text-xs font-bold mb-1.5 block">Category Image</label>
                    {imageFile || (editCategory && editCategory.image?.url) ? (
                      <div className="relative rounded-xl overflow-hidden border border-gray-200 aspect-square max-w-[120px] bg-gray-50 flex items-center justify-center mx-auto shadow-sm">
                        <img 
                          src={imageFile ? URL.createObjectURL(imageFile) : editCategory.image.url} 
                          alt="Preview" 
                          className="w-full h-full object-cover" 
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImageFile(null);
                            if (editCategory && editCategory.image) {
                              editCategory.image.url = '';
                            }
                          }}
                          className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-black/80 rounded-full text-white transition-colors"
                        >
                          <FiX size={12} />
                        </button>
                      </div>
                    ) : (
                      <div 
                        className="border-2 border-dashed border-gray-300 rounded-xl p-5 text-center hover:border-red-500/50 bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => document.getElementById('categoryImage').click()}
                      >
                        <FiImage className="mx-auto text-gray-400 mb-1.5" size={24} />
                        <p className="text-gray-750 font-bold text-xs mb-0.5">Click to upload image</p>
                        <p className="text-gray-400 text-[10px]">JPG, PNG, WEBP (Max 5MB)</p>
                      </div>
                    )}
                    <input 
                      id="categoryImage" 
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

                  <button 
                    type="submit" 
                    disabled={submitting} 
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-xl w-full flex items-center justify-center gap-2 mt-4 shadow-sm transition-colors"
                  >
                    {submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><FiCheckCircle size={16} /> Save Category</>}
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {categoryToDelete && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm -z-10"
                onClick={() => setCategoryToDelete(null)}
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.98 }}
                className="w-full max-w-sm bg-white rounded-2xl overflow-hidden shadow-2xl p-6 border border-gray-150 space-y-4 my-auto"
              >
                <div className="text-center">
                  <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-500 mb-3">
                    <FiTrash2 size={24} />
                  </div>
                  <h3 className="text-lg font-black text-gray-950" style={{ fontFamily: 'Outfit, sans-serif' }}>Delete Category</h3>
                  <p className="text-gray-500 text-sm mt-2">
                    Are you sure you want to delete <span className="font-bold text-gray-900">"{categoryToDelete.name}"</span>?
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setCategoryToDelete(null)}
                    type="button"
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 px-4 rounded-xl text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      const id = categoryToDelete._id;
                      setCategoryToDelete(null);
                      handleDelete(id);
                    }}
                    type="button"
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition-colors shadow-sm"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
