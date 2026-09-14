'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function MuseumLobby() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isReturningUser, setIsReturningUser] = useState(false);
  const [mode, setMode] = useState<'LOGIN' | 'LOGIN_OTP' | 'SIGNUP'>('LOGIN');
  
  const router = useRouter();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [height, setHeight] = useState('');
  const [userRole, setUserRole] = useState('BUYER');

  // Email Verification States
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [verifyCode, setVerifyCode] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsReturningUser(true);
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setIsReturningUser(false);
    setMode('LOGIN');
    // Reset all states
    setEmail(''); setPassword(''); setName(''); setHeight('');
    setIsEmailVerified(false); setIsEmailSent(false); setVerifyCode('');
  };

  const handleSendVerification = async () => {
    if (!email) {
      alert('이메일을 먼저 입력해주세요.');
      return;
    }
    setIsSendingEmail(true);
    try {
      const res = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        setIsEmailSent(true);
      } else {
        alert(data.error || '메일 발송 실패');
      }
    } catch (err) {
      console.error(err);
      alert('서버 에러가 발생했습니다.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verifyCode) return;
    try {
      const res = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: verifyCode })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        setIsEmailVerified(true);
      } else {
        alert(data.error || '인증 실패');
      }
    } catch (err) {
      console.error(err);
      alert('서버 에러가 발생했습니다.');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if (res.ok) {
        // Save token & role temporarily (in real app, save after OTP)
        localStorage.setItem('token', data.token);
        setUserRole(data.user.role);
        setMode('LOGIN_OTP'); // Proceed to OTP
      } else {
        alert(data.error || '로그인 실패');
      }
    } catch (err) {
      console.error(err);
      alert('서버 오류가 발생했습니다.');
    }
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticated(true);
    // Role에 따라 어드민 대시보드 혹은 일반 갤러리로 이동
    setTimeout(() => { 
      if (userRole === 'ADMIN') {
        router.push('/admin'); // 어드민 페이지로 이동 (향후 생성)
      } else {
        router.push('/gallery'); 
      }
    }, 1500);
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEmailVerified) {
      alert('이메일 인증을 먼저 완료해주세요.');
      return;
    }

    // 비밀번호 유효성 검사 (8자 이상, 특수문자 포함)
    const passwordRegex = /^(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!password || !passwordRegex.test(password)) {
      alert('비밀번호는 8글자 이상이어야 하며, 특수문자를 최소 1개 이상 포함해야 합니다.');
      return;
    }

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          name,
          height_cm: parseFloat(height)
        })
      });
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem('token', data.token);
        alert('회원가입이 완료되었습니다!');
        setIsAuthenticated(true);
        setTimeout(() => { router.push('/gallery'); }, 1500);
      } else {
        alert(data.error || '회원가입 실패');
      }
    } catch (err) {
      console.error(err);
      alert('서버 에러가 발생했습니다.');
    }
  };

  if (isReturningUser) {
    return (
      <div className="relative w-full h-screen bg-gray-50 flex flex-col items-center justify-center">
        {/* 우측 상단 로그아웃 버튼 */}
        <button 
          onClick={handleLogout}
          className="absolute top-6 right-8 px-4 py-2 bg-black text-white text-sm font-bold rounded-full hover:bg-gray-800 transition-colors z-50 shadow-md"
        >
          로그아웃
        </button>

        <motion.div
          initial={{ y: '-100vh', opacity: 0, scale: 0.8 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ type: 'spring', bounce: 0.6, duration: 1.2 }}
          className="flex flex-col items-center justify-center"
        >
          <div className="w-16 h-16 rounded-full bg-black mb-4 shadow-xl"></div>
          <h1 className="text-3xl font-bold tracking-tight text-black">다시 오셨군요, 갤러리에 착지했습니다.</h1>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative flex w-full h-screen overflow-hidden bg-black font-sans">
      
      {/* 갤러리 메인 진입 후(문 열림 상태) 보여줄 로그아웃 버튼 */}
      {isAuthenticated && !isReturningUser && (
        <button 
          onClick={handleLogout}
          className="absolute top-6 right-8 px-4 py-2 bg-black text-white text-sm font-bold rounded-full hover:bg-gray-800 transition-colors z-50 shadow-md"
        >
          로그아웃
        </button>
      )}
      <div className="relative w-[65%] h-full flex">
        <motion.div
          animate={isAuthenticated ? { x: '-100%' } : { x: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 bg-white shadow-2xl flex flex-col items-center justify-center z-20 origin-left"
        >
          <div className="w-3/4 max-w-md">
            <h1 className="text-6xl font-black mb-2 tracking-tighter text-black">ArtMart</h1>
            <p className="text-lg text-gray-500 font-medium mb-12 tracking-wide">예술품 위탁 판매의 새로운 기준</p>
            
            <div className="space-y-6">
              <AnimatePresence mode="wait">
                {mode === 'LOGIN' && (
                  <motion.form 
                    key="login"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    onSubmit={handleLoginSubmit}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-semibold text-gray-700">이메일</label>
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full border-b-2 border-gray-200 focus:border-black outline-none py-1 transition-colors text-black" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700">비밀번호</label>
                      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full border-b-2 border-gray-200 focus:border-black outline-none py-1 transition-colors text-black" />
                    </div>
                    <div className="pt-4 space-y-3">
                      <button type="submit" className="w-full py-3 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition-colors">
                        갤러리 입장
                      </button>
                      <button type="button" onClick={() => setMode('SIGNUP')} className="w-full py-3 bg-white text-black font-bold rounded-lg border-2 border-black hover:bg-gray-50 transition-colors">
                        새 관람객 등록 (발권)
                      </button>
                    </div>
                  </motion.form>
                )}

                {mode === 'LOGIN_OTP' && (
                  <motion.form 
                    key="otp"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    onSubmit={handleOtpSubmit}
                    className="space-y-4 text-center"
                  >
                    <p className="text-sm font-semibold text-gray-700 mb-4">보안을 위해 구글 OTP 6자리를 입력해주세요.</p>
                    <div className="flex justify-center gap-2 mb-6">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <input key={i} type="text" maxLength={1} className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-200 rounded-lg focus:border-black outline-none text-black" />
                      ))}
                    </div>
                    <button type="submit" className="w-full py-3 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition-colors">
                      인증 완료 및 입장
                    </button>
                  </motion.form>
                )}

                {mode === 'SIGNUP' && (
                  <motion.div 
                    key="signup"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <button type="button" onClick={() => setMode('LOGIN')} className="text-sm font-bold text-gray-500 hover:text-black mb-6 flex items-center gap-1 transition-colors">
                      ← 돌아가기
                    </button>
                    
                    <h2 className="text-2xl font-bold mb-6 text-gray-900">새로운 관람객 등록</h2>
                    <form onSubmit={handleSignupSubmit} className="space-y-4">
                      {/* 이름 */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700">이름</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full border-b-2 border-gray-200 focus:border-black outline-none py-1 transition-colors text-black" />
                      </div>

                      {/* 이메일 및 인증 */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700">이메일</label>
                        <div className="flex gap-2 mt-1">
                          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isEmailVerified} required className="flex-1 border-b-2 border-gray-200 focus:border-black outline-none py-1 transition-colors text-black disabled:bg-gray-50 disabled:text-gray-400" />
                          <button 
                            type="button" 
                            onClick={handleSendVerification}
                            disabled={isEmailVerified || isSendingEmail}
                            className="px-3 py-1 bg-gray-200 text-sm font-semibold rounded-md hover:bg-gray-300 text-black transition-colors disabled:opacity-50"
                          >
                            {isSendingEmail ? '발송중...' : isEmailSent ? '재전송' : '인증요청'}
                          </button>
                        </div>
                        {isEmailSent && !isEmailVerified && (
                          <div className="mt-2 flex gap-2">
                            <input type="text" value={verifyCode} onChange={(e) => setVerifyCode(e.target.value)} placeholder="인증번호 6자리" className="flex-1 text-sm border-b-2 border-green-400 focus:border-green-600 outline-none py-1 text-black" />
                            <button type="button" onClick={handleVerifyCode} className="px-3 py-1 bg-green-500 text-white text-sm font-bold rounded-md hover:bg-green-600 transition-colors">확인</button>
                          </div>
                        )}
                        {isEmailVerified && <p className="text-xs text-green-600 font-bold mt-1">✓ 이메일 인증이 완료되었습니다.</p>}
                      </div>

                      {/* 비밀번호 */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700">비밀번호</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full border-b-2 border-gray-200 focus:border-black outline-none py-1 transition-colors text-black" />
                      </div>

                      {/* 신장 복구 */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700">신장 (height_cm)</label>
                        <input type="number" step="0.1" value={height} onChange={(e) => setHeight(e.target.value)} required placeholder="예: 175.5" className="w-full border-b-2 border-gray-200 focus:border-black outline-none py-1 transition-colors text-black" />
                      </div>
                      
                      <div className="pt-4">
                        <button type="submit" disabled={!isEmailVerified} className="w-full py-3 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50">
                          회원가입 및 발권
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* 오른쪽 이미지 배경 (기존의 우측 패널 느낌) */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-[url('https://images.unsplash.com/photo-1577720580479-7d839d829c73?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center z-10 hidden md:block">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
        </div>
      </div>
    </div>
  );
}
