'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('결제를 승인하는 중입니다...');

  useEffect(() => {
    const paymentKey = searchParams.get('paymentKey');
    const orderId = searchParams.get('orderId');
    const amount = searchParams.get('amount');

    if (!paymentKey || !orderId || !amount) {
      setStatus('잘못된 접근입니다.');
      setTimeout(() => router.push('/gallery'), 2000);
      return;
    }

    const verifyPayment = async () => {
      try {
        const res = await fetch('/api/payments/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentKey, orderId, amount: Number(amount) })
        });
        const data = await res.json();
        
        if (res.ok) {
          setStatus('결제가 완료되었습니다. 갤러리로 이동합니다.');
          setTimeout(() => router.push(`/gallery?charge_success=${amount}`), 2000);
        } else {
          setStatus('결제 승인에 실패했습니다: ' + (data.error || '알 수 없는 오류'));
          setTimeout(() => router.push('/gallery'), 3000);
        }
      } catch (err) {
        setStatus('결제 서버 통신 오류가 발생했습니다.');
        setTimeout(() => router.push('/gallery'), 3000);
      }
    };
    verifyPayment();
  }, [router, searchParams]);

  return (
    <>
      <h1 className="text-2xl font-bold mb-4">{status}</h1>
      <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
    </>
  );
}

export default function PaymentSuccessPage() {
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-50">
      <Suspense fallback={<div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>}>
        <PaymentSuccessContent />
      </Suspense>
    </div>
  );
}
