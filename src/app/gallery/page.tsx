'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// 임시 작품 데이터 목록
const artworks = [
  { id: 1, title: 'UNTITLED, 2026', artist: '홍길동', year: '1995', type: 'Oil on Canvas', desc: '본 작품은 인간 내면의 깊은 고독을 표현한 추상화입니다.', src: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=1000&auto=format&fit=crop' },
  { id: 2, title: 'MORNING BREEZE', artist: '김아란', year: '1988', type: 'Acrylic on Wood', desc: '아침 햇살을 머금은 숲의 경쾌한 에너지를 담았습니다.', src: 'https://images.unsplash.com/photo-1579783900882-c0d9f07b1985?q=80&w=1000&auto=format&fit=crop' },
  { id: 3, title: 'CITY LIGHTS', artist: '이영수', year: '1990', type: 'Digital Art', desc: '잠들지 않는 도시의 밤을 화려한 네온 컬러로 재해석한 작품.', src: 'https://images.unsplash.com/photo-1582201942988-13e60e4556ee?q=80&w=1000&auto=format&fit=crop' },
  { id: 4, title: 'SILENT WAVE', artist: '최바다', year: '1975', type: 'Watercolor', desc: '바다의 고요함과 파도의 역동성을 동시에 표현했습니다.', src: 'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=1000&auto=format&fit=crop' },
];

export default function GalleryPage() {
  const [isDocentOpen, setIsDocentOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [history, setHistory] = useState<number[]>([0]); // 이전 작품 기록용
  const [direction, setDirection] = useState(1); // 1: 오른쪽(다음), -1: 왼쪽(이전)

  const currentArtwork = artworks[currentIndex];

  const handleNext = () => {
    // 랜덤으로 새로운 인덱스 선택 (현재 인덱스 제외)
    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * artworks.length);
    } while (nextIndex === currentIndex && artworks.length > 1);
    
    setDirection(1);
    setHistory([...history, nextIndex]);
    setCurrentIndex(nextIndex);
  };

  const handlePrev = () => {
    if (history.length > 1) {
      const newHistory = [...history];
      newHistory.pop(); // 현재 작품 제거
      const prevIndex = newHistory[newHistory.length - 1]; // 이전 작품 가져오기
      
      setDirection(-1);
      setHistory(newHistory);
      setCurrentIndex(prevIndex);
    }
  };

  // 슬라이드 애니메이션 설정
  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

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
      
      {/* 좌우 화살표 버튼 */}
      <button 
        onClick={handlePrev}
        disabled={history.length <= 1}
        className={`absolute left-4 sm:left-12 z-50 p-4 rounded-full bg-white/30 backdrop-blur-sm hover:bg-white/50 transition shadow-lg ${history.length <= 1 ? 'opacity-30 cursor-not-allowed' : 'opacity-80 hover:scale-110'}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-900"><path d="m15 18-6-6 6-6"/></svg>
      </button>

      <button 
        onClick={handleNext}
        className="absolute right-4 sm:right-12 z-50 p-4 rounded-full bg-white/30 backdrop-blur-sm hover:bg-white/50 transition opacity-80 shadow-lg hover:scale-110"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-900"><path d="m9 18 6-6-6-6"/></svg>
      </button>

      {/* 작품 슬라이더 영역 */}
      <div className="relative z-10 w-[calc(100vw-120px)] max-w-[400px] h-[calc(100vh-160px)] aspect-[3/4] mx-auto my-auto flex items-center justify-center">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
            className="absolute w-full h-full"
          >
            {/* 미술관 액자 (프레임 + 매트보드) */}
            <div className="w-full h-full bg-[#fafafa] p-6 sm:p-10 shadow-[0_40px_70px_rgba(0,0,0,0.55),0_15px_20px_rgba(0,0,0,0.3)] border-[14px] border-[#111]">
              {/* 실제 캔버스/그림 영역 */}
              <div className="relative w-full h-full shadow-[inset_0_2px_8px_rgba(0,0,0,0.15)] bg-gray-200">
                <img 
                  src={currentArtwork.src} 
                  alt={currentArtwork.title} 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            {/* 미술관 작품 캡션 (이름표) */}
            <div className="absolute -bottom-16 right-0 bg-white/95 backdrop-blur px-5 py-3 shadow-md border-l-4 border-black">
              <p className="text-xs font-bold text-gray-900 tracking-wider uppercase">{currentArtwork.title}</p>
              <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest">{currentArtwork.type}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 도슨트 설명 말풍선 */}
      <AnimatePresence>
        {isDocentOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-24 right-8 z-40 bg-white/95 backdrop-blur-md p-6 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.4)] w-80 border border-gray-100"
          >
            <div className="flex items-center mb-4 pb-3 border-b border-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-800 mr-2">
                <path d="m3 11 18-5v12L3 14v-3z"></path>
                <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"></path>
              </svg>
              <h3 className="font-bold text-gray-900">오디오 도슨트</h3>
            </div>
            <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
              <p><span className="font-semibold text-black">작가:</span> {currentArtwork.artist}</p>
              <p><span className="font-semibold text-black">출생:</span> {currentArtwork.year}년생</p>
              <p className="pt-2"><span className="font-semibold text-black">작품 설명:</span><br/>{currentArtwork.desc}</p>
            </div>
            
            {/* 말풍선 꼬리 */}
            <div className="absolute -bottom-3 right-8 w-6 h-6 bg-white/95 rotate-45 border-r border-b border-gray-100"></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 우측 하단 도슨트 오디오 가이드 버튼 (확성기 모양) */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.5, duration: 0.8, type: 'spring' }}
        onClick={() => setIsDocentOpen(!isDocentOpen)}
        className="absolute bottom-8 right-8 z-50 cursor-pointer hover:scale-110 transition-transform bg-white/90 backdrop-blur rounded-full px-5 py-3 shadow-[0_5px_15px_rgba(0,0,0,0.3)] flex items-center justify-center gap-2 group"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-800 group-hover:text-black">
          <path d="m3 11 18-5v12L3 14v-3z"></path>
          <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"></path>
        </svg>
        <span className="font-bold text-gray-800 text-sm tracking-wide hidden sm:block">Docent</span>
      </motion.div>
    </motion.div>
  );
}
