'use client';

import { motion } from 'framer-motion';

export default function GalleryPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
      className="relative w-full h-screen bg-black flex items-center justify-center overflow-hidden"
    >
      {/* Spotlight Background overlay */}
      <div 
        className="absolute inset-0 pointer-events-none z-20" 
        style={{
          background: 'radial-gradient(circle at center, transparent 15%, rgba(0,0,0,0.95) 50%, rgba(0,0,0,1) 100%)'
        }}
      />
      
      {/* Artwork Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 2, ease: "easeOut" }}
        className="relative z-10 w-[calc(100vw-100px)] max-w-[450px] max-h-[calc(100vh-100px)] aspect-[3/4] shadow-[0_0_80px_rgba(255,255,255,0.12)] bg-[#1a1a1a] p-4 sm:p-6 mx-auto my-auto"
      >
        <div className="relative w-full h-full border border-gray-800 bg-gray-900 overflow-hidden group">
          {/* Temporary Artwork Image */}
          <img 
            src="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=1000&auto=format&fit=crop" 
            alt="Artwork" 
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
