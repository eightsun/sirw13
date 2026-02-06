'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/helpers';

interface NavItem {
  label: string;
  href: string;
}

interface NavbarProps {
  user?: {
    email?: string;
    role?: string;
    rtInfo?: string;
  };
}

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Data Warga', href: '/dashboard/warga' },
    { label: 'Data KK', href: '/dashboard/kk' },
    { label: 'Data Rumah', href: '/dashboard/rumah' },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center">
              <h1 className="text-xl font-bold text-primary-900">SIRW13</h1>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  pathname === item.href
                    ? 'bg-primary-100 text-primary-900'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* User Info & Logout */}
          <div className="flex items-center gap-4">
            {user && (
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-gray-900">{user.email}</p>
                <p className="text-xs text-gray-600">{user.role}</p>
              </div>
            )}
            <form action="/auth/logout" method="post">
              <button
                type="submit"
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Keluar
              </button>
            </form>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-3 pt-2 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'block px-3 py-2 rounded-md text-base font-medium',
                pathname === item.href
                  ? 'bg-primary-100 text-primary-900'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
