'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  LayoutDashboard,
  Laptop2,
  Video,
  Send,
  RefreshCw,
  ShieldCheck,
  Activity,
  PlusCircle,
  FileDown,
  Wrench,
  X,
  ArrowRight
} from 'lucide-react';
import { useAppStore } from '@/store/app-store';

export function CommandMenu() {
  const router = useRouter();
  const { isCommandMenuOpen, setCommandMenuOpen, setActiveQuickAction, startTour } = useAppStore();
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!isCommandMenuOpen) {
      setQuery('');
    }
  }, [isCommandMenuOpen]);

  if (!isCommandMenuOpen) return null;

  const navigateTo = (url: string) => {
    setCommandMenuOpen(false);
    router.push(url);
  };

  const handleAction = (action: 'deploy' | 'release' | 'addDevice' | 'cameraConfig' | 'diagnostics' | 'exportReport') => {
    setCommandMenuOpen(false);
    setActiveQuickAction(action);
  };

  const navigationItems = [
    { name: 'Fleet Overview', route: '/overview', icon: LayoutDashboard, category: 'Navigation' },
    { name: 'Device Inventory & Health', route: '/devices', icon: Laptop2, category: 'Navigation' },
    { name: 'Virtual Camera Studio & Policies', route: '/camera', icon: Video, category: 'Navigation' },
    { name: 'Deployment Center & Packaging', route: '/deployments', icon: Send, category: 'Navigation' },
    { name: 'Updates & Staged Rollouts', route: '/updates', icon: RefreshCw, category: 'Navigation' },
    { name: 'Security Posture & Code Signing', route: '/security', icon: ShieldCheck, category: 'Navigation' },
    { name: 'Diagnostics & Observability', route: '/diagnostics', icon: Activity, category: 'Navigation' },
  ];

  const quickActions = [
    { name: 'Deploy Application Package', action: () => handleAction('deploy'), icon: Send, category: 'Actions' },
    { name: 'Create Application Release', action: () => handleAction('release'), icon: RefreshCw, category: 'Actions' },
    { name: 'Enroll Windows Device', action: () => handleAction('addDevice'), icon: PlusCircle, category: 'Actions' },
    { name: 'Run Camera Diagnostic Test', action: () => handleAction('diagnostics'), icon: Wrench, category: 'Actions' },
    { name: 'Export Fleet Health Report (CSV)', action: () => handleAction('exportReport'), icon: FileDown, category: 'Actions' },
    { name: 'Launch 12-Step Guided Walkthrough', action: () => { setCommandMenuOpen(false); startTour(); }, icon: Activity, category: 'Actions' },
  ];

  const filteredNav = navigationItems.filter(item =>
    item.name.toLowerCase().includes(query.toLowerCase())
  );

  const filteredActions = quickActions.filter(item =>
    item.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 border-b border-gray-100">
          <Search size={18} className="text-gray-400" />
          <input
            type="text"
            placeholder="Type a command, navigate, or search fleet..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full px-3 py-3.5 text-sm text-[#182230] placeholder-gray-400 focus:outline-none bg-transparent"
          />
          <button
            onClick={() => setCommandMenuOpen(false)}
            className="p-1 rounded text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-3">
          {/* Quick Actions */}
          {filteredActions.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Quick Actions
              </div>
              <div className="space-y-0.5 mt-1">
                {filteredActions.map((action, idx) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={idx}
                      onClick={action.action}
                      className="w-full px-3 py-2 flex items-center justify-between rounded-lg hover:bg-[#EFF8FF] text-[#182230] hover:text-[#0796E5] text-xs font-medium transition-colors group"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon size={16} className="text-[#0796E5]" />
                        <span>{action.name}</span>
                      </div>
                      <ArrowRight size={13} className="text-gray-300 group-hover:text-[#0796E5]" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Navigation */}
          {filteredNav.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Navigation
              </div>
              <div className="space-y-0.5 mt-1">
                {filteredNav.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => navigateTo(item.route)}
                      className="w-full px-3 py-2 flex items-center justify-between rounded-lg hover:bg-gray-100 text-[#182230] text-xs font-medium transition-colors group"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon size={16} className="text-[#667085]" />
                        <span>{item.name}</span>
                      </div>
                      <span className="text-[11px] text-gray-400 font-mono group-hover:text-gray-600">
                        {item.route}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {filteredActions.length === 0 && filteredNav.length === 0 && (
            <div className="py-8 text-center text-xs text-gray-400">
              No results found for &ldquo;{query}&rdquo;
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
          <span>Tip: Use <kbd className="px-1 py-0.5 bg-white border rounded text-[10px]">ESC</kbd> to close</span>
          <span>ManyCam Enterprise Console</span>
        </div>
      </div>
    </div>
  );
}
