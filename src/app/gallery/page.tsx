'use client';

import { motion } from 'framer-motion';

export default function GalleryPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
      // 실제 미술관의 차분하고 고급스러운 다크 그레이 벽면
      className="relative w-full h-screen bg-[#222222] flex items-center justify-center overflow-hidden"
    >
      {/* 은은한 벽면 조명 (과장된 스포트라이트를 빼고 자연스러운 질감만) */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{
          background: 'radial-gradient(circle at center top, rgba(255,255,255,0.04) 0%, transparent 60%)'
        }}
      />
      
      {/* 미술관 액자 (프레임 + 매트보드) */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 1.5, ease: "easeOut" }}
        className="relative z-10 w-[calc(100vw-60px)] max-w-[400px] max-h-[calc(100vh-160px)] aspect-[3/4] mx-auto my-auto"
      >
        {/* 검은색 외부 프레임과 흰색 여백(Passe-partout) */}
        <div className="w-full h-full bg-[#fafafa] p-6 sm:p-10 shadow-[0_30px_60px_rgba(0,0,0,0.6)] border-[14px] border-[#111]">
          {/* 실제 캔버스/그림 영역 */}
          <div className="relative w-full h-full shadow-[inset_0_2px_8px_rgba(0,0,0,0.15)] bg-gray-200">
            <img 
              src="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=1000&auto=format&fit=crop" 
              alt="Artwork" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        
        {/* 미술관 작품 캡션 (이름표) */}
        <div className="absolute -bottom-16 right-0 bg-white/95 backdrop-blur px-5 py-3 shadow-md border-l-4 border-black">
          <p className="text-xs font-bold text-gray-900 tracking-wider">UNTITLED, 2026</p>
          <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest">Oil on Canvas</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
