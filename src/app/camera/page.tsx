'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Video,
  Camera,
  Layers,
  Settings,
  Sliders,
  Play,
  Pause,
  Square,
  Download,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Eye,
  Mic,
  MicOff,
  Maximize2,
  Sparkles,
  FileCode,
  ShieldCheck,
  Plus,
  Trash2,
  Volume2,
  RefreshCw,
  FolderOpen
} from 'lucide-react';

interface CameraPreset {
  id: string;
  name: string;
  configurationJson: string;
}

interface CameraPolicy {
  id: string;
  name: string;
  version: string;
  priority: number;
  settingsJson: string;
}

export default function VirtualCameraPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Studio State
  const [activeTab, setActiveTab] = useState<'studio' | 'policies' | 'architecture'>('studio');
  const [selectedSource, setSelectedSource] = useState<string>('test_pattern');
  const [activeScene, setActiveScene] = useState<string>('Executive Meeting');
  const [isPreviewRunning, setIsPreviewRunning] = useState<boolean>(true);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isWebcamActive, setIsWebcamActive] = useState<boolean>(false);

  // Settings
  const [resolution, setResolution] = useState<string>('1920x1080');
  const [fps, setFps] = useState<number>(30);
  const [format, setFormat] = useState<string>('NV12');
  const [mirror, setMirror] = useState<boolean>(false);
  const [rotation, setRotation] = useState<number>(0);
  const [brightness, setBrightness] = useState<number>(50);
  const [contrast, setContrast] = useState<number>(50);
  const [saturation, setSaturation] = useState<number>(50);
  const [sharpness, setSharpness] = useState<number>(50);
  const [zoom, setZoom] = useState<number>(1.0);
  const [backgroundBlur, setBackgroundBlur] = useState<string>('None');
  const [greenScreen, setGreenScreen] = useState<boolean>(false);
  const [audioGain, setAudioGain] = useState<number>(85);
  const [micMuted, setMicMuted] = useState<boolean>(false);
  const [syncOffsetMs, setSyncOffsetMs] = useState<number>(0);

  // Presets and Policies
  const [presets, setPresets] = useState<CameraPreset[]>([]);
  const [selectedPresetName, setSelectedPresetName] = useState<string>('Executive Meeting (1080p60 Studio)');
  const [savePresetModalOpen, setSavePresetModalOpen] = useState<boolean>(false);
  const [newPresetName, setNewPresetName] = useState<string>('');
  const [policies, setPolicies] = useState<CameraPolicy[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Architecture diagram selected node
  const [selectedNode, setSelectedNode] = useState<string>('mf');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch presets & policies
  useEffect(() => {
    fetch('/api/camera/presets')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setPresets(data);
      })
      .catch((e) => console.error(e));

    fetch('/api/camera/policies')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setPolicies(data);
      })
      .catch((e) => console.error(e));
  }, []);

  // WebCam activation
  const startWebcam = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setIsWebcamActive(true);
          setSelectedSource('webcam');
          showToast('Physical webcam connected for preview simulation');
        }
      }
    } catch {
      alert('Camera permission denied or camera unavailable in this browser environment. Using high-fidelity test pattern.');
      setSelectedSource('test_pattern');
    }
  };

  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setIsWebcamActive(false);
    }
  };

  // Canvas rendering loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let t = 0;

    const render = () => {
      if (!isPreviewRunning || isPaused) {
        return;
      }

      const w = canvas.width;
      const h = canvas.height;

      // Apply transformations
      ctx.save();
      ctx.clearRect(0, 0, w, h);

      // Brightness / Contrast / Saturation filter
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;

      if (mirror) {
        ctx.translate(w, 0);
        ctx.scale(-1, 1);
      }

      if (rotation > 0) {
        ctx.translate(w / 2, h / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.translate(-w / 2, -h / 2);
      }

      if (zoom !== 1.0) {
        ctx.translate(w / 2, h / 2);
        ctx.scale(zoom, zoom);
        ctx.translate(-w / 2, -h / 2);
      }

      if (selectedSource === 'webcam' && videoRef.current && isWebcamActive) {
        ctx.drawImage(videoRef.current, 0, 0, w, h);
      } else if (selectedSource === 'test_pattern') {
        // High quality SMPTE style color bars
        const colors = ['#C0C0C0', '#C0C000', '#00C0C0', '#00C000', '#C000C0', '#C00000', '#0000C0'];
        const barWidth = w / colors.length;
        colors.forEach((col, idx) => {
          ctx.fillStyle = col;
          ctx.fillRect(idx * barWidth, 0, barWidth, h * 0.75);
        });
        // Bottom cast bars
        const botColors = ['#0000C0', '#131313', '#C000C0', '#131313', '#00C0C0', '#131313', '#C0C0C0'];
        botColors.forEach((col, idx) => {
          ctx.fillStyle = col;
          ctx.fillRect(idx * barWidth, h * 0.75, barWidth, h * 0.25);
        });

        // Dynamic timecode stamp
        ctx.fillStyle = '#000000';
        ctx.fillRect(w / 2 - 140, h - 45, 280, 30);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 14px monospace';
        ctx.fillText(`SMPTE 1080p | TC 01:24:${String(Math.floor(t % 60)).padStart(2, '0')}:${String(Math.floor((t * 30) % 30)).padStart(2, '0')}`, w / 2 - 130, h - 25);
      } else if (selectedSource === 'color_bars') {
        // Alignment grid & crosshairs
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = '#22B8F0';
        ctx.lineWidth = 1;
        for (let x = 0; x < w; x += 40) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
          ctx.stroke();
        }
        for (let y = 0; y < h; y += 40) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
          ctx.stroke();
        }
        // Center reticle
        ctx.strokeStyle = '#10B981';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, 80 + Math.sin(t * 3) * 5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(w / 2 - 120, h / 2);
        ctx.lineTo(w / 2 + 120, h / 2);
        ctx.moveTo(w / 2, h / 2 - 120);
        ctx.lineTo(w / 2, h / 2 + 120);
        ctx.stroke();
      } else if (selectedSource === 'green_screen') {
        // Chroma key green background with studio subject silhouette
        ctx.fillStyle = '#00FF00';
        ctx.fillRect(0, 0, w, h);
        // Subject silhouette
        ctx.fillStyle = '#1E293B';
        ctx.beginPath();
        ctx.arc(w / 2, h / 2 - 30, 70, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(w / 2, h / 2 + 120, 140, 90, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Demo Screen / Corporate Presentation Scene
        ctx.fillStyle = '#1E293B';
        ctx.fillRect(0, 0, w, h);

        // Gradient accent
        const grad = ctx.createLinearGradient(0, 0, w, h);
        grad.addColorStop(0, '#0796E5');
        grad.addColorStop(1, '#0878BF');
        ctx.fillStyle = grad;
        ctx.fillRect(40, 40, w - 80, 70);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 20px sans-serif';
        ctx.fillText('ManyCam Enterprise Virtual Camera Control Stream', 60, 82);

        // Content cards
        ctx.fillStyle = '#334155';
        ctx.fillRect(40, 130, (w - 100) / 2, h - 180);
        ctx.fillRect(60 + (w - 100) / 2, 130, (w - 100) / 2, h - 180);

        ctx.fillStyle = '#94A3B8';
        ctx.font = '13px monospace';
        ctx.fillText(`Source: ${selectedSource} | Scene: ${activeScene}`, 60, 160);
        ctx.fillText(`Resolution: ${resolution} @ ${fps} FPS | Codec: ${format}`, 60, 185);
        ctx.fillText(`Media Foundation Virtual Sink Active`, 60, 210);
      }

      // Simulated Virtual Background Blur
      if (backgroundBlur !== 'None') {
        ctx.fillStyle = 'rgba(7, 150, 229, 0.08)';
        ctx.fillRect(0, 0, w, h);
      }

      // ManyCam Watermark overlay
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('MANYCAMP ENTERPRISE VIRTUAL CAM', w - 240, 25);

      ctx.restore();

      t += 0.03;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [
    selectedSource,
    activeScene,
    isPreviewRunning,
    isPaused,
    isWebcamActive,
    brightness,
    contrast,
    saturation,
    zoom,
    mirror,
    rotation,
    backgroundBlur,
    resolution,
    fps,
    format,
  ]);

  // Snapshot PNG capture
  const handleCaptureSnapshot = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `manycam-virtual-frame-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
    showToast('High-resolution snapshot downloaded!');
  };

  // Preset actions
  const handleSavePreset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPresetName) return;
    const config = {
      resolution,
      fps,
      format,
      brightness,
      contrast,
      saturation,
      sharpness,
      zoom,
      backgroundBlur,
      greenScreen,
      audioGain,
      micMuted,
      syncOffsetMs,
    };
    try {
      const res = await fetch('/api/camera/presets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newPresetName, configurationJson: JSON.stringify(config) }),
      });
      if (res.ok) {
        const saved = await res.json();
        setPresets((prev) => [saved, ...prev]);
        setSelectedPresetName(saved.name);
        setSavePresetModalOpen(false);
        setNewPresetName('');
        showToast(`Preset "${saved.name}" saved!`);
      }
    } catch {
      alert('Failed to save preset');
    }
  };

  const handleLoadPreset = (presetName: string) => {
    setSelectedPresetName(presetName);
    const p = presets.find((item) => item.name === presetName);
    if (!p) return;
    try {
      const c = JSON.parse(p.configurationJson);
      if (c.resolution) setResolution(c.resolution);
      if (c.fps) setFps(c.fps);
      if (c.format) setFormat(c.format);
      if (c.brightness !== undefined) setBrightness(c.brightness);
      if (c.contrast !== undefined) setContrast(c.contrast);
      if (c.saturation !== undefined) setSaturation(c.saturation);
      if (c.zoom !== undefined) setZoom(c.zoom);
      if (c.backgroundBlur) setBackgroundBlur(c.backgroundBlur);
      if (c.greenScreen !== undefined) setGreenScreen(c.greenScreen);
      if (c.audioGain !== undefined) setAudioGain(c.audioGain);
      if (c.micMuted !== undefined) setMicMuted(c.micMuted);
      showToast(`Preset "${p.name}" restored!`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleResetSettings = () => {
    setResolution('1920x1080');
    setFps(30);
    setFormat('NV12');
    setMirror(false);
    setRotation(0);
    setBrightness(50);
    setContrast(50);
    setSaturation(50);
    setSharpness(50);
    setZoom(1.0);
    setBackgroundBlur('None');
    setGreenScreen(false);
    setAudioGain(85);
    setMicMuted(false);
    setSyncOffsetMs(0);
    showToast('Camera settings restored to default baseline.');
  };

  const handleExportConfig = () => {
    const regContent = `Windows Registry Editor Version 5.00

[HKEY_LOCAL_MACHINE\\SOFTWARE\\Policies\\ManyCam\\VirtualCamera]
"Resolution"="${resolution}"
"FPS"=dword:${fps.toString(16).padStart(8, '0')}
"VideoFormat"="${format}"
"AllowBackgroundBlur"=${backgroundBlur !== 'None' ? 'dword:00000001' : 'dword:00000000'}
"LockConfiguration"=dword:00000000
"EnforcePrivacyIndicator"=dword:00000001
"AudioSyncOffsetMs"=dword:${Math.abs(syncOffsetMs).toString(16).padStart(8, '0')}
`;
    const blob = new Blob([regContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `ManyCam-VirtualCamera-Policy.reg`;
    link.href = url;
    link.click();
    showToast('Exported Windows ADMX / Registry (.reg) policy configuration');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Hidden video element for local webcam stream */}
      <video ref={videoRef} className="hidden" playsInline muted autoPlay />

      {/* Toast Alert */}
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
            Virtual Camera Studio & Policy Control
          </h1>
          <p className="text-xs text-[#667085] mt-1">
            Media Foundation driver pipeline, real-time shader adjustments, ADMX policies and enterprise source management.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-[#E7ECF2] p-1 bg-gray-50">
            <button
              onClick={() => setActiveTab('studio')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                activeTab === 'studio' ? 'bg-white text-[#0796E5] shadow-xs' : 'text-[#667085]'
              }`}
            >
              Camera Studio
            </button>
            <button
              onClick={() => setActiveTab('policies')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                activeTab === 'policies' ? 'bg-white text-[#0796E5] shadow-xs' : 'text-[#667085]'
              }`}
            >
              Enterprise Policies
            </button>
            <button
              onClick={() => setActiveTab('architecture')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                activeTab === 'architecture' ? 'bg-white text-[#0796E5] shadow-xs' : 'text-[#667085]'
              }`}
            >
              Architecture Diagram
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: CAMERA STUDIO (3 COLUMNS) */}
      {activeTab === 'studio' && (
        <div className="space-y-4">
          {/* Preset Selector Bar */}
          <div className="p-3.5 rounded-2xl border border-[#E7ECF2] bg-white shadow-card flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-[#182230] flex items-center gap-1.5">
                <Sliders size={15} className="text-[#0796E5]" />
                Saved Preset:
              </span>
              <select
                value={selectedPresetName}
                onChange={(e) => handleLoadPreset(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-[#182230] bg-gray-50 focus:outline-none focus:border-[#0796E5]"
              >
                {presets.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSavePresetModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-[#0796E5] hover:bg-blue-100 text-xs font-semibold"
              >
                <Save size={14} />
                <span>Save Current as Preset</span>
              </button>

              <button
                onClick={handleResetSettings}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-[#667085] hover:bg-gray-50"
              >
                <RotateCcw size={14} />
                <span>Reset Defaults</span>
              </button>

              <button
                onClick={handleExportConfig}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-[#182230] hover:bg-gray-50"
              >
                <FileCode size={14} className="text-[#0796E5]" />
                <span>Export .reg Policy</span>
              </button>
            </div>
          </div>

          {/* 3-Column Studio Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Column (3 cols): Available Sources & Saved Scenes */}
            <div className="lg:col-span-3 space-y-4">
              {/* Scenes */}
              <div className="p-4 rounded-2xl border border-[#E7ECF2] bg-white shadow-card">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#182230]">
                    Studio Scenes
                  </h3>
                  <span className="text-[10px] text-[#0796E5] font-semibold bg-blue-50 px-2 py-0.5 rounded">
                    4 Configured
                  </span>
                </div>

                <div className="mt-3 space-y-1.5">
                  {[
                    { name: 'Executive Meeting', desc: '1080p60 FHD • Subdued Bokeh' },
                    { name: 'Product Demo', desc: '1440p30 QHD • Screen Overlay' },
                    { name: 'Training Presentation', desc: '720p30 • Bandwidth Optimized' },
                    { name: 'Webinar Broadcast', desc: '4K Ultra-Def • Green Screen Studio' },
                  ].map((scene) => (
                    <button
                      key={scene.name}
                      onClick={() => {
                        setActiveScene(scene.name);
                        showToast(`Switched active scene to "${scene.name}"`);
                      }}
                      className={`w-full p-2.5 rounded-xl text-left border transition-all ${
                        activeScene === scene.name
                          ? 'bg-[#EFF8FF] border-[#0796E5] text-[#0796E5]'
                          : 'bg-white border-gray-100 hover:border-gray-200 text-[#182230]'
                      }`}
                    >
                      <div className="text-xs font-bold leading-tight">{scene.name}</div>
                      <div className="text-[10px] text-[#667085] mt-0.5">{scene.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Sources Selector */}
              <div className="p-4 rounded-2xl border border-[#E7ECF2] bg-white shadow-card">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#182230]">
                    Input Sources
                  </h3>
                  <button
                    onClick={() => showToast('New virtual stream source added')}
                    className="p-1 rounded text-[#0796E5] hover:bg-blue-50"
                    title="Add Virtual Source"
                  >
                    <Plus size={15} />
                  </button>
                </div>

                <div className="mt-3 space-y-1.5">
                  {[
                    { id: 'test_pattern', label: 'SMPTE Color Bars (EBU)', type: 'Pattern' },
                    { id: 'color_bars', label: 'Alignment Crosshair Grid', type: 'Calibration' },
                    { id: 'green_screen', label: 'Virtual Green Screen Chroma', type: 'Studio' },
                    { id: 'presentation', label: 'Boardroom Presentation Slides', type: 'Media' },
                    { id: 'webcam', label: 'Browser Webcam (Permission Req)', type: 'Hardware' },
                  ].map((src) => {
                    const isSelected = selectedSource === src.id;
                    return (
                      <button
                        key={src.id}
                        onClick={() => {
                          if (src.id === 'webcam') {
                            startWebcam();
                          } else {
                            if (isWebcamActive) stopWebcam();
                            setSelectedSource(src.id);
                          }
                        }}
                        className={`w-full p-2.5 rounded-xl text-left border flex items-center justify-between text-xs transition-all ${
                          isSelected
                            ? 'bg-blue-50/60 border-[#0796E5] font-semibold text-[#0796E5]'
                            : 'bg-white border-gray-100 hover:bg-gray-50 text-[#182230]'
                        }`}
                      >
                        <span className="truncate">{src.label}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-[#667085]">
                          {src.type}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Center Column (6 cols): Large 16:9 Video Canvas Preview */}
            <div className="lg:col-span-6 space-y-3">
              <div className="p-4 rounded-2xl border border-[#E7ECF2] bg-white shadow-card">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#182230]">
                      Active Virtual Output ({resolution} @ {fps} FPS • {format})
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setIsPaused(!isPaused)}
                      className="p-1.5 rounded-lg border text-gray-600 hover:bg-gray-50 text-xs"
                      title={isPaused ? 'Resume Preview' : 'Pause Preview'}
                    >
                      {isPaused ? <Play size={14} /> : <Pause size={14} />}
                    </button>

                    <button
                      onClick={handleCaptureSnapshot}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0796E5] hover:bg-[#0878BF] text-white text-xs font-semibold shadow-xs"
                      title="Download PNG snapshot from video stream"
                    >
                      <Download size={13} />
                      <span>Snapshot</span>
                    </button>
                  </div>
                </div>

                {/* 16:9 Canvas Container */}
                <div
                  id="camera-preview-canvas"
                  className="mt-3 relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-inner flex items-center justify-center border border-gray-900"
                >
                  <canvas
                    ref={canvasRef}
                    width={1280}
                    height={720}
                    className="w-full h-full object-contain"
                  />

                  {/* On-screen Live Indicators */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-red-600/90 text-white font-bold text-[10px] tracking-wider uppercase flex items-center gap-1 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                      Virtual On-Air
                    </span>
                    <span className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-white text-[10px] font-mono">
                      {activeScene}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-xs text-white px-2 py-1 rounded text-[10px] font-mono flex items-center gap-2">
                    <span>MF Virtual Source: OK</span>
                    <span>DirectML Shader: 0.8ms</span>
                  </div>

                  <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-xs text-white px-2 py-1 rounded text-[10px] font-mono">
                    Audio Gain: {micMuted ? 'MUTED' : `${audioGain}%`}
                  </div>
                </div>

                {/* Stream Controls Footer */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-[#667085]">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setMirror(!mirror)}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${
                        mirror ? 'bg-blue-50 text-[#0796E5] border-blue-200' : 'text-[#667085]'
                      }`}
                    >
                      Mirror {mirror ? 'ON' : 'OFF'}
                    </button>

                    <button
                      onClick={() => setRotation((r) => (r + 90) % 360)}
                      className="px-2.5 py-1 rounded-md text-xs font-semibold border text-[#667085] hover:bg-gray-50"
                    >
                      Rotate {rotation}°
                    </button>

                    <button
                      onClick={() => setMicMuted(!micMuted)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold border ${
                        micMuted ? 'bg-red-50 text-red-600 border-red-200' : 'text-[#667085]'
                      }`}
                    >
                      {micMuted ? <MicOff size={13} /> : <Mic size={13} />}
                      <span>{micMuted ? 'Mic Muted' : 'Mic Active'}</span>
                    </button>
                  </div>

                  <div className="text-[11px] text-[#667085]">
                    Simulated Browser Sink • Windows Driver Registered
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column (3 cols): Camera Settings & Real-time Filters */}
            <div className="lg:col-span-3 space-y-4">
              <div className="p-4 rounded-2xl border border-[#E7ECF2] bg-white shadow-card space-y-4 text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <h3 className="font-bold uppercase tracking-wider text-[#182230]">
                    Output Properties
                  </h3>
                  <Settings size={15} className="text-[#0796E5]" />
                </div>

                {/* Resolution & FPS */}
                <div className="space-y-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#667085] mb-1">
                      Stream Resolution
                    </label>
                    <select
                      value={resolution}
                      onChange={(e) => setResolution(e.target.value)}
                      className="w-full px-2.5 py-1.5 border rounded-lg text-xs"
                    >
                      <option value="1280x720">1280×720 (720p HD)</option>
                      <option value="1920x1080">1920×1080 (1080p FHD)</option>
                      <option value="2560x1440">2560×1440 (2K QHD)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#667085] mb-1">FPS</label>
                      <select
                        value={fps}
                        onChange={(e) => setFps(parseInt(e.target.value, 10))}
                        className="w-full px-2 py-1.5 border rounded-lg text-xs"
                      >
                        <option value={24}>24 FPS</option>
                        <option value={30}>30 FPS</option>
                        <option value={60}>60 FPS</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#667085] mb-1">Format</label>
                      <select
                        value={format}
                        onChange={(e) => setFormat(e.target.value)}
                        className="w-full px-2 py-1.5 border rounded-lg text-xs"
                      >
                        <option value="NV12">NV12</option>
                        <option value="YUY2">YUY2</option>
                        <option value="MJPEG">MJPEG</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 space-y-3">
                  <div className="font-bold text-[11px] uppercase tracking-wider text-[#182230]">
                    Image Adjustments
                  </div>

                  {/* Brightness */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-[#667085]">Brightness</span>
                      <span className="font-mono">{brightness}%</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={150}
                      value={brightness}
                      onChange={(e) => setBrightness(parseInt(e.target.value, 10))}
                      className="w-full accent-[#0796E5]"
                    />
                  </div>

                  {/* Contrast */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-[#667085]">Contrast</span>
                      <span className="font-mono">{contrast}%</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={150}
                      value={contrast}
                      onChange={(e) => setContrast(parseInt(e.target.value, 10))}
                      className="w-full accent-[#0796E5]"
                    />
                  </div>

                  {/* Saturation */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-[#667085]">Saturation</span>
                      <span className="font-mono">{saturation}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={150}
                      value={saturation}
                      onChange={(e) => setSaturation(parseInt(e.target.value, 10))}
                      className="w-full accent-[#0796E5]"
                    />
                  </div>

                  {/* Zoom */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-[#667085]">Digital Zoom</span>
                      <span className="font-mono">{zoom.toFixed(2)}x</span>
                    </div>
                    <input
                      type="range"
                      min={1.0}
                      max={2.5}
                      step={0.05}
                      value={zoom}
                      onChange={(e) => setZoom(parseFloat(e.target.value))}
                      className="w-full accent-[#0796E5]"
                    />
                  </div>
                </div>

                {/* Virtual Background */}
                <div className="pt-3 border-t border-gray-100 space-y-2">
                  <label className="block text-[11px] font-semibold text-[#667085]">
                    Virtual Background Effect
                  </label>
                  <select
                    value={backgroundBlur}
                    onChange={(e) => setBackgroundBlur(e.target.value)}
                    className="w-full px-2.5 py-1.5 border rounded-lg text-xs"
                  >
                    <option value="None">None (Standard Passthrough)</option>
                    <option value="Light">Light Bokeh (8px)</option>
                    <option value="Medium">Medium Studio Blur (16px)</option>
                    <option value="Deep">Deep Executive Isolation (24px)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: ENTERPRISE CAMERA POLICIES */}
      {activeTab === 'policies' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl border border-[#E7ECF2] bg-white shadow-card">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-sm font-bold text-[#182230]">
                  Enterprise Camera Policy Enforcement
                </h3>
                <p className="text-xs text-[#667085]">
                  Define max resolution, frame rate caps, allowed formats and privacy indicator locks distributed via ADMX / Group Policy.
                </p>
              </div>

              <button
                onClick={handleExportConfig}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0796E5] text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                <Download size={14} />
                <span>Export Active ADMX .reg</span>
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              {policies.map((pol) => {
                let settings: any = {};
                try {
                  settings = JSON.parse(pol.settingsJson);
                } catch {
                  settings = {};
                }

                return (
                  <div key={pol.id} className="p-4 rounded-xl border border-gray-200 bg-white hover:border-[#0796E5] transition-all space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#182230]">{pol.name}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-[#0796E5]">
                        Priority {pol.priority}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-[11px] text-[#667085]">
                      <div className="flex justify-between">
                        <span>Max Output Resolution:</span>
                        <span className="font-semibold text-[#182230]">{settings.maxResolution || '1080p'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Max Frame Rate:</span>
                        <span className="font-semibold text-[#182230]">{settings.maxFps || 30} FPS</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Background Blur:</span>
                        <span className="font-semibold text-emerald-600">
                          {settings.backgroundBlurAllowed ? 'Allowed' : 'Restricted'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Privacy LED Lock:</span>
                        <span className="font-semibold text-blue-600">Mandatory</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-[10px] text-gray-400">Version {pol.version}</span>
                      <button
                        onClick={() => showToast(`Policy "${pol.name}" deployed to target groups`)}
                        className="text-xs text-[#0796E5] font-semibold hover:underline"
                      >
                        Enforce Policy
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: INTERACTIVE WINDOWS ARCHITECTURE DIAGRAM */}
      {activeTab === 'architecture' && (
        <div className="space-y-4">
          <div className="p-6 rounded-2xl border border-[#E7ECF2] bg-white shadow-card space-y-6">
            <div>
              <h3 className="text-base font-bold text-[#182230]">
                Windows Virtual Camera Integration Architecture
              </h3>
              <p className="text-xs text-[#667085] mt-1">
                Click any architectural block below to inspect driver boundaries, IPC named pipes, and Windows Media Foundation pipelines.
              </p>
            </div>

            {/* Clickable SVG Diagram */}
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 overflow-x-auto">
              <svg viewBox="0 0 960 260" className="w-full max-w-4xl mx-auto select-none">
                {/* Node 1: Physical / Virtual Sources */}
                <g
                  onClick={() => setSelectedNode('sources')}
                  className="cursor-pointer group"
                >
                  <rect
                    x="20"
                    y="70"
                    width="150"
                    height="100"
                    rx="12"
                    fill={selectedNode === 'sources' ? '#EFF8FF' : '#FFFFFF'}
                    stroke={selectedNode === 'sources' ? '#0796E5' : '#CBD5E1'}
                    strokeWidth={selectedNode === 'sources' ? '2.5' : '1.5'}
                  />
                  <text x="95" y="110" textAnchor="middle" fontWeight="bold" fontSize="13" fill="#182230">
                    Input Sources
                  </text>
                  <text x="95" y="130" textAnchor="middle" fontSize="10" fill="#667085">
                    Webcam / Screen / NDI
                  </text>
                </g>

                {/* Arrow 1 */}
                <path d="M 170 120 L 220 120" stroke="#0796E5" strokeWidth="2" markerEnd="url(#arrow)" />

                {/* Node 2: Processing & Shaders */}
                <g
                  onClick={() => setSelectedNode('processing')}
                  className="cursor-pointer"
                >
                  <rect
                    x="230"
                    y="70"
                    width="160"
                    height="100"
                    rx="12"
                    fill={selectedNode === 'processing' ? '#EFF8FF' : '#FFFFFF'}
                    stroke={selectedNode === 'processing' ? '#0796E5' : '#CBD5E1'}
                    strokeWidth={selectedNode === 'processing' ? '2.5' : '1.5'}
                  />
                  <text x="310" y="105" textAnchor="middle" fontWeight="bold" fontSize="13" fill="#182230">
                    DirectML Shaders
                  </text>
                  <text x="310" y="125" textAnchor="middle" fontSize="10" fill="#667085">
                    GPU Chroma & Blur
                  </text>
                  <text x="310" y="142" textAnchor="middle" fontSize="9" fill="#0796E5">
                    Zero CPU Penalty
                  </text>
                </g>

                {/* Arrow 2 */}
                <path d="M 390 120 L 440 120" stroke="#0796E5" strokeWidth="2" />

                {/* Node 3: Virtual Driver Sink */}
                <g
                  onClick={() => setSelectedNode('driver')}
                  className="cursor-pointer"
                >
                  <rect
                    x="450"
                    y="70"
                    width="160"
                    height="100"
                    rx="12"
                    fill={selectedNode === 'driver' ? '#EFF8FF' : '#FFFFFF'}
                    stroke={selectedNode === 'driver' ? '#0796E5' : '#CBD5E1'}
                    strokeWidth={selectedNode === 'driver' ? '2.5' : '1.5'}
                  />
                  <text x="530" y="105" textAnchor="middle" fontWeight="bold" fontSize="13" fill="#182230">
                    ManyCam Driver
                  </text>
                  <text x="530" y="125" textAnchor="middle" fontSize="10" fill="#667085">
                    Virtual WebCam Filter
                  </text>
                  <text x="530" y="142" textAnchor="middle" fontSize="9" fill="#10B981">
                    WHQL Certified
                  </text>
                </g>

                {/* Arrow 3 */}
                <path d="M 610 120 L 660 120" stroke="#0796E5" strokeWidth="2" />

                {/* Node 4: Media Foundation Platform */}
                <g
                  onClick={() => setSelectedNode('mf')}
                  className="cursor-pointer"
                >
                  <rect
                    x="670"
                    y="70"
                    width="160"
                    height="100"
                    rx="12"
                    fill={selectedNode === 'mf' ? '#EFF8FF' : '#FFFFFF'}
                    stroke={selectedNode === 'mf' ? '#0796E5' : '#CBD5E1'}
                    strokeWidth={selectedNode === 'mf' ? '2.5' : '1.5'}
                  />
                  <text x="750" y="105" textAnchor="middle" fontWeight="bold" fontSize="13" fill="#182230">
                    Media Foundation
                  </text>
                  <text x="750" y="125" textAnchor="middle" fontSize="10" fill="#667085">
                    Windows 10/11 Subsystem
                  </text>
                  <text x="750" y="142" textAnchor="middle" fontSize="9" fill="#0796E5">
                    IMFVirtualCamera API
                  </text>
                </g>

                {/* Arrow 4 */}
                <path d="M 830 120 L 870 120" stroke="#0796E5" strokeWidth="2" />

                {/* Node 5: Consumers */}
                <g
                  onClick={() => setSelectedNode('consumers')}
                  className="cursor-pointer"
                >
                  <rect
                    x="880"
                    y="70"
                    width="70"
                    height="100"
                    rx="12"
                    fill={selectedNode === 'consumers' ? '#EFF8FF' : '#FFFFFF'}
                    stroke={selectedNode === 'consumers' ? '#0796E5' : '#CBD5E1'}
                    strokeWidth={selectedNode === 'consumers' ? '2.5' : '1.5'}
                  />
                  <text x="915" y="110" textAnchor="middle" fontWeight="bold" fontSize="11" fill="#182230">
                    Teams
                  </text>
                  <text x="915" y="128" textAnchor="middle" fontWeight="bold" fontSize="11" fill="#182230">
                    Zoom
                  </text>
                  <text x="915" y="145" textAnchor="middle" fontSize="10" fill="#667085">
                    Browsers
                  </text>
                </g>
              </svg>
            </div>

            {/* Explanatory Callout for Selected Node */}
            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 text-xs">
              {selectedNode === 'mf' && (
                <div>
                  <h4 className="font-bold text-[#0796E5] text-sm mb-1">
                    Windows Media Foundation (IMFVirtualCamera) User-Mode Architecture
                  </h4>
                  <p className="text-[#182230] leading-relaxed">
                    Starting in Windows 10 Build 20348 / Windows 11, virtual video devices are registered in user space without requiring kernel-mode driver installation. ManyCam registers via <code>MFCreateVirtualCamera</code> with <code>MFVirtualCameraType_SoftwareCameraSource</code>, eliminating kernel crash vectors and complying with strict enterprise endpoint security.
                  </p>
                </div>
              )}
              {selectedNode === 'driver' && (
                <div>
                  <h4 className="font-bold text-[#0796E5] text-sm mb-1">
                    ManyCam Virtual WebCam Driver (v3.8.2.14)
                  </h4>
                  <p className="text-[#182230] leading-relaxed">
                    Exposes standard NV12 and YUY2 capture pins in DirectShow and Media Foundation. Certified under Microsoft WHQL (Windows Hardware Quality Labs) with signed catalog catalog (.cat) files to avoid SmartScreen or driver signature enforcement blocks.
                  </p>
                </div>
              )}
              {selectedNode === 'processing' && (
                <div>
                  <h4 className="font-bold text-[#0796E5] text-sm mb-1">
                    Hardware Accelerated Frame Processing (DirectML / DirectX 12)
                  </h4>
                  <p className="text-[#182230] leading-relaxed">
                    Frame processing leverages Windows Machine Learning (DirectML) to perform real-time background segmentation and chroma keying directly on the endpoint GPU (Intel Arc, NVIDIA RTX, or Qualcomm Adreno NPU), achieving sub-5ms processing latency.
                  </p>
                </div>
              )}
              {selectedNode === 'sources' && (
                <div>
                  <h4 className="font-bold text-[#0796E5] text-sm mb-1">
                    Input Source Ingestion
                  </h4>
                  <p className="text-[#182230] leading-relaxed">
                    ManyCam ingests video streams from physical USB webcams, screen captures, slide presentations, IP cameras (RTSP/RTMP), or test patterns into a synchronized shared memory buffer.
                  </p>
                </div>
              )}
              {selectedNode === 'consumers' && (
                <div>
                  <h4 className="font-bold text-[#0796E5] text-sm mb-1">
                    Client Applications (Teams, Zoom, WebRTC)
                  </h4>
                  <p className="text-[#182230] leading-relaxed">
                    Standard Win32 and Chromium consumers recognize the ManyCam Virtual WebCam as a standard physical camera device without requiring proprietary plugins.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Save Preset Dialog */}
      {savePresetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border p-6 space-y-4">
            <h3 className="font-bold text-base text-[#182230]">Save Studio Preset</h3>
            <form onSubmit={handleSavePreset} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#182230] mb-1">Preset Name *</label>
                <input
                  type="text"
                  placeholder="e.g. VIP Boardroom Broadcast"
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded-lg text-xs"
                />
              </div>
              <div className="text-[11px] text-[#667085]">
                Saves active resolution ({resolution}), frame rate ({fps} FPS), format ({format}), brightness, contrast and background blur.
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSavePresetModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[#667085]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#0796E5] text-white text-xs font-semibold shadow-sm"
                >
                  Save Preset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
