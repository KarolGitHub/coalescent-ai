'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { ModeToggle } from '@/components/ModeToggle';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { HomeIcon, File, UsersRound, LayoutPanelLeft } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { href: '/home', label: 'Home', icon: HomeIcon },
  { href: '/tickets', label: 'Tickets', icon: File },
  { href: '/customers', label: 'Customers', icon: UsersRound },
  { href: '/whiteboard/test', label: 'Whiteboard', icon: LayoutPanelLeft },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <Header />
      <div className='flex min-h-screen'>
        {/* Sidebar for desktop */}
        <aside className='hidden md:flex flex-col w-56 border-r bg-background p-4 gap-2'>
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== '/home' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-2 py-2 rounded transition-colors font-medium text-base ${
                  isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'hover:bg-accent'
                }`}
              >
                <link.icon className='w-5 h-5' />
                <span>{link.label}</span>
              </Link>
            );
          })}
          <div className='mt-auto'>
            <ModeToggle />
          </div>
        </aside>
        {/* Sidebar for mobile (Sheet) */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button
              className='md:hidden p-2 m-2 rounded hover:bg-accent focus:outline-none'
              aria-label='Open navigation'
            >
              <LayoutPanelLeft className='w-6 h-6' />
            </button>
          </SheetTrigger>
          <SheetContent side='left' className='flex flex-col gap-2 w-56 p-4'>
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== '/home' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-2 py-2 rounded transition-colors font-medium text-base ${
                    isActive
                      ? 'bg-accent text-accent-foreground'
                      : 'hover:bg-accent'
                  }`}
                  onClick={() => setOpen(false)}
                >
                  <link.icon className='w-5 h-5' />
                  <span>{link.label}</span>
                </Link>
              );
            })}
            <div className='mt-auto'>
              <ModeToggle />
            </div>
          </SheetContent>
        </Sheet>
        {/* Main content */}
        <main className='flex-1 p-4'>{children}</main>
      </div>
    </>
  );
}
