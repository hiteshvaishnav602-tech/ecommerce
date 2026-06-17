import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiShield, FiUser, FiTruck, FiAward, FiHeadphones } from 'react-icons/fi'
import { loginUser, clearError, googleLogin } from '../redux/slices/authSlice'

export default function LoginPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, loading, error } = useSelector((s) => s.auth)
  const [showPassword, setShowPassword] = useState(false)

  const { register, handleSubmit, setValue, formState: { errors } } = useForm()

  useEffect(() => {
    if (user) navigate('/')
    return () => { dispatch(clearError()) }
  }, [user, navigate, dispatch])

  const onSubmit = (data) => dispatch(loginUser(data))

  const handleQuickFill = (email, password) => {
    setValue('email', email, { shouldValidate: true })
    setValue('password', password, { shouldValidate: true })
  }

  const handleGoogleLogin = () => {
    if (!window.google) {
      toast.error('Google Sign-In is still loading. Please try again in a second.')
      return
    }
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '1043534568600-u22e84v1s5o3j3m86v7l7e2qg94vsd0u.apps.googleusercontent.com'
    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'email profile openid',
        callback: async (tokenResponse) => {
          if (tokenResponse && tokenResponse.access_token) {
            dispatch(googleLogin(tokenResponse.access_token))
          } else {
            toast.error('Google sign-in was cancelled')
          }
        },
      })
      client.requestAccessToken({ prompt: 'select_account' })
    } catch (err) {
      console.error(err)
      toast.error('Failed to initialize Google Login')
    }
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

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center items-center px-4 py-8 md:px-8 bg-white relative">
        <div className="w-full max-w-[440px] border border-gray-200 rounded-[28px] p-6 md:p-8 bg-white shadow-sm">

          {/* Header */}
          <div className="mb-4">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Welcome Back 👋
            </h2>
            <p className="text-gray-500 text-sm mt-1.5 font-medium">
              Sign in to access your curated collection and exclusive drops.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Email Address</label>
              <div className="relative group">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={16} />
                <input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' }
                  })}
                  type="email"
                  placeholder="Enter your email address"
                  className="w-full bg-white border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none hover:border-gray-300 focus:border-black focus:ring-4 focus:ring-black/5 transition-all font-medium"
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Password</label>
              <div className="relative group">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={16} />
                <input
                  {...register('password', { required: 'Password is required' })}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className="w-full bg-white border border-gray-200 rounded-xl pl-11 pr-11 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none hover:border-gray-300 focus:border-black focus:ring-4 focus:ring-black/5 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.password.message}</p>}
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-50 border border-red-100 rounded-xl p-2.5"
              >
                <p className="text-red-655 text-xs font-semibold">{error}</p>
              </motion.div>
            )}

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black accent-black"
                />
                <span className="text-xs font-semibold text-gray-700">Remember Me</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#e11b23] hover:bg-[#c1131a] text-white font-extrabold text-xs uppercase tracking-widest py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-[0.98] mt-4"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'SIGN IN'
              )}
            </button>
          </form>

          {/* Or Continue With Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-4 text-gray-400 font-medium">or continue with</span>
            </div>
          </div>

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 text-gray-700 font-semibold text-xs py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2.5 shadow-sm active:scale-[0.98]"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          {/* Footer Text */}
          <p className="text-center text-xs text-gray-500 mt-5">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-[#e11b23] hover:text-[#c1131a] font-bold transition-colors ml-1 hover:underline"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              Create Account
            </Link>
          </p>

          {/* Compact Quick Demo Access Panel */}
          <div className="flex items-center justify-center gap-2 mt-5 py-1.5 px-3 bg-gray-50 border border-gray-100 rounded-xl">
            <span className="text-gray-400 font-extrabold uppercase tracking-widest text-[9px] flex items-center gap-1">
              <FiShield className="text-[#147e85]" /> DEMO:
            </span>
            <button
              type="button"
              onClick={() => handleQuickFill('admin@chawk.com', 'Admin@123456')}
              className="px-2 py-0.5 bg-white border border-gray-200 hover:border-black rounded-lg font-extrabold text-gray-700 hover:text-black text-[9px] uppercase tracking-wider transition-all shadow-sm"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('customer@chawk.com', 'User@123456')}
              className="px-2 py-0.5 bg-white border border-gray-200 hover:border-black rounded-lg font-extrabold text-gray-700 hover:text-black text-[9px] uppercase tracking-wider transition-all shadow-sm"
            >
              User
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
