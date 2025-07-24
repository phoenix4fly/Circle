'use client';

import { usePathname } from 'next/navigation';
import BottomNav from './BottomNav';

export default function ConditionalBottomNav() {
  const pathname = usePathname();
  
  // Скрываем BottomNav на детальных страницах туров
  const hideBottomNav = pathname.match(/^\/tours\/\d+$/);
  
  if (hideBottomNav) {
    return null;
  }
  
  return <BottomNav />;
} 