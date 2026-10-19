'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Laptop2,
  Search,
  Filter,
  Download,
  Plus,
  RefreshCw,
  MoreVertical,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Shield,
  Layers,
  Wrench,
  Trash2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
  Play,
  ArrowUpDown,
  Video,
  FileText,
  Activity,
  UserCheck
} from 'lucide-react';
import { DeviceRecord } from '@/lib/types';
import { useAppStore } from '@/store/app-store';

export default function DeviceFleetPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs text-gray-400">Loading Device Fleet...</div>}>
      <DeviceFleetContent />
    </Suspense>
  );
}

function DeviceFleetContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialHealth = searchParams.get('health') || '';

  const { selectedDeviceForDrawer, setSelectedDeviceForDrawer } = useAppStore();

  const [devices, setDevices] = useState<DeviceRecord[]>([]);
  const [totalDevices, setTotalDevices] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState(initialSearch);
  const [selectedOs, setSelectedOs] = useState('');
  const [selectedHealth, setSelectedHealth] = useState(initialHealth);
  const [selectedChannel, setSelectedChannel] = useState('');
  const [selectedCompliance, setSelectedCompliance] = useState('');
  const [sortBy, setSortBy] = useState('hostname');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [namedViews, setNamedViews] = useState<{ name: string; filter: any }[]>([
    { name: 'All Devices', filter: {} },
    { name: 'Windows 11 24H2 Fleet', filter: { os: 'Windows 11' } },
    { name: 'Camera Driver Errors', filter: { health: 'Critical' } },
    { name: 'Beta & Canary Cohort', filter: { channel: 'Beta' } },
  ]);
  const [activeView, setActiveView] = useState('All Devices');

  // Modals & Drawers
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState<DeviceRecord | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Drawer details state
  const [drawerDevice, setDrawerDevice] = useState<any | null>(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [drawerTab, setDrawerTab] = useState<'general' | 'camera' | 'deployment' | 'updates' | 'security' | 'diagnostics' | 'activity'>('general');

  // Add Device Form
  const [formHostname, setFormHostname] = useState('');
  const [formOs, setFormOs] = useState('Windows 11 Enterprise');
  const [formArch, setFormArch] = useState('x64');
  const [formChannel, setFormChannel] = useState('Stable');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchDevices = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        search,
        os: selectedOs,
        health: selectedHealth,
        channel: selectedChannel,
        compliance: selectedCompliance,
        sortBy,
        sortOrder,
      });
      const res = await fetch(`/api/devices?${params.toString()}`);
      const data = await res.json();
      setDevices(data.devices || []);
      setTotalDevices(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error('Error fetching devices:', err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, selectedOs, selectedHealth, selectedChannel, selectedCompliance, sortBy, sortOrder]);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  // Open Drawer if selectedDeviceForDrawer is set
  useEffect(() => {
    if (selectedDeviceForDrawer) {
      setDrawerLoading(true);
      fetch(`/api/devices/${selectedDeviceForDrawer}`)
        .then((res) => res.json())
        .then((data) => {
          setDrawerDevice(data);
          setDrawerLoading(false);
        })
        .catch(() => setDrawerLoading(false));
    } else {
      setDrawerDevice(null);
    }
  }, [selectedDeviceForDrawer]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(devices.map((d) => d.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleExportCsv = () => {
    const params = new URLSearchParams({
      search,
      os: selectedOs,
      health: selectedHealth,
      channel: selectedChannel,
      compliance: selectedCompliance,
      export: 'csv',
    });
    window.location.href = `/api/devices?${params.toString()}`;
    showToast('Exporting filtered devices to CSV...');
  };

  const handleAddDeviceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostname: formHostname,
          organizationId: 'orgs-1',
          osName: formOs,
          architecture: formArch,
          updateChannel: formChannel,
        }),
      });
      if (res.ok) {
        showToast(`Device ${formHostname} enrolled successfully!`);
        setAddModalOpen(false);
        setFormHostname('');
        fetchDevices();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to add device');
      }
    } catch {
      alert('Network error');
    }
  };

  const handleDeleteDevice = async () => {
    if (!deviceToDelete) return;
    try {
      const res = await fetch(`/api/devices/${deviceToDelete.id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast(`Device ${deviceToDelete.hostname} removed from fleet.`);
        setDeleteModalOpen(false);
        setDeviceToDelete(null);
        if (selectedDeviceForDrawer === deviceToDelete.id) {
          setSelectedDeviceForDrawer(null);
        }
        fetchDevices();
      }
    } catch {
      alert('Failed to delete device');
    }
  };

  const handleDeviceAction = async (deviceId: string, action: string, payload?: any) => {
    try {
      const res = await fetch(`/api/devices/${deviceId}/actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, payload }),
      });
      const data = await res.json();
      showToast(data.message || `Action ${action} completed`);
      fetchDevices();
      // refresh drawer if open
      if (selectedDeviceForDrawer === deviceId) {
        const refRes = await fetch(`/api/devices/${deviceId}`);
        const refData = await refRes.json();
        setDrawerDevice(refData);
      }
    } catch {
      alert('Action execution failed');
    }
  };

  const handleDrawerFieldUpdate = async (field: string, value: any) => {
    if (!drawerDevice) return;
    try {
      const res = await fetch(`/api/devices/${drawerDevice.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      });
      if (res.ok) {
        const updated = await res.json();
        setDrawerDevice((prev: any) => ({ ...prev, ...updated }));
        showToast(`Updated ${field} to ${value}`);
        fetchDevices();
      }
    } catch {
      alert('Failed to update field');
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#182230] text-white px-4 py-2.5 rounded-lg shadow-lg text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-top-2">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#182230]">
            Windows Device Fleet Management
          </h1>
          <p className="text-xs text-[#667085] mt-1">
            Endpoint inventory, Media Foundation camera binding, policy sync, and silent deployment status.
          </p>
        </div>

        {/* Top Actions: Add Device, Export CSV, Refresh */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchDevices()}
            className="p-2 rounded-lg border border-[#E7ECF2] hover:bg-gray-50 text-[#667085] hover:text-[#182230] transition-colors"
            title="Refresh Fleet Inventory"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E7ECF2] bg-white hover:bg-gray-50 text-xs font-semibold text-[#182230] shadow-xs transition-colors"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#0796E5] hover:bg-[#0878BF] text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus size={15} />
            <span>Add Device</span>
          </button>
        </div>
      </div>

      {/* Named Filter Views Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-[11px] font-semibold text-[#667085] uppercase tracking-wider pr-1">
          Saved Views:
        </span>
        {namedViews.map((nv) => (
          <button
            key={nv.name}
            onClick={() => {
              setActiveView(nv.name);
              setSelectedOs(nv.filter.os || '');
              setSelectedHealth(nv.filter.health || '');
              setSelectedChannel(nv.filter.channel || '');
              setPage(1);
            }}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              activeView === nv.name
                ? 'bg-[#0796E5] text-white font-semibold'
                : 'bg-gray-100 text-[#667085] hover:bg-gray-200'
            }`}
          >
            {nv.name}
          </button>
        ))}
      </div>

      {/* Main Table Container Card */}
      <div id="devices-table-container" className="rounded-2xl border border-[#E7ECF2] bg-white shadow-card overflow-hidden">
        {/* Table Filters Toolbar */}
        <div className="p-4 border-b border-[#E7ECF2] bg-[#F8FAFC] flex flex-wrap items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search size={15} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by hostname, ID, user..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-[#0796E5]"
            />
          </div>

          {/* Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* OS Filter */}
            <select
              value={selectedOs}
              onChange={(e) => {
                setSelectedOs(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-xs text-[#182230] focus:outline-none focus:border-[#0796E5]"
            >
              <option value="">All OS Editions</option>
              <option value="Windows 11">Windows 11</option>
              <option value="Windows 10">Windows 10</option>
            </select>

            {/* Health Filter */}
            <select
              value={selectedHealth}
              onChange={(e) => {
                setSelectedHealth(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-xs text-[#182230] focus:outline-none focus:border-[#0796E5]"
            >
              <option value="">All Health States</option>
              <option value="Healthy">Healthy (WHQL)</option>
              <option value="Warning">Warning (Degraded)</option>
              <option value="Critical">Critical (Error)</option>
              <option value="Offline">Offline</option>
            </select>

            {/* Channel Filter */}
            <select
              value={selectedChannel}
              onChange={(e) => {
                setSelectedChannel(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-xs text-[#182230] focus:outline-none focus:border-[#0796E5]"
            >
              <option value="">All Channels</option>
              <option value="Stable">Stable</option>
              <option value="Beta">Beta</option>
              <option value="Canary">Canary</option>
              <option value="Pinned Legacy">Pinned Legacy</option>
            </select>

            {/* Compliance Filter */}
            <select
              value={selectedCompliance}
              onChange={(e) => {
                setSelectedCompliance(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-xs text-[#182230] focus:outline-none focus:border-[#0796E5]"
            >
              <option value="">All Compliance</option>
              <option value="Compliant">Compliant</option>
              <option value="Non-compliant">Non-compliant</option>
              <option value="Pending">Pending</option>
            </select>

            {/* Reset Filters */}
            {(search || selectedOs || selectedHealth || selectedChannel || selectedCompliance) && (
              <button
                onClick={() => {
                  setSearch('');
                  setSelectedOs('');
                  setSelectedHealth('');
                  setSelectedChannel('');
                  setSelectedCompliance('');
                  setPage(1);
                }}
                className="px-2.5 py-1.5 text-xs text-[#0796E5] hover:underline font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Selected Batch Actions Bar (if any selected) */}
        {selectedIds.length > 0 && (
          <div className="bg-blue-50 px-4 py-2 border-b border-blue-100 flex items-center justify-between text-xs text-[#0796E5]">
            <span className="font-semibold">
              {selectedIds.length} device{selectedIds.length > 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  selectedIds.forEach((id) => handleDeviceAction(id, 'repair'));
                  setSelectedIds([]);
                }}
                className="px-2.5 py-1 bg-white border border-blue-200 rounded text-xs font-semibold text-[#0796E5] hover:bg-blue-50"
              >
                Batch Repair (msiexec /fa)
              </button>
              <button
                onClick={() => {
                  selectedIds.forEach((id) => handleDeviceAction(id, 'checkin'));
                  setSelectedIds([]);
                }}
                className="px-2.5 py-1 bg-white border border-blue-200 rounded text-xs font-semibold text-[#0796E5] hover:bg-blue-50"
              >
                Simulate Check-In
              </button>
            </div>
          </div>
        )}

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-gray-100">
            <thead className="bg-[#F8FAFC] text-[#667085] font-semibold text-[11px] uppercase tracking-wider select-none">
              <tr>
                <th className="py-3 px-3.5 w-10">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={devices.length > 0 && selectedIds.length === devices.length}
                    className="rounded border-gray-300 text-[#0796E5] focus:ring-0"
                  />
                </th>
                <th
                  onClick={() => {
                    setSortBy('hostname');
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                  className="py-3 px-3 cursor-pointer hover:text-[#182230]"
                >
                  <div className="flex items-center gap-1">
                    <span>Device Name</span>
                    <ArrowUpDown size={11} />
                  </div>
                </th>
                <th className="py-3 px-3">Organization & User</th>
                <th className="py-3 px-3">Windows Edition & Arch</th>
                <th className="py-3 px-3">App Version</th>
                <th className="py-3 px-3">Camera Status</th>
                <th className="py-3 px-3">Channel</th>
                <th className="py-3 px-3">Compliance</th>
                <th className="py-3 px-3">Last Seen</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw size={18} className="animate-spin text-[#0796E5]" />
                      <span>Loading fleet endpoints...</span>
                    </div>
                  </td>
                </tr>
              ) : devices.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-gray-400">
                    No devices match the active search or filters.
                  </td>
                </tr>
              ) : (
                devices.map((device) => {
                  const isSelected = selectedIds.includes(device.id);

                  let statusBadge = (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 size={11} />
                      Healthy
                    </span>
                  );
                  if (device.cameraStatus === 'Warning') {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        <AlertTriangle size={11} />
                        Warning
                      </span>
                    );
                  } else if (device.cameraStatus === 'Error') {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-50 text-red-700 border border-red-200">
                        <XCircle size={11} />
                        Error (1603)
                      </span>
                    );
                  } else if (device.cameraStatus === 'Offline') {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                        Offline
                      </span>
                    );
                  }

                  let channelBadge = 'bg-blue-50 text-[#0796E5]';
                  if (device.updateChannel === 'Beta') channelBadge = 'bg-cyan-50 text-cyan-700';
                  else if (device.updateChannel === 'Canary') channelBadge = 'bg-purple-50 text-purple-700';
                  else if (device.updateChannel === 'Pinned Legacy') channelBadge = 'bg-gray-100 text-gray-700';

                  return (
                    <tr
                      key={device.id}
                      className={`hover:bg-[#EFF8FF]/40 transition-colors ${
                        isSelected ? 'bg-blue-50/30' : ''
                      }`}
                    >
                      <td className="py-3 px-3.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(device.id)}
                          className="rounded border-gray-300 text-[#0796E5] focus:ring-0"
                        />
                      </td>

                      <td className="py-3 px-3 font-medium">
                        <button
                          onClick={() => setSelectedDeviceForDrawer(device.id)}
                          className="text-[#0796E5] hover:underline font-mono font-bold text-xs block text-left"
                        >
                          {device.hostname}
                        </button>
                        <span className="text-[10px] text-[#667085] font-mono">
                          {device.id}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <div className="text-xs text-[#182230] font-medium truncate max-w-[150px]">
                          {device.organization?.name || 'Northstar Financial'}
                        </div>
                        <div className="text-[10px] text-[#667085] truncate max-w-[150px]">
                          {device.assignedUser?.fullName || 'Unassigned Node'}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="text-xs text-[#182230] font-medium">
                          {device.osName}
                        </div>
                        <div className="text-[10px] text-[#667085] font-mono">
                          {device.osBuild} • {device.architecture}
                        </div>
                      </td>

                      <td className="py-3 px-3 font-mono font-medium text-xs">
                        {device.appVersion}
                      </td>

                      <td className="py-3 px-3">{statusBadge}</td>

                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${channelBadge}`}>
                          {device.updateChannel}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`text-[11px] font-medium ${
                            device.complianceStatus === 'Compliant'
                              ? 'text-emerald-600'
                              : 'text-amber-600'
                          }`}
                        >
                          {device.complianceStatus}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-[11px] text-[#667085]">
                        {new Date(device.lastSeenAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedDeviceForDrawer(device.id)}
                            className="p-1 rounded hover:bg-gray-100 text-[#0796E5]"
                            title="Inspect Device Drawer"
                          >
                            <ExternalLink size={14} />
                          </button>

                          <button
                            onClick={() => handleDeviceAction(device.id, 'repair')}
                            className="p-1 rounded hover:bg-blue-50 text-[#0796E5]"
                            title="Simulate msiexec /fa Repair"
                          >
                            <Wrench size={14} />
                          </button>

                          <button
                            onClick={() => {
                              setDeviceToDelete(device);
                              setDeleteModalOpen(true);
                            }}
                            className="p-1 rounded hover:bg-red-50 text-red-500"
                            title="Delete Device"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-[#E7ECF2] bg-[#F8FAFC] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#667085]">
          <div>
            Showing <span className="font-semibold text-[#182230]">{(page - 1) * limit + 1}</span> to{' '}
            <span className="font-semibold text-[#182230]">
              {Math.min(page * limit, totalDevices)}
            </span>{' '}
            of <span className="font-semibold text-[#182230]">{totalDevices.toLocaleString()}</span> devices
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg border border-gray-200 bg-white text-[#182230] disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft size={15} />
            </button>

            <span className="px-2 font-medium">
              Page {page} of {totalPages}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg border border-gray-200 bg-white text-[#182230] disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* 7-Tab Device Detail Drawer */}
      {selectedDeviceForDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col border-l border-[#E7ECF2] animate-in slide-in-from-right duration-250">
            {/* Drawer Header */}
            <div className="px-6 py-4 border-b border-[#E7ECF2] bg-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-[#182230] font-mono">
                    {drawerDevice?.hostname || selectedDeviceForDrawer}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-[#0796E5]">
                    {drawerDevice?.healthStatus || 'Active'}
                  </span>
                </div>
                <div className="text-xs text-[#667085] mt-0.5">
                  ID: {drawerDevice?.id} • {drawerDevice?.organization?.name}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDeviceAction(drawerDevice?.id, 'checkin')}
                  className="px-2.5 py-1 rounded-lg border border-gray-200 text-xs font-semibold text-[#182230] hover:bg-gray-50"
                  title="Simulate Agent Check-in"
                >
                  Check-in
                </button>
                <button
                  onClick={() => setSelectedDeviceForDrawer(null)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* 7 Tabs Navigation */}
            <div className="flex border-b border-[#E7ECF2] px-6 bg-[#F8FAFC] overflow-x-auto text-xs">
              {[
                { id: 'general', label: 'General' },
                { id: 'camera', label: 'Camera Studio' },
                { id: 'deployment', label: 'Deployment' },
                { id: 'updates', label: 'Updates' },
                { id: 'security', label: 'Security' },
                { id: 'diagnostics', label: 'Diagnostics' },
                { id: 'activity', label: 'Activity' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setDrawerTab(tab.id as any)}
                  className={`py-3 px-3 font-semibold border-b-2 whitespace-nowrap transition-all ${
                    drawerTab === tab.id
                      ? 'border-[#0796E5] text-[#0796E5] bg-white'
                      : 'border-transparent text-[#667085] hover:text-[#182230]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs text-[#182230]">
              {drawerLoading ? (
                <div className="py-20 text-center text-gray-400">Loading device details...</div>
              ) : !drawerDevice ? (
                <div className="py-20 text-center text-gray-400">Device record not found.</div>
              ) : (
                <>
                  {/* Tab 1: General */}
                  {drawerTab === 'general' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
                        <div>
                          <span className="text-[11px] text-[#667085] block">OS Edition</span>
                          <span className="font-semibold text-[#182230]">{drawerDevice.osName}</span>
                        </div>
                        <div>
                          <span className="text-[11px] text-[#667085] block">Build Version</span>
                          <span className="font-semibold font-mono text-[#182230]">{drawerDevice.osBuild}</span>
                        </div>
                        <div>
                          <span className="text-[11px] text-[#667085] block">Hardware Architecture</span>
                          <span className="font-semibold text-[#182230]">{drawerDevice.architecture}</span>
                        </div>
                        <div>
                          <span className="text-[11px] text-[#667085] block">Management Source</span>
                          <span className="font-semibold text-[#182230]">{drawerDevice.managementSource}</span>
                        </div>
                        <div>
                          <span className="text-[11px] text-[#667085] block">Assigned User</span>
                          <span className="font-semibold text-[#182230]">
                            {drawerDevice.assignedUser?.fullName || 'None'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[11px] text-[#667085] block">Service Status</span>
                          <span className="font-semibold text-emerald-600">{drawerDevice.serviceStatus}</span>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl border border-[#E7ECF2] space-y-3">
                        <div className="font-bold text-xs text-[#182230]">Device Configuration</div>
                        <div className="space-y-2">
                          <label className="block text-[11px] text-[#667085]">Change Update Channel</label>
                          <select
                            value={drawerDevice.updateChannel}
                            onChange={(e) => handleDrawerFieldUpdate('updateChannel', e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg text-xs"
                          >
                            <option value="Stable">Stable (v3.8.2 GA)</option>
                            <option value="Beta">Beta (v3.9.0-beta.2)</option>
                            <option value="Canary">Canary (v3.9.1 Nightly)</option>
                            <option value="Pinned Legacy">Pinned Legacy (v3.7.9 LTS)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tab 2: Camera */}
                  {drawerTab === 'camera' && (
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-sm text-[#0796E5]">Media Foundation Registration</div>
                          <div className="text-[11px] text-[#667085]">Driver: {drawerDevice.cameraDriver}</div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">
                          {drawerDevice.cameraStatus}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 p-4 rounded-xl border border-gray-200">
                        <div>
                          <label className="block text-[11px] text-[#667085] mb-1">Target Resolution</label>
                          <select
                            value={drawerDevice.resolution}
                            onChange={(e) => handleDrawerFieldUpdate('resolution', e.target.value)}
                            className="w-full px-2.5 py-1.5 border rounded-lg text-xs"
                          >
                            <option value="1280x720">1280×720 (720p)</option>
                            <option value="1920x1080">1920×1080 (1080p FHD)</option>
                            <option value="2560x1440">2560×1440 (2K QHD)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] text-[#667085] mb-1">Target Frame Rate</label>
                          <select
                            value={drawerDevice.fps}
                            onChange={(e) => handleDrawerFieldUpdate('fps', parseInt(e.target.value, 10))}
                            className="w-full px-2.5 py-1.5 border rounded-lg text-xs"
                          >
                            <option value={24}>24 FPS</option>
                            <option value={30}>30 FPS</option>
                            <option value={60}>60 FPS</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] text-[#667085] mb-1">Output Format</label>
                          <select
                            value={drawerDevice.videoFormat}
                            onChange={(e) => handleDrawerFieldUpdate('videoFormat', e.target.value)}
                            className="w-full px-2.5 py-1.5 border rounded-lg text-xs"
                          >
                            <option value="NV12">NV12 (Hardware Optimized)</option>
                            <option value="YUY2">YUY2 (DirectShow Standard)</option>
                            <option value="MJPEG">MJPEG</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] text-[#667085] mb-1">Mic Audio Routing</label>
                          <input
                            type="text"
                            value={drawerDevice.micRouting}
                            disabled
                            className="w-full px-2.5 py-1.5 border rounded-lg text-xs bg-gray-50 text-gray-600 font-mono"
                          />
                        </div>
                      </div>

                      <div className="p-3 bg-gray-50 rounded-xl border text-[11px] text-[#667085]">
                        Virtual Camera Sink is actively bound to Microsoft Teams and Google Chrome client instances on this endpoint.
                      </div>
                    </div>
                  )}

                  {/* Tab 3: Deployment */}
                  {drawerTab === 'deployment' && (
                    <div className="space-y-3">
                      <div className="font-bold text-xs text-[#182230]">Recent Deployment Jobs</div>
                      {drawerDevice.deploymentDevices?.length === 0 ? (
                        <div className="p-4 text-center text-gray-400">No deployment records</div>
                      ) : (
                        <div className="divide-y divide-gray-100 border rounded-xl overflow-hidden">
                          {drawerDevice.deploymentDevices?.map((dd: any) => (
                            <div key={dd.id} className="p-3 bg-white hover:bg-gray-50">
                              <div className="flex items-center justify-between font-semibold">
                                <span>{dd.deployment?.package?.name || 'ManyCam MSI Package'}</span>
                                <span className={`text-[10px] px-2 py-0.5 rounded ${dd.status === 'Success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                                  {dd.status} (Exit {dd.exitCode ?? 0})
                                </span>
                              </div>
                              <div className="text-[11px] text-[#667085] mt-1 font-mono">
                                {dd.logExcerpt || 'Package successfully installed with exit code 0.'}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tab 4: Updates */}
                  {drawerTab === 'updates' && (
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-gray-50 border flex items-center justify-between">
                        <div>
                          <div className="font-bold text-xs text-[#182230]">Installed Version: {drawerDevice.appVersion}</div>
                          <div className="text-[11px] text-[#667085]">Channel: {drawerDevice.updateChannel}</div>
                        </div>
                        <button
                          onClick={() => handleDrawerFieldUpdate('appVersion', 'v3.8.2')}
                          className="px-3 py-1 bg-[#0796E5] text-white rounded-lg text-xs font-semibold"
                        >
                          Check For Updates
                        </button>
                      </div>

                      <div className="font-bold text-xs text-[#182230]">Historical Update Audit</div>
                      <div className="p-3 border rounded-xl space-y-2 text-[11px] text-[#667085]">
                        <div className="flex justify-between">
                          <span>Updated v3.8.1 &rarr; v3.8.2</span>
                          <span className="text-emerald-600 font-semibold">Success</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Updated v3.7.9 &rarr; v3.8.1</span>
                          <span className="text-emerald-600 font-semibold">Success</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tab 5: Security */}
                  {drawerTab === 'security' && (
                    <div className="space-y-3">
                      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                        <div className="flex items-center gap-2 font-bold text-emerald-800 text-xs mb-1">
                          <Shield size={15} />
                          <span>Code Signing & AppLocker Status</span>
                        </div>
                        <p className="text-[11px] text-emerald-900 leading-relaxed">
                          Binary validated against DigiCert EV Authenticode certificate. WHQL driver signature verified by Microsoft Windows Hardware Compatibility Program.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-3 border rounded-lg bg-gray-50">
                          <span className="text-[11px] text-[#667085] block">UAC Context</span>
                          <span className="font-semibold text-[#182230]">SYSTEM (Service) + User UI</span>
                        </div>
                        <div className="p-3 border rounded-lg bg-gray-50">
                          <span className="text-[11px] text-[#667085] block">WDAC Enforcement</span>
                          <span className="font-semibold text-emerald-600">Compliant</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tab 6: Diagnostics */}
                  {drawerTab === 'diagnostics' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#182230]">Latest Endpoint Events</span>
                        <button
                          onClick={() => handleDeviceAction(drawerDevice.id, 'diagnostics')}
                          className="px-2.5 py-1 bg-blue-50 text-[#0796E5] rounded text-xs font-semibold hover:bg-blue-100"
                        >
                          Run Health Check
                        </button>
                      </div>

                      <div className="divide-y divide-gray-100 border rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                        {drawerDevice.diagnosticEvents?.map((evt: any) => (
                          <div key={evt.id} className="p-2.5 bg-white text-[11px]">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-[#182230]">{evt.component}</span>
                              <span className="text-[10px] text-gray-400 font-mono">Code {evt.eventCode}</span>
                            </div>
                            <p className="text-[#667085] mt-0.5">{evt.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tab 7: Activity */}
                  {drawerTab === 'activity' && (
                    <div className="space-y-2 text-xs">
                      <div className="font-bold text-xs text-[#182230]">Audit Trail</div>
                      <div className="p-3 border rounded-xl space-y-2 text-[11px] text-[#667085]">
                        <div className="flex justify-between">
                          <span>Device enrolled into fleet</span>
                          <span>{new Date(drawerDevice.enrolledAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Assigned to group Executive Laptops</span>
                          <span>Automated Policy</span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Drawer Footer Actions */}
            <div className="px-6 py-4 bg-gray-50 border-t border-[#E7ECF2] flex items-center justify-between">
              <button
                onClick={() => handleDeviceAction(drawerDevice?.id, 'repair')}
                className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-[#182230] hover:bg-gray-100 flex items-center gap-1.5"
              >
                <Wrench size={14} className="text-[#0796E5]" />
                <span>Trigger Repair (msiexec /fa)</span>
              </button>

              <button
                onClick={() => handleDeviceAction(drawerDevice?.id, 'uninstall')}
                className="px-3 py-1.5 rounded-lg border border-red-200 bg-white text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-1.5"
              >
                <Trash2 size={14} />
                <span>Clean Uninstall (msiexec /x)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Device Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border p-6 space-y-4">
            <h3 className="font-bold text-base text-[#182230]">Add Managed Device</h3>
            <form onSubmit={handleAddDeviceSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#182230] mb-1">Hostname *</label>
                <input
                  type="text"
                  placeholder="e.g. VCA-SFO-0420"
                  value={formHostname}
                  onChange={(e) => setFormHostname(e.target.value.toUpperCase())}
                  required
                  className="w-full px-3 py-2 border rounded-lg text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#182230] mb-1">Windows Edition</label>
                <select
                  value={formOs}
                  onChange={(e) => setFormOs(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-xs"
                >
                  <option value="Windows 11 Enterprise">Windows 11 Enterprise 24H2</option>
                  <option value="Windows 11 Pro">Windows 11 Pro 23H2</option>
                  <option value="Windows 10 Enterprise">Windows 10 Enterprise 22H2</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#182230] mb-1">Architecture</label>
                <select
                  value={formArch}
                  onChange={(e) => setFormArch(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-xs"
                >
                  <option value="x64">x64 (64-bit AMD/Intel)</option>
                  <option value="ARM64">ARM64 (Snapdragon / Surface)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[#667085]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#0796E5] text-white text-xs font-semibold shadow-sm"
                >
                  Enroll
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Device Confirmation Dialog */}
      {deleteModalOpen && deviceToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border p-6 space-y-4">
            <h3 className="font-bold text-base text-[#182230]">Remove Device from Fleet</h3>
            <p className="text-xs text-[#667085]">
              Are you sure you want to remove <strong>{deviceToDelete.hostname}</strong>? This will purge its Media Foundation registration token and stop update sync.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[#667085]"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteDevice}
                className="px-4 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold shadow-sm"
              >
                Confirm Removal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
