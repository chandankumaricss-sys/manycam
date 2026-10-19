'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Laptop2,
  Video,
  Send,
  RefreshCw,
  ShieldCheck,
  Activity,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  LifeBuoy,
  Settings
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { useAppStore } from '@/store/app-store';

export const NAV_ITEMS = [
  {
    name: 'Overview',
    href: '/overview',
    icon: LayoutDashboard,
    badge: null,
    description: 'Fleet metrics & health',
  },
  {
    name: 'Device Fleet',
    href: '/devices',
    icon: Laptop2,
    badge: '2,486',
    description: 'Windows endpoints & telemetry',
  },
  {
    name: 'Virtual Camera',
    href: '/camera',
    icon: Video,
    badge: null,
    description: 'Studio, sources & ADMX policies',
  },
  {
    name: 'Deployment Center',
    href: '/deployments',
    icon: Send,
    badge: 'MSI/MSIX',
    description: 'Intune, MECM & packaging',
  },
  {
    name: 'Updates & Releases',
    href: '/updates',
    icon: RefreshCw,
    badge: 'v3.8.2',
    description: 'Staged rollouts & safety gates',
  },
  {
    name: 'Security & Compliance',
    href: '/security',
    icon: ShieldCheck,
    badge: 'WHQL',
    description: 'Code signing & WDAC rules',
  },
  {
    name: 'Diagnostics & Analytics',
    href: '/diagnostics',
    icon: Activity,
    badge: '18 Alerts',
    description: 'Installer logs & CI/CD pipeline',
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { startTour, setHelpOpen } = useAppStore();

  return (
    <aside
      className={`relative z-20 flex flex-col bg-white border-r border-[#E7ECF2] transition-all duration-200 select-none ${
        isCollapsed ? 'w-[72px]' : 'w-[248px]'
      } min-h-screen h-screen flex-shrink-0`}
    >
      {/* Top Logo Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-[#E7ECF2] bg-white">
        {!isCollapsed ? (
          <BrandLogo />
        ) : (
          <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary-muted text-primary font-bold text-lg">
            M
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-md text-text-secondary hover:text-text-primary hover:bg-gray-100 transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation List - Exactly 7 Sections */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        <div className={`px-2 pb-2 text-[11px] font-semibold tracking-wider text-text-muted uppercase ${isCollapsed ? 'text-center' : ''}`}>
          {isCollapsed ? '•••' : 'Fleet Management'}
        </div>

        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-[#EFF8FF] text-[#0796E5]'
                  : 'text-[#182230] hover:bg-gray-50 hover:text-primary'
              }`}
              title={isCollapsed ? `${item.name} - ${item.description}` : undefined}
            >
              {/* Active selection bar indicator on left */}
              {isActive && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-[#0796E5]" />
              )}

              <Icon
                size={18}
                className={`flex-shrink-0 transition-colors ${
                  isActive ? 'text-[#0796E5]' : 'text-[#667085] group-hover:text-[#0796E5]'
                }`}
              />

              {!isCollapsed && (
                <div className="flex-1 flex items-center justify-between truncate">
                  <span className="truncate">{item.name}</span>
                  {item.badge && (
                    <span
                      className={`text-[11px] font-medium px-1.5 py-0.5 rounded-md ${
                        item.badge.includes('Alert')
                          ? 'bg-amber-100 text-amber-700'
                          : isActive
                          ? 'bg-blue-100 text-[#0796E5]'
                          : 'bg-gray-100 text-[#667085]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Demo Tour & Help Box */}
      <div className="p-3 border-t border-[#E7ECF2] bg-white space-y-2">
        {!isCollapsed ? (
          <div className="rounded-lg p-2.5 bg-gradient-to-br from-[#EFF8FF] to-blue-50/50 border border-blue-100">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0878BF]">
              <Sparkles size={14} className="text-[#0796E5]" />
              Interactive Demo Tour
            </div>
            <p className="text-[11px] text-[#667085] mt-1 leading-snug">
              12 guided scenarios exploring virtual camera fleet deployment & updates.
            </p>
            <button
              onClick={startTour}
              className="mt-2 w-full py-1.5 px-2 bg-[#0796E5] hover:bg-[#0878BF] text-white text-xs font-semibold rounded-md shadow-sm transition-colors text-center"
            >
              Launch Tour Walkthrough
            </button>
          </div>
        ) : (
          <button
            onClick={startTour}
            className="w-full flex items-center justify-center p-2 rounded-lg bg-blue-50 text-[#0796E5] hover:bg-blue-100"
            title="Launch Demo Tour"
          >
            <Sparkles size={18} />
          </button>
        )}

        <div className="flex items-center justify-between text-xs text-[#667085] pt-1 px-1">
          <button
            onClick={() => setHelpOpen(true)}
            className="flex items-center gap-1.5 hover:text-[#182230] transition-colors"
          >
            <LifeBuoy size={14} />
            {!isCollapsed && <span>Help & Docs</span>}
          </button>

          <Link
            href="/settings"
            className="flex items-center gap-1.5 hover:text-[#182230] transition-colors"
          >
            <Settings size={14} />
            {!isCollapsed && <span>Settings</span>}
          </Link>
        </div>
      </div>
    </aside>
  );
}
