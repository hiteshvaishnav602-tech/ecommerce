import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiImage, FiToggleLeft, FiToggleRight } from 'react-icons/fi'
import AdminSidebar from '../../components/admin/AdminSidebar'
import api from '../../services/api'
import toast from 'react-hot-toast'

const PRESET_COLORS = [
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Red', hex: '#FF0000' },
  { name: 'Blue', hex: '#0000FF' },
  { name: 'Green', hex: '#008000' },
  { name: 'Yellow', hex: '#FFFF00' },
  { name: 'Grey', hex: '#808080' },
  { name: 'Pink', hex: '#FFC0CB' },
  { name: 'Navy Blue', hex: '#001F5B' }
];

const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'Free Size'];

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [categories, setCategories] = useState([])
  const [productToDelete, setProductToDelete] = useState(null)

  const [form, setForm] = useState({
    title: '', brand: 'AURA', description: '', category: '',
    price: '', discountPrice: '', stock: '',
    gender: 'unisex', material: '', isFeatured: false, isTrending: false,
    isNewArrival: false, isBestSeller: false, isActive: true,
    tags: '', sizes: '[]', colors: '[]',
  })
  const [imagesList, setImagesList] = useState([])
  const [colorsList, setColorsList] = useState([])
  const [sizesList, setSizesList] = useState([])
  const [tagsList, setTagsList] = useState([])
  const [tagInput, setTagInput] = useState('')
  const [imageUrlInput, setImageUrlInput] = useState('')
  const [uploadingImages, setUploadingImages] = useState(false)
  const [previewActiveIdx, setPreviewActiveIdx] = useState(0)
  const [previewColorOverride, setPreviewColorOverride] = useState(null)

  useEffect(() => {
    setPreviewColorOverride(null);
  }, [previewActiveIdx, imagesList, colorsList]);

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [page, search])

  useEffect(() => {
    if (sizesList.length > 0) {
      const totalStock = sizesList.reduce((acc, curr) => acc + (parseInt(curr.stock) || 0), 0)
      setForm(f => ({ ...f, stock: totalStock }))
    }
  }, [sizesList])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/products', {
        params: { page, limit: 15, keyword: search, isActive: '' }
      })
      setProducts(data.products)
      setTotal(data.total)
    } catch (e) { toast.error('Failed to load products') }
    setLoading(false)
  }

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories/all')
      setCategories(data.categories)
    } catch (_) { }
  }

  const openCreate = () => {
    setEditProduct(null)
    setForm({ title: '', brand: 'AURA', description: '', category: '', price: '', discountPrice: '', stock: '', gender: 'unisex', material: '', isFeatured: false, isTrending: false, isNewArrival: false, isBestSeller: false, isActive: true, tags: '', sizes: '[]', colors: '[]' })
    setColorsList([])
    setSizesList([])
    setImagesList([])
    setTagsList([])
    setTagInput('')
    setImageUrlInput('')
    setPreviewActiveIdx(0)
    setPreviewColorOverride(null)
    setShowModal(true)
  }

  const openEdit = (product) => {
    setEditProduct(product)
    setForm({
      title: product.title || '',
      brand: product.brand || 'AURA',
      description: product.description || '',
      category: product.category?._id || product.category || '',
      price: product.price || '',
      discountPrice: product.discountPrice || '',
      stock: product.stock || '',
      gender: product.gender || 'unisex',
      material: product.material || '',
      isFeatured: product.isFeatured || false,
      isTrending: product.isTrending || false,
      isNewArrival: product.isNewArrival || false,
      isBestSeller: product.isBestSeller || false,
      isActive: product.isActive !== false,
      tags: ''
    })
    const colors = product.colors ? JSON.parse(JSON.stringify(product.colors)) : []
    const hasDefault = colors.some(c => c.isDefault)
    if (colors.length > 0 && !hasDefault) {
      colors[0].isDefault = true
    }
    setColorsList(colors)
    setSizesList(product.sizes || [])
    setImagesList(product.images || [])
    setTagsList(product.tags || [])
    setTagInput('')
    setImageUrlInput('')
    setPreviewActiveIdx(0)
    setPreviewColorOverride(null)
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    if (form.discountPrice && parseFloat(form.discountPrice) > parseFloat(form.price)) {
      toast.error('Discount price cannot be higher than original price')
      setSubmitting(false)
      return
    }

    const updatedForm = {
      ...form,
      sizes: JSON.stringify(sizesList),
      colors: JSON.stringify(colorsList),
      tags: JSON.stringify(tagsList),
      images: JSON.stringify(imagesList)
    }

    const formData = new FormData()
    Object.entries(updatedForm).forEach(([key, val]) => {
      if (typeof val === 'boolean') formData.append(key, val)
      else if (val !== '') formData.append(key, val)
    })

    try {
      if (editProduct) {
        await api.put(`/products/${editProduct._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        toast.success('Product updated!')
      } else {
        await api.post('/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        toast.success('Product created!')
      }
      setShowModal(false)
      fetchProducts()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    }
    setSubmitting(false)
  }

  const handleProductImageUpload = async (files) => {
    if (files.length === 0) return
    const currentCount = imagesList.length
    if (currentCount >= 2) {
      toast.error('Maximum 2 product gallery images allowed.')
      return
    }

    setUploadingImages(true)
    const toastId = toast.loading('Uploading product images...')
    try {
      const uploadedImages = []
      const slotsLeft = 2 - currentCount
      const filesToUpload = files.slice(0, slotsLeft)

      if (files.length > slotsLeft) {
        toast.warning(`Only ${slotsLeft} image(s) will be uploaded. Maximum 2 images allowed.`, { id: toastId })
      }

      for (const file of filesToUpload) {
        const fd = new FormData()
        fd.append('image', file)
        const { data } = await api.post('/products/upload-image', fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        if (data.success) {
          uploadedImages.push({ url: data.url, public_id: data.public_id })
        }
      }
      setImagesList(prev => [...prev, ...uploadedImages])
      toast.success('Images uploaded successfully!', { id: toastId })
    } catch (err) {
      toast.error('Image upload failed', { id: toastId })
    }
    setUploadingImages(false)
  }

  const handleAddImageUrl = () => {
    if (imagesList.length >= 2) {
      toast.error('Maximum 2 product gallery images allowed.')
      return
    }
    const url = imageUrlInput.trim()
    if (url) {
      setImagesList(prev => [...prev, { url, public_id: '' }])
      setImageUrlInput('')
      toast.success('Image URL added!')
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/products/${id}`)
      toast.success('Product deleted')
      fetchProducts()
    } catch (_) { toast.error('Delete failed') }
  }

  const handleToggle = async (product, field) => {
    try {
      await api.put(`/products/${product._id}`, { [field]: !product[field] })
      fetchProducts()
    } catch (_) { toast.error('Update failed') }
  }

  const discountPercent =
    form.price && form.discountPrice && parseFloat(form.discountPrice) < parseFloat(form.price)
      ? Math.round(((parseFloat(form.price) - parseFloat(form.discountPrice)) / parseFloat(form.price)) * 100)
      : 0;

  const previewImages = imagesList.length > 0
    ? imagesList.map(img => img.url)
    : colorsList.find(c => c.isDefault)?.images?.map(img => img.url) ||
      colorsList[0]?.images?.map(img => img.url) ||
      colorsList.map(c => c.images?.[0]?.url || c.image?.url).filter(Boolean);

  const previewImage = previewColorOverride || previewImages[previewActiveIdx] || '';

  const formatPrice = (p) => p ? `₹${parseInt(p).toLocaleString()}` : '—'

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />

      <main className="flex-1 min-w-0 p-4 md:p-8 space-y-6 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>Products</h1>
            <p className="text-gray-500 text-sm mt-0.5">{total} products in catalogue</p>
          </div>
          <button
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold px-5 py-2.5 rounded-lg text-sm tracking-wide transition-colors shadow-sm"
          >
            <FiPlus size={16} /> Add Product
          </button>
        </div>

        {/* Search */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="relative">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search products by title or brand..."
              className="w-full bg-white border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-6 py-4 text-gray-500 text-[10px] font-bold uppercase tracking-widest">Product</th>
                  <th className="px-6 py-4 text-gray-500 text-[10px] font-bold uppercase tracking-widest">Category</th>
                  <th className="px-6 py-4 text-gray-500 text-[10px] font-bold uppercase tracking-widest">Price</th>
                  <th className="px-6 py-4 text-gray-500 text-[10px] font-bold uppercase tracking-widest">Stock</th>
                  <th className="px-6 py-4 text-gray-500 text-[10px] font-bold uppercase tracking-widest">Featured</th>
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
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500 text-sm">
                      No products found. Add a product to get started.
                    </td>
                  </tr>
                ) : products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.images?.[0]?.url || product.colors?.[0]?.images?.[0]?.url || product.colors?.[0]?.image?.url || 'https://placehold.co/100'}
                          alt={product.title}
                          className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-gray-100"
                        />
                        <div className="min-w-0">
                          <p className="text-gray-900 font-bold text-sm truncate max-w-[200px]">{product.title}</p>
                          <p className="text-gray-400 text-xs mt-0.5">{product.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{product.category?.name || '—'}</td>
                    <td className="px-6 py-4">
                      <p className="text-gray-900 text-sm font-bold">{formatPrice(product.discountPrice)}</p>
                      {product.price !== product.discountPrice && (
                        <p className="text-gray-400 text-xs line-through">{formatPrice(product.price)}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${product.stock > 10
                        ? 'bg-green-50 text-green-700 border border-green-150'
                        : product.stock > 0
                          ? 'bg-yellow-50 text-yellow-700 border border-yellow-150'
                          : 'bg-red-50 text-red-700 border border-red-150'
                        }`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggle(product, 'isFeatured')}
                        className={`transition-colors focus:outline-none ${product.isFeatured ? 'text-red-500' : 'text-gray-300 hover:text-gray-400'}`}
                      >
                        {product.isFeatured ? <FiToggleRight size={24} /> : <FiToggleLeft size={24} />}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${product.isActive
                        ? 'bg-green-50 text-green-700 border border-green-150'
                        : 'bg-red-50 text-red-700 border border-red-150'
                        }`}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openEdit(product)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <FiEdit2 size={15} />
                        </button>
                        <button
                          onClick={() => setProductToDelete(product)}
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

        {/* Pagination */}
        {Math.ceil(total / 15) > 1 && (
          <div className="flex justify-center gap-1.5 mt-6">
            {Array.from({ length: Math.ceil(total / 15) }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-9 h-9 rounded-lg text-sm font-bold transition-all border ${page === i + 1
                  ? 'bg-red-500 text-white border-red-500 shadow-sm'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}

        {/* Create/Edit Modal */}
        <AnimatePresence>
          {showModal && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                onClick={() => !submitting && setShowModal(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="fixed inset-4 md:inset-10 bg-white rounded-2xl z-50 overflow-hidden shadow-2xl border border-gray-100 flex flex-col"
              >
                <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
                  {/* Modal Header */}
                  <div className="sticky top-0 flex items-center justify-between p-6 bg-white border-b border-gray-100 z-10">
                    <h2 className="text-xl font-black text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
                      {editProduct ? 'Edit Product' : 'Add New Product'}
                    </h2>
                    <button
                      type="button"
                      onClick={() => !submitting && setShowModal(false)}
                      className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-50 transition-colors"
                    >
                      <FiX size={20} />
                    </button>
                  </div>

                  {/* Modal Content Wrapper (Dual Pane) */}
                  <div className="flex-1 flex overflow-hidden">
                    {/* Left Pane: Form Fields */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="text-gray-700 text-xs font-bold mb-1.5 block">Title *</label>
                          <input
                            value={form.title}
                            onChange={e => setForm({ ...form, title: e.target.value })}
                            required
                            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                            placeholder="Product title"
                          />
                        </div>
                        <div>
                          <label className="text-gray-700 text-xs font-bold mb-1.5 block">Brand</label>
                          <input
                            value={form.brand}
                            onChange={e => setForm({ ...form, brand: e.target.value })}
                            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                          />
                        </div>
                        <div>
                          <label className="text-gray-700 text-xs font-bold mb-1.5 block">Category *</label>
                          <select
                            value={form.category}
                            onChange={e => setForm({ ...form, category: e.target.value })}
                            required
                            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                          >
                            <option value="">Select Category</option>
                            {categories.map(c => (
                              <option key={c._id} value={c._id}>
                                {c.name} {c.gender ? `(${c.gender.toUpperCase()})` : ''}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-gray-700 text-xs font-bold mb-1.5 block">Gender</label>
                          <select
                            value={form.gender}
                            onChange={e => setForm({ ...form, gender: e.target.value })}
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
                          <div className="flex justify-between items-center mb-1.5">
                            <label className="text-gray-700 text-xs font-bold block">Price (₹) *</label>
                            {discountPercent > 0 && (
                              <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold border border-emerald-100">
                                {discountPercent}% Off Calculated
                              </span>
                            )}
                          </div>
                          <input
                            type="number"
                            value={form.price}
                            onChange={e => setForm({ ...form, price: e.target.value })}
                            required
                            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                            placeholder="999"
                            min="0"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-1.5">
                            <label className="text-gray-700 text-xs font-bold block">Discount Price (₹)</label>
                            {form.discountPrice && parseFloat(form.discountPrice) > parseFloat(form.price) && (
                              <span className="text-[10px] text-red-600 bg-red-50 px-2 py-0.5 rounded-full font-bold border border-red-100">
                                Error: Exceeds original price!
                              </span>
                            )}
                          </div>
                          <input
                            type="number"
                            value={form.discountPrice}
                            onChange={e => setForm({ ...form, discountPrice: e.target.value })}
                            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                            placeholder="699"
                            min="0"
                          />
                        </div>
                        <div>
                          <label className="text-gray-700 text-xs font-bold mb-1.5 block">
                            Stock * {sizesList.length > 0 && <span className="text-[10px] text-gray-400 font-normal">(Calculated from sizes)</span>}
                          </label>
                          <input
                            type="number"
                            value={form.stock}
                            onChange={e => setForm({ ...form, stock: e.target.value })}
                            required
                            disabled={sizesList.length > 0}
                            className={`w-full border rounded-lg px-4 py-2.5 text-sm ${sizesList.length > 0 ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed' : 'bg-white text-gray-900 border-gray-300 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500'}`}
                            placeholder="100"
                            min="0"
                          />
                        </div>
                        <div>
                          <label className="text-gray-700 text-xs font-bold mb-1.5 block">Material</label>
                          <input
                            value={form.material}
                            onChange={e => setForm({ ...form, material: e.target.value })}
                            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                            placeholder="100% Cotton"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-gray-700 text-xs font-bold mb-1.5 block">Description *</label>
                        <textarea
                          value={form.description}
                          onChange={e => setForm({ ...form, description: e.target.value })}
                          required
                          rows={3}
                          className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 resize-none"
                          placeholder="Product description..."
                        />
                      </div>

                      {/* Chip Tag Input */}
                      <div>
                        <label className="text-gray-700 text-xs font-bold mb-1.5 block">Tags</label>
                        <div className="w-full bg-white border border-gray-300 rounded-lg p-2 flex flex-wrap gap-2 items-center focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500 min-h-[44px]">
                          {tagsList.map((tag, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 bg-red-50 text-red-600 text-xs font-bold pl-2.5 pr-1.5 py-1 rounded-full border border-red-100 transition-all hover:bg-red-100"
                            >
                              {tag}
                              <button
                                type="button"
                                onClick={() => setTagsList(tagsList.filter((_, i) => i !== idx))}
                                className="text-red-400 hover:text-red-600 p-0.5 rounded-full hover:bg-white/80 transition-colors"
                              >
                                <FiX size={12} />
                              </button>
                            </span>
                          ))}
                          <input
                            value={tagInput}
                            onChange={e => setTagInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ',') {
                                e.preventDefault()
                                const cleanTag = tagInput.trim().replace(/,$/, '')
                                if (cleanTag && !tagsList.includes(cleanTag)) {
                                  setTagsList([...tagsList, cleanTag])
                                }
                                setTagInput('')
                              } else if (e.key === 'Backspace' && !tagInput && tagsList.length > 0) {
                                setTagsList(tagsList.slice(0, -1))
                              }
                            }}
                            placeholder={tagsList.length === 0 ? "casual, cotton, winter" : ""}
                            className="flex-1 bg-transparent border-0 focus:outline-none focus:ring-0 outline-none text-sm text-gray-900 min-w-[120px]"
                          />
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">Press Enter or comma to add. Backspace to delete last chip.</p>
                      </div>

                      {/* Product Gallery Images (On-the-fly uploads + URLs) */}
                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-4">
                        <div className="flex flex-col gap-1">
                          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex justify-between items-center" style={{ fontFamily: 'Outfit, sans-serif' }}>
                            <span>Product Gallery Images</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${imagesList.length >= 2 ? 'bg-red-100 text-red-600' : 'bg-gray-200 text-gray-600'}`}>
                              {imagesList.length}/2 Max
                            </span>
                          </h3>
                          <p className="text-xs text-gray-500 font-normal">Upload up to 2 photos or paste direct URLs. These are used for the main card display.</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {imagesList.length >= 2 ? (
                            <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center bg-gray-100/70 text-gray-400 flex flex-col justify-center items-center cursor-not-allowed">
                              <FiImage className="text-gray-300 mb-1" size={24} />
                              <p className="font-bold text-xs">Maximum 2 images reached</p>
                              <p className="text-[10px] text-gray-400 mt-0.5">Remove an image to upload a new one</p>
                            </div>
                          ) : (
                            <div
                              className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-red-500/50 bg-white transition-colors cursor-pointer flex flex-col justify-center items-center"
                              onClick={() => document.getElementById('productImages').click()}
                            >
                              <FiImage className="text-gray-400 mb-1" size={24} />
                              <p className="text-gray-700 font-bold text-xs">
                                {uploadingImages ? 'Uploading...' : 'Click to upload'}
                              </p>
                              <p className="text-[10px] text-gray-400 mt-0.5">JPEG, PNG, WebP — Max 5MB</p>
                              <input id="productImages" type="file" multiple accept="image/*" hidden disabled={uploadingImages}
                                onChange={e => handleProductImageUpload(Array.from(e.target.files))} />
                            </div>
                          )}

                          <div className="bg-white border border-gray-300 rounded-xl p-4 flex flex-col justify-between gap-2">
                            <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Paste External Image URL</label>
                            <textarea
                              value={imageUrlInput}
                              onChange={e => setImageUrlInput(e.target.value)}
                              disabled={imagesList.length >= 2}
                              className={`w-full border rounded-lg px-2.5 py-1.5 text-xs text-gray-900 resize-none flex-1 ${imagesList.length >= 2 ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white border-gray-200 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500'}`}
                              rows={2}
                              placeholder={imagesList.length >= 2 ? "Maximum 2 images reached" : "https://images.unsplash.com/photo-..."}
                            />
                            <button
                              type="button"
                              onClick={handleAddImageUrl}
                              disabled={imagesList.length >= 2 || !imageUrlInput.trim()}
                              className={`w-full text-white text-xs font-bold py-1.5 rounded-lg transition-colors shadow-sm ${imagesList.length >= 2 || !imageUrlInput.trim() ? 'bg-gray-300 cursor-not-allowed' : 'bg-gray-900 hover:bg-gray-800'}`}
                            >
                              Add URL
                            </button>
                          </div>
                        </div>

                        {imagesList.length === 0 ? (
                          <p className="text-gray-400 text-xs italic">No gallery images added yet. Upload or paste a URL above.</p>
                        ) : (
                          <div className="p-3 bg-white border border-gray-100 rounded-xl">
                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-2">
                              Images — hover to set default or remove
                            </p>
                            <div className="flex flex-wrap gap-2.5">
                              {imagesList.map((img, i) => img.url && (
                                <div
                                  key={i}
                                  onClick={() => {
                                    if (i !== 0) {
                                      const updated = [...imagesList]
                                      const [chosen] = updated.splice(i, 1)
                                      updated.unshift(chosen)
                                      setImagesList(updated)
                                    }
                                  }}
                                  className={`relative group w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all cursor-pointer ${i === 0
                                      ? 'border-red-500 ring-2 ring-red-200 cursor-default'
                                      : 'border-gray-200 hover:border-red-400'
                                    }`}
                                  title={i === 0 ? "Default product image" : "Click to set as default"}
                                >
                                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                                  {i === 0 ? (
                                    <span className="absolute top-1 left-1 bg-red-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded leading-none shadow-sm z-10">
                                      DEFAULT
                                    </span>
                                  ) : (
                                    <>
                                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                      <span className="absolute bottom-1 left-1 bg-white/90 text-gray-900 text-[7px] font-bold px-1.5 py-0.5 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 z-10 pointer-events-none">
                                        ⭐ Default
                                      </span>
                                    </>
                                  )}
                                  <button
                                    type="button"
                                    title="Remove this image"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setImagesList(imagesList.filter((_, j) => j !== i))
                                    }}
                                    className="absolute top-1 right-1 w-5 h-5 bg-white hover:bg-red-500 hover:text-white text-red-500 rounded-full flex items-center justify-center shadow transition-all duration-200 opacity-0 group-hover:opacity-100 z-20 border border-gray-100"
                                  >
                                    <FiX size={12} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Color Variant Management */}
                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-4">
                        <div className="flex flex-col gap-2 border-b border-gray-200 pb-3">
                          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider" style={{ fontFamily: 'Outfit, sans-serif' }}>Color Variants</h3>
                          <p className="text-xs text-gray-500">Click a preset swatch below to add a color variant instantly, or click custom color.</p>

                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            {PRESET_COLORS.map(c => {
                              const isAlreadyAdded = colorsList.some(item => item.name.toLowerCase() === c.name.toLowerCase())
                              return (
                                <button
                                  type="button"
                                  key={c.name}
                                  disabled={isAlreadyAdded}
                                  onClick={() => {
                                    const isFirst = colorsList.length === 0;
                                    setColorsList([...colorsList, { name: c.name, hex: c.hex, images: [], image: { url: '' }, isDefault: isFirst }])
                                  }}
                                  className={`w-7 h-7 rounded-full border hover:scale-110 transition-all flex items-center justify-center relative group ${isAlreadyAdded ? 'opacity-30 cursor-not-allowed border-transparent' : 'border-gray-300 hover:border-gray-500'
                                    }`}
                                  style={{ backgroundColor: c.hex }}
                                  title={isAlreadyAdded ? `${c.name} (Added)` : `Add ${c.name}`}
                                >
                                  <span className="absolute bottom-full mb-1 scale-0 group-hover:scale-100 bg-gray-900 text-white text-[9px] px-2 py-0.5 rounded pointer-events-none transition-all whitespace-nowrap z-20">{c.name}</span>
                                  {!isAlreadyAdded && <FiPlus size={10} className="text-white mix-blend-difference" />}
                                </button>
                              )
                            })}

                            <button
                              type="button"
                              onClick={() => {
                                const isFirst = colorsList.length === 0;
                                setColorsList([...colorsList, { name: '', hex: '#000000', images: [], image: { url: '' }, isDefault: isFirst }])
                              }}
                              className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-1.5 px-3 text-xs flex items-center gap-1.5 rounded-lg shadow-sm font-bold transition-all ml-2"
                            >
                              <FiPlus size={12} /> Custom Color
                            </button>
                          </div>
                        </div>

                        {colorsList.length === 0 ? (
                          <p className="text-gray-400 text-xs italic">No color variants added yet. Click above to add one.</p>
                        ) : (
                          <div className="space-y-3">
                            {colorsList.map((color, idx) => (
                              <div key={idx} className="flex flex-col md:flex-row md:items-center gap-3 p-3 bg-white rounded-xl border border-gray-200 relative group/row shadow-sm">
                                <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-3">
                                  <div>
                                    <label className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Color Name</label>
                                    <input
                                      value={color.name}
                                      onChange={(e) => {
                                        const updated = [...colorsList]
                                        updated[idx].name = e.target.value
                                        setColorsList(updated)
                                      }}
                                      required
                                      className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                                      placeholder="e.g. Grey"
                                    />
                                  </div>

                                  <div>
                                    <label className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Hex Code</label>
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="color"
                                        value={color.hex || '#000000'}
                                        onChange={(e) => {
                                          const updated = [...colorsList]
                                          updated[idx].hex = e.target.value
                                          setColorsList(updated)
                                        }}
                                        className="w-8 h-8 rounded-lg overflow-hidden cursor-pointer bg-transparent border border-gray-200 flex-shrink-0"
                                      />
                                      <input
                                        value={color.hex || '#000000'}
                                        onChange={(e) => {
                                          const updated = [...colorsList]
                                          updated[idx].hex = e.target.value
                                          setColorsList(updated)
                                        }}
                                        required
                                        className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 uppercase"
                                        placeholder="#000000"
                                      />
                                    </div>
                                  </div>

                                  <div className="flex flex-col">
                                    <label className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Default</label>
                                    <label className={`flex items-center gap-2 cursor-pointer mt-1 px-2.5 py-1.5 h-[38px] rounded-lg border transition-all ${
                                      color.isDefault
                                        ? 'bg-red-50/40 border-red-300 text-red-700'
                                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700'
                                    }`}>
                                      <input
                                        type="radio"
                                        name="defaultColorVariant"
                                        checked={!!color.isDefault}
                                        onChange={() => {
                                          const updated = colorsList.map((c, i) => ({
                                            ...c,
                                            isDefault: i === idx
                                          }))
                                          setColorsList(updated)
                                        }}
                                        className="accent-red-500 w-4 h-4 cursor-pointer"
                                      />
                                      <span className="text-xs font-bold">Set Default</span>
                                    </label>
                                  </div>

                                  <div className="col-span-2">
                                    <label className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Variant Images (paste URL or upload)</label>
                                    <div className="flex flex-col gap-2">
                                      <div className="flex gap-1.5 items-center">
                                        <input
                                          type="text"
                                          placeholder="Paste image URL and press Enter..."
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                              e.preventDefault();
                                              const url = e.target.value.trim();
                                              if (url) {
                                                const updated = [...colorsList];
                                                const currentImages = updated[idx].images || [];
                                                updated[idx].images = [...currentImages, { url, public_id: '' }];
                                                updated[idx].image = { url: updated[idx].images[0]?.url || '' };
                                                setColorsList(updated);
                                                e.target.value = '';
                                                toast.success('Image URL added!');
                                              }
                                            }
                                          }}
                                          className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => document.getElementById(`color-upload-${idx}`).click()}
                                          className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-1.5 px-3 rounded-lg flex-shrink-0 shadow-sm transition-all text-xs font-bold flex items-center gap-1.5"
                                          title="Upload local image"
                                        >
                                          <FiImage size={14} /> Upload
                                        </button>
                                        <input
                                          id={`color-upload-${idx}`}
                                          type="file"
                                          accept="image/*"
                                          multiple
                                          hidden
                                          onChange={async (e) => {
                                            const files = Array.from(e.target.files)
                                            if (files.length === 0) return

                                            const toastId = toast.loading('Uploading variant images...')
                                            try {
                                              const uploadedImages = []
                                              for (const file of files) {
                                                const fd = new FormData()
                                                fd.append('image', file)
                                                const { data } = await api.post('/products/upload-image', fd, {
                                                  headers: { 'Content-Type': 'multipart/form-data' }
                                                })
                                                if (data.success) {
                                                  uploadedImages.push({ url: data.url, public_id: data.public_id })
                                                }
                                              }

                                              const updated = [...colorsList]
                                              const currentImages = updated[idx].images || []
                                              updated[idx].images = [...currentImages, ...uploadedImages]
                                              updated[idx].image = { url: updated[idx].images[0]?.url || '' }
                                              setColorsList(updated)
                                              toast.success('Images uploaded successfully!', { id: toastId })
                                            } catch (err) {
                                              toast.error('Image upload failed', { id: toastId })
                                            }
                                          }}
                                        />
                                      </div>
                                      {/* Variant image thumbnails with set-default + remove */}
                                      {(color.images?.length > 0 || color.image?.url) && (
                                        <div className="mt-2 p-3 bg-gray-50 border border-gray-100 rounded-xl">
                                          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-2">
                                            Images — hover to set default or remove
                                          </p>
                                          <div className="flex flex-wrap gap-2">
                                            {(color.images?.length > 0
                                              ? color.images
                                              : color.image?.url ? [{ url: color.image.url }] : []
                                            ).map((img, i) => img.url && (
                                              <div
                                                key={i}
                                                onClick={() => {
                                                  if (i !== 0) {
                                                    const updated = [...colorsList]
                                                    const imgs = [...(updated[idx].images || [])]
                                                    const [chosen] = imgs.splice(i, 1)
                                                    imgs.unshift(chosen)
                                                    updated[idx].images = imgs
                                                    updated[idx].image = { url: imgs[0]?.url || '' }
                                                    setColorsList(updated)
                                                  }
                                                }}
                                                className={`relative group w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all cursor-pointer ${i === 0
                                                    ? 'border-red-500 ring-2 ring-red-200 cursor-default'
                                                    : 'border-gray-200 hover:border-red-400'
                                                  }`}
                                                title={i === 0 ? "Default variant image" : "Click to set as default"}
                                              >
                                                <img src={img.url} alt="" className="w-full h-full object-cover" />

                                                {/* Default badge on first image */}
                                                {i === 0 ? (
                                                  <span className="absolute top-1 left-1 bg-red-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded leading-none z-10 shadow-sm">
                                                    DEFAULT
                                                  </span>
                                                ) : (
                                                  <>
                                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                                    <span className="absolute bottom-1 left-1 bg-white/90 text-gray-900 text-[7px] font-bold px-1.5 py-0.5 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 z-10 pointer-events-none">
                                                      ⭐ Default
                                                    </span>
                                                  </>
                                                )}

                                                <button
                                                  type="button"
                                                  title="Remove this image"
                                                  onClick={(e) => {
                                                    e.stopPropagation()
                                                    const updated = [...colorsList]
                                                    const imgs = (updated[idx].images || []).filter((_, j) => j !== i)
                                                    updated[idx].images = imgs
                                                    updated[idx].image = { url: imgs[0]?.url || '' }
                                                    setColorsList(updated)
                                                  }}
                                                  className="absolute top-1 right-1 w-5 h-5 bg-white hover:bg-red-500 hover:text-white text-red-500 rounded-full flex items-center justify-center shadow transition-all duration-200 opacity-0 group-hover:opacity-100 z-20 border border-gray-100"
                                                >
                                                  <FiX size={12} />
                                                </button>
                                              </div>
                                            ))}
                                          </div>
                                          <p className="text-[9px] text-gray-400 mt-1.5">
                                            First image (red border) = shown first when this color is selected
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    const deletedColor = colorsList[idx];
                                    const updated = colorsList.filter((_, i) => i !== idx);
                                    if (deletedColor.isDefault && updated.length > 0) {
                                      updated[0].isDefault = true;
                                    }
                                    setColorsList(updated);
                                  }}
                                  className="md:relative absolute top-3 right-3 text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                                >
                                  <FiTrash2 size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Size Options Management */}
                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-4">
                        <div>
                          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>Select Sizes</h3>
                          <div className="flex flex-wrap gap-1.5">
                            {AVAILABLE_SIZES.map(sz => {
                              const activeItem = sizesList.find(s => s.size === sz)
                              const isActive = !!activeItem
                              return (
                                <button
                                  type="button"
                                  key={sz}
                                  onClick={() => {
                                    if (isActive) {
                                      setSizesList(sizesList.filter(s => s.size !== sz))
                                    } else {
                                      setSizesList([...sizesList, { size: sz, stock: 10 }])
                                    }
                                  }}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${isActive
                                    ? 'bg-red-500 text-white border-red-500 shadow-sm'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                  {sz}
                                </button>
                              )
                            })}
                          </div>
                        </div>

                        {sizesList.length === 0 ? (
                          <p className="text-gray-400 text-xs italic">No size variants selected. Click a size above to add it.</p>
                        ) : (
                          <div className="pt-2">
                            <label className="text-gray-700 text-xs font-bold mb-2 block">Configure Stock for Selected Sizes</label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              {sizesList.map((s) => (
                                <div key={s.size} className="p-3 bg-white rounded-lg border border-gray-200 flex items-center justify-between gap-2 shadow-sm">
                                  <span className="text-xs font-bold text-gray-800 bg-gray-100 px-2 py-1 rounded">{s.size}</span>
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <span className="text-[9px] text-gray-400 font-bold uppercase shrink-0">Stock</span>
                                    <input
                                      type="number"
                                      value={s.stock}
                                      onChange={(e) => {
                                        const updated = [...sizesList]
                                        const uIdx = updated.findIndex(u => u.size === s.size)
                                        if (uIdx !== -1) {
                                          updated[uIdx].stock = parseInt(e.target.value) || 0
                                          setSizesList(updated)
                                        }
                                      }}
                                      min="0"
                                      className="w-[50px] border border-gray-300 rounded px-1.5 py-1 text-xs text-center text-gray-900 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Toggles */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                        {[
                          ['Featured', 'isFeatured'],
                          ['Trending', 'isTrending'],
                          ['New Arrival', 'isNewArrival'],
                          ['Best Seller', 'isBestSeller'],
                        ].map(([label, key]) => (
                          <label key={key} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg p-3 cursor-pointer hover:bg-gray-100/50 transition-colors">
                            <input
                              type="checkbox"
                              checked={form[key]}
                              onChange={e => setForm({ ...form, [key]: e.target.checked })}
                              className="accent-red-500 w-4 h-4 rounded"
                            />
                            <span className="text-xs font-bold text-gray-700">{label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Right Pane: Storefront Preview */}
                    <div className="hidden lg:flex w-[380px] border-l border-gray-100 bg-gray-50/50 p-6 overflow-y-auto flex-col justify-start">
                      <div className="sticky top-0 space-y-4 w-full">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Storefront Preview</h3>
                          <span className="text-[10px] text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full border border-green-100 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Real-time
                          </span>
                        </div>

                        {/* Product Card Container */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg w-full">
                          {/* Image Gallery Preview */}
                          <div className="relative aspect-[3/4] bg-gray-100 group">
                            <img
                              src={previewImage || 'https://placehold.co/400x500?text=No+Image+Selected'}
                              alt={form.title || 'Product Title'}
                              className="w-full h-full object-cover transition-all duration-500"
                            />

                            {/* Badges Overlay */}
                            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                              {form.isFeatured && (
                                <span className="bg-red-500 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow-sm">
                                  Featured
                                </span>
                              )}
                              {form.isTrending && (
                                <span className="bg-orange-500 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow-sm">
                                  Trending
                                </span>
                              )}
                              {form.isNewArrival && (
                                <span className="bg-blue-600 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow-sm">
                                  New Arrival
                                </span>
                              )}
                              {form.isBestSeller && (
                                <span className="bg-amber-500 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow-sm">
                                  Bestseller
                                </span>
                              )}
                            </div>

                            {/* Wishlist Heart Icon Mock */}
                            <button type="button" className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm border border-gray-100 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors shadow-sm">
                              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                              </svg>
                            </button>

                            {/* Thumbnail Selector Overlay */}
                            {previewImages.length > 1 && (
                              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 px-3">
                                {previewImages.map((img, idx) => (
                                  <button
                                    type="button"
                                    key={idx}
                                    onClick={() => setPreviewActiveIdx(idx)}
                                    className={`w-2 h-2 rounded-full transition-all ${idx === previewActiveIdx ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/80'}`}
                                  />
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Card Info */}
                          <div className="p-4 space-y-2 text-left">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{form.brand || 'AURA'}</p>
                                <h4 className="text-sm font-bold text-gray-800 line-clamp-1 mt-0.5" style={{ fontFamily: 'Outfit, sans-serif' }}>
                                  {form.title || 'Product Title Placeholder'}
                                </h4>
                              </div>
                            </div>

                            {/* Price & Discount */}
                            <div className="flex items-baseline gap-2">
                              {discountPercent > 0 ? (
                                <>
                                  <span className="text-sm font-black text-red-500">₹{parseInt(form.discountPrice).toLocaleString()}</span>
                                  <span className="text-xs text-gray-400 line-through">₹{parseInt(form.price).toLocaleString()}</span>
                                  <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-150 px-1.5 py-0.5 rounded leading-none">
                                    {discountPercent}% OFF
                                  </span>
                                </>
                              ) : (
                                <span className="text-sm font-black text-gray-900">
                                  {form.price ? `₹${parseInt(form.price).toLocaleString()}` : '₹0'}
                                </span>
                              )}
                            </div>

                            {/* Render Color swatches inside preview */}
                            {colorsList.length > 0 && (
                              <div className="space-y-1">
                                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Colors</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {colorsList.map((col, idx) => (
                                    <button
                                      type="button"
                                      key={idx}
                                      onClick={() => {
                                        if (col.images?.[0]?.url || col.image?.url) {
                                          setPreviewColorOverride(col.images?.[0]?.url || col.image.url);
                                        } else {
                                          setPreviewColorOverride(null);
                                        }
                                      }}
                                      className="w-3.5 h-3.5 rounded-full border border-gray-300 flex-shrink-0 hover:scale-110 transition-transform"
                                      style={{ backgroundColor: col.hex }}
                                      title={col.name}
                                    />
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Render Selected Sizes inside preview */}
                            {sizesList.length > 0 && (
                              <div className="space-y-1">
                                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Sizes</p>
                                <div className="flex flex-wrap gap-1">
                                  {sizesList.map((sz, idx) => (
                                    <span
                                      key={idx}
                                      className="text-[9px] font-bold text-gray-600 bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded"
                                    >
                                      {sz.size} ({sz.stock})
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Material & Gender badges */}
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              <span className="text-[9px] font-black uppercase text-gray-500 bg-gray-100/80 px-2 py-0.5 rounded-full">
                                {form.gender}
                              </span>
                              {form.material && (
                                <span className="text-[9px] font-black uppercase text-gray-500 bg-gray-100/80 px-2 py-0.5 rounded-full truncate max-w-[120px]">
                                  {form.material}
                                </span>
                              )}
                            </div>

                            {/* Stock status indicator */}
                            <div className="pt-1 flex items-center justify-between text-[10px]">
                              <span className="text-gray-400">Total Stock: <b className="text-gray-700">{form.stock || 0}</b></span>
                              <span className={`font-bold ${form.stock > 10 ? 'text-green-600' : form.stock > 0 ? 'text-yellow-600' : 'text-red-500'}`}>
                                {form.stock > 10 ? '● In Stock' : form.stock > 0 ? '● Low Stock' : '● Out of Stock'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="flex justify-end gap-3 p-5 bg-white border-t border-gray-100 z-10">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-2.5 px-5 rounded-lg text-sm transition-colors shadow-sm"
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 px-5 rounded-lg text-sm transition-colors shadow-sm flex items-center justify-center gap-2"
                    >
                      {submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                      {editProduct ? 'Update Product' : 'Create Product'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {productToDelete && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm -z-10"
                onClick={() => setProductToDelete(null)}
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
                  <h3 className="text-lg font-black text-gray-950" style={{ fontFamily: 'Outfit, sans-serif' }}>Delete Product</h3>
                  <p className="text-gray-500 text-sm mt-2">
                    Are you sure you want to delete <span className="font-bold text-gray-900">"{productToDelete.title}"</span>?
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setProductToDelete(null)}
                    type="button"
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 px-4 rounded-xl text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      const id = productToDelete._id;
                      setProductToDelete(null);
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
