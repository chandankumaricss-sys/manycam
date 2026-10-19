'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search,
  Bell,
  HelpCircle,
  Shield,
  Layers,
  ChevronDown,
  RotateCcw,
  Sparkles,
  User,
  Check,
  Radio,
  ExternalLink
} from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { UserRole } from '@/lib/types';

const ROLES: { name: UserRole; desc: string; color: string }[] = [
  { name: 'Super Admin', desc: 'Full control across all endpoints & releases', color: 'bg-purple-100 text-purple-700' },
  { name: 'IT Administrator', desc: 'Manage devices, policies & telemetry', color: 'bg-blue-100 text-[#0796E5]' },
  { name: 'Deployment Operator', desc: 'Trigger deployments & rollout tasks', color: 'bg-emerald-100 text-emerald-700' },
  { name: 'Security Auditor', desc: 'Review Authenticode & audit logs', color: 'bg-amber-100 text-amber-700' },
  { name: 'Read-Only Viewer', desc: 'Read-only access to metrics & data', color: 'bg-gray-100 text-gray-700' }
];

const ENVIRONMENTS = [
  { name: 'Production Fleet', nodes: '2,486 devices', color: 'bg-emerald-500' },
  { name: 'Pilot Staging Ring', nodes: '124 devices', color: 'bg-blue-500' },
  { name: 'Canary Test Lab', nodes: '35 devices', color: 'bg-purple-500' }
];

