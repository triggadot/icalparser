'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  CalendarIcon,
  LayoutDashboardIcon,
  UploadIcon,
  Settings2Icon,
  WebhookIcon,
} from 'lucide-react';

const navigation = [
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboardIcon,
  },
  {
    name: 'Events',
    href: '/events',
    icon: CalendarIcon,
  },
  {
    name: 'Upload',
    href: '/upload',
    icon: UploadIcon,
  },
  {
    name: 'Webhooks',
    href: '/settings/webhooks',
    icon: WebhookIcon,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings2Icon,
  },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      {navigation.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center text-sm font-medium transition-colors hover:text-primary',
              pathname === item.href
                ? 'text-primary'
                : 'text-muted-foreground'
            )}
          >
            <Icon className="h-4 w-4 mr-2" />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}