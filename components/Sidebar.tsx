'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

interface SidebarProps {
  children: React.ReactNode;
}

export default function Sidebar({ children }: SidebarProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuthStore();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Users', href: '/users', icon: '👥' },
    { name: 'Products', href: '/products', icon: '📦' },
    { name: 'Orders', href: '/orders', icon: '🛒' },
    { name: 'Shops', href: '/shops', icon: '🏪' },
    { 
      name: 'Inventory', 
      icon: '💎',
      submenu: [
        { name: 'Warehouses', href: '/warehouses', icon: '🏢' },
        { name: 'Parcels', href: '/parcels', icon: '📦' },
      ]
    },
    { name: 'Settings', href: '/settings', icon: '⚙️' },
  ];

  const isActive = (path: string) => pathname === path;
  const isSubmenuActive = (submenu?: Array<{ href: string }>) => {
    return submenu?.some(item => pathname.startsWith(item.href)) || false;
  };

  const toggleSubmenu = (menuName: string) => {
    setExpandedMenu(expandedMenu === menuName ? null : menuName);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="h-screen overflow-hidden flex">
      {/* Mobile hamburger button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2 L21 10 L14 26 L7 10 Z" fill="#B6771D"/>
              <path d="M14 2 L17.5 10 L14 16 L10.5 10 Z" fill="#FF9D00"/>
              <path d="M14 16 L17.5 10 L21 10 L14 26 Z" fill="#FFCF71" opacity="0.8"/>
              <path d="M14 16 L10.5 10 L7 10 L14 26 Z" fill="#FFCF71" opacity="0.8"/>
            </svg>
            <h1 className="text-xl font-bold text-gray-900">GemHaven</h1>
          </Link>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-gray-600 hover:text-gray-900 focus:outline-none"
            suppressHydrationWarning
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isSidebarOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-screen transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:relative lg:z-0
          w-64 bg-linear-to-b from-primary-900 to-primary-800 shadow-lg flex flex-col text-white
        `}
      >
        {/* Logo - hidden on mobile (shown in header instead) */}
        <Link href="/" className="hidden lg:flex items-center justify-center h-16 border-b border-primary-700 shrink-0 space-x-2 hover:bg-primary-800 transition-colors">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 2 L24 11 L16 30 L8 11 Z" fill="#FF9D00"/>
            <path d="M16 2 L20 11 L16 20 L12 11 Z" fill="#FFCF71"/>
            <path d="M16 20 L20 11 L24 11 L16 30 Z" fill="#FFE5B4" opacity="0.8"/>
            <path d="M16 20 L12 11 L8 11 L16 30 Z" fill="#FFE5B4" opacity="0.8"/>
            <circle cx="16" cy="12" r="2" fill="white" opacity="0.6"/>
          </svg>
          <h1 className="text-2xl font-bold text-white">GemHaven</h1>
        </Link>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 py-5 space-y-1">
          {navigation.map((item) => (
            <div key={item.name}>
              {item.submenu ? (
                // Menu item with submenu
                <div>
                  <button
                    onClick={() => toggleSubmenu(item.name)}
                    className={`
                      w-full group flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors
                      ${
                        isSubmenuActive(item.submenu)
                          ? 'bg-primary-500 text-white shadow-md'
                          : 'text-primary-100 hover:bg-primary-800 hover:text-white'
                      }
                    `}
                  >
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{item.icon}</span>
                      {item.name}
                    </div>
                    <svg
                      className={`w-4 h-4 transition-transform ${
                        expandedMenu === item.name ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  {expandedMenu === item.name && (
                    <div className="ml-4 mt-1 space-y-1">
                      {item.submenu.map((subitem) => (
                        <Link
                          key={subitem.name}
                          href={subitem.href}
                          onClick={() => setIsSidebarOpen(false)}
                          className={`
                            group flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors
                            ${
                              isActive(subitem.href)
                                ? 'bg-primary-600 text-white'
                                : 'text-primary-100 hover:bg-primary-700 hover:text-white'
                            }
                          `}
                        >
                          <span className="text-lg mr-2">{subitem.icon}</span>
                          {subitem.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                // Regular menu item
                <Link
                  href={item.href!}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`
                    group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors
                    ${
                      isActive(item.href!)
                        ? 'bg-primary-500 text-white shadow-md'
                        : 'text-primary-100 hover:bg-primary-800 hover:text-white'
                    }
                  `}
                >
                  <span className="text-2xl mr-3">{item.icon}</span>
                  {item.name}
                </Link>
              )}
            </div>
          ))}

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="w-full group flex items-center px-4 py-3 text-sm font-medium rounded-lg text-red-300 hover:bg-red-900/30 transition-colors mt-8"
            suppressHydrationWarning
          >
            <span className="text-2xl mr-3">🚪</span>
            Logout
          </button>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile header spacer */}
        <div className="lg:hidden h-16 shrink-0" />
        
        {/* Content - scrollable area */}
        <main className="flex-1 overflow-y-auto bg-linear-to-br from-primary-50 via-primary-100 to-primary-200 px-4 py-6 lg:px-6">
          {children}
        </main>
      </div>
    </div>
  );
}
