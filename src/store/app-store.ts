import { create } from 'zustand';
import { UserRole } from '@/lib/types';

export interface TourScenario {
  id: number;
  title: string;
  route: string;
  description: string;
  highlightSelector?: string;
  actionText?: string;
}

export const TOUR_SCENARIOS: TourScenario[] = [
  {
    id: 1,
    title: 'Fleet Overview & Enterprise Health',
    route: '/overview',
    description: 'Explore the executive dashboard tracking 2,486 Windows machines, active virtual cameras, deployment success rates and live alert signals.',
    highlightSelector: '#overview-kpi-grid',
    actionText: 'Review KPI Metrics'
  },
  {
    id: 2,
    title: 'Inspect Device Fleet & Camera Configuration',
    route: '/devices',
    description: 'Drill into the endpoint inventory. Select a device such as VCA-NYC-0001 to inspect driver version, Media Foundation state and hardware profile.',
    highlightSelector: '#devices-table-container',
    actionText: 'Open Device Drawer'
  },
  {
    id: 3,
    title: 'Virtual Camera Studio & Saved Presets',
    route: '/camera',
    description: 'Access the Camera Studio, adjust resolution/FPS, switch test patterns, test green screen simulation, and save a persistent enterprise preset.',
    highlightSelector: '#camera-preview-canvas',
    actionText: 'Adjust Studio Controls'
  },
  {
    id: 4,
    title: 'Package Registry & MSI Packaging Configuration',
    route: '/deployments',
    description: 'Inspect enterprise MSI and MSIX installers, WiX custom actions, code-signing hashes and silent command line switches.',
    highlightSelector: '#packages-registry-card',
    actionText: 'Inspect Package Details'
  },
  {
    id: 5,
    title: 'Targeted Deployment to Pilot Ring',
    route: '/deployments',
    description: 'Launch a deployment job targeting pilot test workstations via Microsoft Intune or MECM with silent execution parameters.',
    highlightSelector: '#btn-launch-deployment',
    actionText: 'Launch Simulation'
  },
  {
    id: 6,
    title: 'Deployment Job Diagnostics & Node Troubleshooting',
    route: '/deployments',
    description: 'Watch deterministic installation progress, identify exit code 1603 (access denied on register server) and run an automated repair.',
    highlightSelector: '#active-deployment-card',
    actionText: 'Troubleshoot Exit Code 1603'
  },
  {
    id: 7,
    title: 'Create and Author an Application Release',
    route: '/updates',
    description: 'Define version 3.8.3 with release notes, minimum Windows build (22H2), signing certificate checksum and rollback targets.',
    highlightSelector: '#btn-create-release',
    actionText: 'Review Release Specs'
  },
  {
    id: 8,
    title: 'Staged Rollout Across Progressive Rings',
    route: '/updates',
    description: 'Visualize multi-stage deployment from Internal QA (1%) to Pilot (5%), Early Adopters (20%) and Broad Rollout (65%).',
    highlightSelector: '#staged-rollout-stepper',
    actionText: 'Inspect Rollout Progression'
  },
  {
    id: 9,
    title: 'Automated Safety Gate Tripping & Pause',
    route: '/updates',
    description: 'Observe the safety gates engine evaluate crash rates and camera registration failures, automatically pausing rollout progression.',
    highlightSelector: '#safety-gates-panel',
    actionText: 'Trigger Safety Gate'
  },
  {
    id: 10,
    title: 'Simulated In-Place Rollback Execution',
    route: '/updates',
    description: 'Trigger a rollback simulation to safely restore the prior validated stable version v3.8.1 with configuration preservation.',
    highlightSelector: '#rollback-action-panel',
    actionText: 'Execute Safe Rollback'
  },
  {
    id: 11,
    title: 'Code Signing & Windows Security Posture',
    route: '/security',
    description: 'Inspect DigiCert EV Authenticode certificates, WHQL driver status, AppLocker allow-rules and WDAC integrity checks.',
    highlightSelector: '#security-posture-overview',
    actionText: 'Verify Authenticode Chain'
  },
  {
    id: 12,
    title: 'CI/CD Windows Pipeline & Compliance Reporting',
    route: '/diagnostics',
    description: 'Simulate a 13-stage Windows build & test pipeline, inspect raw installer event logs, and export signed fleet audit reports.',
    highlightSelector: '#pipeline-stage-runner',
    actionText: 'Run Pipeline & Export'
  }
];

