import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiPhone, FiArrowRight } from 'react-icons/fi'
import { registerUser, clearError } from '../redux/slices/authSlice'

export default function RegisterPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, loading, error } = useSelector((s) => s.auth)
  const [showPassword, setShowPassword] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const password = watch('password')

  useEffect(() => {
    if (user) navigate('/')
    return () => { dispatch(clearError()) }
  }, [user, navigate, dispatch])

  const onSubmit = (data) => {
    const { confirmPassword, ...userData } = data
    dispatch(registerUser(userData))
  }

  return (
    <div className="min-h-[calc(100vh-92px)] bg-white flex flex-col lg:flex-row w-full font-sans">
      {/* Left Panel - Streetwear Hero Image & Branding (Desktop only) */}
      <div
        className="w-[55%] hidden lg:flex relative flex-col justify-between p-12 text-white bg-cover bg-top select-none"
        style={{
          backgroundImage: `url('/streetwear_bg.jpg?v=10')`
        }}
      >
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/50 z-0" />

        {/* Spacer at the top (logo is removed) */}
        <div className="h-12 z-10" />

        {/* Center Section - Tagline & Headlines (Shifted upwards) */}
        <div className="z-10 max-w-lg mt-[8%] mb-auto">
          <span className="text-xs font-semibold tracking-[0.25em] text-white uppercase">
            New Arrivals
          </span>
          <div className="w-12 h-[2px] bg-[#e11b23] mt-2 mb-6" />
          <h1 className="text-5xl font-black tracking-tight leading-[1.1] uppercase text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Discover <br />
            Your <br />
            <span className="text-[#e11b23]">Style</span>
          </h1>
          <p className="text-gray-300 text-sm mt-6 leading-relaxed font-medium">
            Premium quality. Latest trends. Designed for you.
          </p>
        </div>
      </div>

      {/* Right Panel - Register Form */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center items-center px-4 py-8 md:px-8 bg-white relative">
        <div className="w-full max-w-[440px] border border-gray-200 rounded-[28px] p-6 md:p-8 bg-white shadow-sm">
          
          {/* Header */}
          <div className="mb-4">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Create Account
            </h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Full Name</label>
              <div className="relative group">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={16} />
                <input
                  {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Name too short' } })}
                  placeholder="John Doe"
                  className="w-full bg-white border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none hover:border-gray-300 focus:border-black focus:ring-4 focus:ring-black/5 transition-all font-medium"
                />
              </div>
              {errors.name && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.name.message}</p>}
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Email Address</label>
              <div className="relative group">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={16} />
                <input
                  {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' } })}
                  type="email"
                  placeholder="Enter your email address"
                  className="w-full bg-white border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none hover:border-gray-300 focus:border-black focus:ring-4 focus:ring-black/5 transition-all font-medium"
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.email.message}</p>}
            </div>

            {/* Phone (Optional) */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Phone Number (Optional)</label>
              <div className="relative group">
                <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={16} />
                <input
                  {...register('phone', { pattern: { value: /^[6-9]\d{9}$/, message: 'Invalid phone number (10 digits starting 6-9)' } })}
                  onInput={(e) => {
                    e.target.value = e.target.value.replace(/[^0-9]/g, '');
                  }}
                  maxLength={10}
                  placeholder="9876543210"
                  className="w-full bg-white border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none hover:border-gray-300 focus:border-black focus:ring-4 focus:ring-black/5 transition-all font-medium"
                />
              </div>
              {errors.phone && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.phone.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Password</label>
              <div className="relative group">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={16} />
                <input
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' },
                  })}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className="w-full bg-white border border-gray-200 rounded-xl pl-11 pr-11 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none hover:border-gray-300 focus:border-black focus:ring-4 focus:ring-black/5 transition-all font-medium"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors">
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Confirm Password</label>
              <div className="relative group">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={16} />
                <input
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (val) => val === password || 'Passwords do not match',
                  })}
                  type="password"
                  placeholder="Confirm your password"
                  className="w-full bg-white border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none hover:border-gray-300 focus:border-black focus:ring-4 focus:ring-black/5 transition-all font-medium"
                />
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.confirmPassword.message}</p>}
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-50 border border-red-100 rounded-xl p-2.5"
              >
                <p className="text-red-655 text-xs font-semibold">{error}</p>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#e11b23] hover:bg-[#c1131a] text-white font-extrabold text-xs uppercase tracking-widest py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-[0.98] mt-4"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'CREATE ACCOUNT'
              )}
            </button>
          </form>

          <p className="text-center text-xs text-gray-500 mt-5">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-[#e11b23] hover:text-[#c1131a] font-bold transition-colors ml-1 hover:underline"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              SIGN IN
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
