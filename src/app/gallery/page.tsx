'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// 임시 작품 데이터 목록 (판매방식, 가격, 사이즈 추가)
const artworks = [
  { id: 1, title: 'UNTITLED, 2026', artist: '홍길동', year: '1995', type: 'Oil on Canvas', desc: '본 작품은 인간 내면의 깊은 고독을 표현한 추상화입니다.', src: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=1000&auto=format&fit=crop', saleType: 'auction', price: 5000000, width: 120, height: 160 },
  { id: 2, title: 'MORNING BREEZE', artist: '김아란', year: '1988', type: 'Acrylic on Wood', desc: '아침 햇살을 머금은 숲의 경쾌한 에너지를 담았습니다.', src: 'https://images.unsplash.com/photo-1579783900882-c0d9f07b1985?q=80&w=1000&auto=format&fit=crop', saleType: 'buy_now', price: 2500000, width: 90, height: 120 },
  { id: 3, title: 'CITY LIGHTS', artist: '이영수', year: '1990', type: 'Digital Art', desc: '잠들지 않는 도시의 밤을 화려한 네온 컬러로 재해석한 작품.', src: 'https://images.unsplash.com/photo-1582201942988-13e60e4556ee?q=80&w=1000&auto=format&fit=crop', saleType: 'auction', price: 1200000, width: 150, height: 100 },
  { id: 4, title: 'SILENT WAVE', artist: '최바다', year: '1975', type: 'Watercolor', desc: '바다의 고요함과 파도의 역동성을 동시에 표현했습니다.', src: 'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=1000&auto=format&fit=crop', saleType: 'buy_now', price: 800000, width: 80, height: 80 },
];

export default function GalleryPage() {
  const [isDocentOpen, setIsDocentOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [history, setHistory] = useState<number[]>([0]); // 이전 작품 기록용
  const [direction, setDirection] = useState(1); // 1: 오른쪽(다음), -1: 왼쪽(이전)
  
  // 신규 기능 상태
  const [liked, setLiked] = useState<Record<number, boolean>>({});
  const [isScaleView, setIsScaleView] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // 입찰 상태 관리
  const [bidStep, setBidStep] = useState<'initial' | 'input' | 'complete'>('initial');
  const [bidAmount, setBidAmount] = useState('');
  const [bidError, setBidError] = useState('');

  const currentArtwork = artworks[currentIndex];

  const handleNext = () => {
    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * artworks.length);
    } while (nextIndex === currentIndex && artworks.length > 1);
    
    setDirection(1);
    setHistory([...history, nextIndex]);
    setCurrentIndex(nextIndex);
    setIsScaleView(false);
    setIsDocentOpen(false);
    setBidStep('initial');
    setBidAmount('');
    setBidError('');
  };

  const handlePrev = () => {
    if (history.length > 1) {
      const newHistory = [...history];
      newHistory.pop();
      const prevIndex = newHistory[newHistory.length - 1];
      
      setDirection(-1);
      setHistory(newHistory);
      setCurrentIndex(prevIndex);
      setIsScaleView(false);
      setIsDocentOpen(false);
      setBidStep('initial');
      setBidAmount('');
      setBidError('');
    }
  };

  const toggleLike = () => {
    setLiked(prev => ({ ...prev, [currentArtwork.id]: !prev[currentArtwork.id] }));
  };

  const closeCart = () => {
    setIsCartOpen(false);
    setTimeout(() => {
      setBidStep('initial');
      setBidAmount('');
      setBidError('');
    }, 300);
  };
  
  const handleBidSubmit = () => {
    if (Number(bidAmount) < currentArtwork.price) {
      setBidError('이 금액으로는 입찰이 불가합니다.');
    } else {
      setBidError('');
      setBidStep('complete');
    }
  };

  const variants = {
    enter: (direction: number) => ({ x: direction > 0 ? 1000 : -1000, opacity: 0 }),
    center: { zIndex: 1, x: 0, opacity: 1 },
    exit: (direction: number) => ({ zIndex: 0, x: direction < 0 ? 1000 : -1000, opacity: 0 })
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
      className="relative w-full h-screen flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: '#c8a694' }}
    >
      <div 
        className="absolute inset-0 pointer-events-none z-0" 
        style={{ background: 'radial-gradient(ellipse at 50% -20%, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.15) 50%, rgba(0,0,0,0.1) 80%, rgba(0,0,0,0.4) 100%)' }}
      />
      
      {/* 상단 툴바: 스케일 뷰 토글 버튼 */}
      <div className="absolute top-8 left-0 right-0 flex justify-center z-50">
        <button 
          onClick={() => setIsScaleView(!isScaleView)}
          className={`px-6 py-3 rounded-full font-bold shadow-lg transition-all ${isScaleView ? 'bg-black text-white' : 'bg-white/90 text-black hover:bg-white backdrop-blur'}`}
        >
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.29 7 12 12 20.71 7"></polyline><line x1="12" y1="22" x2="12" y2="12"></line></svg>
            {isScaleView ? '작품만 보기' : '📏 실제 사이즈로 보기'}
          </div>
        </button>
      </div>

      {/* 좌우 화살표 버튼 */}
      <button onClick={handlePrev} disabled={history.length <= 1} className={`absolute left-4 sm:left-12 z-50 p-4 rounded-full bg-white/30 backdrop-blur-sm hover:bg-white/50 transition shadow-lg ${history.length <= 1 ? 'opacity-30 cursor-not-allowed' : 'opacity-80 hover:scale-110'}`}>
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-900"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      <button onClick={handleNext} className="absolute right-4 sm:right-12 z-50 p-4 rounded-full bg-white/30 backdrop-blur-sm hover:bg-white/50 transition opacity-80 shadow-lg hover:scale-110">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-900"><path d="m9 18 6-6-6-6"/></svg>
      </button>

      {/* 작품 슬라이더 영역 (고유 비율 강제) */}
      <div 
        className="relative z-10 w-full h-[70vh] max-h-[800px] mx-auto flex items-center justify-center"
      >
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
            className="absolute flex justify-center items-center"
            style={{ 
              height: '100%',
              aspectRatio: `${currentArtwork.width} / ${currentArtwork.height}` 
            }}
          >
            <div className="relative w-full h-full bg-[#fafafa] p-4 sm:p-8 shadow-[0_40px_70px_rgba(0,0,0,0.55),0_15px_20px_rgba(0,0,0,0.3)] border-[10px] sm:border-[14px] border-[#111]">
              <div className="relative w-full h-full shadow-[inset_0_2px_8px_rgba(0,0,0,0.15)] bg-white">
                <img src={currentArtwork.src} alt={currentArtwork.title} className="w-full h-full object-contain" />
              </div>
            </div>
            
            <div className="absolute -bottom-16 right-0 bg-white/95 backdrop-blur px-5 py-3 shadow-md border-l-4 border-black">
              <p className="text-xs font-bold text-gray-900 tracking-wider uppercase">{currentArtwork.title}</p>
              <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest">{currentArtwork.type}</p>
            </div>

            {/* 스케일 뷰 활성화 시 사람과 사이즈 정보 표시 */}
            {isScaleView && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 z-20 flex justify-center pointer-events-none"
              >
                {/* 그림 중앙에 머리가 오도록 위치 조정 및 키 비율 계산 (사용자 키 180cm 기준) */}
                <div 
                  className="absolute left-1/2"
                  style={{ 
                    // 작품 세로 길이에 대비한 180cm 사용자의 상대적 픽셀 높이
                    height: `${(180 / currentArtwork.height) * 100}%`,
                    top: '50%', // 그림의 세로 정중앙
                    transform: 'translate(-50%, -12%)' // 눈높이를 그림 중앙에 맞추기 위해 약간 위로 보정
                  }}
                >
                  <img src="/human_scale.png" alt="Human Scale" className="h-full w-auto drop-shadow-2xl opacity-90 object-contain" />
                </div>
                
                {/* 사이즈 정보 태그 */}
                <div className="absolute -left-20 top-1/2 -translate-y-1/2 bg-black/80 text-white px-3 py-2 rounded text-sm whitespace-nowrap">
                  가로 {currentArtwork.width}cm
                </div>
                <div className="absolute left-1/2 -bottom-10 -translate-x-1/2 bg-black/80 text-white px-3 py-2 rounded text-sm whitespace-nowrap">
                  세로 {currentArtwork.height}cm
                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 하단 좌측: 찜하기 및 구매 버튼 */}
      <div className="absolute bottom-8 left-8 z-50 flex gap-4">
        {/* 찜하기 하트 버튼 */}
        <button 
          onClick={toggleLike}
          className="bg-white/90 backdrop-blur rounded-full w-14 h-14 flex items-center justify-center shadow-[0_5px_15px_rgba(0,0,0,0.3)] hover:scale-110 transition-transform group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={liked[currentArtwork.id] ? "#ef4444" : "none"} stroke={liked[currentArtwork.id] ? "#ef4444" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={liked[currentArtwork.id] ? "" : "text-gray-800 group-hover:text-red-500 transition-colors"}>
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
          </svg>
        </button>

        {/* 구매/쇼핑카트 버튼 */}
        <button 
          onClick={() => setIsCartOpen(true)}
          className="bg-white/90 backdrop-blur rounded-full px-6 py-3 shadow-[0_5px_15px_rgba(0,0,0,0.3)] hover:scale-110 transition-transform flex items-center gap-2 group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-800">
            <circle cx="8" cy="21" r="1"></circle><circle cx="19" cy="21" r="1"></circle><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
          </svg>
          <span className="font-bold text-gray-800 text-sm">{currentArtwork.saleType === 'auction' ? '경매 입찰하기' : '즉시 구매하기'}</span>
        </button>
      </div>

      {/* 구매/경매 모달 */}
      <AnimatePresence>
        {isCartOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="bg-gray-50 border-b px-6 py-4 flex justify-between items-center">
                <h2 className="font-bold text-lg">{currentArtwork.saleType === 'auction' ? '경매 입찰' : '작품 구매'}</h2>
                <button onClick={closeCart} className="text-gray-500 hover:text-black">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
              </div>
              <div className="p-6">
                <div className="flex gap-4 mb-6">
                  <img src={currentArtwork.src} className="w-20 h-20 object-cover rounded shadow" />
                  <div>
                    <h3 className="font-bold">{currentArtwork.title}</h3>
                    <p className="text-sm text-gray-500">{currentArtwork.artist}</p>
                    <p className="text-lg font-bold mt-1 text-black">₩{currentArtwork.price.toLocaleString()}</p>
                  </div>
                </div>
                
                {currentArtwork.saleType === 'auction' ? (
                  <div className="bg-gray-100 p-4 rounded-lg text-sm text-gray-700">
                    <p className="font-bold mb-2 text-black">경매 방식 안내</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>작가가 설정한 최소 가격부터 호가가 시작됩니다.</li>
                      <li>새로운 호가 입력 시 1시간의 유예 시간이 주어집니다.</li>
                      <li>1시간 동안 추가 호가가 없으면 최종 낙찰됩니다.</li>
                    </ul>
                    
                    {bidStep === 'initial' && (
                      <button onClick={() => setBidStep('input')} className="w-full mt-4 bg-black text-white font-bold py-3 rounded-lg hover:bg-gray-800 transition">
                        입찰가 입력하기
                      </button>
                    )}
                    
                    {bidStep === 'input' && (
                      <div className="mt-4 flex flex-col gap-2">
                        <div className="flex gap-2">
                          <input 
                            type="number" 
                            placeholder={`최소 ₩${currentArtwork.price.toLocaleString()} 이상`} 
                            value={bidAmount}
                            onChange={(e) => setBidAmount(e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                          />
                          <button 
                            onClick={handleBidSubmit} 
                            disabled={!bidAmount}
                            className="bg-black text-white px-5 py-2 rounded-lg font-bold hover:bg-gray-800 disabled:opacity-50"
                          >
                            확인
                          </button>
                        </div>
                        {bidError && <p className="text-red-500 text-xs font-bold">{bidError}</p>}
                      </div>
                    )}
                    
                    {bidStep === 'complete' && (
                      <div className="mt-4 bg-green-100 border border-green-200 text-green-800 p-3 rounded-lg text-center font-bold">
                        🎉 입찰이 완료되었습니다!
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-gray-100 p-4 rounded-lg text-sm text-gray-700">
                    <p className="font-bold mb-2 text-black">일반 구매 안내</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>작가가 설정한 가격으로 즉시 구매가 가능합니다.</li>
                      <li>결제 완료 시 작품 소유권이 이전됩니다.</li>
                    </ul>
                    
                    {bidStep === 'initial' && (
                      <button onClick={() => setBidStep('complete')} className="w-full mt-4 bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition">
                        ₩{currentArtwork.price.toLocaleString()} 결제하기
                      </button>
                    )}
                    
                    {bidStep === 'complete' && (
                      <div className="mt-4 bg-green-100 border border-green-200 text-green-800 p-3 rounded-lg text-center font-bold">
                        🎉 결제가 완료되었습니다!
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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

      {/* 우측 하단 도슨트 버튼 */}
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
