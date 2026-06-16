import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiHome, FiSearch } from 'react-icons/fi'

export default function NotFound() {
  return (
    <div className="min-h-screen pt-[73px] flex items-center justify-center bg-dark-950 px-4">
      <div className="text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-9xl mb-6 font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-purple-500"
        >
          404
        </motion.div>
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-white mb-4">Page Not Found</h1>
          <p className="text-dark-400 mb-8 max-w-md mx-auto">
            Oops! The page you're looking for seems to have gone on vacation. 
            Don't worry, we've got plenty of other cool stuff to show you.
          </p>
          
          <div className="flex justify-center gap-4">
            <Link to="/" className="btn-primary flex items-center gap-2">
              <FiHome size={18} /> Back to Home
            </Link>
            <Link to="/products" className="btn-secondary flex items-center gap-2">
              <FiSearch size={18} /> Browse Products
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
