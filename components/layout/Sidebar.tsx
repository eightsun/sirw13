'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon, 
  UsersIcon, 
  BuildingOfficeIcon,
  UserGroupIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

interface SidebarProps {
  isOpen: boolean;
}

export function Sidebar({ isOpen }: SidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    { 
      name: 'Dashboard', 
      href: '/dashboard', 
      icon: HomeIcon 
    },
    { 
      name: 'Data Warga', 
      href: '/dashboard/warga', 
      icon: UsersIcon 
    },
    { 
      name: 'Data KK', 
      href: '/dashboard/kk', 
      icon: UserGroupIcon 
    },
    { 
      name: 'Data Rumah', 
      href: '/dashboard/rumah', 
      icon: BuildingOfficeIcon 
    },
    { 
      name: 'Pengaturan', 
      href: '/dashboard/settings', 
      icon: Cog6ToothIcon 
    },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-screen transition-transform
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        <div className="h-full w-64 bg-white border-r border-gray-200 flex flex-col">
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">RW</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">SIRW13</h1>
                <p className="text-xs text-gray-500">Permata Discovery</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-3">
            <ul className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-lg
                        transition-colors duration-150
                        ${active 
                          ? 'bg-purple-50 text-purple-600 font-medium' 
                          : 'text-gray-700 hover:bg-gray-50'
                        }
                      `}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="bg-purple-50 rounded-lg p-3">
              <p className="text-xs font-medium text-purple-900 mb-1">
                💡 Butuh Bantuan?
              </p>
              <p className="text-xs text-purple-700">
                Hubungi admin untuk dukungan teknis
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
