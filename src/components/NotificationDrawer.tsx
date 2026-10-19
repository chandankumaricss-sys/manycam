'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell, X, Check, AlertTriangle, Info, ShieldAlert, Sparkles } from 'lucide-react';
import { useAppStore } from '@/store/app-store';

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  readAt: string | null;
  createdAt: string;
}

export function NotificationDrawer() {
  const { isNotificationOpen, setNotificationOpen } = useAppStore();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isNotificationOpen) {
      setLoading(true);
      fetch('/api/notifications')
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setNotifications(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [isNotificationOpen]);

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications/mark-read', { method: 'POST' });
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, readAt: new Date().toISOString() }))
      );
    } catch {
      // optimistic update fallback
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, readAt: new Date().toISOString() }))
      );
    }
  };

  if (!isNotificationOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-[#E7ECF2]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E7ECF2] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-[#0796E5]" />
            <h3 className="font-bold text-sm text-[#182230]">System Notifications</h3>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-[#0796E5]">
              {notifications.filter((n) => !n.readAt).length} Unread
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={markAllRead}
              className="text-xs text-[#0796E5] hover:underline font-medium"
            >
              Mark all read
            </button>
            <button
              onClick={() => setNotificationOpen(false)}
              className="p-1 rounded-md text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="py-12 text-center text-xs text-gray-400">Loading alerts...</div>
          ) : notifications.length === 0 ? (
            <div className="py-16 text-center text-xs text-gray-400">
              No recent notifications
            </div>
          ) : (
            notifications.map((item) => {
              const isUnread = !item.readAt;
              let Icon = Info;
              let iconColor = 'text-blue-500 bg-blue-50';

              if (item.type === 'alert') {
                Icon = AlertTriangle;
                iconColor = 'text-red-500 bg-red-50';
              } else if (item.type === 'security') {
                Icon = ShieldAlert;
                iconColor = 'text-amber-500 bg-amber-50';
              } else if (item.type === 'deployment') {
                Icon = Sparkles;
                iconColor = 'text-emerald-500 bg-emerald-50';
              }

              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isUnread
                      ? 'bg-[#EFF8FF]/50 border-blue-200'
                      : 'bg-white border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg flex-shrink-0 ${iconColor}`}>
                      <Icon size={16} />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-semibold text-[#182230]">
                          {item.title}
                        </h4>
                        <span className="text-[10px] text-gray-400">
                          {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <p className="mt-1 text-xs text-[#667085] leading-relaxed">
                        {item.message}
                      </p>

                      {item.link && (
                        <div className="mt-2.5">
                          <Link
                            href={item.link}
                            onClick={() => setNotificationOpen(false)}
                            className="text-[11px] font-semibold text-[#0796E5] hover:underline"
                          >
                            Inspect in console &rarr;
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 text-[11px] text-[#667085] flex items-center justify-between">
          <span>Alert retention: 30 days</span>
          <Link
            href="/diagnostics"
            onClick={() => setNotificationOpen(false)}
            className="text-[#0796E5] hover:underline font-medium"
          >
            Open Diagnostic Logs
          </Link>
        </div>
      </div>
    </div>
  );
}
