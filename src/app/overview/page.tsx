'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Laptop2,
  Wifi,
  Video,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Sparkles,
  Send,
  PlusCircle,
  Wrench,
  FileDown,
  RefreshCw,
  Info,
  ChevronRight,
  Layers,
  Activity
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';
import { useAppStore } from '@/store/app-store';

interface OverviewData {
  kpis: {
    totalDevices: number;
    onlineDevices: number;
    healthyCameras: number;
    deploymentSuccessRate: number;
    updateComplianceRate: number;
    activeAlerts: number;
  };
  healthBreakdown: {
    healthy: number;
    warning: number;
    critical: number;
    offline: number;
  };
  osDistribution: { name: string; count: number; percent: number; color: string }[];
  releaseAdoption: { channel: string; count: number; percent: number; color: string }[];
  installationTrends: any[];
  recentActivity: any[];
}

export default function OverviewPage() {
  const router = useRouter();
  const { setActiveQuickAction, startTour } = useAppStore();
  const [period, setPeriod] = useState<'24h' | '7d' | '30d' | '90d'>('30d');
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  // Quick Action Modals
  const [addDeviceModalOpen, setAddDeviceModalOpen] = useState(false);
  const [newHostname, setNewHostname] = useState('');
  const [newOrg, setNewOrg] = useState('');
  const [newOs, setNewOs] = useState('Windows 11 Enterprise');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchOverview = (selectedPeriod: string) => {
    setLoading(true);
    fetch(`/api/overview?period=${selectedPeriod}`)
      .then((res) => res.json())
      .then((resData) => {
        setData(resData);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load overview:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOverview(period);
  }, [period]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAddDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHostname) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostname: newHostname,
          organizationId: 'orgs-1', // will map to first org
          osName: newOs,
          osBuild: newOs.includes('11') ? '24H2 (26100.2894)' : '22H2 (19045.5131)',
          architecture: 'x64',
          appVersion: 'v3.8.2',
        }),
      });
      if (res.ok) {
        showToast(`Device ${newHostname} enrolled successfully!`);
        setAddDeviceModalOpen(false);
        setNewHostname('');
        fetchOverview(period);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to add device');
      }
    } catch {
      alert('Network error adding device');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportFleetReport = () => {
    window.location.href = '/api/devices?export=csv';
    showToast('Exporting complete fleet report CSV...');
  };

  if (loading && !data) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-3 border-[#0796E5] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-[#667085] font-medium">Loading enterprise overview...</span>
      </div>
    );
  }

  const kpis = data?.kpis || {
    totalDevices: 2486,
    onlineDevices: 2312,
    healthyCameras: 2274,
    deploymentSuccessRate: 98.4,
    updateComplianceRate: 94.7,
    activeAlerts: 18,
  };

  const healthData = data?.healthBreakdown
    ? [
        { name: 'Healthy Cameras', value: data.healthBreakdown.healthy, color: '#10B981' },
        { name: 'Warning / Degraded', value: data.healthBreakdown.warning, color: '#F59E0B' },
        { name: 'Critical / Error', value: data.healthBreakdown.critical, color: '#EF4444' },
        { name: 'Offline Endpoints', value: data.healthBreakdown.offline, color: '#94A3B8' },
      ]
    : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#182230] text-white px-4 py-2.5 rounded-lg shadow-lg text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-top-2">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#182230]">
            Enterprise Virtual Camera Overview
          </h1>
          <p className="text-xs text-[#667085] mt-1">
            Monitor deployments, camera health, security and application updates across your Windows fleet.
          </p>
        </div>

        {/* Date Filter & Tour CTA */}
        <div className="flex items-center gap-2.5">
          <div className="inline-flex rounded-lg border border-[#E7ECF2] p-1 bg-gray-50/80">
            {(['24h', '7d', '30d', '90d'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  period === p
                    ? 'bg-white text-[#0796E5] shadow-xs font-semibold'
                    : 'text-[#667085] hover:text-[#182230]'
                }`}
              >
                {p === '24h' ? '24 Hours' : p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>

          <button
            onClick={startTour}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#0796E5] text-white hover:bg-[#0878BF] shadow-xs transition-colors"
          >
            <Sparkles size={14} />
            <span>Guided Tour</span>
          </button>
        </div>
      </div>

      {/* 6 KPI Cards Grid */}
      <div id="overview-kpi-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* KPI 1: Total Managed Devices */}
        <Link
          href="/devices"
          className="p-4 rounded-xl border border-[#E7ECF2] bg-white hover:border-[#0796E5]/60 hover:shadow-card transition-all group relative"
          title="Click to view full device fleet inventory"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#667085]">Total Devices</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-[#0796E5]">
              <Laptop2 size={16} />
            </div>
          </div>
          <div className="mt-2.5 text-2xl font-bold text-[#182230] tracking-tight">
            {kpis.totalDevices.toLocaleString()}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
            <ArrowUpRight size={13} />
            <span>+14 this week</span>
          </div>
        </Link>

        {/* KPI 2: Online Devices */}
        <Link
          href="/devices?health=Healthy"
          className="p-4 rounded-xl border border-[#E7ECF2] bg-white hover:border-[#0796E5]/60 hover:shadow-card transition-all group"
          title="Click to filter online endpoints"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#667085]">Online Devices</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <Wifi size={16} />
            </div>
          </div>
          <div className="mt-2.5 text-2xl font-bold text-[#182230] tracking-tight">
            {kpis.onlineDevices.toLocaleString()}
          </div>
          <div className="mt-1 text-[11px] text-[#667085]">
            93.0% fleet connectivity
          </div>
        </Link>

        {/* KPI 3: Healthy Virtual Cameras */}
        <Link
          href="/devices?health=Healthy"
          className="p-4 rounded-xl border border-[#E7ECF2] bg-white hover:border-[#0796E5]/60 hover:shadow-card transition-all group"
          title="Click to view virtual camera stream status"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#667085]">Healthy Cameras</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-[#0796E5]">
              <Video size={16} />
            </div>
          </div>
          <div className="mt-2.5 text-2xl font-bold text-[#182230] tracking-tight">
            {kpis.healthyCameras.toLocaleString()}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
            <CheckCircle2 size={12} />
            <span>91.5% MF bound</span>
          </div>
        </Link>

        {/* KPI 4: Deployment Success Rate */}
        <Link
          href="/deployments"
          className="p-4 rounded-xl border border-[#E7ECF2] bg-white hover:border-[#0796E5]/60 hover:shadow-card transition-all group"
          title="Click to view deployment jobs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#667085]">Deployment Success</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="mt-2.5 text-2xl font-bold text-[#182230] tracking-tight">
            {kpis.deploymentSuccessRate}%
          </div>
          <div className="mt-1 text-[11px] text-[#667085]">
            Target &gt; 98.0%
          </div>
        </Link>

        {/* KPI 5: Update Compliance */}
        <Link
          href="/updates"
          className="p-4 rounded-xl border border-[#E7ECF2] bg-white hover:border-[#0796E5]/60 hover:shadow-card transition-all group"
          title="Click to view update rollout compliance"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#667085]">Update Compliance</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-[#0796E5]">
              <ShieldCheck size={16} />
            </div>
          </div>
          <div className="mt-2.5 text-2xl font-bold text-[#182230] tracking-tight">
            {kpis.updateComplianceRate}%
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
            <ArrowUpRight size={13} />
            <span>+2.4% vs last cycle</span>
          </div>
        </Link>

        {/* KPI 6: Active Alerts */}
        <Link
          href="/diagnostics"
          className="p-4 rounded-xl border border-[#E7ECF2] bg-white hover:border-[#EF4444]/60 hover:shadow-card transition-all group"
          title="Click to investigate active alerts in Diagnostics"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#667085]">Active Alerts</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <AlertTriangle size={16} />
            </div>
          </div>
          <div className="mt-2.5 text-2xl font-bold text-amber-600 tracking-tight">
            {kpis.activeAlerts}
          </div>
          <div className="mt-1 text-[11px] text-amber-700 font-medium">
            3 require elevated token
          </div>
        </Link>
      </div>

      {/* Row 2: Fleet Health Overview (Horizontal Bars) + Device OS Distribution Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2 cols): Fleet Health Overview */}
        <div className="lg:col-span-2 p-5 rounded-2xl border border-[#E7ECF2] bg-white shadow-card">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <h3 className="text-sm font-bold text-[#182230]">
                Fleet Health & Virtual Camera Driver Status
              </h3>
              <p className="text-xs text-[#667085]">
                Real-time driver binding, service heartbeat and network reachability breakdown
              </p>
            </div>
            <span className="text-xs font-semibold text-[#0796E5] bg-blue-50 px-2.5 py-1 rounded-md">
              {kpis.totalDevices} Total Nodes
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {healthData.map((item) => (
              <div key={item.name} className="p-3 rounded-xl bg-gray-50/70 border border-gray-100">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-[#667085] truncate">{item.name}</span>
                </div>
                <div className="mt-1 text-lg font-bold text-[#182230]">
                  {item.value.toLocaleString()}
                </div>
                <div className="text-[11px] text-[#667085]">
                  {((item.value / kpis.totalDevices) * 100).toFixed(1)}% of fleet
                </div>
              </div>
            ))}
          </div>

          {/* Health Horizontal Stacked Progress Bar */}
          <div className="mt-4">
            <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden flex shadow-inner">
              {healthData.map((item) => {
                const widthPercent = (item.value / kpis.totalDevices) * 100;
                return (
                  <div
                    key={item.name}
                    style={{ width: `${widthPercent}%`, backgroundColor: item.color }}
                    title={`${item.name}: ${item.value} (${widthPercent.toFixed(1)}%)`}
                    className="h-full transition-all duration-500 first:rounded-l-full last:rounded-r-full"
                  />
                );
              })}
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] text-[#667085]">
              <span>Media Foundation Driver: Certified WHQL</span>
              <span>DirectShow Legacy Filter: Active Fallback</span>
            </div>
          </div>
        </div>

        {/* Right (1 col): Device Distribution Donut */}
        <div className="p-5 rounded-2xl border border-[#E7ECF2] bg-white shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-sm font-bold text-[#182230]">OS Distribution</h3>
              <span className="text-[11px] text-[#667085]">Windows 10/11</span>
            </div>

            <div className="h-48 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.osDistribution || []}
                    dataKey="count"
                    nameKey="name"
                    innerRadius={52}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {(data?.osDistribution || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any, name: any) => [`${Number(val).toLocaleString()} devices`, name]}
                    contentStyle={{ fontSize: '11px', borderRadius: '8px', border: '1px solid #E7ECF2' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-gray-100 text-xs">
            {(data?.osDistribution || []).map((os) => (
              <div key={os.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: os.color }} />
                  <span className="text-[#182230] font-medium truncate">{os.name}</span>
                </div>
                <span className="text-[#667085] font-mono text-[11px]">{os.percent}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Installation & Update Trends + Release Adoption */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2 cols): Combined Line / Bar Chart for Trends */}
        <div className="lg:col-span-2 p-5 rounded-2xl border border-[#E7ECF2] bg-white shadow-card">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <h3 className="text-sm font-bold text-[#182230]">
                Installation & Update Trends ({period.toUpperCase()})
              </h3>
              <p className="text-xs text-[#667085]">
                Successful deployments, package updates, failures and rollback events
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1.5 text-xs text-[#667085]">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#0796E5]" /> Updates
              </span>
              <span className="flex items-center gap-1.5 text-xs text-[#667085]">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#10B981]" /> Installs
              </span>
              <span className="flex items-center gap-1.5 text-xs text-[#667085]">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#EF4444]" /> Failures
              </span>
            </div>
          </div>

          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.installationTrends || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="period" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ fontSize: '11px', borderRadius: '8px', border: '1px solid #E7ECF2' }}
                />
                <Bar dataKey="successfulUpdates" name="Successful Updates" fill="#0796E5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="successfulInstalls" name="Successful Installs" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="failedUpdates" name="Failed Updates" fill="#EF4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="rollbacks" name="Rollbacks" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right (1 col): Release Adoption Horizontal Progress */}
        <div className="p-5 rounded-2xl border border-[#E7ECF2] bg-white shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-sm font-bold text-[#182230]">Release Adoption</h3>
              <Link href="/updates" className="text-xs font-semibold text-[#0796E5] hover:underline">
                Manage
              </Link>
            </div>
            <p className="text-xs text-[#667085] mt-1 mb-4">
              Active endpoint distribution across update channels
            </p>

            <div className="space-y-4">
              {(data?.releaseAdoption || []).map((rel) => (
                <div key={rel.channel} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#182230]">{rel.channel}</span>
                    <span className="text-[#667085] font-mono font-medium">
                      {rel.count.toLocaleString()} ({rel.percent}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${rel.percent}%`, backgroundColor: rel.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-xs text-[#0878BF]">
            <div className="font-semibold flex items-center gap-1 mb-0.5">
              <Info size={13} />
              <span>Rollout In-Progress</span>
            </div>
            <p className="text-[11px] text-[#667085] leading-snug">
              v3.8.2 GA deployment has reached Broad Rollout (65%). Safety gates active.
            </p>
          </div>
        </div>
      </div>

      {/* Row 4: Recent Activity Feed + Quick Actions Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2 cols): Live-looking Recent Activity */}
        <div className="lg:col-span-2 p-5 rounded-2xl border border-[#E7ECF2] bg-white shadow-card">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <h3 className="text-sm font-bold text-[#182230]">Recent Activity Feed</h3>
              <p className="text-xs text-[#667085]">
                Real-time operational events across Windows fleet deployments
              </p>
            </div>
            <Link
              href="/diagnostics"
              className="text-xs font-semibold text-[#0796E5] hover:underline flex items-center gap-1"
            >
              <span>View All Logs</span>
              <ChevronRight size={13} />
            </Link>
          </div>

          <div className="mt-3 divide-y divide-gray-100 max-h-72 overflow-y-auto pr-1">
            {(data?.recentActivity || []).map((act) => {
              let badgeColor = 'bg-blue-50 text-[#0796E5] border-blue-200';
              if (act.severity === 'error') badgeColor = 'bg-red-50 text-red-600 border-red-200';
              else if (act.severity === 'warning') badgeColor = 'bg-amber-50 text-amber-600 border-amber-200';
              else if (act.severity === 'success') badgeColor = 'bg-emerald-50 text-emerald-600 border-emerald-200';

              return (
                <div key={act.id} className="py-2.5 flex items-start justify-between gap-3 group">
                  <div className="flex items-start gap-2.5">
                    <span className={`mt-0.5 text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded border ${badgeColor}`}>
                      {act.severity}
                    </span>
                    <div>
                      <p className="text-xs text-[#182230] leading-snug group-hover:text-[#0796E5] transition-colors">
                        {act.text}
                      </p>
                      <span className="text-[10px] text-[#667085] flex items-center gap-1 mt-0.5">
                        <Clock size={10} />
                        {act.time}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={act.link}
                    className="text-xs text-[#0796E5] hover:underline font-semibold flex-shrink-0"
                  >
                    Inspect
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right (1 col): Quick Actions */}
        <div className="p-5 rounded-2xl border border-[#E7ECF2] bg-white shadow-card">
          <div className="pb-3 border-b border-gray-100">
            <h3 className="text-sm font-bold text-[#182230]">Quick Actions</h3>
            <p className="text-xs text-[#667085]">
              Direct operational triggers for Windows fleet
            </p>
          </div>

          <div className="mt-3.5 space-y-2">
            <Link
              href="/deployments?wizard=open"
              className="w-full flex items-center justify-between p-2.5 rounded-xl border border-gray-200 hover:border-[#0796E5] hover:bg-blue-50/40 text-xs font-semibold text-[#182230] transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <Send size={15} className="text-[#0796E5]" />
                <span>Deploy Application</span>
              </div>
              <ChevronRight size={13} className="text-gray-300 group-hover:text-[#0796E5]" />
            </Link>

            <Link
              href="/updates?newRelease=open"
              className="w-full flex items-center justify-between p-2.5 rounded-xl border border-gray-200 hover:border-[#0796E5] hover:bg-blue-50/40 text-xs font-semibold text-[#182230] transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <RefreshCw size={15} className="text-[#0796E5]" />
                <span>Create Release</span>
              </div>
              <ChevronRight size={13} className="text-gray-300 group-hover:text-[#0796E5]" />
            </Link>

            <button
              onClick={() => setAddDeviceModalOpen(true)}
              className="w-full flex items-center justify-between p-2.5 rounded-xl border border-gray-200 hover:border-[#0796E5] hover:bg-blue-50/40 text-xs font-semibold text-[#182230] transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <PlusCircle size={15} className="text-[#0796E5]" />
                <span>Add Device</span>
              </div>
              <ChevronRight size={13} className="text-gray-300 group-hover:text-[#0796E5]" />
            </button>

            <Link
              href="/camera"
              className="w-full flex items-center justify-between p-2.5 rounded-xl border border-gray-200 hover:border-[#0796E5] hover:bg-blue-50/40 text-xs font-semibold text-[#182230] transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <Video size={15} className="text-[#0796E5]" />
                <span>Configure Camera</span>
              </div>
              <ChevronRight size={13} className="text-gray-300 group-hover:text-[#0796E5]" />
            </Link>

            <Link
              href="/diagnostics"
              className="w-full flex items-center justify-between p-2.5 rounded-xl border border-gray-200 hover:border-[#0796E5] hover:bg-blue-50/40 text-xs font-semibold text-[#182230] transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <Wrench size={15} className="text-[#0796E5]" />
                <span>View Diagnostics</span>
              </div>
              <ChevronRight size={13} className="text-gray-300 group-hover:text-[#0796E5]" />
            </Link>

            <button
              onClick={handleExportFleetReport}
              className="w-full flex items-center justify-between p-2.5 rounded-xl border border-gray-200 hover:border-[#0796E5] hover:bg-blue-50/40 text-xs font-semibold text-[#182230] transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <FileDown size={15} className="text-[#0796E5]" />
                <span>Export Fleet Report</span>
              </div>
              <ChevronRight size={13} className="text-gray-300 group-hover:text-[#0796E5]" />
            </button>
          </div>
        </div>
      </div>

      {/* Add Device Modal Dialog */}
      {addDeviceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-white border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-50 text-[#0796E5]">
                  <PlusCircle size={18} />
                </div>
                <h3 className="font-bold text-sm text-[#182230]">Enroll Windows Endpoint</h3>
              </div>
              <button
                onClick={() => setAddDeviceModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddDevice} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#182230] mb-1">
                  Device Hostname *
                </label>
                <input
                  type="text"
                  placeholder="e.g. VCA-NYC-9999"
                  value={newHostname}
                  onChange={(e) => setNewHostname(e.target.value.toUpperCase())}
                  required
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-[#0796E5] font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#182230] mb-1">
                  Windows Edition & Architecture
                </label>
                <select
                  value={newOs}
                  onChange={(e) => setNewOs(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-[#0796E5]"
                >
                  <option value="Windows 11 Enterprise">Windows 11 Enterprise (24H2, x64)</option>
                  <option value="Windows 11 Pro">Windows 11 Pro (23H2, x64)</option>
                  <option value="Windows 10 Enterprise">Windows 10 Enterprise (22H2, x64)</option>
                  <option value="Windows 11 Enterprise ARM64">Windows 11 Enterprise (24H2, ARM64)</option>
                </select>
              </div>

              <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 text-[11px] text-[#667085]">
                Enrolled endpoints receive the <strong>ManyCam Virtual WebCam Driver v3.8.2.14</strong> and connect to the default Stable release channel.
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setAddDeviceModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[#667085] hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#0796E5] hover:bg-[#0878BF] text-white shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Enrolling...' : 'Enroll Device'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
