export type UserRole =
  | 'Super Admin'
  | 'IT Administrator'
  | 'Deployment Operator'
  | 'Security Auditor'
  | 'Read-Only Viewer';

export interface DeviceRecord {
  id: string;
  organizationId: string;
  hostname: string;
  assignedUserId: string | null;
  assignedUser?: { fullName: string; email: string } | null;
  organization?: { name: string; region: string } | null;
  osName: string;
  osBuild: string;
  architecture: string;
  appVersion: string;
  agentVersion: string;
  cameraStatus: 'Healthy' | 'Warning' | 'Error' | 'Offline';
  serviceStatus: 'Running' | 'Stopped' | 'Degraded';
  managementSource: string;
  updateChannel: 'Stable' | 'Beta' | 'Canary' | 'Pinned Legacy';
  complianceStatus: 'Compliant' | 'Non-compliant' | 'Pending';
  lastSeenAt: string;
  enrolledAt: string;
  healthStatus: 'Healthy' | 'Warning' | 'Critical' | 'Offline';
  cameraDriver: string;
  selectedSource: string;
  resolution: string;
  fps: number;
  videoFormat: string;
  micRouting: string;
}

export interface PackageRecord {
  id: string;
  name: string;
  version: string;
  architecture: string;
  packageType: string;
  fileSize: string;
  sha256: string;
  signingStatus: string;
  downloadUrl?: string | null;
  installContext: string;
  createdAt: string;
}

export interface DeploymentRecord {
  id: string;
  packageId: string;
  package?: PackageRecord;
  targetType: string;
  targetId?: string | null;
  targetName: string;
  deploymentMethod: string;
  installContext: string;
  status: 'Pending' | 'Running' | 'Paused' | 'Completed' | 'Failed' | 'Cancelled';
  progress: number;
  totalDevices: number;
  successfulCount: number;
  failedCount: number;
  pendingCount: number;
  startedAt: string;
  completedAt?: string | null;
  initiatedBy: string;
  logsJson: string;
}

export interface ReleaseRecord {
  id: string;
  packageId: string;
  package?: PackageRecord;
  version: string;
  channel: string;
  releaseNotes: string;
  status: string;
  minWindowsBuild: string;
  publishedAt: string;
  rollouts?: RolloutRecord[];
}

export interface RolloutRecord {
  id: string;
  releaseId: string;
  status: 'Active' | 'Paused' | 'Completed' | 'Rolled Back' | 'Cancelled';
  currentStage: number;
  targetPercent: number;
  safetyGatesJson: string;
  startedAt: string;
  pausedReason?: string | null;
  stages?: RolloutStageRecord[];
}

export interface RolloutStageRecord {
  id: string;
  rolloutId: string;
  stageNumber: number;
  stageName: string;
  targetPercent: number;
  status: 'Pending' | 'Active' | 'Completed' | 'Paused' | 'Skipped';
  startedAt?: string | null;
  completedAt?: string | null;
  successCount: number;
  failureCount: number;
}

export interface CameraSourceRecord {
  id: string;
  sourceType: string;
  displayName: string;
  configurationJson: string;
  enabled: boolean;
}

export interface CameraPresetRecord {
  id: string;
  name: string;
  configurationJson: string;
  createdBy: string;
  createdAt: string;
}

export interface CameraPolicyRecord {
  id: string;
  name: string;
  version: string;
  priority: number;
  settingsJson: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CertificateRecord {
  id: string;
  alias: string;
  publisher: string;
  issuer: string;
  thumbprint: string;
  algorithm: string;
  timestampUrl: string;
  expiresAt: string;
  status: string;
  packageValidation: string;
  pipelineIntegration: string;
}

export interface DiagnosticEventRecord {
  id: string;
  deviceId?: string | null;
  device?: { id?: string; hostname: string } | null;
  severity: 'Info' | 'Warning' | 'Error' | 'Critical';
  component: string;
  eventCode: number;
  message: string;
  correlationId: string;
  createdAt: string;
}

export interface AuditLogRecord {
  id: string;
  actorId?: string | null;
  actorName: string;
  action: string;
  resourceType: string;
  resourceId?: string | null;
  beforeJson?: string | null;
  afterJson?: string | null;
  outcome: string;
  correlationId: string;
  createdAt: string;
}

export interface PipelineRunRecord {
  id: string;
  pipelineName: string;
  provider: string;
  buildNumber: string;
  branch: string;
  commitSha: string;
  status: string;
  startedAt: string;
  completedAt?: string | null;
  stages?: {
    id: string;
    stageOrder: number;
    stageName: string;
    status: string;
    durationSec: number;
    logText?: string | null;
  }[];
}

export interface NotificationRecord {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string | null;
  readAt?: string | null;
  createdAt: string;
}
