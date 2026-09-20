'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

const navItems = [
  { href: '/admin', label: '대시보드', icon: '📊' },
  { href: '/admin/artworks', label: '작품 검수', icon: '🖼️' },
  { href: '/admin/auctions', label: '경매 모니터링', icon: '🔨' },
  { href: '/admin/users', label: '회원 관리', icon: '👥' },
  { href: '/admin/logs', label: '감사 로그', icon: '📋' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // F12 및 우클릭 방지
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && ['I','J','C','U'].includes(e.key)) || (e.ctrlKey && e.key === 'U')) {
        e.preventDefault();
        return false;
      }
    };
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);
    // 개발자 도구 감지
    const devCheck = setInterval(() => {
      const threshold = 160;
      if (window.outerWidth - window.innerWidth > threshold || window.outerHeight - window.innerHeight > threshold) {
        document.title = '⚠️ 접근 차단';
      } else {
        document.title = 'ArtMart Admin';
      }
    }, 1000);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
      clearInterval(devCheck);
    };
  }, []);

  const handleLogout = async () => {
    await fetch('/api/admin/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  if (pathname === '/admin/login') return <>{children}</>;

  return (
    <div className="min-h-screen bg-gray-950 flex select-none">
      {/* 사이드바 */}
      <aside className="w-60 bg-gray-900 border-r border-gray-800 flex flex-col">
        {/* 로고 */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-white rounded-sm flex items-center justify-center">
              <span className="text-black font-black text-xs">A</span>
            </div>
            <div>
              <p className="text-white font-bold text-sm tracking-wider">ARTMART</p>
              <p className="text-gray-500 text-xs">Admin Console</p>
            </div>
          </div>
        </div>

        {/* 네비게이션 */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* 하단 */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition"
          >
            <span>🚪</span> 로그아웃
          </button>
        </div>
      </aside>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 overflow-auto bg-gray-950">
        {children}
      </main>
    </div>
  );
}
