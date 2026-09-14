'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function MuseumLobby() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isReturningUser, setIsReturningUser] = useState(false);
  const [mode, setMode] = useState<'LOGIN' | 'LOGIN_OTP' | 'SIGNUP' | 'SIGNUP_OTP_QR'>('LOGIN');
  
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

  // OTP States
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [tempToken, setTempToken] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [otpToken, setOtpToken] = useState('');

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
        if (data.requireOtp) {
          setLoginEmail(email);
          setMode('LOGIN_OTP');
          return;
        }
        // Admin bypass
        localStorage.setItem('token', data.token);
        setIsAuthenticated(true);
        setTimeout(() => {
          router.push(data.role === 'ADMIN' ? '/admin' : '/gallery');
        }, 1500);
      } else {
        alert(data.error || '로그인 실패');
      }
    } catch (err) {
      console.error(err);
      alert('서버 에러가 발생했습니다.');
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/verify-login-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, otpToken })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        setIsAuthenticated(true);
        setTimeout(() => { router.push(data.role === 'ADMIN' ? '/admin' : '/gallery'); }, 1500);
      } else {
        alert(data.error || 'OTP 인증 실패');
      }
    } catch (err) {
      console.error(err);
      alert('서버 에러가 발생했습니다.');
    }
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
        setTempToken(data.token);
        setQrCodeUrl(data.qrCodeUrl);
        alert('회원가입이 거의 완료되었습니다! 마지막으로 OTP를 등록해주세요.');
        setMode('SIGNUP_OTP_QR');
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
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-1/2 h-full bg-[#1a1a1a] border-r border-gray-800 shadow-2xl flex items-center justify-end z-10"
        >
          <div className="w-4 h-32 bg-gray-600 rounded-l-md mr-2"></div>
        </motion.div>
        
        <motion.div
          animate={isAuthenticated ? { x: '100%' } : { x: 0 }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-1/2 h-full bg-[#1a1a1a] border-l border-gray-800 shadow-2xl flex items-center justify-start z-10"
        >
          <div className="w-4 h-32 bg-gray-600 rounded-r-md ml-2"></div>
        </motion.div>
        <div className="absolute inset-0 bg-white flex flex-col items-center justify-center">
          <h2 className="text-4xl font-light text-gray-800 tracking-widest">ARTMART GALLERY</h2>
        </div>
      </div>

      <div className="w-[35%] h-full bg-gray-100 flex items-center justify-center p-8 z-20 shadow-[-10px_0_30px_rgba(0,0,0,0.5)] overflow-y-auto">
        <AnimatePresence mode="wait">
          {!isAuthenticated && (
            <motion.div
              key={mode}
              initial={{ scale: 0.9, opacity: 0, x: 20 }}
              animate={{ scale: 1, opacity: 1, x: 0 }}
              exit={{ scale: 0.9, opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8 my-auto"
            >
              {mode === 'LOGIN' && (
                <>
                  <h2 className="text-2xl font-bold mb-8 text-center text-gray-900">도슨트 키오스크</h2>
                  <form onSubmit={handleLoginSubmit} className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700">이메일</label>
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 w-full border-b-2 border-gray-200 focus:border-black outline-none py-2 transition-colors text-black" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700">비밀번호</label>
                      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 w-full border-b-2 border-gray-200 focus:border-black outline-none py-2 transition-colors text-black" />
                    </div>
                    <button type="submit" className="w-full py-4 mt-4 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition-colors">
                      로그인 진행
                    </button>
                  </form>
                  <div className="mt-6 text-center">
                    <button onClick={() => setMode('SIGNUP')} className="text-sm text-gray-500 hover:text-black font-semibold transition-colors">
                      처음 오셨나요? 회원가입하기
                    </button>
                  </div>
                </>
              )}

              {mode === 'LOGIN_OTP' && (
                <motion.div
                  key="login_otp"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="w-full max-w-sm"
                >
                  <div className="mb-8">
                    <button onClick={() => setMode('LOGIN')} className="text-gray-400 hover:text-black mb-4 flex items-center transition-colors">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                      뒤로가기
                    </button>
                    <h2 className="text-2xl font-bold mb-2 text-gray-900">2단계 인증</h2>
                    <p className="text-sm text-gray-500">Google Authenticator 앱의 6자리 코드를 입력해주세요.</p>
                  </div>
                  
                  <form onSubmit={handleOtpSubmit} className="space-y-6">
                    <div>
                      <input 
                        type="text" 
                        maxLength={6} 
                        value={otpToken}
                        onChange={(e) => setOtpToken(e.target.value)}
                        placeholder="000000" 
                        required 
                        className="w-full text-center text-3xl tracking-[0.5em] border-b-2 border-gray-200 focus:border-black outline-none py-2 transition-colors text-black" 
                      />
                    </div>
                    <button type="submit" className="w-full py-3 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition-colors">
                      인증 완료
                    </button>
                  </form>
                </motion.div>
              )}

              {mode === 'SIGNUP_OTP_QR' && (
                <motion.div
                  key="signup_otp_qr"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="w-full max-w-sm flex flex-col items-center"
                >
                  <h2 className="text-2xl font-bold mb-2 text-gray-900 text-center">Google OTP 등록</h2>
                  <p className="text-sm text-gray-500 mb-6 text-center">보안을 위해 <b>Google Authenticator</b> 앱을 열고 아래 QR 코드를 스캔해주세요.</p>
                  
                  <div className="bg-white p-4 rounded-xl shadow-md border mb-8">
                    {qrCodeUrl && <img src={qrCodeUrl} alt="OTP QR Code" className="w-48 h-48" />}
                  </div>

                  <button 
                    onClick={() => {
                      localStorage.setItem('token', tempToken);
                      setIsAuthenticated(true);
                      setTimeout(() => { router.push('/gallery'); }, 1500);
                    }}
                    className="w-full py-3 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    스캔 완료 (갤러리 입장)
                  </button>
                </motion.div>
              )}

              {mode === 'SIGNUP' && (
                <>
                  <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">새로운 관람객 등록</h2>
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
                  <div className="mt-4 text-center">
                    <button onClick={() => setMode('LOGIN')} className="text-sm text-gray-500 hover:text-black font-semibold transition-colors">
                      이미 계정이 있으신가요? 로그인
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
