import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiSearch, FiTrash2, FiUser, FiShield, FiX, FiCheckCircle } from 'react-icons/fi'
import AdminSidebar from '../../components/admin/AdminSidebar'
import api from '../../services/api'
import toast from 'react-hot-toast'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [editUser, setEditUser] = useState(null)
  const [newRole, setNewRole] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [page])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/users', {
        params: { page, limit: 15, search }
      })
      setUsers(data.users)
      setTotal(data.total)
    } catch (e) {
      toast.error('Failed to load users')
    }
    setLoading(false)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    fetchUsers()
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this user?')) return
    try {
      await api.delete(`/admin/users/${id}`)
      toast.success('User deleted successfully')
      fetchUsers()
    } catch (err) {
      toast.error('Failed to delete user')
    }
  }

  const openRoleUpdate = (user) => {
    setEditUser(user)
    setNewRole(user.role)
    setShowRoleModal(true)
  }

  const handleUpdateRole = async (e) => {
    e.preventDefault()
    try {
      await api.put(`/admin/users/${editUser._id}`, { role: newRole })
      toast.success('User role updated')
      setShowRoleModal(false)
      fetchUsers()
    } catch (err) {
      toast.error('Failed to update role')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      
      <main className="flex-1 min-w-0 p-4 md:p-8 space-y-6 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>Users</h1>
            <p className="text-gray-500 text-sm mt-0.5">{total} total registered users</p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <form onSubmit={handleSearch} className="relative">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by user name or email..."
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
                  <th className="px-6 py-4 text-gray-500 text-[10px] font-bold uppercase tracking-widest">User</th>
                  <th className="px-6 py-4 text-gray-500 text-[10px] font-bold uppercase tracking-widest">Email</th>
                  <th className="px-6 py-4 text-gray-500 text-[10px] font-bold uppercase tracking-widest">Role</th>
                  <th className="px-6 py-4 text-gray-500 text-[10px] font-bold uppercase tracking-widest">Joined Date</th>
                  <th className="px-6 py-4 text-gray-500 text-[10px] font-bold uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-4 bg-gray-100 rounded animate-pulse w-2/3" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 text-sm">
                      No users found.
                    </td>
                  </tr>
                ) : users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center font-black border border-red-100">
                          {user.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <span className="text-gray-900 font-bold text-sm">{user.name || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                        user.role === 'admin' 
                          ? 'bg-red-50 text-red-700 border border-red-150' 
                          : 'bg-green-50 text-green-700 border border-green-150'
                      }`}>
                        {user.role === 'admin' ? <FiShield size={12} /> : <FiUser size={12} />}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {new Date(user.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => openRoleUpdate(user)} 
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Change Role"
                        >
                          <FiShield size={15} />
                        </button>
                        <button 
                          onClick={() => handleDelete(user._id)} 
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete User"
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

        {/* Role Modal */}
        <AnimatePresence>
          {showRoleModal && editUser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm -z-10"
                onClick={() => setShowRoleModal(false)}
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.98 }}
                className="w-full max-w-sm bg-white rounded-2xl overflow-hidden shadow-2xl my-auto border border-gray-150"
              >
                <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white">
                  <h2 className="text-xl font-black text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>Update User Role</h2>
                  <button 
                    onClick={() => setShowRoleModal(false)} 
                    className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-50 transition-colors"
                  >
                    <FiX size={20} />
                  </button>
                </div>

                <form onSubmit={handleUpdateRole} className="p-6 space-y-4">
                  <p className="text-gray-600 text-sm">
                    Change role for <span className="text-gray-900 font-bold">{editUser.email}</span>
                  </p>
                  
                  <div>
                    <label className="text-gray-700 text-xs font-bold mb-1.5 block">Select New Role</label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 font-bold"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <button 
                    type="submit" 
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors"
                  >
                    <FiCheckCircle size={16} /> Save Role
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
