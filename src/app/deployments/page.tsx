'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Send,
  Package,
  Layers,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Copy,
  Terminal,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  FileCode,
  Shield,
  Download,
  Check,
  Sparkles,
  Info
} from 'lucide-react';
import { PackageRecord, DeploymentRecord } from '@/lib/types';
import { useAppStore } from '@/store/app-store';

export default function DeploymentCenterPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs text-gray-400">Loading Deployment Center...</div>}>
      <DeploymentCenterContent />
    </Suspense>
  );
}

function DeploymentCenterContent() {
  const searchParams = useSearchParams();
  const autoOpenWizard = searchParams.get('wizard') === 'open';

  const [activeTab, setActiveTab] = useState<'packages' | 'deployments' | 'wizard' | 'integrations' | 'history'>('deployments');
  const [packages, setPackages] = useState<PackageRecord[]>([]);
  const [deployments, setDeployments] = useState<DeploymentRecord[]>([]);
  const [selectedDeployment, setSelectedDeployment] = useState<DeploymentRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Package Wizard state
  const [pkgWizardOpen, setPkgWizardOpen] = useState(false);
  const [pkgStep, setPkgStep] = useState(1);
  const [newPkgName, setNewPkgName] = useState('ManyCam Enterprise 3.8.3 (MSI x64)');
  const [newPkgVersion, setNewPkgVersion] = useState('3.8.3');
  const [newPkgType, setNewPkgType] = useState('MSI');
  const [newPkgArch, setNewPkgArch] = useState('x64');
  const [newPkgContext, setNewPkgContext] = useState('per-machine');

  // Deployment Wizard state
  const [depStep, setDepStep] = useState(1);
  const [depPackageId, setDepPackageId] = useState('');
  const [depTarget, setDepTarget] = useState('Pilot Ring - Windows 11 24H2');
  const [depMethod, setDepMethod] = useState('Microsoft Intune');
  const [depContext, setDepContext] = useState('per-machine');
  const [depRollbackEnabled, setDepRollbackEnabled] = useState(true);

  // Integrations state
  const [integrationStatuses, setIntegrationStatuses] = useState<{ [key: string]: string }>({
    intune: 'Configured (Demo Sync Active)',
    mecm: 'Demo Standby',
    gpo: 'ADMX Registered',
    store: 'Private Repository Active',
    avd: 'MSIX App Attach Ready',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Copied installer command to clipboard!');
  };

  const fetchPackagesAndDeployments = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/packages').then((r) => r.json()),
      fetch('/api/deployments').then((r) => r.json()),
    ])
      .then(([pkgsData, depsData]) => {
        if (Array.isArray(pkgsData)) setPackages(pkgsData);
        if (Array.isArray(depsData)) {
          setDeployments(depsData);
          if (depsData.length > 0 && !selectedDeployment) {
            setSelectedDeployment(depsData[0]);
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPackagesAndDeployments();
  }, []);

  useEffect(() => {
    if (autoOpenWizard) {
      setActiveTab('wizard');
    }
  }, [autoOpenWizard]);

  // Deployment action handler (pause, resume, retryFailed, advanceSimulation)
  const handleDeploymentAction = async (id: string, action: string) => {
    try {
      const res = await fetch(`/api/deployments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        const updated = await res.json();
        setSelectedDeployment(updated);
        setDeployments((prev) => prev.map((d) => (d.id === id ? updated : d)));
        showToast(`Deployment ${action} successfully`);
      }
    } catch {
      alert('Failed to update deployment');
    }
  };

  // Launch Deployment Wizard Simulation
  const handleLaunchDeployment = async () => {
    try {
      const targetPkgId = depPackageId || packages[0]?.id || 'pkg-382-msi-x64';
      const res = await fetch('/api/deployments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: targetPkgId,
          targetName: depTarget,
          deploymentMethod: depMethod,
          installContext: depContext,
          totalDevices: 120,
        }),
      });
      if (res.ok) {
        const created = await res.json();
        setDeployments((prev) => [created, ...prev]);
        setSelectedDeployment(created);
        setActiveTab('deployments');
        setDepStep(1);
        showToast(`Simulation started: Deployment ${created.id} initiated!`);
      }
    } catch {
      alert('Failed to launch deployment simulation');
    }
  };

  // Publish New Package Wizard
  const handlePublishPackage = async () => {
    try {
      const res = await fetch('/api/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newPkgName,
          version: newPkgVersion,
          packageType: newPkgType,
          architecture: newPkgArch,
          installContext: newPkgContext,
        }),
      });
      if (res.ok) {
        const created = await res.json();
        setPackages((prev) => [created, ...prev]);
        setPkgWizardOpen(false);
        setPkgStep(1);
        showToast(`Package "${created.name}" published to registry!`);
      }
    } catch {
      alert('Failed to publish package');
    }
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
            Enterprise Deployment Center
          </h1>
          <p className="text-xs text-[#667085] mt-1">
            Silent MSI/MSIX packaging, Microsoft Intune & MECM integration, detection rules, and node error remediation.
          </p>
        </div>

        {/* 5 Tabs Navigation */}
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-[#E7ECF2] p-1 bg-gray-50">
            {[
              { id: 'deployments', label: 'Deployments' },
              { id: 'packages', label: 'Package Registry' },
              { id: 'wizard', label: 'Deployment Wizard' },
              { id: 'integrations', label: 'Integrations' },
              { id: 'history', label: 'Troubleshooting & Exit Codes' },
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

      {/* TAB 1: ACTIVE DEPLOYMENTS & LIVE OPERATIONS MONITOR */}
      {activeTab === 'deployments' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (5 cols): Deployment Jobs List */}
          <div className="lg:col-span-5 p-5 rounded-2xl border border-[#E7ECF2] bg-white shadow-card space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-sm font-bold text-[#182230]">Deployment Jobs</h3>
              <button
                id="btn-launch-deployment"
                onClick={() => setActiveTab('wizard')}
                className="flex items-center gap-1 text-xs font-semibold text-[#0796E5] hover:underline"
              >
                <Plus size={14} />
                <span>New Deployment</span>
              </button>
            </div>

            <div className="divide-y divide-gray-100 max-h-[620px] overflow-y-auto pr-1">
              {deployments.map((dep) => {
                const isSelected = selectedDeployment?.id === dep.id;
                let statusBadge = 'bg-blue-50 text-[#0796E5] border-blue-200';
                if (dep.status === 'Completed') statusBadge = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                else if (dep.status === 'Failed') statusBadge = 'bg-red-50 text-red-700 border-red-200';
                else if (dep.status === 'Paused') statusBadge = 'bg-amber-50 text-amber-700 border-amber-200';

                return (
                  <button
                    key={dep.id}
                    onClick={() => setSelectedDeployment(dep)}
                    className={`w-full p-3 text-left rounded-xl transition-all ${
                      isSelected
                        ? 'bg-[#EFF8FF] border border-[#0796E5]'
                        : 'bg-white hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#182230] font-mono">
                        {dep.id}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${statusBadge}`}>
                        {dep.status}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-[#182230] mt-1 truncate">
                      {dep.package?.name || 'ManyCam Enterprise MSI'}
                    </div>

                    <div className="text-[11px] text-[#667085] mt-0.5 flex items-center justify-between">
                      <span>Target: {dep.targetName}</span>
                      <span>Method: {dep.deploymentMethod}</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-2">
                      <div className="flex justify-between text-[10px] font-mono mb-1 text-[#667085]">
                        <span>Progress</span>
                        <span>{dep.progress}% ({dep.successfulCount}/{dep.totalDevices})</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#0796E5] rounded-full transition-all duration-300"
                          style={{ width: `${dep.progress}%` }}
                        />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column (7 cols): Selected Deployment Inspection & Controls */}
          <div id="active-deployment-card" className="lg:col-span-7 p-6 rounded-2xl border border-[#E7ECF2] bg-white shadow-card space-y-5">
            {selectedDeployment ? (
              <>
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-[#182230] font-mono">
                        {selectedDeployment.id}
                      </span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-blue-50 text-[#0796E5]">
                        {selectedDeployment.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#667085] mt-0.5">
                      Initiated by {selectedDeployment.initiatedBy} via {selectedDeployment.deploymentMethod}
                    </p>
                  </div>

                  {/* Operational Action Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDeploymentAction(selectedDeployment.id, 'advanceSimulation')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0796E5] hover:bg-[#0878BF] text-white text-xs font-semibold shadow-xs"
                      title="Advance deterministic simulation by 25%"
                    >
                      <Sparkles size={14} />
                      <span>Advance Simulation</span>
                    </button>

                    {selectedDeployment.status === 'Running' ? (
                      <button
                        onClick={() => handleDeploymentAction(selectedDeployment.id, 'pause')}
                        className="p-1.5 rounded-lg border text-gray-600 hover:bg-gray-50"
                        title="Pause Deployment"
                      >
                        <Pause size={15} />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleDeploymentAction(selectedDeployment.id, 'resume')}
                        className="p-1.5 rounded-lg border text-gray-600 hover:bg-gray-50"
                        title="Resume Deployment"
                      >
                        <Play size={15} />
                      </button>
                    )}

                    <button
                      onClick={() => handleDeploymentAction(selectedDeployment.id, 'retryFailed')}
                      className="p-1.5 rounded-lg border text-[#0796E5] hover:bg-blue-50"
                      title="Retry Failed Nodes (Exit 1603)"
                    >
                      <RotateCcw size={15} />
                    </button>
                  </div>
                </div>

                {/* Progress Stats Summary Cards */}
                <div className="grid grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-gray-50 border">
                    <span className="text-[11px] text-[#667085] block">Total Targets</span>
                    <span className="text-base font-bold text-[#182230]">{selectedDeployment.totalDevices}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                    <span className="text-[11px] text-emerald-700 block">Succeeded</span>
                    <span className="text-base font-bold text-emerald-800">{selectedDeployment.successfulCount}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
                    <span className="text-[11px] text-amber-700 block">Pending</span>
                    <span className="text-base font-bold text-amber-800">{selectedDeployment.pendingCount}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-red-50 border border-red-100">
                    <span className="text-[11px] text-red-700 block">Failed (1603)</span>
                    <span className="text-base font-bold text-red-800">{selectedDeployment.failedCount}</span>
                  </div>
                </div>

                {/* Silent Command Execution Box with Copy */}
                <div className="p-3.5 rounded-xl bg-gray-900 text-white font-mono text-[11px] space-y-2">
                  <div className="flex items-center justify-between text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <Terminal size={14} className="text-green-400" />
                      <span>Executed Command (Silent Enterprise Deployment)</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(`msiexec /i "${selectedDeployment.package?.name || 'ManyCam.msi'}" /qn /norestart /L*v "%ProgramData%\\ManyCam\\install.log"`)}
                      className="text-gray-400 hover:text-white flex items-center gap-1"
                    >
                      <Copy size={12} />
                      <span>Copy</span>
                    </button>
                  </div>
                  <div className="text-green-400 overflow-x-auto select-all">
                    msiexec /i &quot;ManyCamEnterprise-3.8.2-x64.msi&quot; /qn /norestart ALLUSERS=1 /L*v &quot;%ProgramData%\ManyCam\install.log&quot;
                  </div>
                </div>

                {/* Live Step Logs */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-[#182230]">Installer Event Journal</span>
                  <div className="p-3 bg-gray-50 border rounded-xl max-h-48 overflow-y-auto font-mono text-[11px] space-y-1.5">
                    {JSON.parse(selectedDeployment.logsJson || '[]').map((log: any, idx: number) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-gray-400 flex-shrink-0">{log.time}</span>
                        <span className={log.level === 'ERROR' ? 'text-red-600 font-bold' : log.level === 'WARN' ? 'text-amber-600' : 'text-blue-600'}>
                          [{log.level}]
                        </span>
                        <span className="text-[#182230]">{log.msg}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="py-20 text-center text-gray-400 text-xs">
                Select a deployment from the left list to inspect details.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: PACKAGE REGISTRY */}
      {activeTab === 'packages' && (
        <div id="packages-registry-card" className="p-6 rounded-2xl border border-[#E7ECF2] bg-white shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h3 className="text-base font-bold text-[#182230]">Application Package Registry</h3>
              <p className="text-xs text-[#667085]">
                Verified Authenticode MSI, MSIX, and WiX installers certified for Windows enterprise deployment.
              </p>
            </div>
            <button
              onClick={() => setPkgWizardOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#0796E5] text-white text-xs font-semibold shadow-xs"
            >
              <Plus size={15} />
              <span>Publish Package Wizard</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-gray-100">
              <thead className="bg-[#F8FAFC] text-[#667085] font-semibold text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-3">Package Name</th>
                  <th className="py-3 px-3">Format & Arch</th>
                  <th className="py-3 px-3">Version</th>
                  <th className="py-3 px-3">Size</th>
                  <th className="py-3 px-3">Authenticode Signing</th>
                  <th className="py-3 px-3">SHA-256 Digest</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {packages.map((pkg) => (
                  <tr key={pkg.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-3 font-medium text-[#182230]">
                      <div className="font-bold">{pkg.name}</div>
                      <span className="text-[10px] text-gray-400 font-mono">{pkg.id}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-[#0796E5] font-mono text-[10px] font-semibold">
                        {pkg.packageType} • {pkg.architecture}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-semibold">{pkg.version}</td>
                    <td className="py-3 px-3 text-gray-500 font-mono">{pkg.fileSize}</td>
                    <td className="py-3 px-3">
                      <span className="flex items-center gap-1 text-emerald-600 font-semibold text-[11px]">
                        <CheckCircle2 size={13} />
                        {pkg.signingStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-[10px] text-gray-400 truncate max-w-[140px]">
                      {pkg.sha256}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => copyToClipboard(`msiexec /i "${pkg.name}.msi" /qn ALLUSERS=1`)}
                        className="text-xs text-[#0796E5] hover:underline font-semibold"
                      >
                        Copy Command
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: 8-STEP DEPLOYMENT WIZARD */}
      {activeTab === 'wizard' && (
        <div className="max-w-3xl mx-auto p-6 rounded-2xl border border-[#E7ECF2] bg-white shadow-card space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <h3 className="text-base font-bold text-[#182230]">Enterprise Deployment Wizard</h3>
              <p className="text-xs text-[#667085]">Step {depStep} of 6: Configure deployment parameters</p>
            </div>
            <span className="px-2.5 py-1 rounded bg-blue-50 text-[#0796E5] text-xs font-semibold">
              Simulation Mode
            </span>
          </div>

          {/* Stepper Dots */}
          <div className="flex items-center justify-between">
            {['1. Select Package', '2. Target Group', '3. Method', '4. Context', '5. Schedule', '6. Launch'].map(
              (label, idx) => (
                <div key={label} className="flex flex-col items-center">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      depStep === idx + 1
                        ? 'bg-[#0796E5] text-white ring-4 ring-blue-100'
                        : depStep > idx + 1
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {depStep > idx + 1 ? '✓' : idx + 1}
                  </div>
                  <span className="text-[10px] text-gray-500 mt-1 hidden sm:inline">{label}</span>
                </div>
              )
            )}
          </div>

          {/* Wizard Step Content */}
          <div className="py-4 space-y-4 text-xs">
            {depStep === 1 && (
              <div className="space-y-3">
                <label className="block font-bold text-xs text-[#182230]">
                  Select Application Package
                </label>
                <div className="space-y-2">
                  {packages.slice(0, 4).map((p) => (
                    <div
                      key={p.id}
                      onClick={() => setDepPackageId(p.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        depPackageId === p.id
                          ? 'border-[#0796E5] bg-blue-50/50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#182230]">{p.name}</span>
                        <span className="text-xs font-mono text-[#0796E5]">{p.packageType}</span>
                      </div>
                      <div className="text-[11px] text-[#667085] mt-1">
                        SHA-256: {p.sha256.substring(0, 24)}... • {p.fileSize}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {depStep === 2 && (
              <div className="space-y-3">
                <label className="block font-bold text-xs text-[#182230]">
                  Select Target Deployment Cohort
                </label>
                <select
                  value={depTarget}
                  onChange={(e) => setDepTarget(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-xs"
                >
                  <option value="Pilot Ring - Windows 11 24H2">Pilot Ring - Windows 11 24H2 (120 nodes)</option>
                  <option value="Executive Laptops - NY">Executive Laptops - NY (85 nodes)</option>
                  <option value="Trading Floor Desks - London">Trading Floor Desks - London (240 nodes)</option>
                  <option value="Broad Rollout Wave 1">Broad Rollout Wave 1 (650 nodes)</option>
                  <option value="All Managed Fleet Endpoints">All Managed Fleet Endpoints (2,486 nodes)</option>
                </select>
              </div>
            )}

            {depStep === 3 && (
              <div className="space-y-3">
                <label className="block font-bold text-xs text-[#182230]">
                  Enterprise Distribution Gateway
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['Microsoft Intune', 'MECM / SCCM', 'Active Directory GPO', 'winget / Private Repository'].map(
                    (m) => (
                      <div
                        key={m}
                        onClick={() => setDepMethod(m)}
                        className={`p-3 rounded-xl border cursor-pointer text-xs font-semibold ${
                          depMethod === m
                            ? 'border-[#0796E5] bg-blue-50/50 text-[#0796E5]'
                            : 'border-gray-200 text-[#182230]'
                        }`}
                      >
                        {m}
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {depStep === 4 && (
              <div className="space-y-3">
                <label className="block font-bold text-xs text-[#182230]">
                  Installation Context & Elevation
                </label>
                <div className="p-3 bg-gray-50 border rounded-xl space-y-2 text-[11px] text-[#667085]">
                  <div>
                    <strong>Per-Machine Context (ALLUSERS=1):</strong> Required for Media Foundation virtual camera filter registration in HKLM and background service installation.
                  </div>
                  <div>
                    <strong>Reboot Policy:</strong> Suppressed (<code>/norestart</code>) with exit code 3010 logged if reboot is deferred.
                  </div>
                </div>
              </div>
            )}

            {depStep === 5 && (
              <div className="space-y-3">
                <label className="block font-bold text-xs text-[#182230]">
                  Execution Schedule & Rollback Strategy
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={depRollbackEnabled}
                    onChange={(e) => setDepRollbackEnabled(e.target.checked)}
                    className="rounded text-[#0796E5]"
                  />
                  <span>Enable automatic rollback if failure rate exceeds 2.0%</span>
                </div>
              </div>
            )}

            {depStep === 6 && (
              <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-xl space-y-2 text-xs">
                <div className="font-bold text-[#0796E5]">Review & Launch Simulation</div>
                <div>Target: <strong>{depTarget}</strong></div>
                <div>Method: <strong>{depMethod}</strong></div>
                <div>Package: <strong>{packages.find((p) => p.id === depPackageId)?.name || 'ManyCam MSI 3.8.2'}</strong></div>
              </div>
            )}
          </div>

          {/* Stepper Navigation */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <button
              onClick={() => setDepStep((s) => Math.max(1, s - 1))}
              disabled={depStep === 1}
              className="px-3 py-1.5 rounded-lg border text-xs font-semibold text-[#667085] disabled:opacity-40"
            >
              Previous
            </button>

            {depStep < 6 ? (
              <button
                onClick={() => setDepStep((s) => Math.min(6, s + 1))}
                className="px-4 py-1.5 rounded-lg bg-[#0796E5] text-white text-xs font-semibold shadow-xs"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleLaunchDeployment}
                className="px-5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs"
              >
                Launch Simulation
              </button>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: ENTERPRISE INTEGRATIONS */}
      {activeTab === 'integrations' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { id: 'intune', name: 'Microsoft Intune', desc: 'Modern MDM deployment via Win32 app packaging (IntuneWin) and graph API sync.', status: integrationStatuses.intune },
            { id: 'mecm', name: 'Microsoft Configuration Manager (MECM/SCCM)', desc: 'Task sequence integration, boundary group distribution and software center catalog.', status: integrationStatuses.mecm },
            { id: 'gpo', name: 'Active Directory Group Policy (ADMX)', desc: 'Administrative templates for silent software installation and registry key lock.', status: integrationStatuses.gpo },
            { id: 'avd', name: 'Azure Virtual Desktop (MSIX App Attach)', desc: 'Dynamic VHDX packaging for virtual desktop multi-session host pools.', status: integrationStatuses.avd },
          ].map((item) => (
            <div key={item.id} className="p-5 rounded-2xl border border-[#E7ECF2] bg-white shadow-card space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-[#182230]">{item.name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-emerald-50 text-emerald-700">
                  {item.status}
                </span>
              </div>
              <p className="text-xs text-[#667085]">{item.desc}</p>
              <div className="pt-2 flex items-center justify-between text-xs">
                <button
                  onClick={() => showToast(`Simulated test connection for ${item.name}: OK`)}
                  className="text-[#0796E5] font-semibold hover:underline"
                >
                  Test Connection
                </button>
                <span className="text-gray-400">Tenant: manycam-demo.onmicrosoft.com</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 5: TROUBLESHOOTING & EXIT CODES */}
      {activeTab === 'history' && (
        <div className="p-6 rounded-2xl border border-[#E7ECF2] bg-white shadow-card space-y-4">
          <div className="pb-3 border-b border-gray-100">
            <h3 className="text-base font-bold text-[#182230]">Windows Installer Troubleshooting Guide</h3>
            <p className="text-xs text-[#667085]">
              Diagnostic analysis of common installation errors across Windows virtual camera fleets.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                code: '1603',
                title: 'Fatal error during installation (ERROR_INSTALL_FAILURE)',
                cause: 'VirtualCamRegisterServer custom action failed due to lack of SYSTEM elevation or AppLocker/WDAC policy blocking binary.',
                remediation: 'Ensure package is launched in machine context (ALLUSERS=1). Verify WDAC hash exemption for ManyCamService.exe.',
                actionText: 'Simulate Automated Remediation',
              },
              {
                code: '1618',
                title: 'Another installation is already in progress (ERROR_INSTALL_ALREADY_RUNNING)',
                cause: 'Windows Installer service mutex is locked by an ongoing Windows Update or Office click-to-run setup.',
                remediation: 'Update agent automatically retries with exponential backoff (120s delay).',
                actionText: 'View Retry Queue',
              },
              {
                code: '3010',
                title: 'Success, reboot required (ERROR_SUCCESS_REBOOT_REQUIRED)',
                cause: 'DirectShow or Media Foundation virtual capture pin requires restart to bind in existing communication processes.',
                remediation: 'Reboot scheduled during user-defined maintenance window.',
                actionText: 'Schedule Restart',
              },
            ].map((err) => (
              <div key={err.code} className="p-4 rounded-xl border border-gray-200 bg-white hover:border-blue-200 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-red-100 text-red-800">
                    Exit {err.code}
                  </span>
                  <span className="font-bold text-xs text-[#182230]">{err.title}</span>
                </div>
                <div className="text-xs text-[#667085]">
                  <strong>Root Cause:</strong> {err.cause}
                </div>
                <div className="text-xs text-[#667085]">
                  <strong>Remediation:</strong> {err.remediation}
                </div>
                <button
                  onClick={() => showToast(`Remediation executed for Exit Code ${err.code}`)}
                  className="mt-2 text-xs text-[#0796E5] font-semibold hover:underline"
                >
                  {err.actionText} &rarr;
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Publish Package Wizard Modal */}
      {pkgWizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border p-6 space-y-4">
            <h3 className="font-bold text-base text-[#182230]">Publish Package Wizard</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Package Name *</label>
                <input
                  type="text"
                  value={newPkgName}
                  onChange={(e) => setNewPkgName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Version *</label>
                  <input
                    type="text"
                    value={newPkgVersion}
                    onChange={(e) => setNewPkgVersion(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Format</label>
                  <select
                    value={newPkgType}
                    onChange={(e) => setNewPkgType(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-xs"
                  >
                    <option value="MSI">MSI (Standard Windows Installer)</option>
                    <option value="MSIX">MSIX (Modern Container)</option>
                    <option value="WiX-MSI">WiX-based MSI</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPkgWizardOpen(false)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[#667085]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePublishPackage}
                className="px-4 py-1.5 rounded-lg bg-[#0796E5] text-white text-xs font-semibold shadow-xs"
              >
                Publish Package
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
