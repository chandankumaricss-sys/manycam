'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Key,
  FileCheck2,
  Lock,
  AlertTriangle,
  CheckCircle2,
  Download,
  Users,
  Shield,
  Clock,
  Search,
  ChevronRight,
  Sparkles,
  ExternalLink,
  Layers,
  Terminal,
  Activity
} from 'lucide-react';
import { CertificateRecord, AuditLogRecord } from '@/lib/types';
import { useAppStore } from '@/store/app-store';

export default function SecurityCompliancePage() {
  const { currentRole, setRole } = useAppStore();
  const [activeTab, setActiveTab] = useState<'posture' | 'signing' | 'policies' | 'edr' | 'rbac' | 'audit'>('posture');

  const [certificates, setCertificates] = useState<CertificateRecord[]>([]);
  const [posture, setPosture] = useState<any>({
    totalDevices: 2486,
    compliantDevices: 2354,
    complianceRate: 94.7,
    nonCompliant: 92,
    pendingReview: 40,
    signedPackages: 8,
    activeCertificates: 2,
    expiringCertificates: 1,
  });
  const [compatibilityMatrix, setCompatibilityMatrix] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogRecord[]>([]);
  const [auditSearch, setAuditSearch] = useState('');
  const [auditFilter, setAuditFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchSecurity = () => {
    setLoading(true);
    fetch('/api/security')
      .then((res) => res.json())
      .then((data) => {
        if (data.certificates) setCertificates(data.certificates);
        if (data.posture) setPosture(data.posture);
        if (data.compatibilityMatrix) setCompatibilityMatrix(data.compatibilityMatrix);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });

    fetch('/api/audit')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setAuditLogs(data);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchSecurity();
  }, []);

  const handleExportAudit = () => {
    window.location.href = '/api/audit?export=csv';
    showToast('Exporting complete audit trail to CSV...');
  };

  const filteredAudits = auditLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.actorName.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.correlationId.toLowerCase().includes(auditSearch.toLowerCase());
    const matchesFilter = auditFilter ? log.resourceType === auditFilter : true;
    return matchesSearch && matchesFilter;
  });

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
            Security Posture & Compliance Center
          </h1>
          <p className="text-xs text-[#667085] mt-1">
            Authenticode code signing, WHQL driver attestation, AppLocker & WDAC enforcement, and immutable audit trails.
          </p>
        </div>

        {/* 6 Tabs */}
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-[#E7ECF2] p-1 bg-gray-50">
            {[
              { id: 'posture', label: 'Security Posture' },
              { id: 'signing', label: 'Code Signing' },
              { id: 'policies', label: 'Windows Policies' },
              { id: 'edr', label: 'EDR Matrix' },
              { id: 'rbac', label: 'Role Permissions' },
              { id: 'audit', label: 'Audit Trail' },
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

      {/* TAB 1: SECURITY POSTURE OVERVIEW */}
      {activeTab === 'posture' && (
        <div id="security-posture-overview" className="space-y-6">
          {/* Posture KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="p-4 rounded-xl border border-[#E7ECF2] bg-white shadow-card">
              <span className="text-xs text-[#667085] block font-medium">Signed Packages</span>
              <div className="mt-2 text-2xl font-bold text-[#182230]">{posture.signedPackages} / 8</div>
              <span className="text-[11px] text-emerald-600 font-semibold">100% Authenticode</span>
            </div>

            <div className="p-4 rounded-xl border border-[#E7ECF2] bg-white shadow-card">
              <span className="text-xs text-[#667085] block font-medium">Compliant Devices</span>
              <div className="mt-2 text-2xl font-bold text-[#182230]">{posture.compliantDevices.toLocaleString()}</div>
              <span className="text-[11px] text-emerald-600 font-semibold">{posture.complianceRate}% of fleet</span>
            </div>

            <div className="p-4 rounded-xl border border-[#E7ECF2] bg-white shadow-card">
              <span className="text-xs text-[#667085] block font-medium">Security Exceptions</span>
              <div className="mt-2 text-2xl font-bold text-amber-600">{posture.nonCompliant}</div>
              <span className="text-[11px] text-amber-700 font-medium">Pending update</span>
            </div>

            <div className="p-4 rounded-xl border border-[#E7ECF2] bg-white shadow-card">
              <span className="text-xs text-[#667085] block font-medium">Blocked Installs</span>
              <div className="mt-2 text-2xl font-bold text-[#182230]">0</div>
              <span className="text-[11px] text-emerald-600 font-semibold">Zero WDAC blocks</span>
            </div>

            <div className="p-4 rounded-xl border border-[#E7ECF2] bg-white shadow-card">
              <span className="text-xs text-[#667085] block font-medium">Expiring Certs</span>
              <div className="mt-2 text-2xl font-bold text-amber-600">{posture.expiringCertificates}</div>
              <span className="text-[11px] text-amber-700 font-medium">Staging Key (44d)</span>
            </div>

            <div className="p-4 rounded-xl border border-[#E7ECF2] bg-white shadow-card">
              <span className="text-xs text-[#667085] block font-medium">Pending Reviews</span>
              <div className="mt-2 text-2xl font-bold text-[#182230]">{posture.pendingReview}</div>
              <span className="text-[11px] text-[#667085]">Awaiting policy sync</span>
            </div>
          </div>

          {/* Compliance Matrix and Posture Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl border border-[#E7ECF2] bg-white shadow-card space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="text-sm font-bold text-[#182230]">Windows Security Control Gates</h3>
                <span className="text-[11px] text-[#0796E5] font-semibold bg-blue-50 px-2 py-0.5 rounded">
                  Enforced
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                {[
                  { name: 'UAC Context Boundary', status: 'Enforced', desc: 'Background service executes as SYSTEM; UI runs non-elevated in user token.' },
                  { name: 'SmartScreen Reputation Check', status: 'Passed', desc: 'Binaries signed by DigiCert EV root with positive Microsoft reputation.' },
                  { name: 'AppLocker Publisher Rules', status: 'Compliant', desc: 'Catalog hash and publisher CN="ManyCam LLC" permitted.' },
                  { name: 'WDAC User-Mode Code Integrity (UMCI)', status: 'Validated', desc: 'Policy enforces WHQL signed drivers and Authenticode binaries.' },
                ].map((item) => (
                  <div key={item.name} className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-start justify-between">
                    <div>
                      <div className="font-bold text-[#182230]">{item.name}</div>
                      <div className="text-[11px] text-[#667085] mt-0.5">{item.desc}</div>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-[#E7ECF2] bg-white shadow-card space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="text-sm font-bold text-[#182230]">Recent Security Assessments</h3>
                <button
                  onClick={() => showToast('Simulated security scan initiated across 2,486 nodes')}
                  className="text-xs text-[#0796E5] font-semibold hover:underline"
                >
                  Run Fleet Assessment
                </button>
              </div>

              <div className="space-y-2.5 text-xs">
                {[
                  { endpoint: 'VCA-NYC-0001', check: 'WDAC & AppLocker Integrity', result: 'Pass', time: '12m ago' },
                  { endpoint: 'VCA-LON-0042', check: 'Media Foundation Driver Signature', result: 'Pass', time: '45m ago' },
                  { endpoint: 'VCA-BER-0026', check: 'ARM64 Driver Execution Hash', result: 'Pass', time: '2h ago' },
                  { endpoint: 'VCA-SFO-0118', check: 'Controlled Folder Access Exemption', result: 'Pass', time: '4h ago' },
                ].map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl border border-gray-100 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-[#182230] font-mono">{item.endpoint}</div>
                      <div className="text-[11px] text-[#667085]">{item.check}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-emerald-50 text-emerald-700">
                        {item.result}
                      </span>
                      <div className="text-[10px] text-gray-400 mt-0.5">{item.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CODE SIGNING MANAGEMENT */}
      {activeTab === 'signing' && (
        <div className="space-y-6">
          {/* Conceptual Signing Flow Diagram */}
          <div className="p-5 rounded-2xl border border-[#E7ECF2] bg-white shadow-card space-y-3">
            <h3 className="text-sm font-bold text-[#182230]">Enterprise Authenticode Signing Pipeline</h3>
            <div className="p-4 bg-gray-50 rounded-xl border flex flex-wrap items-center justify-between gap-2 text-xs">
              {[
                '1. Build Artifact (MSI/MSIX)',
                '2. SHA-256 Hash Generation',
                '3. Azure Key Vault HSM Signing',
                '4. RFC 3161 Timestamping',
                '5. Authenticode Verification',
                '6. Published to Fleet',
              ].map((step, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="font-semibold text-[#182230] bg-white px-2.5 py-1 rounded-lg border">
                    {step}
                  </span>
                  {idx < 5 && <ChevronRight size={14} className="text-gray-400 hidden sm:inline" />}
                </div>
              ))}
            </div>
          </div>

          {/* Certificate Registry Table */}
          <div className="p-6 rounded-2xl border border-[#E7ECF2] bg-white shadow-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-[#182230]">Active Certificate Metadata Records</h3>
              <button
                onClick={() => showToast('Authenticode signature report exported')}
                className="flex items-center gap-1 text-xs text-[#0796E5] font-semibold hover:underline"
              >
                <Download size={14} />
                <span>Export Signing Report</span>
              </button>
            </div>

            <div className="divide-y divide-gray-100">
              {certificates.map((cert) => (
                <div key={cert.id} className="py-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Key size={16} className="text-[#0796E5]" />
                      <span className="font-bold text-sm text-[#182230]">{cert.alias}</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        cert.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {cert.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-[#667085]">
                    <div>Publisher: <strong className="text-[#182230]">{cert.publisher}</strong></div>
                    <div>Issuer: <strong className="text-[#182230]">{cert.issuer}</strong></div>
                    <div>Thumbprint: <span className="font-mono text-gray-500">{cert.thumbprint}</span></div>
                    <div>Algorithm: <span>{cert.algorithm} • Timestamp: RFC 3161</span></div>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs">
                    <span className="text-gray-500">
                      Expires: {new Date(cert.expiresAt).toLocaleDateString()} • HSM: {cert.pipelineIntegration}
                    </span>
                    <button
                      onClick={() => showToast(`Verified signature record for "${cert.alias}"`)}
                      className="text-[#0796E5] font-semibold hover:underline"
                    >
                      Verify Driver Signature
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: WINDOWS POLICIES & ADMX */}
      {activeTab === 'policies' && (
        <div className="p-6 rounded-2xl border border-[#E7ECF2] bg-white shadow-card space-y-4">
          <div className="pb-3 border-b border-gray-100">
            <h3 className="text-base font-bold text-[#182230]">Windows ADMX Registry Policies</h3>
            <p className="text-xs text-[#667085]">
              Policies enforced under <code>HKLM\SOFTWARE\Policies\ManyCam\Enterprise</code> across endpoints.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {[
              { key: 'EnforceSignedDrivers', type: 'DWORD', val: '00000001', desc: 'Blocks loading of any unregistered or self-signed virtual camera filter pins.' },
              { key: 'RestrictUserConfig', type: 'DWORD', val: '00000000', desc: 'Allows end-users to select background blur while locking max resolution.' },
              { key: 'EnforcePrivacyIndicator', type: 'DWORD', val: '00000001', desc: 'Mandates Windows taskbar green camera in-use privacy icon.' },
              { key: 'DisableNDIStreaming', type: 'DWORD', val: '00000001', desc: 'Restricts broadcasting raw camera buffers over local area network.' },
            ].map((pol) => (
              <div key={pol.key} className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-1.5 font-mono">
                <div className="flex justify-between font-bold text-[#182230]">
                  <span>{pol.key}</span>
                  <span className="text-[#0796E5]">{pol.val}</span>
                </div>
                <div className="text-[11px] text-[#667085] font-sans">{pol.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ENDPOINT COMPATIBILITY MATRIX (EDR) */}
      {activeTab === 'edr' && (
        <div className="p-6 rounded-2xl border border-[#E7ECF2] bg-white shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h3 className="text-base font-bold text-[#182230]">Endpoint Security & EDR Compatibility</h3>
              <p className="text-xs text-[#667085]">
                Continuous certification testing with enterprise antivirus and threat detection platforms.
              </p>
            </div>
            <button
              onClick={() => showToast('Simulated EDR compatibility check completed: All passed')}
              className="px-3.5 py-1.5 rounded-lg bg-[#0796E5] text-white text-xs font-semibold shadow-xs"
            >
              Run EDR Assessment
            </button>
          </div>

          <div className="divide-y divide-gray-100 text-xs">
            {compatibilityMatrix.map((item, idx) => (
              <div key={idx} className="py-3.5 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#182230]">{item.name}</span>
                    <span className="text-[11px] text-gray-400 font-mono">v{item.version}</span>
                  </div>
                  <p className="text-[#667085] text-xs mt-0.5">{item.details}</p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 whitespace-nowrap">
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: ROLE-BASED ACCESS CONTROL (RBAC) */}
      {activeTab === 'rbac' && (
        <div className="p-6 rounded-2xl border border-[#E7ECF2] bg-white shadow-card space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h3 className="text-base font-bold text-[#182230]">Role Permissions Matrix</h3>
              <p className="text-xs text-[#667085]">
                Granular permission assignment by resource and action. Active Role: <strong>{currentRole}</strong>
              </p>
            </div>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left divide-y divide-gray-100">
              <thead className="bg-gray-50 text-gray-500 font-semibold text-[11px] uppercase">
                <tr>
                  <th className="py-2.5 px-3">Resource</th>
                  <th className="py-2.5 px-3">Super Admin</th>
                  <th className="py-2.5 px-3">IT Admin</th>
                  <th className="py-2.5 px-3">Deployment Operator</th>
                  <th className="py-2.5 px-3">Security Auditor</th>
                  <th className="py-2.5 px-3">Read-Only Viewer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {[
                  { res: 'Devices (Inventory & Telemetry)', sa: 'Full', it: 'Full', do: 'Update / Repair', sa2: 'Read', ro: 'Read' },
                  { res: 'Virtual Camera Studio & Policies', sa: 'Full', it: 'Full', do: 'Read', sa2: 'Read', ro: 'Read' },
                  { res: 'Deployments & Packaging', sa: 'Full', it: 'Full', do: 'Launch & Retry', sa2: 'Read', ro: 'Read' },
                  { res: 'Updates & Staged Rollouts', sa: 'Full', it: 'Manage', do: 'Advance', sa2: 'Read', ro: 'Read' },
                  { res: 'Code Signing Certificates', sa: 'Full', it: 'Read', do: 'None', sa2: 'Verify & Audit', ro: 'Read' },
                  { res: 'Audit Trail Logs', sa: 'Full', it: 'Export', do: 'Read', sa2: 'Full Export', ro: 'Read' },
                ].map((row) => (
                  <tr key={row.res} className="hover:bg-gray-50">
                    <td className="py-2.5 px-3 text-[#182230] font-bold">{row.res}</td>
                    <td className="py-2.5 px-3 text-purple-700">{row.sa}</td>
                    <td className="py-2.5 px-3 text-[#0796E5]">{row.it}</td>
                    <td className="py-2.5 px-3 text-emerald-700">{row.do}</td>
                    <td className="py-2.5 px-3 text-amber-700">{row.sa2}</td>
                    <td className="py-2.5 px-3 text-gray-500">{row.ro}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <div className="p-6 rounded-2xl border border-[#E7ECF2] bg-white shadow-card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-gray-100">
            <div>
              <h3 className="text-base font-bold text-[#182230]">Immutable Audit Trail</h3>
              <p className="text-xs text-[#667085]">
                Cryptographically correlated event history tracking administrative mutations across the fleet.
              </p>
            </div>
            <button
              onClick={handleExportAudit}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-[#182230] hover:bg-gray-50"
            >
              <Download size={14} />
              <span>Export Audit CSV</span>
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search actor, action, or correlation ID..."
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 border rounded-lg text-xs"
              />
            </div>
            <select
              value={auditFilter}
              onChange={(e) => setAuditFilter(e.target.value)}
              className="px-3 py-1.5 border rounded-lg text-xs"
            >
              <option value="">All Resource Types</option>
              <option value="Device">Device</option>
              <option value="Deployment">Deployment</option>
              <option value="Rollout">Rollout</option>
              <option value="CameraPreset">CameraPreset</option>
              <option value="CameraPolicy">CameraPolicy</option>
              <option value="Certificate">Certificate</option>
            </select>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left divide-y divide-gray-100">
              <thead className="bg-gray-50 text-gray-500 font-semibold text-[11px] uppercase">
                <tr>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Actor</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Resource</th>
                  <th className="py-2.5 px-3">Outcome</th>
                  <th className="py-2.5 px-3 font-mono">Correlation ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAudits.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="py-2.5 px-3 text-gray-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-[#182230]">{log.actorName}</td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-[#0796E5]">{log.action}</td>
                    <td className="py-2.5 px-3">{log.resourceType} ({log.resourceId || 'N/A'})</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${log.outcome === 'Success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                        {log.outcome}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-gray-400 text-[10px]">{log.correlationId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
