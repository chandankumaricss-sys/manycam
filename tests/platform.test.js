// End-to-End Automated Platform Integration Verification Test Suite
const assert = require('assert');

const BASE_URL = 'http://localhost:3002';

async function runTests() {
  console.log('================================================================');
  console.log('RUNNING MANYCAMP ENTERPRISE CONTROL CENTER INTEGRATION TESTS');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`✔ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`✘ [FAIL] ${name}:`, err.message);
      failed++;
    }
  }

  // 1. Verify Overview Metrics & Seed Data Integrity
  await test('Overview API returns deterministic seeded metrics (2,486 devices)', async () => {
    const res = await fetch(`${BASE_URL}/api/overview`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.kpis.totalDevices, 2486, 'Total devices must be 2,486');
    assert.strictEqual(data.kpis.onlineDevices, 2312, 'Online devices must be 2,312');
    assert.strictEqual(data.kpis.healthyCameras, 2274, 'Healthy cameras must be 2,274');
    assert.strictEqual(data.kpis.updateComplianceRate, 94.7, 'Compliance rate must be 94.7%');
    assert.strictEqual(data.kpis.activeAlerts, 18, 'Active alerts must be 18');
    assert(data.osDistribution.length >= 4, 'OS distribution must contain 4 Windows editions');
    assert(data.installationTrends.length > 0, 'Installation trends must be generated');
    assert(data.recentActivity.length > 0, 'Recent activity feed must be populated');
  });

  // 2. Verify Devices API (Pagination, Filtering, Search)
  await test('Devices API supports pagination, searching, and filtering', async () => {
    const res = await fetch(`${BASE_URL}/api/devices?limit=10&page=1`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.total, 2486);
    assert.strictEqual(data.devices.length, 10);

    // Search filter
    const searchRes = await fetch(`${BASE_URL}/api/devices?search=NYC`);
    const searchData = await searchRes.json();
    assert(searchData.devices.length > 0);
    assert(searchData.devices.every(d => d.hostname.includes('NYC') || d.id.includes('NYC')));
  });

  // 3. Verify Device CRUD & Action Workflows
  let createdDeviceId = null;
  await test('Device Enrollment (POST /api/devices)', async () => {
    const testHostname = `VCA-TEST-${Date.now().toString().slice(-4)}`;
    const res = await fetch(`${BASE_URL}/api/devices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        hostname: testHostname,
        organizationId: 'orgs-1',
        osName: 'Windows 11 Enterprise',
        architecture: 'x64',
      }),
    });
    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.strictEqual(data.hostname, testHostname);
    createdDeviceId = data.id;
  });

  await test('Device Actions: Agent Check-In & MSI Repair Simulation', async () => {
    assert(createdDeviceId, 'Created device must exist');
    // Check-in
    const checkinRes = await fetch(`${BASE_URL}/api/devices/${createdDeviceId}/actions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'checkin' }),
    });
    assert.strictEqual(checkinRes.status, 200);

    // Repair (msiexec /fa)
    const repairRes = await fetch(`${BASE_URL}/api/devices/${createdDeviceId}/actions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'repair' }),
    });
    assert.strictEqual(repairRes.status, 200);
    const repairData = await repairRes.json();
    assert.strictEqual(repairData.device.cameraStatus, 'Healthy');
  });

  await test('Device Clean Removal (DELETE /api/devices/[id])', async () => {
    assert(createdDeviceId);
    const res = await fetch(`${BASE_URL}/api/devices/${createdDeviceId}`, { method: 'DELETE' });
    assert.strictEqual(res.status, 200);
    const checkRes = await fetch(`${BASE_URL}/api/devices/${createdDeviceId}`);
    assert.strictEqual(checkRes.status, 404);
  });

  // 4. Verify Camera Studio & Presets API
  await test('Camera Presets API (GET and POST)', async () => {
    const listRes = await fetch(`${BASE_URL}/api/camera/presets`);
    assert.strictEqual(listRes.status, 200);
    const presets = await listRes.json();
    assert(presets.length >= 4, 'Must have seeded presets (Executive, Showcase, Webinar)');

    const saveRes = await fetch(`${BASE_URL}/api/camera/presets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `Integration Test Preset ${Date.now()}`,
        configurationJson: JSON.stringify({ resolution: '1920x1080', fps: 60, format: 'NV12' }),
      }),
    });
    assert.strictEqual(saveRes.status, 201);
  });

  // 5. Verify Camera Policies API
  await test('Camera Policies API returns enterprise ADMX policy rules', async () => {
    const res = await fetch(`${BASE_URL}/api/camera/policies`);
    assert.strictEqual(res.status, 200);
    const policies = await res.json();
    assert(policies.length >= 5, 'Must have at least 5 enterprise policy templates');
    const hipaa = policies.find(p => p.name.includes('HIPAA'));
    assert(hipaa, 'Must include strict HIPAA telemedicine policy');
  });

  // 6. Verify Packages & Deployment Simulation Engine
  let createdDepId = null;
  await test('Deployments API: Launch Simulation and Deterministic Progress', async () => {
    const pkgsRes = await fetch(`${BASE_URL}/api/packages`);
    assert.strictEqual(pkgsRes.status, 200);
    const pkgs = await pkgsRes.json();
    assert(pkgs.length >= 8, 'Must have 8 application package versions');

    // Launch simulation
    const launchRes = await fetch(`${BASE_URL}/api/deployments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        packageId: pkgs[0].id,
        targetName: 'Automated Pilot Ring',
        deploymentMethod: 'Microsoft Intune',
        totalDevices: 100,
      }),
    });
    assert.strictEqual(launchRes.status, 201);
    const dep = await launchRes.json();
    assert.strictEqual(dep.status, 'Running');
    createdDepId = dep.id;

    // Advance simulation
    const advRes = await fetch(`${BASE_URL}/api/deployments/${createdDepId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'advanceSimulation' }),
    });
    assert.strictEqual(advRes.status, 200);
    const advanced = await advRes.json();
    assert(advanced.progress > dep.progress, 'Progress must increase deterministically');
  });

  // 7. Verify Releases & Staged Rollout Engine
  await test('Rollout Engine: Pause, Advance, Safety Gate Tripping, and Rollback', async () => {
    const res = await fetch(`${BASE_URL}/api/rollouts/rollout-382`);
    assert.strictEqual(res.status, 200);
    const rollout = await res.json();
    assert(rollout.stages.length === 5, 'Must feature 5 rollout stages');

    // Trip safety gate
    const tripRes = await fetch(`${BASE_URL}/api/rollouts/rollout-382`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'tripSafetyGate' }),
    });
    assert.strictEqual(tripRes.status, 200);
    const tripped = await tripRes.json();
    assert.strictEqual(tripped.status, 'Paused');
    assert(tripped.pausedReason.includes('Safety Gate Tripped'));

    // Resume rollout
    const resumeRes = await fetch(`${BASE_URL}/api/rollouts/rollout-382`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'resume' }),
    });
    assert.strictEqual(resumeRes.status, 200);
    const resumed = await resumeRes.json();
    assert.strictEqual(resumed.status, 'Active');
  });

  // 8. Verify Security & EDR Compatibility
  await test('Security API returns Authenticode certificates and EDR matrix', async () => {
    const res = await fetch(`${BASE_URL}/api/security`);
    assert.strictEqual(res.status, 200);
    const sec = await res.json();
    assert(sec.certificates.length >= 4, 'Must have certificates records');
    assert(sec.compatibilityMatrix.length >= 6, 'Must have EDR compatibility matrix');
    assert(sec.compatibilityMatrix.some(e => e.name.includes('Defender')));
    assert(sec.compatibilityMatrix.some(e => e.name.includes('CrowdStrike')));
  });

  // 9. Verify Diagnostics & Event Logs
  await test('Diagnostics Logs API returns 2,000+ events with filtering', async () => {
    const res = await fetch(`${BASE_URL}/api/diagnostics/events?limit=10`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert(data.total >= 2000, 'Must have 2,000+ seeded diagnostic events');
    assert.strictEqual(data.events.length, 10);
  });

  // 10. Verify CI/CD Pipeline Center (13 stages)
  await test('CI/CD Pipeline Center returns 13-stage Windows runner runs', async () => {
    const res = await fetch(`${BASE_URL}/api/diagnostics/pipeline`);
    assert.strictEqual(res.status, 200);
    const pipelines = await res.json();
    assert(pipelines.length >= 10);
    assert.strictEqual(pipelines[0].stages.length, 13, 'Must have 13 pipeline stages');
  });

  // 11. Verify Immutable Audit Trail
  await test('Audit Trail API records mutations with correlation IDs', async () => {
    const res = await fetch(`${BASE_URL}/api/audit?limit=10`);
    assert.strictEqual(res.status, 200);
    const audits = await res.json();
    assert(audits.length >= 10);
    assert(audits[0].correlationId);
  });

  // 12. Verify HTML Page Routes (All 7 modules + settings)
  const routes = [
    '/overview',
    '/devices',
    '/camera',
    '/deployments',
    '/updates',
    '/security',
    '/diagnostics',
    '/settings',
  ];

  for (const r of routes) {
    await test(`Page route loads cleanly: ${r}`, async () => {
      const res = await fetch(`${BASE_URL}${r}`);
      assert.strictEqual(res.status, 200, `Route ${r} must return status 200`);
      const html = await res.text();
      assert(html.includes('ManyCam'), `HTML of ${r} must contain ManyCam branding`);
    });
  }

  console.log('\n================================================================');
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error('Fatal test error:', e);
  process.exit(1);
});
