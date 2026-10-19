'use client';

import React, { useState } from 'react';
import {
  LifeBuoy,
  X,
  Layers,
  Terminal,
  ShieldCheck,
  AlertCircle,
  FileCode,
  CheckCircle2,
  Info
} from 'lucide-react';
import { useAppStore } from '@/store/app-store';

export function HelpModal() {
  const { isHelpOpen, setHelpOpen } = useAppStore();
  const [activeTab, setActiveTab] = useState<'architecture' | 'packaging' | 'codes' | 'admx' | 'about'>('architecture');

  if (!isHelpOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-white border-b border-[#E7ECF2] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-50 text-[#0796E5]">
              <LifeBuoy size={20} />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#182230]">
                Enterprise Technical Documentation & Architecture
              </h3>
              <p className="text-xs text-[#667085]">
                Windows Virtual Camera Fleet Administration & MSI/MSIX Reference
              </p>
            </div>
          </div>

          <button
            onClick={() => setHelpOpen(false)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#E7ECF2] px-6 bg-[#F8FAFC]">
          {[
            { id: 'architecture', label: 'Media Foundation Driver Architecture', icon: Layers },
            { id: 'packaging', label: 'MSI vs. MSIX Packaging', icon: FileCode },
            { id: 'codes', label: 'Windows Exit Codes (1603, 1618)', icon: Terminal },
            { id: 'admx', label: 'ADMX / Group Policy Reference', icon: ShieldCheck },
            { id: 'about', label: 'Platform & System Overview', icon: Info },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-3 px-3.5 text-xs font-semibold border-b-2 transition-all ${
                  isActive
                    ? 'border-[#0796E5] text-[#0796E5] bg-white'
                    : 'border-transparent text-[#667085] hover:text-[#182230]'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs text-[#182230]">
          {activeTab === 'architecture' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                <h4 className="font-bold text-sm text-[#0878BF] mb-1">
                  Windows Media Foundation (MF) Virtual Camera Driver Architecture
                </h4>
                <p className="text-[#182230] leading-relaxed">
                  In modern Windows 10 (20H1+) and Windows 11, virtual camera devices are implemented as user-mode Media Foundation media sources via the <code>IMFVirtualCamera</code> API. This decouples the camera stream from privileged kernel-mode drivers, greatly improving system stability and preventing blue screens (BSOD).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl border border-[#E7ECF2] bg-white">
                  <div className="font-bold text-[#0796E5] mb-1">1. Frame Ingestion</div>
                  <p className="text-[#667085] leading-relaxed">
                    ManyCam captures input frames from physical webcams, screen captures, or IP streams into an internal DirectShow / Media Foundation pipeline buffer.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl border border-[#E7ECF2] bg-white">
                  <div className="font-bold text-[#0796E5] mb-1">2. Hardware Acceleration</div>
                  <p className="text-[#667085] leading-relaxed">
                    DirectML and DirectX 11/12 GPU shaders apply real-time chroma keying, background blur, overlays and color correction at zero CPU penalty.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl border border-[#E7ECF2] bg-white">
                  <div className="font-bold text-[#0796E5] mb-1">3. Sink Delivery</div>
                  <p className="text-[#667085] leading-relaxed">
                    The virtual device sink exposes standard NV12 and YUY2 color streams consumed by Microsoft Teams, Zoom, WebRTC and browser apps.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 font-mono text-[11px]">
                <div className="text-gray-500 mb-1">// Registration CLSID in Registry</div>
                <code>HKLM\SOFTWARE\Classes\CLSID\{`{B1659104-51A6-4f40-8C65-7284451DFDB4}`}\InprocServer32</code>
                <div className="text-gray-500 mt-1">// Media Foundation Virtual Camera API: MFCreateVirtualCamera()</div>
              </div>
            </div>
          )}

          {activeTab === 'packaging' && (
            <div className="space-y-4">
              <h4 className="font-bold text-sm text-[#182230]">
                MSI vs. MSIX: Architectural Differences for Virtual Camera Delivery
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/30">
                  <div className="font-bold text-[#0796E5] text-sm mb-2">Windows Installer (MSI)</div>
                  <ul className="space-y-1.5 text-[#667085] list-disc list-inside">
                    <li>Supports machine-wide installation (<code>ALLUSERS=1</code>) in <code>%ProgramFiles%</code>.</li>
                    <li>Installs Windows background service running under <code>NT AUTHORITY\SYSTEM</code>.</li>
                    <li>Registers COM InprocServer32 components and Media Foundation filters.</li>
                    <li>Fully compatible with legacy GPO, MECM and enterprise scripts.</li>
                    <li>Requires administrative elevation for driver / system component registration.</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/30">
                  <div className="font-bold text-purple-700 text-sm mb-2">Modern App Packaging (MSIX)</div>
                  <ul className="space-y-1.5 text-[#667085] list-disc list-inside">
                    <li>Containerized, clean uninstall with zero registry rot.</li>
                    <li>Supports Microsoft Intune direct deployment and Windows Store for Business.</li>
                    <li>Optimized for Azure Virtual Desktop (AVD) using <strong>MSIX App Attach</strong>.</li>
                    <li>Strict signing requirement: Must be signed by a trusted Authenticode certificate.</li>
                    <li>Virtual camera extension requires declared restricted capabilities in manifest.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'codes' && (
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-[#182230]">
                Standard Windows Installer (MSI) Exit Codes
              </h4>
              <div className="divide-y divide-gray-100 border border-[#E7ECF2] rounded-xl overflow-hidden">
                {[
                  { code: '0', title: 'ERROR_SUCCESS', desc: 'The action completed successfully with no errors.' },
                  { code: '1603', title: 'ERROR_INSTALL_FAILURE', desc: 'Fatal error during installation. Commonly caused by custom action failure (e.g. VirtualCamRegisterServer), lack of SYSTEM permissions, or AppLocker/WDAC binary execution block.' },
                  { code: '1618', title: 'ERROR_INSTALL_ALREADY_RUNNING', desc: 'Another installation is currently running. Windows Installer mutex is locked by another msiexec process. Retry with backoff.' },
                  { code: '3010', title: 'ERROR_SUCCESS_REBOOT_REQUIRED', desc: 'Installation was successful, but a restart is required to bind the virtual video capture filter.' },
                  { code: '1602', title: 'ERROR_INSTALL_USEREXIT', desc: 'User cancelled installation prior to completion.' }
                ].map((item) => (
                  <div key={item.code} className="p-3 flex items-start gap-3 bg-white hover:bg-gray-50">
                    <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-gray-100 text-[#182230]">
                      {item.code}
                    </span>
                    <div>
                      <div className="font-bold text-xs text-[#182230]">{item.title}</div>
                      <div className="text-[11px] text-[#667085]">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'admx' && (
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-[#182230]">
                Enterprise ADMX Group Policy & Registry Keys
              </h4>
              <p className="text-[#667085]">
                Corporate endpoints can be centrally governed using administrative templates (ADMX) in <code>C:\Windows\PolicyDefinitions</code> or Microsoft Intune Administrative Templates CSP.
              </p>
              <div className="p-3 bg-gray-900 text-green-400 rounded-xl font-mono text-[11px] overflow-x-auto leading-relaxed">
                <div>[HKEY_LOCAL_MACHINE\SOFTWARE\Policies\ManyCam\Enterprise]</div>
                <div>&quot;MaxResolution&quot;=&quot;1920x1080&quot;</div>
                <div>&quot;MaxFPS&quot;=dword:0000001e</div>
                <div>&quot;AllowVirtualBackground&quot;=dword:00000001</div>
                <div>&quot;EnforcePrivacyIndicator&quot;=dword:00000001</div>
                <div>&quot;LockConfiguration&quot;=dword:00000000</div>
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                <div className="flex items-center gap-2 font-bold text-[#0878BF] text-sm mb-1">
                  <Info size={16} />
                  <span>Platform Overview & Fleet Architecture</span>
                </div>
                <p className="text-xs text-[#182230] leading-relaxed">
                  The ManyCam Enterprise Control Center is an enterprise SaaS administration platform for Windows Virtual Camera fleet operations, packaging workflows, staged rollouts, and security controls across hybrid workstation fleets.
                </p>
                <p className="text-xs text-[#667085] mt-2 leading-relaxed">
                  All enterprise organizations, telemetry feeds, and endpoint devices are centrally managed through automated Windows Intune, MECM, and Group Policy configuration rings.
                </p>
              </div>

              <div className="p-3 border rounded-xl space-y-1 text-gray-500">
                <div><strong>Application Version:</strong> ManyCam Enterprise Control Center v3.8.2-EE</div>
                <div><strong>Platform Target:</strong> Windows 10 21H2+ / Windows 11 (x64 / ARM64)</div>
                <div><strong>Stack:</strong> Next.js 15, React 19, TypeScript, Tailwind CSS, Prisma, SQLite</div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-gray-50 border-t border-[#E7ECF2] flex items-center justify-between">
          <span className="text-[11px] text-[#667085]">
            Need live engineering support? Contact your Augment Windows platform lead.
          </span>
          <button
            onClick={() => setHelpOpen(false)}
            className="px-4 py-1.5 rounded-lg bg-[#0796E5] hover:bg-[#0878BF] text-white text-xs font-semibold"
          >
            Close Documentation
          </button>
        </div>
      </div>
    </div>
  );
}
