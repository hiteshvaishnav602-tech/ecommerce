import { Link } from 'react-router-dom'
import { FiInstagram, FiTwitter, FiFacebook, FiYoutube, FiChevronDown } from 'react-icons/fi'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function Footer() {
  const [email, setEmail] = useState('')
  const [openSections, setOpenSections] = useState({
    help: false,
    company: false,
    info: false,
    store: false,
    whoweare: false
  })

  const toggleSection = (id) => {
    setOpenSections(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const handleNewsletter = (e) => {
    e.preventDefault()
    if (!email) return
    toast.success('🎉 Subscribed! Stay tuned for amazing deals.')
    setEmail('')
  }

  return (
    <footer className="bg-[#fcfcfc] text-neutral-600 border-t border-neutral-200 mt-auto font-sans">

      {/* Main Footer Columns (Desktop) */}
      <div className="hidden md:block max-w-[1400px] mx-auto px-8 lg:px-12 py-12">
        <div className="grid grid-cols-4 gap-8">
          {/* Need Help */}
          <div>
            <h4 className="text-neutral-900 font-bold text-xs uppercase tracking-wider mb-5">NEED HELP</h4>
            <ul className="space-y-3">
              {[
                { label: 'Contact Us', href: '/contact' },
                { label: 'Track Order', href: '/my-orders' },
                { label: 'Returns & Refunds', href: '#' },
                { label: 'FAQs', href: '#' },
                { label: 'My Account', href: '/profile' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link to={href} className="text-neutral-505 hover:text-red-600 text-sm transition-colors">{label}</Link>
                </li>
              ))}
              <li className="flex items-center gap-2 mt-4 pt-3 border-t border-neutral-200">
                <span className="text-red-600 text-sm font-semibold">₹</span>
                <span className="text-neutral-600 text-xs font-medium">COD Available</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-red-600 text-sm font-semibold">↺</span>
                <span className="text-neutral-600 text-xs font-medium">30 Days Easy Returns & Exchanges</span>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-neutral-900 font-bold text-xs uppercase tracking-wider mb-5">COMPANY</h4>
            <ul className="space-y-3">
              {[
                { label: 'About Us', href: '#' },
                { label: 'Investor Relation', href: '#' },
                { label: 'Careers', href: '#' },
                { label: 'Gift Vouchers', href: '#' },
                { label: 'Community Initiatives', href: '#' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link to={href} className="text-neutral-505 hover:text-red-600 text-sm transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* More Info */}
          <div>
            <h4 className="text-neutral-900 font-bold text-xs uppercase tracking-wider mb-5">MORE INFO</h4>
            <ul className="space-y-3">
              {[
                { label: 'T&C', href: '#' },
                { label: 'Privacy Policy', href: '#' },
                { label: 'Sitemap', href: '#' },
                { label: 'Get Notified', href: '#' },
                { label: 'Blogs', href: '#' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link to={href} className="text-neutral-505 hover:text-red-600 text-sm transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Store Near Me */}
          <div>
            <h4 className="text-neutral-900 font-bold text-xs uppercase tracking-wider mb-5">STORE NEAR ME</h4>
            <ul className="space-y-3">
              {['Mumbai', 'Pune', 'Bangalore', 'Ahmedabad'].map(city => (
                <li key={city}>
                  <span className="text-neutral-505 text-sm">{city}</span>
                </li>
              ))}
              <li className="pt-2">
                <Link to="#" className="text-red-650 font-bold text-sm hover:text-red-500 hover:underline">View More</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Main Footer Columns (Mobile Accordions) */}
      <div className="md:hidden max-w-[1400px] mx-auto px-6 py-4">
        <div className="border-t border-neutral-200">
          {[
            {
              id: 'help',
              title: 'NEED HELP',
              content: (
                <ul className="space-y-3 pb-4 pt-1">
                  {[
                    { label: 'Contact Us', href: '/contact' },
                    { label: 'Track Order', href: '/my-orders' },
                    { label: 'Returns & Refunds', href: '#' },
                    { label: 'FAQs', href: '#' },
                    { label: 'My Account', href: '/profile' },
                  ].map(({ label, href }) => (
                    <li key={label}>
                      <Link to={href} className="text-neutral-500 hover:text-red-600 text-sm transition-colors block py-0.5">{label}</Link>
                    </li>
                  ))}
                  <li className="flex items-center gap-2 mt-3 pt-2.5 border-t border-neutral-200/60">
                    <span className="text-red-600 text-sm font-semibold">₹</span>
                    <span className="text-neutral-600 text-xs font-medium">COD Available</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-red-600 text-sm font-semibold">↺</span>
                    <span className="text-neutral-600 text-xs font-medium">30 Days Easy Returns & Exchanges</span>
                  </li>
                </ul>
              )
            },
            {
              id: 'company',
              title: 'COMPANY',
              content: (
                <ul className="space-y-3 pb-4 pt-1">
                  {[
                    { label: 'About Us', href: '#' },
                    { label: 'Investor Relation', href: '#' },
                    { label: 'Careers', href: '#' },
                    { label: 'Gift Vouchers', href: '#' },
                    { label: 'Community Initiatives', href: '#' },
                  ].map(({ label, href }) => (
                    <li key={label}>
                      <Link to={href} className="text-neutral-500 hover:text-red-600 text-sm transition-colors block py-0.5">{label}</Link>
                    </li>
                  ))}
                </ul>
              )
            },
            {
              id: 'info',
              title: 'MORE INFO',
              content: (
                <ul className="space-y-3 pb-4 pt-1">
                  {[
                    { label: 'T&C', href: '#' },
                    { label: 'Privacy Policy', href: '#' },
                    { label: 'Sitemap', href: '#' },
                    { label: 'Get Notified', href: '#' },
                    { label: 'Blogs', href: '#' },
                  ].map(({ label, href }) => (
                    <li key={label}>
                      <Link to={href} className="text-neutral-500 hover:text-red-600 text-sm transition-colors block py-0.5">{label}</Link>
                    </li>
                  ))}
                </ul>
              )
            },
            {
              id: 'store',
              title: 'STORE NEAR ME',
              content: (
                <ul className="space-y-3 pb-4 pt-1">
                  {['Mumbai', 'Pune', 'Bangalore', 'Ahmedabad'].map(city => (
                    <li key={city}>
                      <span className="text-neutral-500 text-sm block py-0.5">{city}</span>
                    </li>
                  ))}
                  <li className="pt-1">
                    <Link to="#" className="text-red-650 font-bold text-sm hover:text-red-500 hover:underline">View More</Link>
                  </li>
                </ul>
              )
            },
            {
              id: 'whoweare',
              title: 'WHO WE ARE',
              content: (
                <p className="text-neutral-500 text-xs leading-relaxed pb-4 pt-1">
                  AURA is India's homegrown clothing brand, delivering premium fashion to millions of happy customers across the country.
                  We believe in self-expression through style — bold, comfortable, and always authentic.
                  Shop from 1000+ unique designs crafted for the youth of India.
                </p>
              )
            }
          ].map(section => {
            const isOpen = openSections[section.id]
            return (
              <div key={section.id} className="border-b border-neutral-200">
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between py-4.5 text-left focus:outline-none hover:text-neutral-900 transition-colors"
                >
                  <span className={`font-semibold text-[13px] tracking-wide uppercase transition-colors duration-200 ${isOpen ? 'text-red-600' : 'text-neutral-800'}`}>{section.title}</span>
                  <FiChevronDown className={`text-neutral-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-red-600' : ''}`} size={16} />
                </button>
                {isOpen && (
                  <div className="animate-fadeIn">{section.content}</div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* App Download + Social */}
      <div className="border-t border-neutral-200 py-8">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">

            {/* App Download */}
            <div className="text-center md:text-left">
              <p className="text-neutral-800 font-bold text-xs uppercase tracking-wider mb-4 flex items-center gap-2 justify-center md:justify-start">
                📱 EXPERIENCE THE AURA APP
              </p>
              <div className="flex gap-3 justify-center md:justify-start">
                <a href="#" className="block">
                  <div className="bg-black text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-neutral-900 border border-neutral-800 transition-colors">
                    <span className="text-lg">▶</span>
                    <div className="text-left">
                      <p className="text-[9px] text-neutral-400 leading-none">GET IT ON</p>
                      <p className="text-xs font-bold leading-tight">Google Play</p>
                    </div>
                  </div>
                </a>
                <a href="#" className="block">
                  <div className="bg-black text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-neutral-900 border border-neutral-800 transition-colors">
                    <span className="text-lg">🍎</span>
                    <div className="text-left">
                      <p className="text-[9px] text-neutral-400 leading-none">Download on the</p>
                      <p className="text-xs font-bold leading-tight">App Store</p>
                    </div>
                  </div>
                </a>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <span className="text-neutral-600 text-sm font-medium">Follow Us:</span>
              <div className="flex items-center gap-3">
                {[
                  { icon: FiFacebook, href: '#', hoverBg: 'hover:bg-[#1877f2] hover:border-transparent' },
                  { icon: FiInstagram, href: '#', hoverBg: 'hover:bg-gradient-to-tr hover:from-[#fd5949] hover:via-[#d6249f] hover:to-[#285AEB] hover:border-transparent' },
                  { icon: FiYoutube, href: '#', hoverBg: 'hover:bg-[#ff0000] hover:border-transparent' },
                  { icon: FiTwitter, href: '#', hoverBg: 'hover:bg-black hover:border-transparent' },
                ].map(({ icon: Icon, href, hoverBg }, i) => (
                  <a
                    key={i}
                    href={href}
                    className={`w-9 h-9 rounded-full flex items-center justify-center bg-white border border-neutral-250 text-neutral-500 hover:text-white transition-all duration-300 ${hoverBg} shadow-sm`}
                  >
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Who We Are - Accordion (Desktop Only) */}
      <div className="hidden md:block border-t border-neutral-200">
        <div className="max-w-[1400px] mx-auto px-8 lg:px-12">
          <button
            onClick={() => toggleSection('whoweare')}
            className="w-full flex items-center justify-between py-4 text-left focus:outline-none group"
          >
            <span className="text-neutral-900 group-hover:text-red-500 font-bold text-xs uppercase tracking-widest transition-colors">WHO WE ARE</span>
            <FiChevronDown className={`text-neutral-450 transition-transform duration-300 ${openSections.whoweare ? 'rotate-180 text-red-600' : ''}`} size={16} />
          </button>
          {openSections.whoweare && (
            <p className="pb-6 text-neutral-500 text-sm leading-relaxed max-w-4xl transition-all duration-300">
              AURA is India's homegrown clothing brand, delivering premium fashion to millions of happy customers across the country.
              We believe in self-expression through style — bold, comfortable, and always authentic.
              Shop from 1000+ unique designs crafted for the youth of India.
            </p>
          )}
        </div>
      </div>

      {/* Bottom - Payment + Copyright */}
      <div className="border-t border-neutral-200 py-6 bg-[#f3f4f6]">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-5">
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 w-full md:w-auto">
              <p className="text-neutral-500 text-xs flex items-center gap-2">
                <span className="font-semibold text-neutral-700">100% Secure Payment:</span>
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {['PhonePe', 'GPay', 'Amazon Pay', 'Mastercard', 'Paytm', 'Cash on Delivery'].map(p => (
                  <span key={p} className="text-neutral-600 text-[10px] bg-white border border-neutral-200 px-2.5 py-1 rounded font-medium shadow-sm">{p}</span>
                ))}
              </div>
            </div>
            <p className="text-neutral-500 text-xs tracking-wide">© AURA {new Date().getFullYear()}-{new Date().getFullYear() - 1999}</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
