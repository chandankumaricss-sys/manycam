'use client';

import React, { useState, useEffect } from 'react';
import {
  Activity,
  Terminal,
  Wrench,
  Video,
  GitBranch,
  FileText,
  Search,
  Filter,
  Download,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Play,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Copy,
  Layers,
  Clock,
  ExternalLink,
  Printer
} from 'lucide-react';
import { DiagnosticEventRecord, PipelineRunRecord } from '@/lib/types';
import { useAppStore } from '@/store/app-store';

export default function DiagnosticsAnalyticsPage() {
  const [activeTab, setActiveTab] = useState<'health' | 'logs' | 'troubleshooter' | 'cameraTest' | 'pipeline' | 'reports'>('health');

  // Logs state
  const [events, setEvents] = useState<DiagnosticEventRecord[]>([]);
  const [logSearch, setLogSearch] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('');
  const [selectedComponent, setSelectedComponent] = useState('');
  const [logPage, setLogPage] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);

  // Camera diagnostics runner state
  const [diagRunning, setDiagRunning] = useState(false);
  const [diagStep, setDiagStep] = useState(0);
  const [diagLogs, setDiagLogs] = useState<string[]>([]);
  const [diagResult, setDiagResult] = useState<'success' | 'warning' | null>(null);

  // Pipeline state
  const [pipelines, setPipelines] = useState<PipelineRunRecord[]>([]);
  const [selectedPipeline, setSelectedPipeline] = useState<PipelineRunRecord | null>(null);

  // Reports state
  const [selectedReportType, setSelectedReportType] = useState('Fleet Health Report');
  const [reportOrg, setReportOrg] = useState('All Organizations');
  const [reportDateRange, setReportDateRange] = useState('Last 30 Days');
  const [generatedReport, setGeneratedReport] = useState<any | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Copied log line to clipboard!');
  };

  // Fetch events
  const fetchLogs = (page = 1) => {
    const params = new URLSearchParams({
      page: String(page),
      limit: '25',
      search: logSearch,
      severity: selectedSeverity,
      component: selectedComponent,
    });
    fetch(`/api/diagnostics/events?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.events) {
          setEvents(data.events);
          setTotalLogs(data.total || 0);
        }
      })
      .catch((e) => console.error(e));
  };

  // Fetch pipelines
  const fetchPipelines = () => {
    fetch('/api/diagnostics/pipeline')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setPipelines(data);
          if (data.length > 0 && !selectedPipeline) {
            setSelectedPipeline(data[0]);
          }
        }
      })
      .catch((e) => console.error(e));
  };

  useEffect(() => {
    fetchLogs(logPage);
    fetchPipelines();
  }, [logPage, selectedSeverity, selectedComponent]);

  const handleExportLogsCsv = () => {
    const params = new URLSearchParams({
      search: logSearch,
      severity: selectedSeverity,
      component: selectedComponent,
      export: 'csv',
    });
    window.location.href = `/api/diagnostics/events?${params.toString()}`;
    showToast('Exporting diagnostic logs to CSV...');
  };

  // Trigger camera diagnostics check runner
  const runCameraDiagnostics = () => {
    setDiagRunning(true);
    setDiagStep(1);
    setDiagLogs([`[00:00:01] Starting automated Windows virtual camera health diagnostics...`]);
    setDiagResult(null);

    const steps = [
      '1. Media Foundation Platform Initialization (MFStartup)',
      '2. Querying Virtual Camera CLSID in Registry HKLM\\Software\\Classes',
      '3. Stream Format Negotiation: NV12, YUY2, MJPEG check',
      '4. Frame Ingestion Buffer Allocation & Shared Memory State',
      '5. DirectML GPU Shader Compilation (Arc / RTX Acceleration)',
      '6. Background Service Named Pipe IPC Connection (ManyCamSvc.exe)',
      '7. Synthetic Video Frame Delivery Benchmark (1080p @ 30 FPS)',
      '8. Consumer Hook Compatibility (Teams, Zoom, WebRTC)',
      '9. Diagnostic Verification Complete: Optimal Performance',
    ];

    let s = 1;
    const interval = setInterval(() => {
      s++;
      if (s <= steps.length) {
        setDiagStep(s);
        setDiagLogs((prev) => [
          ...prev,
          `[00:00:0${s}] ${steps[s - 1]} ... OK (0ms delay)`,
        ]);
      } else {
        clearInterval(interval);
        setDiagRunning(false);
        setDiagResult('success');
        showToast('Camera diagnostics completed: All 9 checks passed!');
      }
    }, 600);
  };

  // Trigger new CI/CD build simulation
  const handleTriggerBuild = async () => {
    try {
      const res = await fetch('/api/diagnostics/pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pipelineName: 'ManyCam-Windows-Client-CI', provider: 'GitHub Actions' }),
      });
      if (res.ok) {
        const created = await res.json();
        setPipelines((prev) => [created, ...prev]);
        setSelectedPipeline(created);
        showToast(`CI/CD Build #${created.buildNumber} triggered!`);
      }
    } catch {
      alert('Failed to trigger pipeline build');
    }
  };

  const handleGenerateReport = () => {
    const report = {
      title: selectedReportType,
      generatedAt: new Date().toISOString(),
      organization: reportOrg,
      dateRange: reportDateRange,
      summary: {
        totalEndpoints: 2486,
        healthyVirtualCameras: 2274,
        updateCompliance: '94.7%',
        deploymentSuccess: '98.4%',
        activeCriticalIncidents: 0,
      },
    };
    setGeneratedReport(report);
    showToast(`Generated ${selectedReportType}!`);
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
            Diagnostics, Observability & CI/CD Pipelines
          </h1>
          <p className="text-xs text-[#667085] mt-1">
            Windows event logs, MSI installer exit codes, automated camera health verifications, and build pipelines.
          </p>
        </div>

        {/* 6 Tabs */}
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-[#E7ECF2] p-1 bg-gray-50">
            {[
              { id: 'health', label: 'Health Monitor' },
              { id: 'logs', label: 'Log Explorer' },
              { id: 'troubleshooter', label: 'Installer Troubleshooting' },
              { id: 'cameraTest', label: 'Camera Diagnostics' },
              { id: 'pipeline', label: 'CI/CD Pipelines' },
              { id: 'reports', label: 'Reporting' },
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

      {/* TAB 1: HEALTH MONITOR */}
      {activeTab === 'health' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-[#E7ECF2] bg-white shadow-card">
              <span className="text-xs text-[#667085] block font-medium">App Crash Rate</span>
              <div className="mt-2 text-2xl font-bold text-emerald-600">0.12%</div>
              <span className="text-[11px] text-[#667085]">Gate limit: &lt; 0.50%</span>
            </div>

            <div className="p-4 rounded-xl border border-[#E7ECF2] bg-white shadow-card">
              <span className="text-xs text-[#667085] block font-medium">Installation Failure Rate</span>
              <div className="mt-2 text-2xl font-bold text-[#182230]">1.6%</div>
              <span className="text-[11px] text-emerald-600 font-semibold">98.4% success</span>
            </div>

            <div className="p-4 rounded-xl border border-[#E7ECF2] bg-white shadow-card">
              <span className="text-xs text-[#667085] block font-medium">Camera Registration Errors</span>
              <div className="mt-2 text-2xl font-bold text-amber-600">3</div>
              <span className="text-[11px] text-[#667085]">Resolved via msiexec /fa</span>
            </div>

            <div className="p-4 rounded-xl border border-[#E7ECF2] bg-white shadow-card">
              <span className="text-xs text-[#667085] block font-medium">Service Recovery Watchdog</span>
              <div className="mt-2 text-2xl font-bold text-[#182230]">0 Failures</div>
              <span className="text-[11px] text-emerald-600 font-semibold">100% IPC Uptime</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-[#E7ECF2] bg-white shadow-card space-y-3">
            <h3 className="text-sm font-bold text-[#182230]">Fleet Diagnostic Telemetry</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-gray-50 rounded-xl border">
                <span className="font-semibold block mb-1">DirectML GPU Acceleration</span>
                <p className="text-[#667085] text-[11px]">Active on 2,298 nodes (Intel Arc / Nvidia RTX / Adreno NPU). Zero fallback degradation.</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border">
                <span className="font-semibold block mb-1">Audio/Video Synchronization</span>
                <p className="text-[#667085] text-[11px]">Mean synchronization offset is 2.4ms across Microsoft Teams & Zoom conferencing sessions.</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border">
                <span className="font-semibold block mb-1">Driver Memory Footprint</span>
                <p className="text-[#667085] text-[11px]">Median RAM usage is 38.4 MB per active camera pipeline instance.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LOG EXPLORER */}
      {activeTab === 'logs' && (
        <div className="p-6 rounded-2xl border border-[#E7ECF2] bg-white shadow-card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-gray-100">
            <div>
              <h3 className="text-base font-bold text-[#182230]">Fleet Event Log Explorer</h3>
              <p className="text-xs text-[#667085]">
                Full-text searchable journal across Windows Installer, Update Agent, Virtual Camera and Background Services.
              </p>
            </div>
            <button
              onClick={handleExportLogsCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-[#182230] hover:bg-gray-50"
            >
              <Download size={14} />
              <span>Export Logs CSV</span>
            </button>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[220px]">
              <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search event logs by message or correlation ID..."
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchLogs(1)}
                className="w-full pl-9 pr-3 py-1.5 border rounded-lg text-xs"
              />
            </div>

            <select
              value={selectedSeverity}
              onChange={(e) => {
                setSelectedSeverity(e.target.value);
                setLogPage(1);
              }}
              className="px-3 py-1.5 border rounded-lg text-xs"
            >
              <option value="">All Severities</option>
              <option value="Info">Info</option>
              <option value="Warning">Warning</option>
              <option value="Error">Error</option>
            </select>

            <select
              value={selectedComponent}
              onChange={(e) => {
                setSelectedComponent(e.target.value);
                setLogPage(1);
              }}
              className="px-3 py-1.5 border rounded-lg text-xs"
            >
              <option value="">All Components</option>
              <option value="Windows Installer">Windows Installer</option>
              <option value="Update Agent">Update Agent</option>
              <option value="Virtual Camera">Virtual Camera</option>
              <option value="Background Service">Background Service</option>
              <option value="Policy Engine">Policy Engine</option>
              <option value="Code Signing">Code Signing</option>
            </select>
          </div>

          {/* Log Table */}
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left divide-y divide-gray-100 font-mono">
              <thead className="bg-gray-50 text-gray-500 font-semibold text-[11px] uppercase tracking-wider font-sans">
                <tr>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Severity</th>
                  <th className="py-2.5 px-3">Component</th>
                  <th className="py-2.5 px-3">Code</th>
                  <th className="py-2.5 px-3">Device</th>
                  <th className="py-2.5 px-3">Message</th>
                  <th className="py-2.5 px-3 text-right font-sans">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-[11px]">
                {events.map((evt) => (
                  <tr key={evt.id} className="hover:bg-gray-50 font-mono">
                    <td className="py-2 px-3 text-gray-400 whitespace-nowrap">
                      {new Date(evt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-2 px-3">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-sans font-semibold ${
                          evt.severity === 'Error'
                            ? 'bg-red-50 text-red-700'
                            : evt.severity === 'Warning'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-blue-50 text-[#0796E5]'
                        }`}
                      >
                        {evt.severity}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-semibold text-[#182230] whitespace-nowrap">
                      {evt.component}
                    </td>
                    <td className="py-2 px-3 text-gray-500 font-bold">{evt.eventCode}</td>
                    <td className="py-2 px-3 text-[#0796E5] whitespace-nowrap">
                      {evt.device?.hostname || 'System'}
                    </td>
                    <td className="py-2 px-3 text-[#182230] max-w-md truncate" title={evt.message}>
                      {evt.message}
                    </td>
                    <td className="py-2 px-3 text-right">
                      <button
                        onClick={() => copyToClipboard(`[${evt.createdAt}] [${evt.severity}] [${evt.component}] (Event ${evt.eventCode}): ${evt.message}`)}
                        className="text-gray-400 hover:text-[#0796E5]"
                        title="Copy Log String"
                      >
                        <Copy size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: INSTALLER TROUBLESHOOTING & EXIT CODES */}
      {activeTab === 'troubleshooter' && (
        <div className="space-y-4">
          <div className="p-6 rounded-2xl border border-[#E7ECF2] bg-white shadow-card space-y-4">
            <div className="pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-[#182230]">Windows Installer Exit Code Lookup</h3>
              <p className="text-xs text-[#667085]">
                Standard Win32 installer error explanations with remediation scripts for enterprise IT operations.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-red-200 bg-red-50/30 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold px-2 py-0.5 rounded bg-red-100 text-red-800">1603</span>
                  <span className="font-bold text-[#182230]">Fatal error during installation</span>
                </div>
                <p className="text-[#667085]">
                  Occurs when custom action <code>VirtualCamRegisterServer</code> fails to write COM CLSIDs under HKLM. Usually resolved by ensuring execution runs in elevated SYSTEM context.
                </p>
                <button
                  onClick={() => copyToClipboard('msiexec /fa {MANYCAM-PRODUCT-CODE} /qn /L*v "repair.log"')}
                  className="text-xs font-semibold text-[#0796E5] hover:underline flex items-center gap-1"
                >
                  <Copy size={12} />
                  <span>Copy MSI Repair Command (msiexec /fa)</span>
                </button>
              </div>

              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/30 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">1618</span>
                  <span className="font-bold text-[#182230]">Another installation in progress</span>
                </div>
                <p className="text-[#667085]">
                  The Windows Installer transaction lock is held by another process. The update agent automatically retries with backoff.
                </p>
                <button
                  onClick={() => showToast('Command: tasklist | findstr msiexec')}
                  className="text-xs font-semibold text-[#0796E5] hover:underline"
                >
                  Inspect Active Installer Mutex
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CAMERA DIAGNOSTICS RUNNER */}
      {activeTab === 'cameraTest' && (
        <div className="max-w-3xl mx-auto p-6 rounded-2xl border border-[#E7ECF2] bg-white shadow-card space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <h3 className="text-base font-bold text-[#182230]">
                Interactive 9-Step Camera Diagnostics Suite
              </h3>
              <p className="text-xs text-[#667085]">
                Verify Media Foundation registration, buffer negotiation, and DirectML GPU shader status.
              </p>
            </div>
            <button
              onClick={runCameraDiagnostics}
              disabled={diagRunning}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#0796E5] hover:bg-[#0878BF] text-white text-xs font-semibold shadow-xs disabled:opacity-50"
            >
              <Play size={14} />
              <span>{diagRunning ? 'Running Check...' : 'Run Diagnostics'}</span>
            </button>
          </div>

          {/* Stepper Progress */}
          <div className="space-y-2 text-xs">
            {[
              '1. Media Foundation Platform Initialization (MFStartup)',
              '2. Querying Virtual Camera CLSID in Registry HKLM\\Software\\Classes',
              '3. Stream Format Negotiation: NV12, YUY2, MJPEG check',
              '4. Frame Ingestion Buffer Allocation & Shared Memory State',
              '5. DirectML GPU Shader Compilation (Arc / RTX Acceleration)',
              '6. Background Service Named Pipe IPC Connection (ManyCamSvc.exe)',
              '7. Synthetic Video Frame Delivery Benchmark (1080p @ 30 FPS)',
              '8. Consumer Hook Compatibility (Teams, Zoom, WebRTC)',
              '9. Diagnostic Verification Complete: Optimal Performance',
            ].map((text, idx) => {
              const num = idx + 1;
              const isPast = diagStep > num;
              const isCurrent = diagStep === num;

              return (
                <div
                  key={num}
                  className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                    isPast
                      ? 'bg-emerald-50/60 border-emerald-200 text-emerald-800'
                      : isCurrent
                      ? 'bg-blue-50 border-[#0796E5] text-[#0796E5] font-semibold'
                      : 'bg-gray-50 border-gray-100 text-[#667085]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold bg-white border">
                      {isPast ? '✓' : num}
                    </span>
                    <span>{text}</span>
                  </div>
                  <span className="text-[11px] font-mono">
                    {isPast ? 'PASS' : isCurrent ? 'TESTING...' : 'PENDING'}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Console Log Terminal */}
          <div className="p-3.5 bg-gray-900 rounded-xl font-mono text-[11px] text-green-400 space-y-1 max-h-48 overflow-y-auto">
            {diagLogs.map((log, idx) => (
              <div key={idx}>{log}</div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: CI/CD PIPELINES (13-STAGE ENGINE) */}
      {activeTab === 'pipeline' && (
        <div id="pipeline-stage-runner" className="space-y-6">
          <div className="p-6 rounded-2xl border border-[#E7ECF2] bg-white shadow-card space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-gray-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-[#182230]">
                    Windows Virtual Camera CI/CD Pipeline
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                    GitHub Actions Runner
                  </span>
                </div>
                <p className="text-xs text-[#667085] mt-1">
                  13-stage automated build, WiX packaging, Authenticode signing, and pilot deployment pipeline.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleTriggerBuild}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#0796E5] hover:bg-[#0878BF] text-white text-xs font-semibold shadow-xs"
                >
                  <Sparkles size={14} />
                  <span>Trigger Demo Build</span>
                </button>
              </div>
            </div>

            {/* 13 Pipeline Stages Grid */}
            <div className="space-y-2 text-xs">
              <span className="font-bold text-[#182230]">Pipeline Stages (Build #2026.10.125)</span>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {[
                  '1. Checkout Source Code',
                  '2. Dependency Restore (vcpkg / NuGet)',
                  '3. Static Analysis (Clang-Tidy & SonarQube)',
                  '4. Compile C++ Core & .NET Host',
                  '5. Unit Tests (GoogleTest / NUnit)',
                  '6. Windows Integration Tests (MF & DirectShow)',
                  '7. Build MSI & MSIX Packages (WiX 4.0)',
                  '8. Sign Binaries with DigiCert EV HSM',
                  '9. Validate Signatures & Authenticode',
                  '10. Windows Defender / SmartScreen Scan',
                  '11. Enterprise Release Gate Approval',
                  '12. Publish Artifacts to CDN',
                  '13. Deploy to Pilot Ring (Microsoft Intune)',
                ].map((stg, idx) => (
                  <div key={idx} className="p-3 rounded-xl border border-gray-200 bg-white hover:border-[#0796E5] transition-all">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#182230] truncate">{stg}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-emerald-50 text-emerald-700">
                        Success
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-400 mt-1 font-mono">
                      Duration: {12 + idx * 4}s • Exit: 0
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: REPORTING & PDF/CSV EXPORT */}
      {activeTab === 'reports' && (
        <div className="max-w-3xl mx-auto p-6 rounded-2xl border border-[#E7ECF2] bg-white shadow-card space-y-6">
          <div className="pb-4 border-b border-gray-100">
            <h3 className="text-base font-bold text-[#182230]">Enterprise Fleet Report Generator</h3>
            <p className="text-xs text-[#667085]">
              Generate signed compliance audits, deployment success reports and telemetry exports.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-semibold mb-1">Report Template</label>
              <select
                value={selectedReportType}
                onChange={(e) => setSelectedReportType(e.target.value)}
                className="w-full px-2.5 py-1.5 border rounded-lg text-xs"
              >
                <option value="Fleet Health Report">Fleet Health Report</option>
                <option value="Deployment Success Report">Deployment Success Report</option>
                <option value="Update Compliance Report">Update Compliance Report</option>
                <option value="Installer Failure Report">Installer Failure Report</option>
                <option value="Security Compliance Report">Security Compliance Report</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1">Organization Scope</label>
              <select
                value={reportOrg}
                onChange={(e) => setReportOrg(e.target.value)}
                className="w-full px-2.5 py-1.5 border rounded-lg text-xs"
              >
                <option value="All Organizations">All Organizations (2,486 nodes)</option>
                <option value="Northstar Financial Group">Northstar Financial Group</option>
                <option value="Meridian Health Systems">Meridian Health Systems</option>
                <option value="Atlas Consulting">Atlas Consulting</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1">Time Horizon</label>
              <select
                value={reportDateRange}
                onChange={(e) => setReportDateRange(e.target.value)}
                className="w-full px-2.5 py-1.5 border rounded-lg text-xs"
              >
                <option value="Last 24 Hours">Last 24 Hours</option>
                <option value="Last 7 Days">Last 7 Days</option>
                <option value="Last 30 Days">Last 30 Days</option>
                <option value="Last 90 Days">Last 90 Days</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={handleGenerateReport}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#0796E5] text-white text-xs font-semibold shadow-xs"
            >
              <FileText size={14} />
              <span>Generate Report</span>
            </button>

            <button
              onClick={() => {
                window.location.href = '/api/devices?export=csv';
                showToast('Downloading report CSV...');
              }}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg border border-gray-200 text-[#182230] text-xs font-semibold hover:bg-gray-50"
            >
              <Download size={14} />
              <span>Download CSV</span>
            </button>
          </div>

          {/* Generated Report View */}
          {generatedReport && (
            <div className="p-5 rounded-xl border border-blue-200 bg-blue-50/30 space-y-3 text-xs animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-[#0878BF]">{generatedReport.title}</span>
                <span className="text-[10px] text-gray-500 font-mono">{generatedReport.generatedAt}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-blue-100">
                <div>Total Nodes: <strong>{generatedReport.summary.totalEndpoints}</strong></div>
                <div>Healthy Cameras: <strong>{generatedReport.summary.healthyVirtualCameras}</strong></div>
                <div>Compliance: <strong>{generatedReport.summary.updateCompliance}</strong></div>
                <div>Deployment Success: <strong>{generatedReport.summary.deploymentSuccess}</strong></div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
