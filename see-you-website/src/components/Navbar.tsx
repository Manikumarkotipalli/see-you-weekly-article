'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BookOpen, Shield, LogOut } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { api } from '@/services/api';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    setIsAdmin(!!token);
  }, [pathname]);

  const handleLogout = () => {
    api.adminLogout();
    setIsAdmin(false);
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md transition-colors">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-slate-900 dark:text-white">
          <BookOpen className="text-emerald-600 dark:text-emerald-400" size={24} />
          <span>SeeYou<span className="text-emerald-600 dark:text-emerald-400">.Weekly</span></span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            href="/"
            className={`text-sm font-medium hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors ${
              pathname === '/' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            Articles
          </Link>
          <Link
            href="/about"
            className={`text-sm font-medium hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors ${
              pathname === '/about' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            About
          </Link>

          {isAdmin ? (
            <>
              <Link
                href="/admin"
                className={`text-sm font-medium flex items-center gap-1 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors ${
                  pathname.startsWith('/admin') && pathname !== '/admin/login' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                <Shield size={16} />
                Admin
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm font-medium flex items-center gap-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors cursor-pointer"
              >
                <LogOut size={16} />
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/admin/login"
              className={`text-sm font-medium hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors ${
                pathname === '/admin/login' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Sign In
            </Link>
          )}

          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
