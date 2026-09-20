'use client';
import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function PaymentFailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get('message') || '결제가 취소되었거나 실패했습니다.';

  useEffect(() => {
    setTimeout(() => router.push('/gallery'), 3000);
  }, [router]);

  return (
    <>
      <h1 className="text-2xl font-bold mb-2 text-red-600">결제 실패</h1>
      <p className="text-gray-700">{message}</p>
      <p className="text-sm text-gray-500 mt-4">잠시 후 갤러리로 이동합니다...</p>
    </>
  );
}

export default function PaymentFailPage() {
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-50">
      <Suspense fallback={<div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>}>
        <PaymentFailContent />
      </Suspense>
    </div>
  );
}
