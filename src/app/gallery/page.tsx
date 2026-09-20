'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { loadTossPayments } from '@tosspayments/payment-sdk';

// 임시 작품 데이터 목록 (판매방식, 가격, 사이즈 추가)
const artworks = [
  { id: 1, title: 'UNTITLED, 2026', artist: '홍길동', year: '1995', type: 'Oil on Canvas', desc: '본 작품은 인간 내면의 깊은 고독을 표현한 추상화입니다.', src: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=1000&auto=format&fit=crop', saleType: 'auction', price: 5000000, width: 120, height: 160 },
  { id: 2, title: 'MORNING BREEZE', artist: '김아란', year: '1988', type: 'Acrylic on Wood', desc: '아침 햇살을 머금은 숲의 경쾌한 에너지를 담았습니다.', src: 'https://images.unsplash.com/photo-1579783900882-c0d9f07b1985?q=80&w=1000&auto=format&fit=crop', saleType: 'sale', price: 2500000, width: 90, height: 120 },
  { id: 3, title: 'CITY LIGHTS', artist: '이영수', year: '1990', type: 'Digital Art', desc: '잠들지 않는 도시의 밤을 화려한 네온 컬러로 재해석한 작품.', src: 'https://images.unsplash.com/photo-1582201942988-13e60e4556ee?q=80&w=1000&auto=format&fit=crop', saleType: 'sale', price: 1200000, width: 150, height: 100 },
  { id: 4, title: 'SILENT WAVE', artist: '최바다', year: '1975', type: 'Watercolor', desc: '바다의 고요함과 파도의 역동성을 동시에 표현했습니다.', src: 'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=1000&auto=format&fit=crop', saleType: 'sale', price: 800000, width: 80, height: 80 },
  { id: 5, title: 'TIMELESS BEAUTY', artist: '박경매', year: '1982', type: 'Mixed Media', desc: '시간의 흐름 속에서도 변치 않는 아름다움을 상징합니다. (경매 테스트용 더미 작품)', src: 'https://images.unsplash.com/photo-1549490349-8643362247b5?q=80&w=1000&auto=format&fit=crop', saleType: 'auction', price: 150000, width: 100, height: 100 },
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
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileView, setProfileView] = useState<'edit' | 'liked' | 'sell' | 'history' | 'my_art' | 'charge' | null>(null);
  
  // 코인 상태
  const [userCoins, setUserCoins] = useState(0);
  const [chargeAmount, setChargeAmount] = useState('');
  
  // 경매 마감 타이머 상태
  const [auctionEndTimes, setAuctionEndTimes] = useState<Record<number, number>>({});
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const chargeAmt = params.get('charge_success');
      if (chargeAmt) {
        setUserCoins(prev => prev + Number(chargeAmt));
        alert(`${Number(chargeAmt).toLocaleString()} 코인 충전이 정상적으로 완료되었습니다!`);
        window.history.replaceState({}, '', '/gallery');
        setProfileView('charge');
        setIsProfileOpen(true);
      }
    }
  }, []);

  interface MyArtwork {
    id: number;
    title: string;
    price: number;
    src: string;
    status: 'pending' | 'approved';
    saleType: 'sale' | 'auction';
  }
  const [myArtworks, setMyArtworks] = useState<MyArtwork[]>([]);
  const [myTransactions, setMyTransactions] = useState<any[]>([]);
  
  // 프로필 정보 상태
  const [profileName, setProfileName] = useState('관람객 님');
  const [profileImage, setProfileImage] = useState('/mascot.png');
  const [editNameInput, setEditNameInput] = useState(profileName);
  const profileImageInputRef = useRef<HTMLInputElement>(null);

  // 미술품 판매 상태
  const [sellTitle, setSellTitle] = useState('');
  const [sellPrice, setSellPrice] = useState('');
  const [sellImage, setSellImage] = useState<string | null>(null);
  const [sellType, setSellType] = useState<'sale' | 'auction'>('sale');
  const sellImageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await fetch('/api/user/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.user.profile_name) {
            setProfileName(data.user.profile_name);
            setEditNameInput(data.user.profile_name);
          }
          if (data.user.profile_image) setProfileImage(data.user.profile_image);
          if (data.user.coins) setUserCoins(data.user.coins);
          
          if (data.artworks && data.artworks.length > 0) {
            setMyArtworks(data.artworks.map((a: any) => ({
              id: a.id,
              title: a.title,
              price: a.price,
              src: a.src,
              status: a.status,
              saleType: a.sale_type
            })));
          }
          if (data.transactions) {
            setMyTransactions(data.transactions);
          }
        }
      } catch (err) {
        console.error('Failed to fetch profile', err);
      }
    };
    fetchProfile();
  }, []);

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setProfileImage(url);
    }
  };

  const handleProfileSave = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await fetch('/api/user/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ profileName: editNameInput, profileImage })
        });
      } catch (err) {
        console.error(err);
      }
    }
    setProfileName(editNameInput);
    alert('프로필이 성공적으로 업데이트되었습니다.');
  };

  const handleSellImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setSellImage(url);
    }
  };

  const handleSellSubmit = async () => {
    if (!sellTitle || !sellPrice || !sellImage) {
      alert('모든 항목을 입력하고 작품 사진을 업로드해주세요.');
      return;
    }
    alert('작품 등록 신청이 완료되었습니다.\n관리자의 승인을 기다리는 중입니다. 승인이 완료되면 갤러리에 정식으로 등록되어 다른 사용자들에게 보여집니다.');
    
    let dbId = Date.now();
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const res = await fetch('/api/artworks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ title: sellTitle, price: Number(sellPrice), src: sellImage, saleType: sellType })
        });
        if (res.ok) {
          const data = await res.json();
          dbId = data.artwork.id;
        }
      } catch (err) {
        console.error(err);
      }
    }

    const newArt: MyArtwork = {
      id: dbId,
      title: sellTitle,
      price: Number(sellPrice),
      src: sellImage,
      status: 'pending',
      saleType: sellType
    };
    setMyArtworks(prev => [newArt, ...prev]);

    // 폼 초기화 및 닫기
    setSellTitle('');
    setSellPrice('');
    setSellImage(null);
    setSellType('sale');
    setProfileView('my_art');
  };
  
  const closeProfile = () => {
    if (profileView) {
      setProfileView(null);
      setTimeout(() => {
        setIsProfileOpen(false);
      }, 500);
    } else {
      setIsProfileOpen(false);
    }
  };
  
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
  
  const handleBidSubmit = async () => {
    if (Number(bidAmount) < currentArtwork.price) {
      setBidError('최소 시작가 이상의 금액을 입력해주세요.');
    } else if (Number(bidAmount) > userCoins) {
      setBidError('보유하신 코인이 부족하십니다.');
    } else {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          await fetch('/api/user/coins', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ 
              amount: Number(bidAmount), 
              action: 'subtract',
              artworkId: currentArtwork.id,
              artworkTitle: currentArtwork.title,
              artworkSrc: currentArtwork.src,
              type: 'bid',
              auctionEndTime: Date.now() + 10 * 60 * 1000
            })
          });
        } catch (err) {
          console.error(err);
        }
      }
      const auctionEnd = Date.now() + 10 * 60 * 1000;
      setMyTransactions(prev => [{
        id: Date.now(),
        artwork_id: currentArtwork.id,
        artwork_title: currentArtwork.title,
        artwork_src: currentArtwork.src,
        amount: Number(bidAmount),
        type: 'bid',
        auction_end_time: auctionEnd
      }, ...prev]);
      
      setUserCoins(prev => prev - Number(bidAmount));
      setAuctionEndTimes(prev => ({ ...prev, [currentArtwork.id]: auctionEnd }));
      setBidError('');
      setBidStep('complete');
      alert('입찰이 완료되었습니다. 호가 금액만큼 코인이 사용 정지됩니다.');
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

      {/* 작품 슬라이더 영역 (고유 비율 강제 및 크기 고정) */}
      <div 
        className="relative z-10 w-full h-[550px] mx-auto flex items-center justify-center"
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
                <div className="absolute left-1/2 -top-12 -translate-x-1/2 bg-black/80 text-white px-3 py-2 rounded text-sm whitespace-nowrap shadow-md">
                  가로 {currentArtwork.width}cm
                </div>
                <div className="absolute -left-24 top-1/2 -translate-y-1/2 bg-black/80 text-white px-3 py-2 rounded text-sm whitespace-nowrap shadow-md">
                  세로 {currentArtwork.height}cm
                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 하단 우측: 찜하기 및 구매 버튼, 프로필 버튼 */}
      <div className="absolute bottom-8 right-8 z-50 flex gap-4">
        {/* 프로필 버튼 */}
        <button 
          onClick={() => setIsProfileOpen(true)}
          className="bg-white/90 backdrop-blur rounded-full w-14 h-14 flex items-center justify-center shadow-[0_5px_15px_rgba(0,0,0,0.3)] hover:scale-110 transition-transform group overflow-hidden"
        >
          <img src={profileImage} alt="Profile" className="w-full h-full object-contain p-1" />
        </button>

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
                    <ul className="list-disc pl-4 space-y-1 text-xs">
                      <li>본 거래 방식은 10분을 간격으로 더 큰 호가가 없을 경우 낙찰로 판단 되게 됩니다.</li>
                      <li>추가로 보유하신 코인은 호가시 호가 금액 만큼 사용 정지되며 더 큰 호가가 나올 시 사용정지가 풀리게 됩니다.</li>
                    </ul>
                    
                    {bidStep === 'initial' && (() => {
                      const endTime = auctionEndTimes[currentArtwork.id];
                      const timeLeftMs = endTime ? endTime - currentTime : 0;
                      const hasActiveAuction = timeLeftMs > 0;
                      const m = Math.floor(timeLeftMs / 60000);
                      const s = Math.floor((timeLeftMs % 60000) / 1000);

                      return (
                        <div className="mt-4">
                          <div className="flex justify-between items-center mb-2 px-1">
                            <span className="text-xs font-semibold text-gray-500">내 보유 코인</span>
                            <span className="text-sm font-bold text-black">{userCoins.toLocaleString()} 코인</span>
                          </div>
                          {hasActiveAuction && (
                            <div className="flex justify-between items-center mb-3 px-1 text-red-600 bg-red-50 p-2 rounded border border-red-100">
                              <span className="text-xs font-bold flex items-center gap-1">
                                <span className="animate-pulse">⏳</span> 남은 시간
                              </span>
                              <span className="text-sm font-bold">
                                {m}분 {s.toString().padStart(2, '0')}초
                              </span>
                            </div>
                          )}
                          <button onClick={() => setBidStep('input')} className="w-full bg-black text-white font-bold py-3 rounded-lg hover:bg-gray-800 transition">
                            입찰가 입력하기
                          </button>
                        </div>
                      );
                    })()}
                    
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
                      <div className="mt-4">
                        <div className="flex justify-between items-center mb-2 px-1">
                          <span className="text-xs font-semibold text-gray-500">내 보유 코인</span>
                          <span className="text-sm font-bold text-black">{userCoins.toLocaleString()} 코인</span>
                        </div>
                        <button 
                          onClick={async () => {
                            if (userCoins >= currentArtwork.price) {
                              const token = localStorage.getItem('token');
                              if (token) {
                                try {
                                  await fetch('/api/user/coins', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                    body: JSON.stringify({ 
                                      amount: currentArtwork.price, 
                                      action: 'subtract',
                                      artworkId: currentArtwork.id,
                                      artworkTitle: currentArtwork.title,
                                      artworkSrc: currentArtwork.src,
                                      type: 'buy'
                                    })
                                  });
                                } catch (err) {
                                  console.error(err);
                                }
                              }
                              setMyTransactions(prev => [{
                                id: Date.now(),
                                artwork_id: currentArtwork.id,
                                artwork_title: currentArtwork.title,
                                artwork_src: currentArtwork.src,
                                amount: currentArtwork.price,
                                type: 'buy',
                                auction_end_time: null
                              }, ...prev]);
                              setUserCoins(prev => prev - currentArtwork.price);
                              alert('구매가 완료되었습니다.');
                              setBidStep('complete');
                            } else {
                              alert('보유하신 코인이 부족하십니다.');
                            }
                          }}
                          className="w-full bg-black text-white font-bold py-3 rounded-lg hover:bg-gray-800 transition"
                        >
                          ₩{currentArtwork.price.toLocaleString()} 구매하기
                        </button>
                      </div>
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
            className="absolute bottom-24 left-8 z-40 bg-white/95 backdrop-blur-md p-6 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.4)] w-80 border border-gray-100"
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
            <div className="absolute -bottom-3 left-8 w-6 h-6 bg-white/95 rotate-45 border-r border-b border-gray-100"></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 좌측 하단 도슨트 버튼 */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.5, duration: 0.8, type: 'spring' }}
        onClick={() => setIsDocentOpen(!isDocentOpen)}
        className="absolute bottom-8 left-8 z-50 cursor-pointer hover:scale-110 transition-transform bg-white/90 backdrop-blur rounded-full px-5 py-3 shadow-[0_5px_15px_rgba(0,0,0,0.3)] flex items-center justify-center gap-2 group"
      >
        <img src="/mascot.png" alt="Docent Mascot" className="w-8 h-8 object-contain drop-shadow-md" />
      </motion.div>

      {/* 프로필 사이드바 */}
      <AnimatePresence>
        {isProfileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeProfile}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[150]"
            />
            <AnimatePresence>
              {profileView && (
                <motion.div
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="fixed top-0 right-80 h-full w-96 bg-gray-50 shadow-[-10px_0_30px_rgba(0,0,0,0.1)] z-[190] border-l border-gray-200 flex flex-col"
                >
                  <div className="p-6 border-b flex justify-between items-center bg-white shadow-sm z-10">
                    <h2 className="text-xl font-bold">
                      {profileView === 'edit' && '프로필 수정'}
                      {profileView === 'liked' && '찜한 작품 목록'}
                      {profileView === 'history' && '구매 및 경매 현황'}
                      {profileView === 'sell' && '예술가 되기 (작품 등록)'}
                      {profileView === 'charge' && '코인 충전'}
                    </h2>
                    <button onClick={() => setProfileView(null)} className="text-gray-500 hover:text-black">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    </button>
                  </div>
                  <div className="p-6 flex-1 overflow-y-auto">
                    {profileView === 'edit' && (
                      <div className="space-y-4">
                        <div className="flex flex-col items-center mb-6">
                          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-md border overflow-hidden mb-4">
                            <img src={profileImage} alt="Profile" className="w-full h-full object-contain p-1" />
                          </div>
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            ref={profileImageInputRef}
                            onChange={handleProfileImageChange}
                          />
                          <button onClick={() => profileImageInputRef.current?.click()} className="px-4 py-2 bg-black text-white text-sm font-bold rounded-lg hover:bg-gray-800 transition">사진 변경</button>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">이름</label>
                          <input 
                            type="text" 
                            value={editNameInput} 
                            onChange={(e) => setEditNameInput(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:border-black focus:ring-1 focus:ring-black outline-none" 
                          />
                        </div>
                        <button onClick={handleProfileSave} className="w-full mt-4 py-3 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition">저장하기</button>
                      </div>
                    )}
                    
                    {profileView === 'liked' && (
                      <div className="space-y-4">
                        {Object.keys(liked).filter(id => liked[Number(id)]).length > 0 ? (
                          Object.keys(liked).filter(id => liked[Number(id)]).map(id => {
                            const art = artworks.find(a => a.id === Number(id));
                            if (!art) return null;
                            return (
                              <div key={id} className="flex gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                                <img src={art.src} className="w-16 h-16 object-cover rounded-lg" />
                                <div>
                                  <p className="font-bold">{art.title}</p>
                                  <p className="text-xs text-gray-500">{art.artist}</p>
                                  <p className="text-sm font-bold mt-1 text-black">₩{art.price.toLocaleString()}</p>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-center py-10 text-gray-500">찜한 작품이 없습니다.</div>
                        )}
                      </div>
                    )}

                    {profileView === 'sell' && (
                      <div className="space-y-4">
                        <div className="bg-blue-50 p-4 rounded-lg text-blue-800 text-sm mb-4">
                          작품을 등록하고 나만의 갤러리를 시작해보세요.
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">작품 제목</label>
                          <input 
                            type="text" 
                            placeholder="작품명 입력" 
                            value={sellTitle}
                            onChange={(e) => setSellTitle(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:border-black outline-none" 
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">판매 방식</label>
                          <div className="flex gap-4 mb-2 mt-2">
                            <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700">
                              <input type="radio" name="sellType" checked={sellType === 'sale'} onChange={() => setSellType('sale')} className="accent-black" /> 
                              일반 구매
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700">
                              <input type="radio" name="sellType" checked={sellType === 'auction'} onChange={() => setSellType('auction')} className="accent-black" /> 
                              경매
                            </label>
                          </div>
                          {sellType === 'auction' && (
                            <p className="text-xs text-red-600 font-bold bg-red-50 p-2 rounded border border-red-100 mt-2">
                              본 거래 방식은 10분을 간격으로 더 큰 호가가 없을 경우 낙찰로 판단 되게 됩니다.
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">
                            {sellType === 'auction' ? '경매 시작가 (코인)' : '판매 가격 (코인)'}
                          </label>
                          <input 
                            type="number" 
                            placeholder="예: 500000" 
                            value={sellPrice}
                            onChange={(e) => setSellPrice(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:border-black outline-none" 
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">작품 사진 업로드</label>
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            ref={sellImageInputRef}
                            onChange={handleSellImageChange}
                          />
                          <div 
                            onClick={() => sellImageInputRef.current?.click()}
                            className="border-2 border-dashed border-gray-300 rounded-lg p-2 flex flex-col items-center justify-center text-gray-500 cursor-pointer hover:bg-gray-50 transition min-h-[160px]"
                          >
                            {sellImage ? (
                              <img src={sellImage} alt="Preview" className="w-full h-32 object-contain rounded" />
                            ) : (
                              <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                                <span>클릭하여 사진 선택</span>
                              </>
                            )}
                          </div>
                        </div>
                        <button onClick={handleSellSubmit} className="w-full mt-4 py-3 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition">작품 등록 신청</button>
                      </div>
                    )}
                    
                    {profileView === 'history' && (
                      <div className="space-y-4">
                        {myTransactions.length > 0 ? (
                          myTransactions.map(tx => {
                            const isAuction = tx.type === 'bid';
                            let timeLeftStr = '';
                            if (isAuction && tx.auction_end_time) {
                              const timeLeftMs = Number(tx.auction_end_time) - currentTime;
                              if (timeLeftMs > 0) {
                                const m = Math.floor(timeLeftMs / 60000);
                                const s = Math.floor((timeLeftMs % 60000) / 1000);
                                timeLeftStr = `남은 시간: ${m}분 ${s.toString().padStart(2, '0')}초`;
                              } else {
                                timeLeftStr = '경매 종료';
                              }
                            }
                            return (
                              <div key={tx.id} className="flex gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                                <img src={tx.artwork_src} className="w-16 h-16 object-cover rounded-lg" />
                                <div className="flex-1">
                                  <div className="flex justify-between items-start">
                                    <p className="font-bold text-gray-900">{tx.artwork_title}</p>
                                    <span className={`text-xs font-bold px-2 py-1 rounded ${isAuction ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                      {isAuction ? '경매 입찰' : '일반 구매'}
                                    </span>
                                  </div>
                                  <p className="text-sm font-bold mt-1 text-black">
                                    {isAuction ? '입찰가:' : '구매가:'} ₩{tx.amount.toLocaleString()}
                                  </p>
                                  {isAuction && (
                                    <p className="text-xs font-bold text-red-500 mt-1">{timeLeftStr}</p>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-center py-10 text-gray-500">
                            구매 및 경매 내역이 없습니다.
                          </div>
                        )}
                      </div>
                    )}

                    {profileView === 'charge' && (
                      <div className="space-y-4">
                        <div className="bg-gray-100 border border-gray-200 p-4 rounded-lg text-gray-800 text-sm mb-4 leading-relaxed font-medium">
                          현금을 코인으로 환전하여 작품을 즉시 구매하거나 경매에 참여해보세요. (1원 = 1코인)
                        </div>
                        <div className="p-5 bg-white border border-gray-300 rounded-lg text-center mb-6 shadow-sm">
                          <p className="text-sm text-gray-500 mb-1 font-semibold">현재 보유 코인</p>
                          <p className="text-3xl font-bold text-black">{userCoins.toLocaleString()} <span className="text-lg text-gray-600 font-medium">코인</span></p>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">충전할 금액 (₩)</label>
                          <input 
                            type="number" 
                            placeholder="예: 50000" 
                            value={chargeAmount}
                            onChange={(e) => setChargeAmount(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:border-black outline-none transition" 
                          />
                        </div>
                        <div className="flex gap-2 mb-4">
                          {[10000, 50000, 100000, 1000000].map(amt => (
                            <button 
                              key={amt}
                              onClick={() => setChargeAmount(prev => (Number(prev) + amt).toString())}
                              className="flex-1 py-2 bg-white text-xs font-bold text-gray-700 border border-gray-300 rounded hover:bg-gray-50 hover:border-gray-400 transition whitespace-nowrap"
                            >
                              +{amt.toLocaleString()}
                            </button>
                          ))}
                        </div>
                        <button 
                          onClick={async () => {
                            if (!chargeAmount || Number(chargeAmount) <= 0) {
                              alert('충전할 금액을 입력해주세요.');
                              return;
                            }
                            try {
                              const tossPayments = await loadTossPayments('test_ck_vZnjEJeQVxKNDwX6LRp93PmOoBN0');
                              const amount = Number(chargeAmount);
                              const orderId = 'ORDER-' + Date.now() + Math.random().toString(36).substring(2, 7);
                              
                              await tossPayments.requestPayment('토스결제', {
                                amount,
                                orderId,
                                orderName: '아트마트 코인 충전',
                                customerName: profileName,
                                successUrl: window.location.origin + '/payments/success?amount=' + amount,
                                failUrl: window.location.origin + '/payments/fail',
                              });
                            } catch (err: any) {
                              if (err.code !== 'USER_CANCEL') {
                                alert(`결제 연동 중 오류가 발생했습니다: ${err.message || err.code || err}`);
                                console.error('Toss Payments Error:', err);
                              }
                            }
                          }} 
                          className="w-full mt-4 py-3 bg-[#3182f6] text-white font-bold rounded-lg hover:bg-blue-600 transition shadow-sm"
                        >
                          토스페이먼츠로 충전하기
                        </button>
                      </div>
                    )}

                    {profileView === 'my_art' && (
                      <div className="space-y-4">
                        {myArtworks.length > 0 ? (
                          myArtworks.map(art => (
                            <div key={art.id} className="flex gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                              <img src={art.src} className="w-16 h-16 object-cover rounded-lg" />
                              <div className="flex-1">
                                <p className="font-bold">{art.title}</p>
                                <p className="text-sm font-bold mt-1 text-black">희망가: ₩{art.price.toLocaleString()}</p>
                                <div className="mt-2 inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded">
                                  {art.status === 'pending' ? '승인 대기중' : '등록 완료'}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-10 text-gray-500">등록한 작품이 없습니다.</div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-[200] flex flex-col"
            >
              <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                <h2 className="text-xl font-bold">내 프로필</h2>
                <button onClick={closeProfile} className="text-gray-500 hover:text-black transition">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
              </div>
              
              <div className="p-6 flex-1 overflow-y-auto space-y-8">
                {/* 프로필 정보 */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-200 overflow-hidden">
                    <img src={profileImage} alt="Profile" className="w-full h-full object-contain p-1 drop-shadow-sm" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{profileName}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm font-bold text-black">{userCoins.toLocaleString()} 코인</span>
                      <button onClick={() => setProfileView('edit')} className="text-xs text-gray-500 font-semibold hover:text-black hover:underline transition">프로필 수정</button>
                    </div>
                  </div>
                </div>

                {/* 메뉴 리스트 */}
                <div className="space-y-2">
                  <button onClick={() => setProfileView('liked')} className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors font-medium text-gray-700 flex items-center justify-between">
                    <span>찜한 작품 목록</span>
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">{Object.values(liked).filter(Boolean).length}</span>
                  </button>
                  <button onClick={() => setProfileView('my_art')} className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors font-medium text-gray-700 flex items-center justify-between">
                    <span>내 예술품 보기</span>
                    {myArtworks.length > 0 && <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">{myArtworks.length}</span>}
                  </button>
                  <button onClick={() => setProfileView('charge')} className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors font-medium text-gray-700 flex items-center justify-between">
                    <span>코인 충전하기</span>
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-bold">충전</span>
                  </button>
                  <button onClick={() => setProfileView('history')} className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors font-medium text-gray-700">
                    구매내역 및 경매 현황
                  </button>
                  <button onClick={() => setProfileView('sell')} className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors font-medium text-gray-700">
                    예술가 되기 (미술품 판매)
                  </button>
                </div>
              </div>

              <div className="p-6 border-t">
                <button 
                  onClick={() => {
                    localStorage.removeItem('token');
                    window.location.href = '/';
                  }}
                  className="w-full py-3 bg-gray-100 text-red-600 font-bold rounded-lg hover:bg-red-50 transition-colors"
                >
                  로그아웃
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
