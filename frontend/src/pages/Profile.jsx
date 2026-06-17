import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiUser, FiMail, FiPhone, FiEdit2, FiLock, FiSave, FiSettings, FiChevronRight, FiHome, FiPlus, FiTrash2, FiX, FiCheck } from 'react-icons/fi'
import { getProfile, updateProfile, changePassword, addAddress, updateAddress, deleteAddress } from '../redux/slices/authSlice'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const dispatch = useDispatch()
  const { user, loading } = useSelector((s) => s.auth)

  const [editMode, setEditMode] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', gender: '' })
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmNew: '' })
  const [pwError, setPwError] = useState('')

  // Address book states
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [editAddressId, setEditAddressId] = useState(null)
  const [addrForm, setAddrForm] = useState({
    name: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
  })


  useEffect(() => {
    if (user) setForm({ name: user.name, phone: user.phone || '', gender: user.gender || '' })
  }, [user])

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    await dispatch(updateProfile(form))
    setEditMode(false)
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (pwForm.newPassword !== pwForm.confirmNew) {
      setPwError('Passwords do not match')
      return
    }
    setPwError('')
    await dispatch(changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }))
    setPwForm({ currentPassword: '', newPassword: '', confirmNew: '' })
  }

  // Address book handlers
  const handleAddressSubmit = async (e) => {
    e.preventDefault()

    if (!addrForm.name || !addrForm.phone || !addrForm.addressLine1 || !addrForm.city || !addrForm.state || !addrForm.pincode) {
      toast.error('Please fill all required fields')
      return
    }

    if (!/^[6-9]\d{9}$/.test(addrForm.phone)) {
      toast.error('Invalid phone number (must be 10 digits)')
      return
    }

    if (!/^\d{6}$/.test(addrForm.pincode)) {
      toast.error('Invalid pincode (must be 6 digits)')
      return
    }

    try {
      if (editAddressId) {
        await dispatch(updateAddress({ id: editAddressId, address: addrForm }))
      } else {
        await dispatch(addAddress(addrForm))
      }
      setShowAddressForm(false)
      setEditAddressId(null)
      setAddrForm({ name: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '' })
    } catch (err) {
      toast.error('Failed to save address')
    }
  }

  const handleEditAddress = (addr) => {
    setEditAddressId(addr._id)
    setAddrForm({
      name: addr.name,
      phone: addr.phone,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2 || '',
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
    })
    setShowAddressForm(true)
  }

  const handleDeleteAddress = async (id) => {
    if (!confirm('Are you sure you want to delete this address?')) return
    await dispatch(deleteAddress(id))
  }

  return (
    <div className="min-h-screen pt-[73px] bg-dark-950">
      <div className="container-custom py-8 max-w-3xl">
        <h1 className="text-3xl font-display font-bold text-white mb-8">My Profile</h1>

        {/* Avatar & Basic Info */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5 mb-6">
            <div className="w-20 h-20 rounded-2xl bg-primary-500/20 border-2 border-primary-500/40 flex items-center justify-center flex-shrink-0">
              {user?.avatar?.url ? (
                <img src={user.avatar.url} alt={user.name} className="w-full h-full rounded-2xl object-cover" />
              ) : (
                <span className="text-primary-400 font-bold text-3xl">{user?.name?.[0]?.toUpperCase()}</span>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white">{user?.name}</h2>
              <p className="text-dark-400 text-sm">{user?.email}</p>
              <span className={`badge mt-2 ${user?.role === 'admin' ? 'badge-primary' : 'badge-success'}`}>
                {user?.role}
              </span>
            </div>
            <button
              onClick={() => setEditMode(!editMode)}
              className="sm:ml-auto w-full sm:w-auto btn-secondary btn-sm flex justify-center items-center gap-2"
            >
              <FiEdit2 size={14} /> {editMode ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {editMode ? (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Full Name</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="input-label">Phone</label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="input"
                    placeholder="9876543210"
                  />
                </div>
                <div>
                  <label className="input-label">Gender</label>
                  <select
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    className="input"
                  >
                    <option value="">Prefer not to say</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
                <FiSave size={16} /> Save Changes
              </button>
            </form>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: FiUser, label: 'Name', val: user?.name },
                { icon: FiMail, label: 'Email', val: user?.email },
                { icon: FiPhone, label: 'Phone', val: user?.phone || 'Not set' },
                { icon: FiUser, label: 'Gender', val: user?.gender || 'Not set' },
              ].map(({ icon: Icon, label, val }) => (
                <div key={label} className="bg-dark-800/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-dark-400 text-xs mb-1">
                    <Icon size={13} /> {label}
                  </div>
                  <p className="text-white text-sm font-medium capitalize">{val}</p>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Address Book Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="card p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-6 pb-2 border-b border-white/5">
            <h3 className="text-white font-bold text-lg flex items-center gap-2">
              <FiHome className="text-primary-400" /> Saved Delivery Addresses
            </h3>
            {!showAddressForm && (
              <button
                onClick={() => {
                  setEditAddressId(null)
                  setAddrForm({ name: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '' })
                  setShowAddressForm(true)
                }}
                className="btn-primary btn-sm flex items-center gap-1.5 font-bold uppercase tracking-wider text-xs"
              >
                <FiPlus size={14} /> Add New
              </button>
            )}
          </div>

          {/* Address Form */}
          {showAddressForm && (
            <form onSubmit={handleAddressSubmit} className="mb-6 p-5 border border-white/5 bg-white/2 rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <h4 className="text-white font-bold text-sm uppercase tracking-wider">
                  {editAddressId ? 'Edit Address' : 'Add New Address'}
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddressForm(false)
                    setEditAddressId(null)
                  }}
                  className="text-dark-400 hover:text-white transition-colors"
                >
                  <FiX size={18} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="input-label text-xs">Full Name *</label>
                  <input
                    value={addrForm.name}
                    onChange={(e) => setAddrForm({ ...addrForm, name: e.target.value })}
                    className="input py-2.5 text-sm"
                    placeholder="e.g. John Doe"
                    required
                  />
                </div>
                <div>
                  <label className="input-label text-xs">Phone Number *</label>
                  <input
                    value={addrForm.phone}
                    onChange={(e) => setAddrForm({ ...addrForm, phone: e.target.value.replace(/[^0-9]/g, '') })}
                    maxLength={10}
                    className="input py-2.5 text-sm"
                    placeholder="10-digit mobile number"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="input-label text-xs">Address Line 1 (Flat, House no., Area) *</label>
                <input
                  value={addrForm.addressLine1}
                  onChange={(e) => setAddrForm({ ...addrForm, addressLine1: e.target.value })}
                  className="input py-2.5 text-sm"
                  placeholder="Street Address"
                  required
                />
              </div>

              <div>
                <label className="input-label text-xs">Address Line 2 (Landmark, Optional)</label>
                <input
                  value={addrForm.addressLine2}
                  onChange={(e) => setAddrForm({ ...addrForm, addressLine2: e.target.value })}
                  className="input py-2.5 text-sm"
                  placeholder="Near landmark, building, etc."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="input-label text-xs">City *</label>
                  <input
                    value={addrForm.city}
                    onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })}
                    className="input py-2.5 text-sm"
                    placeholder="City"
                    required
                  />
                </div>
                <div>
                  <label className="input-label text-xs">State *</label>
                  <input
                    value={addrForm.state}
                    onChange={(e) => setAddrForm({ ...addrForm, state: e.target.value })}
                    className="input py-2.5 text-sm"
                    placeholder="State"
                    required
                  />
                </div>
                <div>
                  <label className="input-label text-xs">Pincode *</label>
                  <input
                    value={addrForm.pincode}
                    onChange={(e) => setAddrForm({ ...addrForm, pincode: e.target.value.replace(/[^0-9]/g, '') })}
                    className="input py-2.5 text-sm"
                    placeholder="6-digit PIN"
                    maxLength={6}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 btn-primary py-3 flex items-center justify-center gap-2 text-xs uppercase tracking-wider">
                  <FiSave size={15} /> {editAddressId ? 'Save Changes' : 'Add Address'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddressForm(false)
                    setEditAddressId(null)
                  }}
                  className="btn-secondary py-3 text-xs uppercase tracking-wider px-5"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Address Cards List */}
          {user?.addresses?.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {user.addresses.map((addr) => (
                <div
                  key={addr._id}
                  className="border border-white/5 bg-white/2 rounded-2xl p-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-white font-bold text-sm truncate max-w-[150px]">{addr.name}</p>
                      <span className="text-[10px] text-dark-500 font-mono">Address ID: {addr._id?.substring(18)}</span>
                    </div>
                    <p className="text-dark-300 text-xs leading-relaxed">
                      {addr.addressLine1}
                      {addr.addressLine2 && `, ${addr.addressLine2}`}
                      <br />
                      {addr.city}, {addr.state} - <span className="text-white font-medium">{addr.pincode}</span>
                    </p>
                    <p className="text-dark-400 text-[10px] mt-2 font-semibold">📞 {addr.phone}</p>
                  </div>

                  <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-white/5">
                    <button
                      onClick={() => handleEditAddress(addr)}
                      className="p-1.5 text-dark-400 hover:text-primary-400 hover:bg-primary-500/10 rounded-lg transition-colors"
                      title="Edit Address"
                    >
                      <FiEdit2 size={13} />
                    </button>
                    <button
                      onClick={() => handleDeleteAddress(addr._id)}
                      className="p-1.5 text-dark-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Delete Address"
                    >
                      <FiTrash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border border-dashed border-white/10 rounded-2xl">
              <p className="text-dark-400 text-sm">No saved delivery addresses found.</p>
              <button
                onClick={() => {
                  setEditAddressId(null)
                  setAddrForm({ name: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '' })
                  setShowAddressForm(true)
                }}
                className="mt-3 text-primary-400 hover:text-primary-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 mx-auto"
              >
                <FiPlus size={14} /> Add First Address
              </button>
            </div>
          )}
        </motion.div>

        {/* Settings Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.05 }} 
          className="card p-6 mb-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                <FiSettings className="text-primary-400" /> Account Preferences & Theme
              </h3>
              <p className="text-dark-400 text-xs mt-1">
                Customize store theme (Light / Dark Mode), choose currencies, adjust notification subscriptions, and manage privacy profiles.
              </p>
            </div>
            <Link 
              to="/settings" 
              className="btn-secondary btn-sm flex items-center justify-center gap-2 shrink-0"
            >
              Open Settings <FiChevronRight size={14} />
            </Link>
          </div>
        </motion.div>

        {/* Change Password */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-6">
          <h3 className="text-white font-bold text-lg flex items-center gap-2 mb-6">
            <FiLock className="text-primary-400" /> Change Password
          </h3>
          <form onSubmit={handleChangePassword} className="space-y-4 max-w-sm">
            {['currentPassword', 'newPassword', 'confirmNew'].map((field) => (
              <div key={field}>
                <label className="input-label">
                  {field === 'currentPassword' ? 'Current Password' : field === 'newPassword' ? 'New Password' : 'Confirm New Password'}
                </label>
                <input
                  type="password"
                  value={pwForm[field]}
                  onChange={(e) => setPwForm({ ...pwForm, [field]: e.target.value })}
                  className="input"
                  placeholder="••••••••"
                  required
                />
              </div>
            ))}
            {pwError && <p className="text-red-400 text-sm">{pwError}</p>}
            <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
              <FiLock size={16} /> Update Password
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
