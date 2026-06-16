import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  FiMoon, FiSun, FiMonitor, FiBell, FiGlobe, FiDatabase,
  FiCheck, FiChevronRight, FiShield, FiHelpCircle, FiRotateCcw
} from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  // 1. Theme state (Appearance)
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark')

  // 2. Notification states
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('settings_notifications')
    return saved ? JSON.parse(saved) : { orderUpdates: true, promotions: false, weeklyNewsletter: true, smsAlerts: true }
  })

  // 3. Localization states
  const [locale, setLocale] = useState(() => {
    const saved = localStorage.getItem('settings_locale')
    return saved ? JSON.parse(saved) : { currency: 'INR', language: 'English' }
  })

  // 4. Advanced/Security states
  const [advanced, setAdvanced] = useState(() => {
    const saved = localStorage.getItem('settings_advanced')
    return saved ? JSON.parse(saved) : { clearOnLogout: true, rememberSession: true, twoFactorMock: false }
  })

  // Effect to apply theme dynamically
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
      root.classList.remove('light')
    } else if (theme === 'light') {
      root.classList.add('light')
      root.classList.remove('dark')
    } else {
      // System default
      const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (isSystemDark) {
        root.classList.add('dark')
        root.classList.remove('light')
      } else {
        root.classList.add('light')
        root.classList.remove('dark')
      }
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  // Persist states to local storage
  const handleToggleNotification = (key) => {
    const updated = { ...notifications, [key]: !notifications[key] }
    setNotifications(updated)
    localStorage.setItem('settings_notifications', JSON.stringify(updated))
    toast.success('Notification preferences updated!')
  }

  const handleLocaleChange = (key, value) => {
    const updated = { ...locale, [key]: value }
    setLocale(updated)
    localStorage.setItem('settings_locale', JSON.stringify(updated))
    toast.success(`Preferred ${key} set to ${value}!`)

    // Trigger dynamic reload of currency throughout the store if updated
    if (key === 'currency') {
      window.dispatchEvent(new Event('currencyChange'))
    }
  }

  const handleToggleAdvanced = (key) => {
    const updated = { ...advanced, [key]: !advanced[key] }
    setAdvanced(updated)
    localStorage.setItem('settings_advanced', JSON.stringify(updated))
    toast.success('Advanced setting updated!')
  }

  const handleResetSettings = () => {
    if (!confirm('Are you sure you want to reset all preferences to default?')) return
    setTheme('dark')
    setNotifications({ orderUpdates: true, promotions: false, weeklyNewsletter: true, smsAlerts: true })
    setLocale({ currency: 'INR', language: 'English' })
    setAdvanced({ clearOnLogout: true, rememberSession: true, twoFactorMock: false })

    localStorage.removeItem('theme')
    localStorage.removeItem('settings_notifications')
    localStorage.removeItem('settings_locale')
    localStorage.removeItem('settings_advanced')
    toast.success('All settings reset to default! 🔄')
  }

  return (
    <div className="min-h-screen pt-[73px] bg-dark-950 dark:bg-dark-950 light:bg-slate-50 transition-colors duration-300">
      <div className="container-custom py-12 max-w-4xl">
        {/* Title Section */}
        <div className="mb-10 text-left">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-white dark:text-white light:text-slate-900 transition-colors">
            Account Settings
          </h1>
          <p className="text-dark-400 dark:text-dark-400 light:text-slate-500 text-sm mt-1">
            Manage your store appearance, privacy, and account choices.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left: Quick Nav Sidebar */}
          <div className="md:col-span-4 space-y-2">
            {[
              { label: 'Appearance', icon: FiMonitor, active: true },
              { label: 'Notifications', icon: FiBell },
              { label: 'Localization', icon: FiGlobe },
              { label: 'Privacy & Security', icon: FiShield },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between p-3.5 rounded-xl cursor-pointer hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-slate-200/50 text-dark-300 dark:text-dark-300 light:text-slate-600 font-medium transition-all group"
              >
                <div className="flex items-center gap-3">
                  <item.icon size={18} className="text-primary-500 group-hover:scale-110 transition-transform" />
                  <span>{item.label}</span>
                </div>
                <FiChevronRight size={14} className="text-dark-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>

          {/* Right: Actual Settings Panel */}
          <div className="md:col-span-8 space-y-6">

            {/* 1. APPEARANCE SETTINGS */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="card p-6 border-white/10 dark:border-white/10 light:border-slate-200 shadow-md">
              <h3 className="text-white dark:text-white light:text-slate-900 font-bold text-lg mb-4 flex items-center gap-2">
                <FiMonitor className="text-primary-400" /> Store Theme
              </h3>
              <p className="text-dark-400 dark:text-dark-400 light:text-slate-500 text-xs mb-6">
                Customize how the platform looks. Choose between light, dark, or sync with your system theme.
              </p>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'light', label: 'Light', icon: FiSun },
                  { value: 'dark', label: 'Dark', icon: FiMoon },
                  { value: 'system', label: 'System', icon: FiMonitor },
                ].map((opt) => {
                  const isActive = theme === opt.value
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setTheme(opt.value)}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-300 gap-2 ${isActive
                        ? 'border-primary-500 bg-primary-500/10 text-primary-400 shadow-glow'
                        : 'border-white/10 dark:border-white/10 light:border-slate-200 bg-white/5 dark:bg-white/5 light:bg-slate-100 hover:border-white/20 text-dark-300'
                        }`}
                    >
                      <opt.icon size={20} className={isActive ? 'text-primary-400' : 'text-dark-400'} />
                      <span className="text-xs font-semibold">{opt.label}</span>
                      {isActive && (
                        <div className="w-4 h-4 bg-primary-500 rounded-full flex items-center justify-center text-dark-950 mt-1">
                          <FiCheck size={10} />
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </motion.div>

            {/* 2. NOTIFICATION SETTINGS */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card p-6 border-white/10 dark:border-white/10 light:border-slate-200 shadow-md">
              <h3 className="text-white dark:text-white light:text-slate-900 font-bold text-lg mb-4 flex items-center gap-2">
                <FiBell className="text-primary-400" /> Notifications
              </h3>
              <p className="text-dark-400 dark:text-dark-400 light:text-slate-500 text-xs mb-6">
                Decide what alerts and weekly updates you want to receive on your devices.
              </p>

              <div className="space-y-4">
                {[
                  { key: 'orderUpdates', label: 'Order Status Alerts', desc: 'Get updates on your shipping, deliveries, and payment status.' },
                  { key: 'promotions', label: 'Promotional Emails', desc: 'Receive exclusive coupons, sales access, and weekend campaigns.' },
                  { key: 'weeklyNewsletter', label: 'Weekly Fashion Newsletters', desc: 'Get weekly tips and curation collections.' },
                  { key: 'smsAlerts', label: 'SMS Shipping Alerts', desc: 'Instant text updates directly to your phone.' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between pb-3.5 border-b border-white/5 last:border-b-0 last:pb-0">
                    <div className="max-w-[80%]">
                      <p className="text-white dark:text-white light:text-slate-900 text-sm font-semibold">{item.label}</p>
                      <p className="text-dark-400 dark:text-dark-400 light:text-slate-500 text-xs mt-0.5">{item.desc}</p>
                    </div>
                    {/* Toggle Switch */}
                    <button
                      onClick={() => handleToggleNotification(item.key)}
                      className={`w-11 h-6 rounded-full p-0.5 transition-colors flex items-center ${notifications[item.key] ? 'bg-primary-500 justify-end' : 'bg-white/10 justify-start'}`}
                    >
                      <span className="w-5 h-5 rounded-full bg-white shadow-md block" />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* 3. REGION & LOCALIZATION */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-6 border-white/10 dark:border-white/10 light:border-slate-200 shadow-md">
              <h3 className="text-white dark:text-white light:text-slate-900 font-bold text-lg mb-4 flex items-center gap-2">
                <FiGlobe className="text-primary-400" /> Region & Localization
              </h3>
              <p className="text-dark-400 dark:text-dark-400 light:text-slate-500 text-xs mb-6">
                Configure your default display currency and preferred viewing language.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Preferred Currency</label>
                  <select
                    value={locale.currency}
                    onChange={(e) => handleLocaleChange('currency', e.target.value)}
                    className="input"
                  >
                    <option value="INR">INR (₹) - Indian Rupee</option>
                    <option value="USD">USD ($) - US Dollar</option>
                    <option value="EUR">EUR (€) - Euro</option>
                  </select>
                </div>
                <div>
                  <label className="input-label">Preferred Language</label>
                  <select
                    value={locale.language}
                    onChange={(e) => handleLocaleChange('language', e.target.value)}
                    className="input"
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi (हिंदी)</option>
                    <option value="Spanish">Spanish (Español)</option>
                  </select>
                </div>
              </div>
            </motion.div>

            {/* 4. PRIVACY & ACCOUNT MANAGEMENT */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card p-6 border-white/10 dark:border-white/10 light:border-slate-200 shadow-md">
              <h3 className="text-white dark:text-white light:text-slate-900 font-bold text-lg mb-4 flex items-center gap-2">
                <FiShield className="text-primary-400" /> Advanced Privacy Settings
              </h3>
              <p className="text-dark-400 dark:text-dark-400 light:text-slate-500 text-xs mb-6">
                Modify account level privacy and mock authentication features.
              </p>

              <div className="space-y-4">
                {[
                  { key: 'clearOnLogout', label: 'Clear Cart on Logout', desc: 'Automatically wipe items in cart when logging out of session.' },
                  { key: 'rememberSession', label: 'Remember Sessions', desc: 'Keep logged in even after browser close for 30 days.' },
                  { key: 'twoFactorMock', label: 'Enable Two-Factor Authentication', desc: 'Simulates secure login protocols on credentials verification.' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between pb-3.5 border-b border-white/5 last:border-b-0 last:pb-0">
                    <div className="max-w-[80%]">
                      <p className="text-white dark:text-white light:text-slate-900 text-sm font-semibold">{item.label}</p>
                      <p className="text-dark-400 dark:text-dark-400 light:text-slate-500 text-xs mt-0.5">{item.desc}</p>
                    </div>
                    {/* Toggle Switch */}
                    <button
                      onClick={() => handleToggleAdvanced(item.key)}
                      className={`w-11 h-6 rounded-full p-0.5 transition-colors flex items-center ${advanced[item.key] ? 'bg-primary-500/80 justify-end' : 'bg-white/10 justify-start'}`}
                    >
                      <span className="w-5 h-5 rounded-full bg-white shadow-md block" />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* RESET CARD */}
            <div className="flex flex-col sm:flex-row items-center justify-between p-6 card border-red-500/20 bg-red-500/[0.02]">
              <div>
                <p className="text-white font-bold text-sm">Reset settings</p>
                <p className="text-dark-400 text-xs mt-0.5">Wipe all local configs and restore defaults.</p>
              </div>
              <button
                onClick={handleResetSettings}
                className="btn-danger btn-sm flex items-center gap-2 mt-4 sm:mt-0"
              >
                <FiRotateCcw size={14} /> Restore Defaults
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