export function Header() {
  const pathname = usePathname();
  const {
    currentRole,
    setRole,
    currentEnvironment,
    setEnvironment,
    setCommandMenuOpen,
    setNotificationOpen,
    setHelpOpen,
    setResetDialogOpen,
    startTour,
    isTourActive
  } = useAppStore();

  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [envMenuOpen, setEnvMenuOpen] = useState(false);

  // Keyboard shortcut listener for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandMenuOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setCommandMenuOpen]);

  // Derive breadcrumbs from path
  const pathParts = pathname.split('/').filter(Boolean);
  const pageTitle = pathParts.length > 0
    ? pathParts[0].charAt(0).toUpperCase() + pathParts[0].slice(1)
    : 'Overview';

  return (
    <header className="h-16 bg-white border-b border-[#E7ECF2] px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Breadcrumbs & Environment Selector */}
      <div className="flex items-center gap-4">
        {/* Breadcrumb path */}
        <div className="flex items-center gap-2 text-sm">
          <Link href="/overview" className="text-[#667085] hover:text-[#182230] transition-colors">
            ManyCam
          </Link>
          <span className="text-gray-300">/</span>
          <span className="font-semibold text-[#182230]">{pageTitle}</span>
          {pathParts.length > 1 && (
            <>
              <span className="text-gray-300">/</span>
              <span className="text-[#667085] capitalize">{pathParts[1]}</span>
            </>
          )}
        </div>

        {/* Environment Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setEnvMenuOpen(!envMenuOpen)}
            className="flex items-center gap-2 px-2.5 py-1 text-xs font-medium rounded-full bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors"
          >
            <span className={`w-2 h-2 rounded-full ${ENVIRONMENTS.find(e => e.name === currentEnvironment)?.color || 'bg-emerald-500'}`} />
            <span className="text-[#182230]">{currentEnvironment}</span>
            <ChevronDown size={12} className="text-[#667085]" />
          </button>

          {envMenuOpen && (
            <div className="absolute left-0 mt-1.5 w-56 rounded-lg bg-white border border-[#E7ECF2] shadow-lg py-1 z-50">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-[#667085] uppercase tracking-wider">
                Fleet Ring Environment
              </div>
              {ENVIRONMENTS.map((env) => (
                <button
                  key={env.name}
                  onClick={() => {
                    setEnvironment(env.name);
                    setEnvMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left flex items-center justify-between hover:bg-gray-50 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${env.color}`} />
                    <span className="font-medium text-[#182230]">{env.name}</span>
                  </div>
                  <span className="text-[11px] text-[#667085]">{env.nodes}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* DEMO Indicator Tag */}
        <div className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200/80">
          <Radio size={12} className="animate-pulse text-amber-600" />
          <span>SIMULATED DEMO ENVIRONMENT</span>
        </div>
      </div>

      {/* Right Controls: Search, Quick Tour, Notifications, Role Switcher, Profile */}
      <div className="flex items-center gap-2.5">
        {/* Global Search Bar (Ctrl+K) */}
        <button
          onClick={() => setCommandMenuOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#E7ECF2] bg-[#F8FAFC] hover:bg-white text-xs text-[#667085] hover:border-gray-300 transition-all w-48 sm:w-60 justify-between"
        >
          <div className="flex items-center gap-2">
            <Search size={14} className="text-[#667085]" />
            <span>Search devices, releases...</span>
          </div>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-semibold text-gray-500 bg-white border border-gray-200 rounded">
            ⌘K
          </kbd>
        </button>

        {/* Demo Tour Button */}
        <button
          id="btn-demo-tour"
          onClick={startTour}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            isTourActive
              ? 'bg-[#0796E5] text-white shadow-sm'
              : 'bg-primary-muted text-[#0796E5] border border-blue-200 hover:bg-blue-100'
          }`}
          title="Interactive 12-scenario presentation tour"
        >
          <Sparkles size={14} />
          <span className="hidden md:inline">{isTourActive ? 'Tour Active' : 'Demo Tour'}</span>
        </button>

        {/* Notifications Icon with Badge */}
        <button
          onClick={() => setNotificationOpen(true)}
          className="relative p-2 rounded-lg text-[#667085] hover:text-[#182230] hover:bg-gray-100 transition-colors"
          title="Notifications & Alerts"
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        {/* Help & Docs Button */}
        <button
          onClick={() => setHelpOpen(true)}
          className="p-2 rounded-lg text-[#667085] hover:text-[#182230] hover:bg-gray-100 transition-colors"
          title="Windows Virtual Camera Architecture & MSI Guide"
        >
          <HelpCircle size={18} />
        </button>

        {/* Reset Demo Data Action */}
        <button
          onClick={() => setResetDialogOpen(true)}
          className="p-2 rounded-lg text-[#667085] hover:text-[#EF4444] hover:bg-red-50 transition-colors"
          title="Reset Demo Data to Initial Deterministic State"
        >
          <RotateCcw size={17} />
        </button>

        {/* Role Switcher Menu */}
        <div className="relative">
          <button
            onClick={() => setRoleMenuOpen(!roleMenuOpen)}
            className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all"
          >
            <div className="w-7 h-7 rounded-full bg-[#0796E5] text-white font-semibold flex items-center justify-center text-xs shadow-sm">
              OC
            </div>
            <div className="hidden xl:flex flex-col text-left">
              <span className="text-xs font-semibold text-[#182230] leading-none">
                Olivia Chen
              </span>
              <span className="text-[10px] text-[#667085] mt-0.5 leading-none">
                {currentRole}
              </span>
            </div>
            <ChevronDown size={13} className="text-[#667085]" />
          </button>

          {roleMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-lg bg-white border border-[#E7ECF2] shadow-xl py-2 z-50">
              <div className="px-3.5 pb-2 border-b border-gray-100">
                <div className="text-xs font-semibold text-[#182230]">Olivia Chen</div>
                <div className="text-[11px] text-[#667085]">olivia.chen@enterprise.manycam.local</div>
                <div className="mt-1.5 inline-block text-[10px] font-medium px-2 py-0.5 rounded bg-blue-50 text-[#0796E5]">
                  Active Role: {currentRole}
                </div>
              </div>

              <div className="px-3 py-1.5 text-[11px] font-semibold text-[#667085] uppercase tracking-wider">
                Simulate Role Permissions
              </div>

              {ROLES.map((role) => (
                <button
                  key={role.name}
                  onClick={() => {
                    setRole(role.name);
                    setRoleMenuOpen(false);
                  }}
                  className={`w-full px-3.5 py-2 text-left flex items-start gap-2.5 hover:bg-gray-50 transition-colors ${
                    currentRole === role.name ? 'bg-blue-50/50' : ''
                  }`}
                >
                  <Shield size={15} className={`mt-0.5 flex-shrink-0 ${currentRole === role.name ? 'text-[#0796E5]' : 'text-gray-400'}`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-[#182230]">{role.name}</span>
                      {currentRole === role.name && <Check size={14} className="text-[#0796E5]" />}
                    </div>
                    <div className="text-[11px] text-[#667085] leading-tight mt-0.5">
                      {role.desc}
                    </div>
                  </div>
                </button>
              ))}

              <div className="mt-2 pt-2 border-t border-gray-100 px-3">
                <Link
                  href="/settings"
                  onClick={() => setRoleMenuOpen(false)}
                  className="w-full text-xs text-[#0796E5] hover:underline flex items-center justify-between py-1 font-medium"
                >
                  <span>Enterprise Workspace Settings</span>
                  <ExternalLink size={12} />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
