'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

const navItems = [
  { href: '/admin', label: '대시보드', icon: '◈' },
  { href: '/admin/items', label: '상품 보기', icon: '▤' },
  { href: '/admin/artworks', label: '전체 작품 관리', icon: '◻' },
  { href: '/admin/auctions', label: '경매 모니터링', icon: '◇' },
  { href: '/admin/users', label: '회원 관리', icon: '○' },
  { href: '/admin/logs', label: '감사 로그', icon: '≡' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (pathname === '/admin/login') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key)) ||
        (e.ctrlKey && e.key === 'U')
      ) {
        e.preventDefault();
      }
    };
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [pathname]);

  const handleLogout = async () => {
    await fetch('/api/admin/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  if (pathname === '/admin/login') return <>{children}</>;

  return (
    <div className="min-h-screen flex select-none" style={{ backgroundColor: '#c8a694' }}>
      {/* 배경 */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse at 50% -20%, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.1) 50%, rgba(0,0,0,0.2) 100%)'
        }}
      />

      {/* 사이드바 */}
      <aside
        className="relative z-10 w-56 flex flex-col"
        style={{
          background: 'rgba(26,16,8,0.85)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(255,255,255,0.08)'
        }}
      >
        {/* 로고 */}
        <div className="px-6 py-8 border-b border-white/5">
          <p className="text-[#c8a694]/50 text-[10px] tracking-[0.4em] uppercase mb-1">ArtMart</p>
          <p className="text-[#f5ede6] text-lg font-light tracking-[0.2em] uppercase">Admin</p>
        </div>

        {/* 네비게이션 */}
        <nav className="flex-1 px-3 py-6 space-y-1">
          {navItems.map(item => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all"
                style={{
                  background: isActive ? 'rgba(200,166,148,0.15)' : 'transparent',
                  color: isActive ? '#f5ede6' : 'rgba(245,237,230,0.4)',
                  borderLeft: isActive ? '2px solid #c8a694' : '2px solid transparent'
                }}
              >
                <span className="text-base">{item.icon}</span>
                <span className="font-medium tracking-wide">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* 로그아웃 */}
        <div className="px-3 py-6 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all"
            style={{ color: 'rgba(245,237,230,0.3)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(245,237,230,0.7)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(245,237,230,0.3)')}
          >
            <span>←</span>
            <span>로그아웃</span>
          </button>
        </div>
      </aside>

      {/* 메인 */}
      <main className="relative z-10 flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
