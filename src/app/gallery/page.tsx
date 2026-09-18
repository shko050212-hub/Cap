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

      {/* 우측 하단 콧수염 도슨트 아이콘 (12번 원본 이미지 투명화 적용) */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.5, duration: 0.8, type: 'spring' }}
        className="absolute bottom-8 right-8 w-20 h-20 z-50 cursor-pointer hover:scale-110 transition-transform"
      >
        <img 
          src="/docent.png" 
          alt="Docent" 
          className="w-full h-full object-contain"
          style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' }}
        />
      </motion.div>
    </motion.div>
  );
}
