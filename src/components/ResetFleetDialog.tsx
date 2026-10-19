'use client';

import React, { useState } from 'react';
import { RotateCcw, AlertTriangle, CheckCircle2, X } from 'lucide-react';
import { useAppStore } from '@/store/app-store';

export function ResetFleetDialog() {
  const { isResetDialogOpen, setResetDialogOpen } = useAppStore();
  const [isResetting, setIsResetting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isResetDialogOpen) return null;

  const handleReset = async () => {
    setIsResetting(true);
    try {
      const res = await fetch('/api/fleet/reset', { method: 'POST' });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } else {
        alert('Failed to reset fleet data.');
        setIsResetting(false);
      }
    } catch {
      alert('Error connecting to local server.');
      setIsResetting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-white">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-4">
            <RotateCcw size={22} className={isResetting ? 'animate-spin' : ''} />
          </div>

          <h3 className="text-base font-bold text-[#182230]">
            Reset Database to Baseline State?
          </h3>

          <p className="mt-2 text-xs text-[#667085] leading-relaxed">
            This will wipe any temporary mutations, newly added devices, or created deployment jobs, and restore the exact <strong>2,486-device deterministic enterprise dataset</strong> (2,312 online, 98.4% deployment success, 94.7% compliance).
          </p>

          <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 flex items-start gap-2">
            <AlertTriangle size={15} className="flex-shrink-0 mt-0.5 text-amber-600" />
            <span>
              All diagnostic event logs, saved custom presets, and active job queues will be reverted to factory baseline values.
            </span>
          </div>

          {success && (
            <div className="mt-3 p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600" />
              <span>Database restored successfully! Reloading console...</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-2.5">
          <button
            onClick={() => setResetDialogOpen(false)}
            disabled={isResetting}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-[#667085] hover:text-[#182230] hover:bg-gray-200/50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleReset}
            disabled={isResetting}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#EF4444] hover:bg-red-600 text-white shadow-sm flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            {isResetting ? (
              <>
                <RotateCcw size={14} className="animate-spin" />
                <span>Restoring Initial Seed...</span>
              </>
            ) : (
              <span>Confirm & Reset Fleet Data</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