export interface AppState {
  currentRole: UserRole;
  setRole: (role: UserRole) => void;
  currentEnvironment: string;
  setEnvironment: (env: string) => void;

  isCommandMenuOpen: boolean;
  setCommandMenuOpen: (open: boolean) => void;

  isNotificationOpen: boolean;
  setNotificationOpen: (open: boolean) => void;

  isHelpOpen: boolean;
  setHelpOpen: (open: boolean) => void;

  isResetDialogOpen: boolean;
  setResetDialogOpen: (open: boolean) => void;

  selectedDeviceForDrawer: string | null;
  setSelectedDeviceForDrawer: (id: string | null) => void;

  activeQuickAction: 'deploy' | 'release' | 'addDevice' | 'cameraConfig' | 'diagnostics' | 'exportReport' | null;
  setActiveQuickAction: (action: 'deploy' | 'release' | 'addDevice' | 'cameraConfig' | 'diagnostics' | 'exportReport' | null) => void;

  // Guided tour
  isTourActive: boolean;
  currentTourIndex: number;
  startTour: () => void;
  nextTourStep: () => void;
  prevTourStep: () => void;
  skipTour: () => void;
  jumpToTourStep: (index: number) => void;

  // Active simulated deployment progress (persisted in store for live interactive simulation)
  simulatedJob: {
    isRunning: boolean;
    jobType: string;
    progress: number;
    title: string;
    logs: string[];
    isFailed?: boolean;
    errorCode?: number;
  } | null;
  setSimulatedJob: (job: AppState['simulatedJob']) => void;
  updateSimulatedJobProgress: (progress: number, newLog?: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentRole: 'Super Admin',
  setRole: (role) => set({ currentRole: role }),
  currentEnvironment: 'Production Fleet',
  setEnvironment: (env) => set({ currentEnvironment: env }),

  isCommandMenuOpen: false,
  setCommandMenuOpen: (open) => set({ isCommandMenuOpen: open }),

  isNotificationOpen: false,
  setNotificationOpen: (open) => set({ isNotificationOpen: open }),

  isHelpOpen: false,
  setHelpOpen: (open) => set({ isHelpOpen: open }),

  isResetDialogOpen: false,
  setResetDialogOpen: (open) => set({ isResetDialogOpen: open }),

  selectedDeviceForDrawer: null,
  setSelectedDeviceForDrawer: (id) => set({ selectedDeviceForDrawer: id }),

  activeQuickAction: null,
  setActiveQuickAction: (action) => set({ activeQuickAction: action }),

  // Tour
  isTourActive: false,
  currentTourIndex: 0,
  startTour: () => set({ isTourActive: true, currentTourIndex: 0 }),
  nextTourStep: () =>
    set((state) => ({
      currentTourIndex: Math.min(state.currentTourIndex + 1, TOUR_SCENARIOS.length - 1),
    })),
  prevTourStep: () =>
    set((state) => ({
      currentTourIndex: Math.max(state.currentTourIndex - 1, 0),
    })),
  skipTour: () => set({ isTourActive: false, currentTourIndex: 0 }),
  jumpToTourStep: (index) => set({ isTourActive: true, currentTourIndex: index }),

  simulatedJob: null,
  setSimulatedJob: (job) => set({ simulatedJob: job }),
  updateSimulatedJobProgress: (progress, newLog) =>
    set((state) => {
      if (!state.simulatedJob) return {};
      const updatedLogs = newLog
        ? [...state.simulatedJob.logs, newLog]
        : state.simulatedJob.logs;
      return {
        simulatedJob: {
          ...state.simulatedJob,
          progress,
          logs: updatedLogs,
        },
      };
    }),
}));
