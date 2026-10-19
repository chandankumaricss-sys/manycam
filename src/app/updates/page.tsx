'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  RefreshCw,
  GitBranch,
  ShieldAlert,
  RotateCcw,
  Play,
  Pause,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Plus,
  Sliders,
  Sparkles,
  FileText,
  Lock,
  ArrowRight,
  Layers,
  Terminal,
  Activity
} from 'lucide-react';
import { ReleaseRecord, RolloutRecord } from '@/lib/types';
import { useAppStore } from '@/store/app-store';

export default function UpdatesReleasesPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs text-gray-400">Loading Updates & Releases...</div>}>
      <UpdatesReleasesContent />
    </Suspense>
  );
}

function UpdatesReleasesContent() {
  const searchParams = useSearchParams();
  const autoOpenNew = searchParams.get('newRelease') === 'open';

  const [activeTab, setActiveTab] = useState<'rollouts' | 'releases' | 'policies' | 'upgrade' | 'channels'>('rollouts');
  const [releases, setReleases] = useState<ReleaseRecord[]>([]);
  const [activeRollout, setActiveRollout] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Release Wizard state
  const [newReleaseOpen, setNewReleaseOpen] = useState(false);
  const [newVersion, setNewVersion] = useState('3.8.3');
  const [newChannel, setNewChannel] = useState('Stable Candidate');
  const [newNotes, setNewNotes] = useState('Media Foundation camera driver stability update with zero-touch Intune parameters.');
  const [newMinBuild, setNewMinBuild] = useState('Windows 10 21H2 (19044)');

  // In-place upgrade simulation step
  const [upgradeSimStep, setUpgradeSimStep] = useState<number>(0);
  const [upgradeSimRunning, setUpgradeSimRunning] = useState<boolean>(false);
  const [simulateFailureAtStep, setSimulateFailureAtStep] = useState<number | null>(null);
  const [upgradeLogs, setUpgradeLogs] = useState<string[]>([]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchReleases = () => {
    setLoading(true);
    fetch('/api/releases')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setReleases(data);
          const firstRollout = data.find((r) => r.rollouts && r.rollouts.length > 0)?.rollouts?.[0];
          if (firstRollout) setActiveRollout(firstRollout);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchReleases();
  }, []);

  useEffect(() => {
    if (autoOpenNew) {
      setNewReleaseOpen(true);
    }
  }, [autoOpenNew]);

  // Rollout action handlers
  const handleRolloutAction = async (action: string, reason?: string) => {
    if (!activeRollout) return;
    try {
      const res = await fetch(`/api/rollouts/${activeRollout.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason }),
      });
      if (res.ok) {
        const updated = await res.json();
        setActiveRollout(updated);
        showToast(`Rollout ${action} executed successfully`);
        fetchReleases();
      }
    } catch {
      alert('Action execution failed');
    }
  };

  // Create Release submission
  const handleCreateRelease = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/releases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          version: newVersion,
          channel: newChannel,
          packageId: 'pkg-382-msi-x64',
          releaseNotes: newNotes,
          minWindowsBuild: newMinBuild,
        }),
      });
      if (res.ok) {
        const created = await res.json();
        showToast(`Release v${created.version} published!`);
        setNewReleaseOpen(false);
        fetchReleases();
      }
    } catch {
      alert('Failed to publish release');
    }
  };

  // Run in-place upgrade workflow simulation
  const runInPlaceUpgrade = () => {
    setUpgradeSimRunning(true);
    setUpgradeSimStep(1);
    setUpgradeLogs([`[00:00] Initialized in-place upgrade workflow for ManyCam v3.8.2 -> v3.8.3`]);

    const steps = [
      { step: 1, name: 'Detecting installed virtual camera components and registry keys', log: 'Found ManyCam v3.8.2 installed in %ProgramFiles%\\ManyCam' },
      { step: 2, name: 'Validating package Authenticode signature & SHA-256 hash', log: 'Verified signature CN="ManyCam LLC" against DigiCert EV root' },
      { step: 3, name: 'Checking running application and service process states', log: 'Sent graceful shutdown IPC signal to ManyCamSvc.exe' },
      { step: 4, name: 'Verifying Windows build compatibility (24H2 verified)', log: 'Compatible build detected: Windows 11 Enterprise 24H2' },
      { step: 5, name: 'Backing up user presets and custom camera configurations', log: 'Backed up registry keys to %ProgramData%\\ManyCam\\Backup' },
      { step: 6, name: 'Simulating transactional package installation (msiexec /i)', log: 'Unpacking binaries and updating system CLSIDs' },
      { step: 7, name: 'Migrating legacy presets and virtual camera settings', log: 'Migrated 4 presets and 1 ADMX policy' },
      { step: 8, name: 'Re-registering Media Foundation virtual camera filter', log: 'MFCreateVirtualCamera succeeded with exit code 0' },
      { step: 9, name: 'Restarting background service and watchdog thread', log: 'ManyCamSvc.exe transitioned to RUNNING' },
      { step: 10, name: 'Performing synthetic frame delivery health check', log: 'Virtual camera stream active at 1080p @ 30 FPS' },
      { step: 11, name: 'Upgrade complete! Fleet record updated', log: 'Transaction committed successfully' },
    ];

    let current = 1;
    const interval = setInterval(() => {
      current++;
      if (simulateFailureAtStep && current === simulateFailureAtStep) {
        clearInterval(interval);
        setUpgradeSimStep(current);
        setUpgradeLogs((prev) => [
          ...prev,
          `[00:0${current * 2}] ERROR at step ${current}: Virtual camera registration failed (Code 1603).`,
          `[00:0${current * 2 + 1}] AUTOMATIC ROLLBACK TRIGGERED: Restoring prior version v3.8.2 and backed up presets...`,
          `[00:0${current * 2 + 2}] Rollback completed safely. Device state restored to Healthy.`,
        ]);
        setUpgradeSimRunning(false);
        showToast('Automatic rollback executed after step failure');
        return;
      }

      if (current <= steps.length) {
        setUpgradeSimStep(current);
        setUpgradeLogs((prev) => [
          ...prev,
          `[00:0${current * 2}] Step ${current}: ${steps[current - 1].log}`,
        ]);
      } else {
        clearInterval(interval);
        setUpgradeSimRunning(false);
        showToast('In-place upgrade completed successfully!');
      }
    }, 700);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
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
            Updates & Release Management
          </h1>
          <p className="text-xs text-[#667085] mt-1">
            Phased rollout progression, automated safety gates, in-place upgrade strategies, and safe rollbacks.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-[#E7ECF2] p-1 bg-gray-50">
            {[
              { id: 'rollouts', label: 'Staged Rollouts' },
              { id: 'releases', label: 'Release Registry' },
              { id: 'upgrade', label: 'In-Place Upgrade Simulator' },
              { id: 'policies', label: 'Update Policies' },
              { id: 'channels', label: 'Release Channels' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
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

      {/* TAB 1: STAGED ROLLOUTS & SAFETY GATES */}
      {activeTab === 'rollouts' && (
        <div className="space-y-6">
          {/* Active Rollout Progression Card */}
          <div className="p-6 rounded-2xl border border-[#E7ECF2] bg-white shadow-card space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-gray-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-[#182230]">
                    Rollout: ManyCam Enterprise v3.8.2 GA
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      activeRollout?.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-700'
                        : activeRollout?.status === 'Paused'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-blue-50 text-[#0796E5]'
                    }`}
                  >
                    {activeRollout?.status || 'Active'}
                  </span>
                </div>
                <p className="text-xs text-[#667085] mt-1">
                  Target: 65% fleet adoption ({activeRollout?.currentStage || 4} of 5 rings active)
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {activeRollout?.status === 'Active' ? (
                  <button
                    onClick={() => handleRolloutAction('pause')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-[#182230] hover:bg-gray-50"
                  >
                    <Pause size={14} />
                    <span>Pause Rollout</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleRolloutAction('resume')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0796E5] text-white text-xs font-semibold hover:bg-[#0878BF]"
                  >
                    <Play size={14} />
                    <span>Resume Rollout</span>
                  </button>
                )}

                <button
                  onClick={() => handleRolloutAction('advance')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-[#0796E5] text-xs font-semibold hover:bg-blue-100"
                >
                  <ArrowRight size={14} />
                  <span>Advance Next Ring</span>
                </button>

                <button
                  onClick={() => handleRolloutAction('tripSafetyGate')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold"
                  title="Simulate crash rate threshold exceeded (>0.5%)"
                >
                  <ShieldAlert size={14} />
                  <span>Trip Safety Gate</span>
                </button>

                <button
                  onClick={() => handleRolloutAction('rollback')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-[#667085] hover:bg-gray-50 text-xs font-semibold"
                >
                  <RotateCcw size={14} />
                  <span>Execute Rollback</span>
                </button>
              </div>
            </div>

            {/* Paused Reason Callout if Tripped */}
            {activeRollout?.status === 'Paused' && activeRollout?.pausedReason && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                <AlertTriangle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900">
                  <div className="font-bold">Rollout Paused by Safety Gate Evaluation</div>
                  <p className="mt-0.5 leading-relaxed">{activeRollout.pausedReason}</p>
                </div>
              </div>
            )}

            {/* Visual Staged Progression Stepper */}
            <div id="staged-rollout-stepper" className="space-y-2">
              <div className="font-bold text-xs text-[#182230]">Deployment Rings Progression</div>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                {[
                  { stage: 1, name: 'Internal QA Ring', pct: '1%', status: 'Completed', count: '25 nodes' },
                  { stage: 2, name: 'Pilot Group (HQ)', pct: '5%', status: 'Completed', count: '124 nodes' },
                  { stage: 3, name: 'Early Adopters', pct: '20%', status: 'Completed', count: '492 nodes' },
                  { stage: 4, name: 'Broad Enterprise', pct: '65%', status: 'Active', count: '1,480 nodes' },
                  { stage: 5, name: 'General Availability', pct: '100%', status: 'Pending', count: '2,486 nodes' },
                ].map((stg) => {
                  let border = 'border-gray-200 bg-gray-50/50';
                  let badge = 'text-gray-400 bg-gray-100';
                  if (stg.status === 'Completed') {
                    border = 'border-emerald-200 bg-emerald-50/40';
                    badge = 'text-emerald-700 bg-emerald-100';
                  } else if (stg.status === 'Active') {
                    border = 'border-[#0796E5] bg-blue-50/50';
                    badge = 'text-[#0796E5] bg-blue-100 font-bold';
                  }

                  return (
                    <div key={stg.stage} className={`p-3 rounded-xl border ${border} space-y-1.5`}>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#182230]">Ring {stg.stage}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${badge}`}>
                          {stg.pct}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-[#182230] leading-tight truncate">
                        {stg.name}
                      </div>
                      <div className="text-[11px] text-[#667085] flex items-center justify-between pt-1">
                        <span>{stg.count}</span>
                        <span className="font-medium text-emerald-600">{stg.status}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Automatic Safety Gates Configuration Panel */}
            <div id="safety-gates-panel" className="p-4 rounded-xl border border-gray-200 bg-gray-50/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#182230] flex items-center gap-1.5">
                  <ShieldAlert size={15} className="text-[#0796E5]" />
                  Active Safety Gates & Auto-Pause Thresholds
                </span>
                <span className="text-[11px] text-emerald-600 font-semibold">
                  All Gates Active
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-white rounded-lg border">
                  <span className="text-[11px] text-[#667085] block">Max Failure Rate</span>
                  <span className="font-bold text-[#182230]">2.0% (Current: 0.8%)</span>
                </div>
                <div className="p-3 bg-white rounded-lg border">
                  <span className="text-[11px] text-[#667085] block">Max App Crash Rate</span>
                  <span className="font-bold text-[#182230]">0.5% (Current: 0.12%)</span>
                </div>
                <div className="p-3 bg-white rounded-lg border">
                  <span className="text-[11px] text-[#667085] block">MF Driver Gate</span>
                  <span className="font-bold text-emerald-600">Zero Tolerance</span>
                </div>
                <div className="p-3 bg-white rounded-lg border">
                  <span className="text-[11px] text-[#667085] block">Min Observation Time</span>
                  <span className="font-bold text-[#182230]">24 Hours / Ring</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RELEASE REGISTRY */}
      {activeTab === 'releases' && (
        <div className="p-6 rounded-2xl border border-[#E7ECF2] bg-white shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h3 className="text-base font-bold text-[#182230]">Release Registry</h3>
              <p className="text-xs text-[#667085]">
                Version history, rollback eligibility, channel assignments, and release changelogs.
              </p>
            </div>
            <button
              id="btn-create-release"
              onClick={() => setNewReleaseOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#0796E5] text-white text-xs font-semibold shadow-xs"
            >
              <Plus size={15} />
              <span>Create Release Wizard</span>
            </button>
          </div>

          <div className="divide-y divide-gray-100">
            {releases.map((rel) => (
              <div key={rel.id} className="py-4 flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#182230]">v{rel.version}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-[#0796E5]">
                      {rel.channel}
                    </span>
                    <span className="text-xs text-gray-400">
                      Published {new Date(rel.publishedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-xs text-[#667085] whitespace-pre-line leading-relaxed">
                    {rel.releaseNotes}
                  </p>

                  <div className="text-[11px] text-[#667085] flex items-center gap-3">
                    <span>Min OS: {rel.minWindowsBuild}</span>
                    <span>Package: {rel.package?.name || 'ManyCam MSI'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => showToast(`Rollback target set to v${rel.version}`)}
                    className="px-3 py-1.5 rounded-lg border text-xs font-semibold text-[#182230] hover:bg-gray-50"
                  >
                    Set as Rollback Target
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: IN-PLACE UPGRADE STRATEGY SIMULATOR */}
      {activeTab === 'upgrade' && (
        <div id="rollback-action-panel" className="max-w-4xl mx-auto p-6 rounded-2xl border border-[#E7ECF2] bg-white shadow-card space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <h3 className="text-base font-bold text-[#182230]">
                11-Step In-Place Upgrade & Rollback Engine
              </h3>
              <p className="text-xs text-[#667085]">
                Simulate transactional client upgrade with configuration preservation and automatic recovery.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-[#667085] flex items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={simulateFailureAtStep === 8}
                  onChange={(e) => setSimulateFailureAtStep(e.target.checked ? 8 : null)}
                  className="rounded text-red-600"
                />
                <span>Simulate Failure at Step 8</span>
              </label>

              <button
                onClick={runInPlaceUpgrade}
                disabled={upgradeSimRunning}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#0796E5] hover:bg-[#0878BF] text-white text-xs font-semibold shadow-xs disabled:opacity-50"
              >
                <Play size={14} />
                <span>Run Upgrade Workflow</span>
              </button>
            </div>
          </div>

          {/* Stepper Display */}
          <div className="space-y-2">
            {[
              '1. Detect existing version & registry CLSIDs',
              '2. Validate package Authenticode & SHA-256',
              '3. Signal running ManyCam service & apps',
              '4. Verify OS build & hardware compatibility',
              '5. Backup user presets & ADMX configurations',
              '6. Execute transactional MSI install',
              '7. Migrate presets & restore registry keys',
              '8. Register Media Foundation virtual camera',
              '9. Restart background service (ManyCamSvc)',
              '10. Verify synthetic video frame delivery',
              '11. Mark upgrade completed successfully',
            ].map((stepText, idx) => {
              const stepNum = idx + 1;
              const isPast = upgradeSimStep > stepNum;
              const isCurrent = upgradeSimStep === stepNum;
              const isFailed = isCurrent && simulateFailureAtStep === stepNum;

              return (
                <div
                  key={stepNum}
                  className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
                    isFailed
                      ? 'bg-red-50 border-red-300 text-red-800'
                      : isPast
                      ? 'bg-emerald-50/60 border-emerald-200 text-emerald-800'
                      : isCurrent
                      ? 'bg-blue-50 border-[#0796E5] text-[#0796E5] font-semibold'
                      : 'bg-gray-50 border-gray-100 text-[#667085]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold bg-white border">
                      {isPast ? '✓' : isFailed ? '✕' : stepNum}
                    </span>
                    <span>{stepText}</span>
                  </div>
                  <span className="text-[11px] font-mono">
                    {isPast ? 'DONE' : isFailed ? 'FAILED' : isCurrent ? 'RUNNING...' : 'PENDING'}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Live Log Terminal */}
          <div className="p-3.5 bg-gray-900 rounded-xl font-mono text-[11px] text-green-400 space-y-1 max-h-48 overflow-y-auto">
            {upgradeLogs.map((log, idx) => (
              <div key={idx} className={log.includes('ERROR') ? 'text-red-400 font-bold' : log.includes('ROLLBACK') ? 'text-amber-400' : ''}>
                {log}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: UPDATE POLICIES */}
      {activeTab === 'policies' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { name: 'Global Enterprise Standard - Automatic Staged', channel: 'Stable', defer: '7 Days', reboot: 'Prompt with 4h deferral window' },
            { name: 'Pilot Ring Fast Track (Direct Canary/Beta)', channel: 'Beta', defer: '0 Days', reboot: 'Immediate restart outside business hours' },
            { name: 'Executive & VIP Conservative Pinning', channel: 'Stable (Pinned v3.8.2)', defer: '14 Days', reboot: 'Explicit user authorization' },
            { name: 'Trading Floor Zero-Downtime Frozen LTS', channel: 'Pinned Legacy (v3.7.9)', defer: '90 Days', reboot: 'Weekend maintenance window only' },
          ].map((pol) => (
            <div key={pol.name} className="p-5 rounded-2xl border border-[#E7ECF2] bg-white shadow-card space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-[#182230]">{pol.name}</span>
                <span className="px-2 py-0.5 rounded bg-blue-50 text-[#0796E5] font-semibold text-[10px]">
                  {pol.channel}
                </span>
              </div>
              <div className="space-y-1 text-[#667085]">
                <div>Deferral Period: <strong>{pol.defer}</strong></div>
                <div>Reboot Policy: <strong>{pol.reboot}</strong></div>
              </div>
              <div className="pt-2 flex justify-between border-t border-gray-100">
                <button
                  onClick={() => showToast(`Policy "${pol.name}" applied to target endpoints`)}
                  className="text-[#0796E5] font-semibold hover:underline"
                >
                  Apply Policy
                </button>
                <span className="text-gray-400">Intune ADMX Sync</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 5: RELEASE CHANNELS */}
      {activeTab === 'channels' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { channel: 'Stable Channel', ver: 'v3.8.2 GA', desc: 'Enterprise wide certified build. Undergoes full 5-ring staged rollout before general availability.', count: '1,920 nodes' },
            { channel: 'Beta Channel', ver: 'v3.9.0-beta.2', desc: 'Pre-release branch for evaluation of next-generation DirectML AI segmentation and ARM64 drivers.', count: '340 nodes' },
            { channel: 'Canary Channel', ver: 'v3.9.1 Nightly', desc: 'Daily automated developer preview for rapid integration verification in laboratory environments.', count: '126 nodes' },
          ].map((c) => (
            <div key={c.channel} className="p-5 rounded-2xl border border-[#E7ECF2] bg-white shadow-card space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-[#182230]">{c.channel}</span>
                <span className="font-mono text-xs text-[#0796E5] font-bold">{c.ver}</span>
              </div>
              <p className="text-xs text-[#667085] leading-relaxed">{c.desc}</p>
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-[#667085]">
                <span>Active Endpoints:</span>
                <span className="font-bold text-[#182230]">{c.count}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Release Wizard Modal */}
      {newReleaseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border p-6 space-y-4">
            <h3 className="font-bold text-base text-[#182230]">Create Application Release</h3>
            <form onSubmit={handleCreateRelease} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Version *</label>
                <input
                  type="text"
                  value={newVersion}
                  onChange={(e) => setNewVersion(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Channel</label>
                <select
                  value={newChannel}
                  onChange={(e) => setNewChannel(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-xs"
                >
                  <option value="Stable Candidate">Stable Candidate</option>
                  <option value="Stable">Stable</option>
                  <option value="Beta">Beta</option>
                  <option value="Canary">Canary</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Release Notes</label>
                <textarea
                  rows={3}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewReleaseOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[#667085]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#0796E5] text-white text-xs font-semibold shadow-xs"
                >
                  Publish Release
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
