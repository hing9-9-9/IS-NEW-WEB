'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Bell,
  Briefcase,
  Users,
  UserCog,
  FlaskConical,
  Settings,
  Menu,
  X,
  TrendingUp,
  Image,
  Calendar,
  GraduationCap,
  LogOut,
  Heart,
  ExternalLink,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { authApi } from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const menuItems = [
  { label: '대시보드', href: '/admin', icon: LayoutDashboard },
  { label: '공지사항', href: '/admin/notices', icon: Bell },
  { label: '취업정보', href: '/admin/jobs', icon: Briefcase },
  { label: '교수진', href: '/admin/faculty', icon: Users },
  { label: '행정직원', href: '/admin/staff', icon: UserCog },
  { label: '연구실', href: '/admin/labs', icon: FlaskConical },
  { label: '졸업후 진로', href: '/admin/careers', icon: TrendingUp },
  { label: '히어로 슬라이드', href: '/admin/hero-slides', icon: Image },
  { label: '학사 일정', href: '/admin/academic', icon: Calendar },
  { label: '졸업요건', href: '/admin/requirements', icon: GraduationCap },
  { label: '학생회', href: '/admin/student-council', icon: Heart },
  { label: '설정', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (isLoginPage) {
      setAuthChecked(true);
      return;
    }

    const checkSession = async () => {
      try {
        const session = await authApi.checkSession();
        if (session.isLoggedIn) {
          setIsLoggedIn(true);
        } else {
          router.replace('/admin/login');
        }
      } catch {
        router.replace('/admin/login');
      } finally {
        setAuthChecked(true);
      }
    };

    checkSession();
  }, [pathname, isLoginPage, router]);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    }
    router.push('/admin/login');
  };

  // Login page: render without sidebar
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Wait for auth check
  if (!authChecked || !isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-[#0a2d5e] text-white transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-4 border-b border-white/10">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="text-xl font-bold">IS-WEB Admin</span>
          </Link>
          <button
            className="lg:hidden absolute top-4 right-4"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <nav className="p-4 overflow-y-auto h-[calc(100vh-72px)]">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== '/admin' && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                      ${isActive
                        ? 'bg-white/20 text-white'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                      }
                    `}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}

            <li className="pt-2 border-t border-white/10">
              <Link
                href="/"
                className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-white/70 hover:bg-white/10 hover:text-white"
              >
                <ExternalLink size={20} />
                <span>사이트로 돌아가기</span>
              </Link>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors w-full text-left text-red-300 hover:bg-red-500/20 hover:text-red-100"
              >
                <LogOut size={20} />
                <span>로그아웃</span>
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div className="flex-1 lg:flex-none" />
            <div className="text-sm text-gray-500">
              관리자
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
