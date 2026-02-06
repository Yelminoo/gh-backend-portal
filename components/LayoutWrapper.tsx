'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Pages that should NOT show the sidebar
  const publicPages = ['/login', '/register', '/'];
  
  const shouldShowSidebar = !publicPages.includes(pathname);

  if (!shouldShowSidebar) {
    return <>{children}</>;
  }

  return <Sidebar>{children}</Sidebar>;
}
