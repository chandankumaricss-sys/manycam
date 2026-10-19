'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Laptop2,
  RefreshCw,
  Shield,
  Bell,
  Layers,
  RotateCcw,
  CheckCircle2,
  Save,
  AlertTriangle,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { useAppStore } from '@/store/app-store';

export default function SettingsPage() {
  const { setResetDialogOpen } = useAppStore();
  const [activeTab, setActiveTab] = useState<'general' | 'fleet' | 'updates' | 'security' | 'notifications' | 'integrations' | 'maintenance'>('general');

  // Form State
  const [workspaceName, setWorkspaceName] = useState('ManyCam Enterprise Global Operations');
  const [timezone, setTimezone] = useState('America/New_York (EST)');
  const [locale, setLocale] = useState('en-US');
  const [checkInInterval, setCheckInInterval] = useState(300);
  const [inactivityThreshold, setInactivityThreshold] = useState(48);
  const [defaultChannel, setDefaultChannel] = useState('Stable');
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState(60);

  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.workspaceName) setWorkspaceName(data.workspaceName);
        if (data.timezone) setTimezone(data.timezone);
        if (data.checkInIntervalSec) setCheckInInterval(data.checkInIntervalSec);
        if (data.defaultChannel) setDefaultChannel(data.defaultChannel);
      })
      .catch((e) => console.error(e));
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceName,
          timezone,
          locale,
          checkInIntervalSec: checkInInterval,
          deviceInactivityThresholdHours: inactivityThreshold,
          defaultChannel,
          autoUpdateEnabled,
          sessionTimeout,
        }),
      });
      if (res.ok) {
        showToast('Settings saved successfully and persisted across sessions!');
      }
    } catch {
      alert('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-5xl">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#182230] text-white px-4 py-2.5 rounded-lg shadow-lg text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-top-2">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#182230]">
            Enterprise Console Settings
          </h1>
          <p className="text-xs text-[#667085] mt-1">
            Global administrative configuration, telemetry thresholds, policy baselines, and database maintenance.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <div className="inline-flex rounded-lg border border-[#E7ECF2] p-1 bg-gray-50 text-xs font-semibold">
            {[
              { id: 'general', label: 'General' },
              { id: 'fleet', label: 'Fleet & Telemetry' },
              { id: 'updates', label: 'Updates' },
              { id: 'security', label: 'Security' },
              { id: 'notifications', label: 'Notifications' },
              { id: 'integrations', label: 'Integrations' },
              { id: 'maintenance', label: 'Maintenance & Tools' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1 rounded-md transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-white text-[#0796E5] shadow-xs'
                    : 'text-[#667085] hover:text-[#182230]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <form onSubmit={handleSaveSettings}>
        {/* TAB 1: GENERAL */}
        {activeTab === 'general' && (
          <div className="p-6 rounded-2xl border border-[#E7ECF2] bg-white shadow-card space-y-5 text-xs">
            <h3 className="font-bold text-sm text-[#182230]">Workspace & Localization</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1">Enterprise Workspace Name</label>
                <input
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">System Timezone</label>
                <input
                  type="text"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Locale & Language</label>
                <select
                  value={locale}
                  onChange={(e) => setLocale(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-xs"
                >
                  <option value="en-US">English (United States)</option>
                  <option value="en-GB">English (United Kingdom)</option>
                  <option value="de-DE">Deutsch (Germany)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Default Landing Route</label>
                <input
                  type="text"
                  disabled
                  value="/overview"
                  className="w-full px-3 py-2 border rounded-lg text-xs bg-gray-50 text-gray-500 font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: FLEET */}
        {activeTab === 'fleet' && (
          <div className="p-6 rounded-2xl border border-[#E7ECF2] bg-white shadow-card space-y-5 text-xs">
            <h3 className="font-bold text-sm text-[#182230]">Fleet Telemetry & Heartbeat Intervals</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1">Agent Heartbeat Interval (Seconds)</label>
                <input
                  type="number"
                  value={checkInInterval}
                  onChange={(e) => setCheckInInterval(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 border rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Inactivity Threshold Before Offline (Hours)</label>
                <input
                  type="number"
                  value={inactivityThreshold}
                  onChange={(e) => setInactivityThreshold(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 border rounded-lg text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: UPDATES */}
        {activeTab === 'updates' && (
          <div className="p-6 rounded-2xl border border-[#E7ECF2] bg-white shadow-card space-y-5 text-xs">
            <h3 className="font-bold text-sm text-[#182230]">Update Channel Defaults</h3>
            <div className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Organization Default Release Channel</label>
                <select
                  value={defaultChannel}
                  onChange={(e) => setDefaultChannel(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-xs max-w-sm"
                >
                  <option value="Stable">Stable (v3.8.2 GA)</option>
                  <option value="Beta">Beta (v3.9.0)</option>
                  <option value="Canary">Canary (v3.9.1)</option>
                  <option value="Pinned Legacy">Pinned Legacy (v3.7.9)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  checked={autoUpdateEnabled}
                  onChange={(e) => setAutoUpdateEnabled(e.target.checked)}
                  className="rounded text-[#0796E5]"
                />
                <span>Enable automated background silent updates within maintenance windows</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SECURITY */}
        {activeTab === 'security' && (
          <div className="p-6 rounded-2xl border border-[#E7ECF2] bg-white shadow-card space-y-5 text-xs">
            <h3 className="font-bold text-sm text-[#182230]">Security Policy & Session Control</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1">Console Session Idle Timeout (Minutes)</label>
                <input
                  type="number"
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 border rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Authenticode Verification Gate</label>
                <input
                  type="text"
                  disabled
                  value="Strict EV Hardware Token Required"
                  className="w-full px-3 py-2 border rounded-lg text-xs bg-gray-50 text-gray-500 font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: NOTIFICATIONS */}
        {activeTab === 'notifications' && (
          <div className="p-6 rounded-2xl border border-[#E7ECF2] bg-white shadow-card space-y-4 text-xs">
            <h3 className="font-bold text-sm text-[#182230]">Alert Threshold Notifications</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded text-[#0796E5]" />
                <span>Notify IT Administrators on deployment failure rate &gt; 2.0%</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded text-[#0796E5]" />
                <span>Notify Security team when Code Signing certificate expires in &lt; 60 days</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded text-[#0796E5]" />
                <span>Trigger automatic alert when Media Foundation driver registration fails (Code 1603)</span>
              </label>
            </div>
          </div>
        )}

        {/* TAB 6: INTEGRATIONS */}
        {activeTab === 'integrations' && (
          <div className="p-6 rounded-2xl border border-[#E7ECF2] bg-white shadow-card space-y-4 text-xs">
            <h3 className="font-bold text-sm text-[#182230]">Enterprise Webhooks & API Connectors</h3>
            <div className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Intune Graph API Webhook URL</label>
                <input
                  type="text"
                  defaultValue="https://graph.microsoft.com/v1.0/deviceManagement/managedDevices"
                  className="w-full px-3 py-2 border rounded-lg text-xs font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">MECM / SCCM Management Point FQDN</label>
                <input
                  type="text"
                  defaultValue="sccm-mp.manycam-corp.internal"
                  className="w-full px-3 py-2 border rounded-lg text-xs font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: MAINTENANCE & TOOLS */}
        {activeTab === 'maintenance' && (
          <div className="p-6 rounded-2xl border border-[#E7ECF2] bg-white shadow-card space-y-5 text-xs">
            <div>
              <h3 className="font-bold text-sm text-[#182230]">System Maintenance & Fleet Operations</h3>
              <p className="text-xs text-[#667085] mt-0.5">
                Manage operational routines, inject test diagnostics, or restore the baseline enterprise dataset.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-red-200 bg-red-50/40 space-y-2">
                <div className="font-bold text-red-700 text-sm">Reset Database to Initial Baseline</div>
                <p className="text-[#667085] text-[11px]">
                  Restores 2,486 managed devices (2,312 online, 98.4% success, 94.7% compliance, 18 alerts).
                </p>
                <button
                  type="button"
                  onClick={() => setResetDialogOpen(true)}
                  className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-xs shadow-xs"
                >
                  Reset Fleet Database
                </button>
              </div>

              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 space-y-2">
                <div className="font-bold text-[#0796E5] text-sm">Generate Test Incidents</div>
                <p className="text-[#667085] text-[11px]">
                  Injects 3 virtual camera registration errors (Code 1603) on pilot devices to test automated repair workflows.
                </p>
                <button
                  type="button"
                  onClick={() => showToast('Injected 3 sample camera registration incidents')}
                  className="px-3.5 py-1.5 rounded-lg bg-[#0796E5] hover:bg-[#0878BF] text-white font-semibold text-xs shadow-xs"
                >
                  Inject Incidents
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Save Footer Bar */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#0796E5] hover:bg-[#0878BF] text-white text-xs font-semibold shadow-xs disabled:opacity-50"
          >
            <Save size={14} />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
