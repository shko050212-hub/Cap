'use client';

import { motion } from 'framer-motion';

export default function GalleryPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
      // 따뜻한 톤의 미술관 벽면 (#c8a694)
      className="relative w-full h-screen flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: '#c8a694' }}
    >
      {/* 위에서 떨어지는 은은한 스포트라이트 조명 */}
      <div 
        className="absolute inset-0 pointer-events-none z-0" 
        style={{
          background: 'radial-gradient(ellipse at 50% -20%, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.15) 50%, rgba(0,0,0,0.1) 80%, rgba(0,0,0,0.4) 100%)'
        }}
      />
      
      {/* 미술관 액자 (프레임 + 매트보드) */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 1.5, ease: "easeOut" }}
        className="relative z-10 w-[calc(100vw-60px)] max-w-[400px] max-h-[calc(100vh-160px)] aspect-[3/4] mx-auto my-auto"
      >
        {/* 검은색 외부 프레임과 아래로 강하게 떨어지는 그림자 */}
        <div className="w-full h-full bg-[#fafafa] p-6 sm:p-10 shadow-[0_40px_70px_rgba(0,0,0,0.55),0_15px_20px_rgba(0,0,0,0.3)] border-[14px] border-[#111]">
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

      {/* 우측 하단 콧수염 도슨트 아이콘 (Inline SVG) */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.5, duration: 0.8, type: 'spring' }}
        className="absolute bottom-8 right-8 z-50 cursor-pointer hover:scale-110 transition-transform p-3 drop-shadow-[0_10px_10px_rgba(0,0,0,0.4)] text-[#111] hover:text-[#333]"
      >
        <svg viewBox="0 0 512 512" width="70" height="70" fill="currentColor">
          <path d="M496 256c-27-2-55.8 4.2-80 19.3-15.5 9.7-27.5 24.3-40 37.7-18.4 19.7-39.7 39-68 39s-49.6-19.3-68-39c-12.5-13.4-24.5-28-40-37.7-24.2-15-53-21.3-80-19.3-26.6 2-53 13.8-72 34-4.8 5-7.5 11.5-8 18.4-.7 9.5 5.5 18 14 21.6 44.5 19 97 22.2 144.4 7.6 15-4.6 28.5-11.4 41.6-19.8 17.6-11.3 33.3-25.5 50-38 16.7 12.5 32.4 26.7 50 38 13.1 8.4 26.6 15.2 41.6 19.8 47.4 14.6 99.8 11.4 144.4-7.6 8.5-3.6 14.7-12 14-21.6-.5-6.9-3.2-13.4-8-18.4-19-20.2-45.4-32-72-34z"/>
        </svg>
      </motion.div>
    </motion.div>
  );
}
