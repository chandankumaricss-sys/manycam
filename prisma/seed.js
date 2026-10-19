const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Cleaning existing data ---');
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.pipelineStage.deleteMany();
  await prisma.pipelineRun.deleteMany();
  await prisma.diagnosticEvent.deleteMany();
  await prisma.securityAssessment.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.deviceUpdateHistory.deleteMany();
  await prisma.updatePolicy.deleteMany();
  await prisma.rolloutStage.deleteMany();
  await prisma.rollout.deleteMany();
  await prisma.release.deleteMany();
  await prisma.deploymentDevice.deleteMany();
  await prisma.deployment.deleteMany();
  await prisma.package.deleteMany();
  await prisma.cameraPolicyAssignment.deleteMany();
  await prisma.cameraPolicy.deleteMany();
  await prisma.cameraPreset.deleteMany();
  await prisma.cameraSource.deleteMany();
  await prisma.deviceGroupMember.deleteMany();
  await prisma.deviceGroup.deleteMany();
  await prisma.device.deleteMany();
  await prisma.user.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.role.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.appSetting.deleteMany();

  console.log('--- Seeding Organizations ---');
  const orgNames = [
    { name: 'Northstar Financial Group', industry: 'Banking & Capital Markets', region: 'North America (NYC)' },
    { name: 'Meridian Health Systems', industry: 'Healthcare & Telemedicine', region: 'North America (Boston)' },
    { name: 'Atlas Consulting', industry: 'Management Consulting', region: 'Europe (London)' },
    { name: 'HarborPoint Technology', industry: 'Cloud & Enterprise Software', region: 'North America (SFO)' },
    { name: 'BluePeak Logistics', industry: 'Global Supply Chain', region: 'Asia Pacific (Singapore)' },
    { name: 'Pacific Rim Energy', industry: 'Renewable Power & Utilities', region: 'Asia Pacific (Tokyo)' },
    { name: 'Vanguard BioTech', industry: 'Pharmaceutical Research', region: 'Europe (Basel)' },
    { name: 'Apex Global Media', industry: 'Broadcast & Streaming', region: 'North America (LA)' },
    { name: 'Sentinel Defense Systems', industry: 'Aerospace & Security', region: 'North America (DC)' },
    { name: 'Horizon Robotics', industry: 'Industrial Automation', region: 'Europe (Berlin)' },
    { name: 'Beacon Healthcare', industry: 'Clinical Diagnostics', region: 'North America (Chicago)' },
    { name: 'Sterling Asset Management', industry: 'Private Wealth Management', region: 'Europe (Zurich)' }
  ];

  const orgs = [];
  for (const orgData of orgNames) {
    const org = await prisma.organization.create({ data: orgData });
    orgs.push(org);
  }

  console.log('--- Seeding Roles & Permissions ---');
  const rolesData = [
    { name: 'Super Admin', description: 'Full access to all systems, settings, releases and device controls' },
    { name: 'IT Administrator', description: 'Manage fleet devices, execute deployments, review telemetry and configure policies' },
    { name: 'Deployment Operator', description: 'Trigger software installations, monitor rollouts and repair failed endpoints' },
    { name: 'Security Auditor', description: 'Inspect code signing certificates, review compliance reports and audit logs' },
    { name: 'Read-Only Viewer', description: 'Access dashboard metrics, device inventories and reports without mutation permissions' }
  ];

  const roles = {};
  for (const r of rolesData) {
    const createdRole = await prisma.role.create({ data: r });
    roles[r.name] = createdRole;
  }

  const resources = ['devices', 'camera', 'deployments', 'updates', 'security', 'diagnostics', 'reports', 'settings', 'users'];
  const actions = ['read', 'create', 'update', 'delete', 'execute'];

  for (const res of resources) {
    for (const act of actions) {
      const perm = await prisma.permission.create({
        data: { resource: res, action: act }
      });
      // assign Super Admin all
      await prisma.rolePermission.create({
        data: { roleId: roles['Super Admin'].id, permissionId: perm.id }
      });
      // IT Administrator: all except user delete
      if (res !== 'users' || act === 'read') {
        await prisma.rolePermission.create({
          data: { roleId: roles['IT Administrator'].id, permissionId: perm.id }
        });
      }
      // Deployment Operator: deployments, updates, diagnostics, devices read/update
      if (['deployments', 'updates', 'diagnostics'].includes(res) || (res === 'devices' && ['read', 'update', 'execute'].includes(act))) {
        await prisma.rolePermission.create({
          data: { roleId: roles['Deployment Operator'].id, permissionId: perm.id }
        });
      }
      // Security Auditor: read on all, security/audit
      if (act === 'read' || (res === 'security' && ['read', 'execute'].includes(act))) {
        await prisma.rolePermission.create({
          data: { roleId: roles['Security Auditor'].id, permissionId: perm.id }
        });
      }
      // Viewer: read only
      if (act === 'read') {
        await prisma.rolePermission.create({
          data: { roleId: roles['Read-Only Viewer'].id, permissionId: perm.id }
        });
      }
    }
  }

  console.log('--- Seeding Users ---');
  const seededUsers = [
    { fullName: 'Olivia Chen', email: 'olivia.chen@enterprise.manycam.local', role: 'IT Administrator', org: orgs[0].id },
    { fullName: 'Ethan Brooks', email: 'ethan.brooks@enterprise.manycam.local', role: 'Deployment Operator', org: orgs[0].id },
    { fullName: 'Maya Patel', email: 'maya.patel@enterprise.manycam.local', role: 'Security Auditor', org: orgs[0].id },
    { fullName: 'Daniel Reed', email: 'daniel.reed@enterprise.manycam.local', role: 'Super Admin', org: orgs[0].id },
    { fullName: 'Sarah Jenkins', email: 'sarah.jenkins@northstar.financial', role: 'IT Administrator', org: orgs[0].id },
    { fullName: 'Marcus Brody', email: 'marcus.brody@atlas.consulting', role: 'Read-Only Viewer', org: orgs[2].id },
    { fullName: 'Dr. Evelyn Ward', email: 'evelyn.ward@meridian.health', role: 'Read-Only Viewer', org: orgs[1].id },
    { fullName: 'Liam Gallagher', email: 'liam.g@harborpoint.tech', role: 'IT Administrator', org: orgs[3].id }
  ];

  const users = [];
  for (const u of seededUsers) {
    const createdUser = await prisma.user.create({
      data: {
        fullName: u.fullName,
        email: u.email,
        organizationId: u.org,
        roleId: roles[u.role].id
      }
    });
    users.push(createdUser);
  }

  console.log('--- Seeding Device Groups ---');
  const groupNames = [
    'Executive Laptops - NY', 'Trading Floor Desks - London', 'Telehealth Clinical Tablets',
    'Engineering CAD Workstations', 'Field Sales Surface Laptops', 'HQ Boardroom Consoles',
    'Pilot Ring - Windows 11 24H2', 'Broad Rollout Wave 1', 'Broad Rollout Wave 2',
    'VIP Briefing Centers', 'Zurich Wealth Advisors', 'Tokyo Remote Offices',
    'Singapore Logistics Ops', 'Berlin Automation Labs', 'San Francisco Engineering',
    'Chicago Clinical Research', 'London Advisory Partners', 'Boston Surgical Video Suite',
    'Canary Edge Testers', 'Beta Testing Cohort Alpha', 'Legacy Pinned Machines',
    'Azure Virtual Desktop Fleet', 'Citrix VDI Workspaces', 'Remote Workstations (EMEA)',
    'Remote Workstations (APAC)', 'Remote Workstations (Americas)', 'Finance & Audit Team',
    'Legal & Compliance Units', 'Contact Center Agents', 'Broadcast Studio Cameras',
    'Security Operations Centers', 'Kiosk / Dedicated Terminals', 'Data Science GPU Rigs',
    'HR & Onboarding Workstations', 'Contractor Managed Endpoints'
  ];

  const groups = [];
  for (let i = 0; i < groupNames.length; i++) {
    const g = await prisma.deviceGroup.create({
      data: {
        name: groupNames[i],
        description: `Enterprise endpoint cluster for ${groupNames[i]}`,
        organizationId: orgs[i % orgs.length].id
      }
    });
    groups.push(g);
  }

  console.log('--- Seeding 2,486 Managed Devices ---');
  // Target counts:
  // Total: 2,486
  // Online: 2,312 (Offline: 174)
  // Healthy Virtual Cameras: 2,274 (Warning: 114, Critical/Error: 98)
  // Compliance: 2,354 Compliant (94.7%), 92 Non-compliant, 40 Pending
  const TOTAL_DEVICES = 2486;
  const OFFLINE_COUNT = 174;
  const HEALTHY_COUNT = 2274;
  const WARNING_COUNT = 114;
  const CRITICAL_COUNT = 98; // 2274 + 114 + 98 = 2486

  const osDist = [
    { os: 'Windows 11 Enterprise', build: '24H2 (26100.2894)', weight: 48 },
    { os: 'Windows 11 Pro', build: '23H2 (22631.4460)', weight: 28 },
    { os: 'Windows 10 Enterprise', build: '22H2 (19045.5131)', weight: 18 },
    { os: 'Windows 10 Pro', build: '22H2 (19045.5011)', weight: 6 }
  ];

  const sources = [
    'Logitech Brio 4K Stream',
    'Logitech C920 HD Pro',
    'Intel RealSense D435',
    'Surface Studio Front Camera',
    'Dell UltraSharp 4K Cam',
    'AVerMedia Live Streamer CAM',
    'Elgato Facecam Pro',
    'Poly Studio P5'
  ];

  const cities = ['NYC', 'LON', 'SFO', 'BER', 'TYO', 'SIN', 'ZUR', 'BOS', 'CHI', 'DFW', 'SEA', 'AMS'];
  const devicesBatch = [];

  const now = new Date('2026-10-17T12:00:00Z');

  for (let i = 1; i <= TOTAL_DEVICES; i++) {
    const city = cities[(i - 1) % cities.length];
    const padNum = String(i).padStart(4, '0');
    const hostname = `VCA-${city}-${padNum}`;

    let healthStatus = 'Healthy';
    let cameraStatus = 'Healthy';
    let serviceStatus = 'Running';

    if (i <= HEALTHY_COUNT) {
      healthStatus = 'Healthy';
      cameraStatus = 'Healthy';
      serviceStatus = 'Running';
    } else if (i <= HEALTHY_COUNT + WARNING_COUNT) {
      healthStatus = 'Warning';
      cameraStatus = 'Warning';
      serviceStatus = (i % 2 === 0) ? 'Running' : 'Degraded';
    } else {
      healthStatus = 'Critical';
      cameraStatus = 'Error';
      serviceStatus = 'Stopped';
    }

    const isOffline = (i > (TOTAL_DEVICES - OFFLINE_COUNT));
    if (isOffline) {
      healthStatus = 'Offline';
      cameraStatus = 'Offline';
      serviceStatus = 'Stopped';
    }

    // Determine OS based on weights
    const roll = (i * 17) % 100;
    let chosenOs = osDist[0];
    if (roll < 48) chosenOs = osDist[0];
    else if (roll < 76) chosenOs = osDist[1];
    else if (roll < 94) chosenOs = osDist[2];
    else chosenOs = osDist[3];

    // Architecture: 8% ARM64, 92% x64
    const arch = (i % 12 === 0) ? 'ARM64' : 'x64';

    // Channel
    let channel = 'Stable';
    if (i % 20 === 0) channel = 'Canary';
    else if (i % 7 === 0) channel = 'Beta';
    else if (i % 25 === 0) channel = 'Pinned Legacy';

    // App Version
    let appVersion = 'v3.8.2';
    if (channel === 'Canary') appVersion = 'v3.9.1-canary.104';
    else if (channel === 'Beta') appVersion = 'v3.9.0-beta.2';
    else if (channel === 'Pinned Legacy') appVersion = 'v3.7.9';
    else if (healthStatus === 'Warning' && i % 3 === 0) appVersion = 'v3.8.1';

    // Compliance: 94.7% = ~2354 compliant
    let compliance = 'Compliant';
    if (i > 2446) compliance = 'Pending';
    else if (i > 2354) compliance = 'Non-compliant';

    const mgmt = (i % 3 === 0) ? 'Microsoft Intune' : (i % 3 === 1) ? 'MECM/SCCM' : 'Group Policy';

    const lastSeenMinutesAgo = isOffline ? (60 * 24 * (1 + (i % 7))) : (i % 45);
    const lastSeen = new Date(now.getTime() - lastSeenMinutesAgo * 60 * 1000);
    const enrolledAt = new Date(now.getTime() - (30 + (i % 180)) * 24 * 60 * 60 * 1000);

    const orgId = orgs[(i - 1) % orgs.length].id;
    const userId = users[(i - 1) % users.length].id;

    devicesBatch.push({
      id: `dev-${i}`,
      organizationId: orgId,
      hostname,
      assignedUserId: userId,
      osName: chosenOs.os,
      osBuild: chosenOs.build,
      architecture: arch,
      appVersion,
      agentVersion: 'v2.4.1',
      cameraStatus,
      serviceStatus,
      managementSource: mgmt,
      updateChannel: channel,
      complianceStatus: compliance,
      lastSeenAt: lastSeen,
      enrolledAt: enrolledAt,
      healthStatus,
      cameraDriver: 'ManyCam Virtual WebCam Driver v3.8.2.14',
      selectedSource: sources[i % sources.length],
      resolution: (i % 5 === 0) ? '2560x1440' : (i % 4 === 0) ? '1280x720' : '1920x1080',
      fps: (i % 6 === 0) ? 60 : 30,
      videoFormat: (i % 3 === 0) ? 'YUY2' : (i % 3 === 1) ? 'MJPEG' : 'NV12',
      micRouting: 'ManyCam Virtual Audio Driver'
    });
  }

  // Insert in batches of 500
  for (let b = 0; b < devicesBatch.length; b += 500) {
    const chunk = devicesBatch.slice(b, b + 500);
    await prisma.device.createMany({ data: chunk });
  }

  console.log('--- Assigning Devices to Groups ---');
  const groupAssignments = [];
  for (let i = 1; i <= TOTAL_DEVICES; i++) {
    const primaryGroupId = groups[(i - 1) % groups.length].id;
    groupAssignments.push({ deviceId: `dev-${i}`, groupId: primaryGroupId });
    // Also assign some to pilot ring
    if (i <= 120) {
      const pilotGroupId = groups.find(g => g.name.includes('Pilot'))?.id || groups[6].id;
      if (pilotGroupId !== primaryGroupId) {
        groupAssignments.push({ deviceId: `dev-${i}`, groupId: pilotGroupId });
      }
    }
  }
  for (let b = 0; b < groupAssignments.length; b += 500) {
    const chunk = groupAssignments.slice(b, b + 500);
    await prisma.deviceGroupMember.createMany({ data: chunk });
  }

  console.log('--- Seeding Packages ---');
  const packagesData = [
    {
      id: 'pkg-382-msi-x64',
      name: 'ManyCam Enterprise 3.8.2 (MSI x64)',
      version: '3.8.2',
      architecture: 'x64',
      packageType: 'MSI',
      fileSize: '142.8 MB',
      sha256: '9f83a48e89547d7c6742a1975e54c7d0d6e8b5d3851b4e995648e9c20a458f33',
      signingStatus: 'Valid / Signed',
      installContext: 'per-machine',
      downloadUrl: '/packages/ManyCamEnterprise-3.8.2-x64.msi'
    },
    {
      id: 'pkg-382-msix-x64',
      name: 'ManyCam Enterprise 3.8.2 (MSIX x64)',
      version: '3.8.2',
      architecture: 'x64',
      packageType: 'MSIX',
      fileSize: '138.4 MB',
      sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      signingStatus: 'Valid / Signed',
      installContext: 'per-machine',
      downloadUrl: '/packages/ManyCamEnterprise-3.8.2-x64.msix'
    },
    {
      id: 'pkg-381-msi-arm64',
      name: 'ManyCam Enterprise 3.8.1 (MSI ARM64)',
      version: '3.8.1',
      architecture: 'ARM64',
      packageType: 'MSI',
      fileSize: '135.2 MB',
      sha256: '4a6b89c31e97d1e8c740a3251f22c8e0d4b9a5e1823c4d791637e8b20c458a22',
      signingStatus: 'Valid / Signed',
      installContext: 'per-machine',
      downloadUrl: '/packages/ManyCamEnterprise-3.8.1-arm64.msi'
    },
    {
      id: 'pkg-381-msi-x64',
      name: 'ManyCam Enterprise 3.8.1 (MSI x64)',
      version: '3.8.1',
      architecture: 'x64',
      packageType: 'MSI',
      fileSize: '141.6 MB',
      sha256: '7c82a15e69547b7c5742b1975e54c7d0d6e8b5d3851b4e995648e9c20a458d11',
      signingStatus: 'Valid / Signed',
      installContext: 'per-machine',
      downloadUrl: '/packages/ManyCamEnterprise-3.8.1-x64.msi'
    },
    {
      id: 'pkg-390-beta-msix',
      name: 'ManyCam Enterprise 3.9.0-beta.2 (MSIX x64)',
      version: '3.9.0-beta.2',
      architecture: 'x64',
      packageType: 'MSIX',
      fileSize: '146.1 MB',
      sha256: 'b45c228e99547d7c6742a1975e54c7d0d6e8b5d3851b4e995648e9c20a458f77',
      signingStatus: 'Valid / Signed',
      installContext: 'per-machine',
      downloadUrl: '/packages/ManyCamEnterprise-3.9.0-beta.2.msix'
    },
    {
      id: 'pkg-391-canary-wix',
      name: 'ManyCam Enterprise 3.9.1-canary.104 (WiX-MSI)',
      version: '3.9.1-canary.104',
      architecture: 'x64',
      packageType: 'WiX-MSI',
      fileSize: '148.9 MB',
      sha256: 'c89a441e89547d7c6742a1975e54c7d0d6e8b5d3851b4e995648e9c20a458e88',
      signingStatus: 'Valid / Signed',
      installContext: 'per-machine',
      downloadUrl: '/packages/ManyCamEnterprise-3.9.1-canary.msi'
    },
    {
      id: 'pkg-379-msi-x64',
      name: 'ManyCam Enterprise 3.7.9 Legacy LTS (MSI x64)',
      version: '3.7.9',
      architecture: 'x64',
      packageType: 'MSI',
      fileSize: '132.5 MB',
      sha256: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
      signingStatus: 'Valid / Signed',
      installContext: 'per-machine',
      downloadUrl: '/packages/ManyCamEnterprise-3.7.9-x64.msi'
    },
    {
      id: 'pkg-383-rc-bootstrapper',
      name: 'ManyCam Enterprise 3.8.3-RC1 Burn Bootstrapper',
      version: '3.8.3-rc1',
      architecture: 'x64',
      packageType: 'Burn Bootstrapper',
      fileSize: '154.0 MB',
      sha256: 'ffeeddccbbaa99887766554433221100ffeeddccbbaa99887766554433221100',
      signingStatus: 'Valid / Signed',
      installContext: 'per-machine',
      downloadUrl: '/packages/ManyCamEnterprise-3.8.3-Setup.exe'
    }
  ];

  for (const pkg of packagesData) {
    await prisma.package.create({ data: pkg });
  }

  console.log('--- Seeding Releases & Rollouts ---');
  const releaseData = [
    {
      id: 'rel-382',
      packageId: 'pkg-382-msi-x64',
      version: '3.8.2',
      channel: 'Stable',
      releaseNotes: '• Media Foundation Virtual Camera Driver v3.8.2.14 certification\n• Fixed NV12 to YUY2 colorspace conversion on Intel Gen13 Arc GPUs\n• Enhanced AppLocker and WDAC compatibility with SHA256 code signing\n• Background blur performance optimization using Windows DirectML\n• Zero-touch silent installation flags for Microsoft Intune',
      status: 'Rollout-Active',
      minWindowsBuild: 'Windows 10 21H2 (19044)'
    },
    {
      id: 'rel-383-rc',
      packageId: 'pkg-383-rc-bootstrapper',
      version: '3.8.3-rc1',
      channel: 'Stable Candidate',
      releaseNotes: '• Candidate update for broad enterprise deployment\n• Hardened registry policy validation for ADMX deployment\n• Audio sync offset calibration for remote meeting platforms',
      status: 'Draft',
      minWindowsBuild: 'Windows 10 21H2 (19044)'
    },
    {
      id: 'rel-390-beta',
      packageId: 'pkg-390-beta-msix',
      version: '3.9.0-beta.2',
      channel: 'Beta',
      releaseNotes: '• Next-gen AI background segmentation engine preview\n• Native ARM64 Media Foundation filter support for Snapdragon X Elite\n• MSIX App Attach support for Azure Virtual Desktop session hosts',
      status: 'Rollout-Active',
      minWindowsBuild: 'Windows 11 22H2 (22621)'
    },
    {
      id: 'rel-391-canary',
      packageId: 'pkg-391-canary-wix',
      version: '3.9.1-canary.104',
      channel: 'Canary',
      releaseNotes: '• Nightly developer preview branch with experimental DirectShow bypass\n• Hardware accelerated NVENC/AMF video pipeline testing',
      status: 'Published',
      minWindowsBuild: 'Windows 11 23H2 (22631)'
    },
    {
      id: 'rel-379-lts',
      packageId: 'pkg-379-msi-x64',
      version: '3.7.9',
      channel: 'Pinned Legacy',
      releaseNotes: '• Long-Term Servicing release pinned for mission-critical trading floor and healthcare units',
      status: 'Archived',
      minWindowsBuild: 'Windows 10 1809 (17763)'
    },
    {
      id: 'rel-381-prev',
      packageId: 'pkg-381-msi-x64',
      version: '3.8.1',
      channel: 'Stable',
      releaseNotes: '• Maintenance update resolving audio feedback loop when switching default Windows communications device',
      status: 'Archived',
      minWindowsBuild: 'Windows 10 21H2 (19044)'
    }
  ];

  for (const rel of releaseData) {
    const createdRelease = await prisma.release.create({ data: rel });
    if (rel.id === 'rel-382') {
      const rollout = await prisma.rollout.create({
        data: {
          id: 'rollout-382',
          releaseId: createdRelease.id,
          status: 'Active',
          currentStage: 4,
          targetPercent: 65,
          safetyGatesJson: JSON.stringify({
            maxFailureRate: 2.0,
            maxCrashRate: 0.5,
            cameraErrorGate: true,
            codeSigningGate: true,
            minObservationHours: 24
          }),
          startedAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000)
        }
      });

      const stages = [
        { stageNumber: 1, stageName: 'Internal QA Ring', targetPercent: 1, status: 'Completed', successCount: 25, failureCount: 0 },
        { stageNumber: 2, stageName: 'Pilot Group (Northwind & HQ)', targetPercent: 5, status: 'Completed', successCount: 124, failureCount: 1 },
        { stageNumber: 3, stageName: 'Early Adopters Cohort', targetPercent: 20, status: 'Completed', successCount: 492, failureCount: 3 },
        { stageNumber: 4, stageName: 'Broad Enterprise Rollout', targetPercent: 65, status: 'Active', successCount: 1480, failureCount: 14 },
        { stageNumber: 5, stageName: 'General Availability (100%)', targetPercent: 100, status: 'Pending', successCount: 0, failureCount: 0 }
      ];

      for (const stg of stages) {
        await prisma.rolloutStage.create({
          data: {
            rolloutId: rollout.id,
            stageNumber: stg.stageNumber,
            stageName: stg.stageName,
            targetPercent: stg.targetPercent,
            status: stg.status,
            successCount: stg.successCount,
            failureCount: stg.failureCount,
            startedAt: stg.status !== 'Pending' ? new Date(now.getTime() - (5 - stg.stageNumber) * 24 * 3600 * 1000) : null,
            completedAt: stg.status === 'Completed' ? new Date(now.getTime() - (4 - stg.stageNumber) * 24 * 3600 * 1000) : null
          }
        });
      }
    }
  }

  console.log('--- Seeding Deployments & Deployment Devices ---');
  // 40 deployments to satisfy requirement
  const deploymentMethods = ['Microsoft Intune', 'MECM/SCCM', 'Group Policy', 'winget', 'Manual MSI'];
  const deployments = [];

  for (let d = 1; d <= 40; d++) {
    const isLatestActive = (d === 1);
    const isFailed = (d === 14);
    const status = isLatestActive ? 'Running' : isFailed ? 'Failed' : 'Completed';
    const pkg = packagesData[(d - 1) % packagesData.length];
    const totalDevs = (d === 1) ? 350 : 20 + ((d * 19) % 150);
    const failedDevs = isFailed ? Math.floor(totalDevs * 0.3) : Math.floor(totalDevs * 0.016); // ~98.4% success rate
    const successDevs = totalDevs - failedDevs - (isLatestActive ? 45 : 0);
    const pendingDevs = isLatestActive ? 45 : 0;
    const progress = isLatestActive ? 87 : (isFailed ? 64 : 100);

    const dep = await prisma.deployment.create({
      data: {
        id: `dep-${d}`,
        packageId: pkg.id,
        targetType: 'Group',
        targetId: groups[(d - 1) % groups.length].id,
        targetName: groups[(d - 1) % groups.length].name,
        deploymentMethod: deploymentMethods[d % deploymentMethods.length],
        installContext: 'per-machine',
        status,
        progress,
        totalDevices: totalDevs,
        successfulCount: successDevs,
        failedCount: failedDevs,
        pendingCount: pendingDevs,
        startedAt: new Date(now.getTime() - (d * 18) * 3600 * 1000),
        completedAt: status === 'Completed' ? new Date(now.getTime() - (d * 18 - 2) * 3600 * 1000) : null,
        initiatedBy: users[(d - 1) % users.length].id,
        logsJson: JSON.stringify([
          { time: 'T-00:00:01', level: 'INFO', msg: `Initiated deployment job for package ${pkg.name}` },
          { time: 'T-00:00:15', level: 'INFO', msg: `Validated target device reachability: ${totalDevs} nodes online` },
          { time: 'T-00:01:20', level: 'INFO', msg: `Pushed MSI payload to local Windows Cache %ProgramData%\\ManyCam\\Cache` },
          { time: 'T-00:03:40', level: isFailed ? 'ERROR' : 'INFO', msg: isFailed ? 'Fatal error 1603 encountered on multiple nodes: AppLocker rule blocked binary' : `Completed execution across ${successDevs} nodes with exit code 0` }
        ])
      }
    });
    deployments.push(dep);

    // Link a few sample deployment_devices for inspection
    if (d <= 5) {
      for (let k = 1; k <= 10; k++) {
        const isDeviceFailed = (k === 7);
        await prisma.deploymentDevice.create({
          data: {
            deploymentId: dep.id,
            deviceId: `dev-${k + d * 10}`,
            status: isDeviceFailed ? 'Failed' : 'Success',
            exitCode: isDeviceFailed ? 1603 : 0,
            errorReason: isDeviceFailed ? 'Fatal error during installation. Windows Installer returned error 1603 (Custom Action VirtualCamRegisterServer failed due to access denial).' : null,
            attempts: isDeviceFailed ? 2 : 1,
            logExcerpt: isDeviceFailed ? `MSI (s) (1C:44) [12:04:12:108]: Product: ManyCam Enterprise -- Error 1722. There is a problem with this Windows Installer package. Action VirtualCamRegisterServer, location: C:\\Program Files\\ManyCam\\x64\\ManyCamService.exe, command: /register` : `MSI (s) (1C:44) [12:03:45:901]: Windows Installer installed the product. Product Name: ManyCam Enterprise. Product Version: 3.8.2. Product Language: 1033. Manufacturer: ManyCam LLC. Installation success or error status: 0.`
          }
        });
      }
    }
  }

  console.log('--- Seeding Update Policies ---');
  const policyTemplates = [
    { name: 'Global Enterprise Standard - Automatic Staged', channel: 'Stable', deferDays: 7, retryLimit: 3, rebootHandling: 'Prompt with 4h deferral window', meteredNetworkAllowed: false },
    { name: 'Pilot Ring Fast Track (Direct Canary/Beta)', channel: 'Beta', deferDays: 0, retryLimit: 5, rebootHandling: 'Immediate silent reboot outside working hours', meteredNetworkAllowed: true },
    { name: 'Executive & VIP Devices - Conservative Pinning', channel: 'Stable', pinnedVersion: 'v3.8.2', deferDays: 14, retryLimit: 2, rebootHandling: 'Strict user prompt required', meteredNetworkAllowed: false },
    { name: 'Trading Floor Zero-Downtime Frozen LTS', channel: 'Pinned Legacy', pinnedVersion: 'v3.7.9', deferDays: 90, retryLimit: 1, rebootHandling: 'Weekend maintenance window only (Sun 02:00-04:00)', meteredNetworkAllowed: false },
    { name: 'Telemedicine Clinical Tablet Policy', channel: 'Stable', deferDays: 14, retryLimit: 3, rebootHandling: 'Daily 03:00 - 05:00 window', meteredNetworkAllowed: false },
    { name: 'Field Laptop Roaming Cellular Policy', channel: 'Stable', deferDays: 5, retryLimit: 3, rebootHandling: 'Prompt user when plugged in', meteredNetworkAllowed: false },
    { name: 'Azure Virtual Desktop Session Host Policy', channel: 'Stable', deferDays: 0, retryLimit: 2, rebootHandling: 'Scheduled image redeployment', meteredNetworkAllowed: true },
    { name: 'Canary Developer Fleet - Auto-Update Nightly', channel: 'Canary', deferDays: 0, retryLimit: 5, rebootHandling: 'Automatic restart if idle 15min', meteredNetworkAllowed: true },
    { name: 'Healthcare Diagnostic Workstation Policy', channel: 'Pinned Legacy', pinnedVersion: 'v3.8.1', deferDays: 30, retryLimit: 2, rebootHandling: 'Explicit IT approval required', meteredNetworkAllowed: false },
    { name: 'APAC Branch Offices Maintenance Policy', channel: 'Stable', deferDays: 7, retryLimit: 3, rebootHandling: 'Saturday 01:00 UTC', meteredNetworkAllowed: false },
    { name: 'EMEA Corporate Policy - Intune Managed', channel: 'Stable', deferDays: 3, retryLimit: 4, rebootHandling: 'Intune compliance deadline (5 days)', meteredNetworkAllowed: false },
    { name: 'Security Hardened Offline Isolation Policy', channel: 'Stable', pinnedVersion: 'v3.8.2', deferDays: 60, retryLimit: 1, rebootHandling: 'Manual SCCM push only', meteredNetworkAllowed: false }
  ];

  for (const pol of policyTemplates) {
    await prisma.updatePolicy.create({
      data: {
        name: pol.name,
        channel: pol.channel,
        pinnedVersion: pol.pinnedVersion || null,
        deferDays: pol.deferDays,
        retryLimit: pol.retryLimit,
        rebootHandling: pol.rebootHandling,
        meteredNetworkAllowed: pol.meteredNetworkAllowed,
        automaticUpdatesEnabled: !pol.name.includes('Frozen'),
        maintenanceWindowJson: JSON.stringify({
          days: ['Tuesday', 'Thursday'],
          startTime: '02:00',
          endTime: '05:00',
          timezone: 'America/New_York'
        })
      }
    });
  }

  console.log('--- Seeding Camera Sources, Presets & Policies ---');
  const cameraSources = [
    { sourceType: 'webcam', displayName: 'Physical Webcam (Local Device)', configurationJson: JSON.stringify({ facingMode: 'user', autoFocus: true }) },
    { sourceType: 'sample_video', displayName: 'Enterprise Conference Stream (Sample)', configurationJson: JSON.stringify({ loop: true, sampleUrl: '/media/conference-stream.mp4' }) },
    { sourceType: 'screen_share', displayName: 'Application Screen Share (Figma/IDE)', configurationJson: JSON.stringify({ fps: 30, resolution: '1920x1080' }) },
    { sourceType: 'presentation', displayName: 'Executive Boardroom Slide Deck', configurationJson: JSON.stringify({ slides: 12, autoAdvanceSec: 20 }) },
    { sourceType: 'test_pattern', displayName: 'SMPTE Color Bars (EBU Standard)', configurationJson: JSON.stringify({ standard: 'SMPTE EG 1' }) },
    { sourceType: 'color_bars', displayName: 'Digital HD Alignment Grid & Crosshairs', configurationJson: JSON.stringify({ grid: true, crosshair: true }) },
    { sourceType: 'green_screen', displayName: 'Chroma Key Virtual Studio (Green Screen)', configurationJson: JSON.stringify({ tolerance: 0.35, blur: 5 }) },
    { sourceType: 'static_image', displayName: 'Corporate Brand Wallpaper Overlay', configurationJson: JSON.stringify({ opacity: 0.85, position: 'bottom-right' }) }
  ];

  for (const cs of cameraSources) {
    await prisma.cameraSource.create({ data: cs });
  }

  const cameraPresets = [
    {
      name: 'Executive Meeting (1080p60 Studio)',
      configurationJson: JSON.stringify({
        resolution: '1920x1080',
        fps: 60,
        format: 'NV12',
        brightness: 52,
        contrast: 54,
        saturation: 50,
        sharpness: 60,
        zoom: 1.1,
        blur: 'Medium (15px)',
        greenScreen: false,
        audioGain: 85,
        micMute: false,
        syncOffsetMs: 0
      })
    },
    {
      name: 'Product Showcase & Screen PiP (1440p30)',
      configurationJson: JSON.stringify({
        resolution: '2560x1440',
        fps: 30,
        format: 'NV12',
        brightness: 50,
        contrast: 50,
        saturation: 52,
        sharpness: 65,
        zoom: 1.0,
        blur: 'Light (8px)',
        greenScreen: false,
        audioGain: 90,
        micMute: false,
        syncOffsetMs: 20
      })
    },
    {
      name: 'Training Presentation (720p30 Optimized Bandwidth)',
      configurationJson: JSON.stringify({
        resolution: '1280x720',
        fps: 30,
        format: 'YUY2',
        brightness: 48,
        contrast: 50,
        saturation: 48,
        sharpness: 50,
        zoom: 1.0,
        blur: 'None',
        greenScreen: true,
        audioGain: 80,
        micMute: false,
        syncOffsetMs: 0
      })
    },
    {
      name: 'Webinar Broadcast (4K Ultra-Definition)',
      configurationJson: JSON.stringify({
        resolution: '2560x1440',
        fps: 60,
        format: 'NV12',
        brightness: 55,
        contrast: 56,
        saturation: 54,
        sharpness: 70,
        zoom: 1.15,
        blur: 'Custom Studio Bokeh',
        greenScreen: true,
        audioGain: 95,
        micMute: false,
        syncOffsetMs: -15
      })
    }
  ];

  for (const cp of cameraPresets) {
    await prisma.cameraPreset.create({ data: cp });
  }

  const cameraPolicies = [
    { name: 'Standard Enterprise Camera Baseline', version: '1.2.0', priority: 100, settingsJson: JSON.stringify({ maxResolution: '1920x1080', maxFps: 30, allowedFormats: ['NV12', 'YUY2'], backgroundBlurAllowed: true, lockSettings: false, enforcePrivacyIndicator: true }) },
    { name: 'Strict HIPAA Healthcare Telemedicine Policy', version: '2.0.1', priority: 200, settingsJson: JSON.stringify({ maxResolution: '1920x1080', maxFps: 30, allowedFormats: ['NV12'], backgroundBlurAllowed: false, lockSettings: true, enforcePrivacyIndicator: true, disableUnauthorizedSources: true }) },
    { name: 'Executive Boardroom High-Definition Audio/Video', version: '1.4.0', priority: 150, settingsJson: JSON.stringify({ maxResolution: '2560x1440', maxFps: 60, allowedFormats: ['NV12', 'YUY2', 'MJPEG'], backgroundBlurAllowed: true, lockSettings: false, enforcePrivacyIndicator: true }) },
    { name: 'Low Bandwidth Remote Branch Policy', version: '1.0.0', priority: 110, settingsJson: JSON.stringify({ maxResolution: '1280x720', maxFps: 24, allowedFormats: ['NV12'], backgroundBlurAllowed: false, lockSettings: true, enforcePrivacyIndicator: true }) },
    { name: 'Security Operations & Forensic Recording Lock', version: '3.1.0', priority: 300, settingsJson: JSON.stringify({ maxResolution: '1920x1080', maxFps: 30, allowedFormats: ['NV12', 'YUY2'], backgroundBlurAllowed: false, lockSettings: true, enforcePrivacyIndicator: true, disableUnauthorizedSources: true }) }
  ];

  for (const pol of cameraPolicies) {
    await prisma.cameraPolicy.create({ data: pol });
  }

  console.log('--- Seeding Code Signing Certificates ---');
  const certificatesData = [
    {
      alias: 'ManyCam Enterprise Production EV Code Signing 2026',
      publisher: 'CN="ManyCam LLC", O="ManyCam LLC", L="Austin", S="Texas", C="US"',
      issuer: 'CN=DigiCert EV Code Signing CA (G4), OU=www.digicert.com, O=DigiCert Inc, C=US',
      thumbprint: '4C5F7920A4B3D2E16480F93B8C1E0A2754D69B41',
      algorithm: 'SHA256withRSA (4096-bit)',
      timestampUrl: 'http://timestamp.digicert.com',
      expiresAt: new Date('2027-08-15T23:59:59Z'),
      status: 'Active',
      packageValidation: 'Verified Authentic',
      pipelineIntegration: 'Azure Key Vault HSM (FIPS 140-2 Level 3)'
    },
    {
      alias: 'Microsoft Windows Hardware Compatibility (WHQL) Driver Cert',
      publisher: 'CN=Microsoft Windows Third Party Component CA 2014, O=Microsoft Corporation, C=US',
      issuer: 'CN=Microsoft Root Certificate Authority 2010, O=Microsoft Corporation, C=US',
      thumbprint: '3B8E104597D2F40A12C5980B6E345D184E290ABC',
      algorithm: 'SHA256withRSA (2048-bit)',
      timestampUrl: 'http://timestamp.microsoft.com',
      expiresAt: new Date('2028-04-10T23:59:59Z'),
      status: 'Active',
      packageValidation: 'WHQL Certified',
      pipelineIntegration: 'Partner Center Hardware Dashboard'
    },
    {
      alias: 'ManyCam Internal Staging & Beta CI/CD Signing Key',
      publisher: 'CN="ManyCam Development Staging Signing", O="ManyCam LLC", C="US"',
      issuer: 'CN=ManyCam Internal Enterprise Subordinate CA, O=ManyCam LLC',
      thumbprint: '8A9B0C1D2E3F4A5B6C7D8E9F0A1B2C3D4E5F6A7B',
      algorithm: 'SHA256withECDSA (NIST P-384)',
      timestampUrl: 'http://timestamp.digicert.com',
      expiresAt: new Date('2026-11-30T23:59:59Z'),
      status: 'Expiring Soon',
      packageValidation: 'Internal Trust Only',
      pipelineIntegration: 'GitHub Actions OIDC AWS KMS'
    },
    {
      alias: 'Legacy Code Signing Certificate (v3.6 Series)',
      publisher: 'CN="ManyCam LLC Legacy Root", O="ManyCam LLC", C="US"',
      issuer: 'CN=Sectigo RSA Code Signing CA, O=Sectigo Limited',
      thumbprint: '11223344556677889900AABBCCDDEEFF11223344',
      algorithm: 'SHA256withRSA (2048-bit)',
      timestampUrl: 'http://timestamp.sectigo.com',
      expiresAt: new Date('2024-05-01T00:00:00Z'),
      status: 'Expired',
      packageValidation: 'Revocation Verified',
      pipelineIntegration: 'Archived Cold Storage'
    }
  ];

  for (const cert of certificatesData) {
    await prisma.certificate.create({ data: cert });
  }

  console.log('--- Seeding 2,000+ Diagnostic Events ---');
  const components = [
    'Windows Installer', 'Update Agent', 'Virtual Camera',
    'Background Service', 'Policy Engine', 'Code Signing'
  ];

  const diagBatch = [];
  const severities = ['Info', 'Info', 'Info', 'Warning', 'Error'];
  const eventCodes = {
    'Windows Installer': [1000, 1001, 11707, 1603, 1618, 3010],
    'Update Agent': [2001, 2002, 2004, 2008, 2012],
    'Virtual Camera': [3001, 3002, 3005, 3008, 3014, 3020],
    'Background Service': [4001, 4002, 7034, 7036],
    'Policy Engine': [5001, 5002, 5003, 5005],
    'Code Signing': [6001, 6002, 6003, 6005]
  };

  const sampleMessages = {
    'Windows Installer': [
      'Product: ManyCam Enterprise -- Installation completed successfully.',
      'Windows Installer transaction started with elevated SYSTEM privilege token.',
      'Action VirtualCamRegisterServer successfully registered DirectShow / Media Foundation filter in HKLM\\Software\\Classes\\CLSID.',
      'Windows Installer error 1603 encountered during CustomAction execution: Access is denied.',
      'Windows Installer error 1618: Another installation is already in progress. Retrying in 120 seconds.',
      'Product successfully installed. Reboot flag 3010 logged.'
    ],
    'Update Agent': [
      'Release check completed: Endpoint is assigned to channel [Stable], target version v3.8.2.',
      'Staged rollout condition verified: Ring 4 allowed download token.',
      'Downloaded payload signature validated with thumbprint 4C5F7920A4B3D2E16480F93B8C1E0A2754D69B41.',
      'Update deferral active: User requested 4 hour grace period.',
      'Update agent heartbeat received.'
    ],
    'Virtual Camera': [
      'Virtual Camera driver registered with Windows Media Foundation platform.',
      'Stream negotiated at 1920x1080 @ 30 FPS, color format NV12.',
      'Consumer connected: Microsoft Teams (ms-teams.exe, PID: 14820).',
      'Frame delivery latency within optimal threshold: 4.2ms.',
      'Warning: Frame drop detected under high GPU load (12 frames dropped in 60s).',
      'Error: DirectShow filter failed to bind to physical video capture device.'
    ],
    'Background Service': [
      'ManyCam Enterprise Service (ManyCamSvc.exe) transitioned to RUNNING state.',
      'IPC named pipe \\\\.\\pipe\\ManyCamEnterpriseIPC initialized with SDDL DACL.',
      'Service watchdog triggered auto-restart after unexpected child crash (Code 7034).',
      'Service health check passed: Memory 42 MB, CPU 0.4%.'
    ],
    'Policy Engine': [
      'ADMX Group Policy evaluated: Locked max resolution set to 1920x1080.',
      'MDM CSP policy sync completed from Microsoft Intune endpoint manager.',
      'Conflict resolved: Organization policy takes precedence over local device setting.',
      'Privacy indicator enforcement verified in registry.'
    ],
    'Code Signing': [
      'Binary verification passed: C:\\Program Files\\ManyCam\\ManyCam.exe is signed by DigiCert EV CA.',
      'Catalog file ManyCamDriver.cat signature verified with WHQL root.',
      'SmartScreen reputation query returned KNOWN_SAFE.',
      'Certificate validation warning: Staging certificate expires in under 45 days.'
    ]
  };

  for (let e = 1; e <= 2050; e++) {
    const comp = components[e % components.length];
    const msgs = sampleMessages[comp];
    const codes = eventCodes[comp];
    const msg = msgs[e % msgs.length];
    const code = codes[e % codes.length];

    let sev = 'Info';
    if (msg.includes('Error') || msg.includes('error') || msg.includes('failed') || code === 1603 || code === 7034) {
      sev = 'Error';
    } else if (msg.includes('Warning') || msg.includes('warning') || msg.includes('deferral') || code === 1618) {
      sev = 'Warning';
    }

    const minutesAgo = Math.floor((e * 4.5));
    const createdDate = new Date(now.getTime() - minutesAgo * 60 * 1000);
    const targetDevId = (e % 3 === 0) ? `dev-${(e % 2486) + 1}` : null;

    diagBatch.push({
      deviceId: targetDevId,
      severity: sev,
      component: comp,
      eventCode: code,
      message: msg,
      correlationId: `corr-2026-${String(e).padStart(6, '0')}`,
      createdAt: createdDate
    });
  }

  for (let b = 0; b < diagBatch.length; b += 500) {
    const chunk = diagBatch.slice(b, b + 500);
    await prisma.diagnosticEvent.createMany({ data: chunk });
  }

  console.log('--- Seeding Audit Logs ---');
  const auditActions = [
    { action: 'UPDATE_CHANNEL_CHANGED', res: 'Device', before: '{"channel":"Beta"}', after: '{"channel":"Stable"}' },
    { action: 'DEPLOYMENT_LAUNCHED', res: 'Deployment', before: 'null', after: '{"package":"ManyCam Enterprise 3.8.2","target":"Pilot Ring"}' },
    { action: 'ROLLOUT_PAUSED', res: 'Rollout', before: '{"status":"Active"}', after: '{"status":"Paused","reason":"Gate 2 threshold exceeded"}' },
    { action: 'POLICY_ASSIGNED', res: 'CameraPolicy', before: '{"policy":"Default"}', after: '{"policy":"Strict HIPAA Telemedicine"}' },
    { action: 'CERTIFICATE_VALIDATED', res: 'Certificate', before: 'null', after: '{"thumbprint":"4C5F7920A4B3D2E16480F93B8C1E0A2754D69B41","status":"Valid"}' },
    { action: 'DEVICE_REPAIR_TRIGGERED', res: 'Device', before: '{"cameraStatus":"Error"}', after: '{"cameraStatus":"Healthy","action":"msiexec /fa"}' },
    { action: 'PRESET_SAVED', res: 'CameraPreset', before: 'null', after: '{"name":"Executive 1080p60 Studio"}' }
  ];

  const auditBatch = [];
  for (let a = 1; a <= 120; a++) {
    const item = auditActions[a % auditActions.length];
    const minutesAgo = a * 25;
    auditBatch.push({
      actorId: users[a % users.length].id,
      actorName: `${users[a % users.length].fullName} (${users[a % users.length].email.includes('admin') ? 'Admin' : 'Operator'})`,
      action: item.action,
      resourceType: item.res,
      resourceId: item.res === 'Device' ? `dev-${(a * 7) % 2486 + 1}` : `res-${a}`,
      beforeJson: item.before,
      afterJson: item.after,
      outcome: (a === 23) ? 'Denied' : 'Success',
      correlationId: `audit-evt-${String(a).padStart(5, '0')}`,
      createdAt: new Date(now.getTime() - minutesAgo * 60 * 1000)
    });
  }
  await prisma.auditLog.createMany({ data: auditBatch });

  console.log('--- Seeding CI/CD Pipeline Runs ---');
  const pipelineProviders = ['GitHub Actions', 'Azure DevOps'];
  const pipelineNames = ['ManyCam-Windows-Client-CI', 'VirtualCam-Driver-WHQL-Release', 'Enterprise-MSI-Packaging-CD'];

  const stageNames = [
    'Checkout Source', 'Dependency Restore (vcpkg / NuGet)', 'Static Analysis (Clang-Tidy & SonarQube)',
    'Compile C++ Core & .NET Host', 'Unit Tests (GoogleTest / NUnit)', 'Windows Integration Tests (MF & DirectShow)',
    'Build MSI & MSIX Packages (WiX 4.0)', 'Sign Binaries with DigiCert EV HSM', 'Validate Signatures & Authenticode',
    'Windows Defender / SmartScreen Scan', 'Enterprise Release Gate Approval', 'Publish to Enterprise CDN',
    'Deploy to Pilot Ring (Microsoft Intune)'
  ];

  for (let p = 1; p <= 25; p++) {
    const isLatest = (p === 1);
    const isFailed = (p === 5);
    const status = isLatest ? 'Running' : (isFailed ? 'Failed' : 'Success');

    const pr = await prisma.pipelineRun.create({
      data: {
        id: `pipe-${p}`,
        pipelineName: pipelineNames[p % pipelineNames.length],
        provider: pipelineProviders[p % pipelineProviders.length],
        buildNumber: `2026.10.${100 + p}`,
        branch: (p % 4 === 0) ? 'release/v3.8.3' : 'main',
        commitSha: Math.random().toString(16).substring(2, 9),
        status,
        startedAt: new Date(now.getTime() - p * 8 * 3600 * 1000),
        completedAt: status !== 'Running' ? new Date(now.getTime() - (p * 8 * 3600 - 1800) * 1000) : null
      }
    });

    for (let s = 0; s < stageNames.length; s++) {
      let stgStatus = 'Success';
      if (isLatest) {
        if (s < 7) stgStatus = 'Success';
        else if (s === 7) stgStatus = 'Running';
        else stgStatus = 'Pending';
      } else if (isFailed) {
        if (s < 8) stgStatus = 'Success';
        else if (s === 8) stgStatus = 'Failed';
        else stgStatus = 'Skipped';
      }

      await prisma.pipelineStage.create({
        data: {
          pipelineRunId: pr.id,
          stageOrder: s + 1,
          stageName: stageNames[s],
          status: stgStatus,
          durationSec: stgStatus === 'Success' ? (15 + (s * 8)) : (stgStatus === 'Running' ? 12 : 0),
          logText: `[Step ${s + 1}] Executed ${stageNames[s]} in clean Windows Server 2025 runner container.\nExit code: ${stgStatus === 'Failed' ? '1 (SIGVERIFY_FAILED: Timestamp server timeout)' : '0 (OK)'}`
        }
      });
    }
  }

  console.log('--- Seeding Notifications ---');
  const notifs = [
    { type: 'alert', title: 'Virtual Camera Registration Outage', message: 'Endpoint VCA-LON-0042 reported Media Foundation registration error (Code 1603).', link: '/devices?search=VCA-LON-0042' },
    { type: 'deployment', title: 'Pilot Rollout Reached 65%', message: 'Release v3.8.2 has reached 1,480 devices with a 98.4% success rate.', link: '/updates' },
    { type: 'security', title: 'Staging Certificate Expiring Soon', message: 'ManyCam Internal Staging key expires in 44 days. Automated rotation scheduled.', link: '/security' },
    { type: 'system', title: 'Intune Integration Sync Completed', message: 'Synchronized 2,486 Windows device policy profiles from Microsoft Intune tenant.', link: '/deployments' },
    { type: 'alert', title: 'Safety Gate Paused Candidate Build', message: 'Rollout for Canary v3.9.1 paused automatically due to crash threshold gate (0.8% > 0.5%).', link: '/updates' }
  ];

  for (const n of notifs) {
    await prisma.notification.create({
      data: {
        type: n.type,
        title: n.title,
        message: n.message,
        link: n.link,
        readAt: null
      }
    });
  }

  console.log('--- Seeding Default App Settings ---');
  await prisma.appSetting.create({
    data: {
      key: 'general',
      valueJson: JSON.stringify({
        workspaceName: 'ManyCam Enterprise Global Operations',
        locale: 'en-US',
        timezone: 'America/New_York',
        dateFormat: 'YYYY-MM-DD HH:mm:ss',
        defaultLandingPage: '/overview',
        checkInIntervalSec: 300,
        deviceInactivityThresholdHours: 48,
        defaultChannel: 'Stable',
        autoEnrollment: true
      })
    }
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
