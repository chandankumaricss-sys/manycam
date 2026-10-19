import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';

    // Compute metrics directly from seeded database
    const totalDevices = await prisma.device.count();
    const onlineDevices = await prisma.device.count({
      where: { healthStatus: { not: 'Offline' } },
    });
    const healthyCameras = await prisma.device.count({
      where: { cameraStatus: 'Healthy' },
    });
    const warningDevices = await prisma.device.count({
      where: { healthStatus: 'Warning' },
    });
    const criticalDevices = await prisma.device.count({
      where: { healthStatus: 'Critical' },
    });
    const offlineDevices = totalDevices - onlineDevices;

    const compliantDevices = await prisma.device.count({
      where: { complianceStatus: 'Compliant' },
    });
    const updateComplianceRate = Number(((compliantDevices / totalDevices) * 100).toFixed(1));

    // Deployments success rate
    const deployments = await prisma.deployment.findMany({
      select: { successfulCount: true, totalDevices: true },
    });
    const totalAttempted = deployments.reduce((acc, d) => acc + d.totalDevices, 0);
    const totalSuccessful = deployments.reduce((acc, d) => acc + d.successfulCount, 0);
    const deploymentSuccessRate = totalAttempted > 0
      ? Number(((totalSuccessful / totalAttempted) * 100).toFixed(1))
      : 98.4;

    // Active Alerts count (Diagnostic errors and critical events in past 24h)
    const activeAlerts = 18;

    // OS Distribution counts
    const win11Ent = await prisma.device.count({ where: { osName: 'Windows 11 Enterprise' } });
    const win11Pro = await prisma.device.count({ where: { osName: 'Windows 11 Pro' } });
    const win10Ent = await prisma.device.count({ where: { osName: 'Windows 10 Enterprise' } });
    const win10Pro = await prisma.device.count({ where: { osName: 'Windows 10 Pro' } });

    const osDistribution = [
      { name: 'Windows 11 Enterprise', count: win11Ent, percent: Number(((win11Ent / totalDevices) * 100).toFixed(1)), color: '#0796E5' },
      { name: 'Windows 11 Pro', count: win11Pro, percent: Number(((win11Pro / totalDevices) * 100).toFixed(1)), color: '#22B8F0' },
      { name: 'Windows 10 Enterprise', count: win10Ent, percent: Number(((win10Ent / totalDevices) * 100).toFixed(1)), color: '#10B981' },
      { name: 'Windows 10 Pro', count: win10Pro, percent: Number(((win10Pro / totalDevices) * 100).toFixed(1)), color: '#F59E0B' },
    ];

    // Release channel adoption
    const stableCount = await prisma.device.count({ where: { updateChannel: 'Stable' } });
    const betaCount = await prisma.device.count({ where: { updateChannel: 'Beta' } });
    const canaryCount = await prisma.device.count({ where: { updateChannel: 'Canary' } });
    const pinnedCount = await prisma.device.count({ where: { updateChannel: 'Pinned Legacy' } });

    const releaseAdoption = [
      { channel: 'Stable (v3.8.2 GA)', count: stableCount, percent: Number(((stableCount / totalDevices) * 100).toFixed(1)), color: '#0796E5' },
      { channel: 'Beta (v3.9.0-beta.2)', count: betaCount, percent: Number(((betaCount / totalDevices) * 100).toFixed(1)), color: '#22B8F0' },
      { channel: 'Canary (v3.9.1 Nightly)', count: canaryCount, percent: Number(((canaryCount / totalDevices) * 100).toFixed(1)), color: '#8B5CF6' },
      { channel: 'Pinned Legacy (v3.7.9 LTS)', count: pinnedCount, percent: Number(((pinnedCount / totalDevices) * 100).toFixed(1)), color: '#64748B' },
    ];

    // Dynamic trends based on period (24 Hours, 7 Days, 30 Days, 90 Days)
    let trendPoints = 7;
    let labelPrefix = 'Day ';
    if (period === '24h') {
      trendPoints = 6;
      labelPrefix = 'Hour ';
    } else if (period === '7d') {
      trendPoints = 7;
    } else if (period === '90d') {
      trendPoints = 12;
      labelPrefix = 'Wk ';
    } else {
      trendPoints = 10;
    }

    const installationTrends = Array.from({ length: trendPoints }).map((_, i) => {
      const idx = i + 1;
      return {
        period: `${labelPrefix}${idx}`,
        successfulInstalls: 35 + ((idx * 17) % 65),
        failedInstalls: (idx === 4 || idx === 8) ? 3 : 1,
        successfulUpdates: 140 + ((idx * 29) % 180),
        failedUpdates: (idx === 3) ? 4 : (idx === 7 ? 2 : 0),
        rollbacks: (idx === 5) ? 1 : 0,
      };
    });

    // Recent activity items
    const recentActivity = [
      { id: 'act-1', text: 'Endpoint VCA-NYC-0124 updated successfully to ManyCam v3.8.2 via Intune.', time: '4 mins ago', severity: 'success', link: '/devices?search=VCA-NYC-0124' },
      { id: 'act-2', text: 'Northwind Pilot staged deployment reached 65% target across 1,480 workstations.', time: '18 mins ago', severity: 'info', link: '/updates' },
      { id: 'act-3', text: 'Authenticode EV certificate signature verification passed for package pkg-382-msi-x64.', time: '45 mins ago', severity: 'success', link: '/security' },
      { id: 'act-4', text: 'Device VCA-LON-0042 reported virtual camera filter registration failure (Code 1603).', time: '1 hr ago', severity: 'error', link: '/devices?search=VCA-LON-0042' },
      { id: 'act-5', text: 'Automatic safety gate evaluated crash threshold: 0.12% (within 0.5% limit).', time: '2 hrs ago', severity: 'info', link: '/updates' },
      { id: 'act-6', text: 'ADMX Group Policy enforced: Background blur permitted, max FPS capped at 30.', time: '3 hrs ago', severity: 'info', link: '/camera' },
      { id: 'act-7', text: 'Automated repair initiated for 3 endpoints with degraded virtual audio routing.', time: '4 hrs ago', severity: 'warning', link: '/devices' },
      { id: 'act-8', text: 'Nightly CI/CD Windows runner build #2026.10.125 passed 84/84 unit & Media Foundation integration tests.', time: '6 hrs ago', severity: 'success', link: '/diagnostics' },
    ];

    return NextResponse.json({
      kpis: {
        totalDevices,
        onlineDevices,
        healthyCameras,
        deploymentSuccessRate,
        updateComplianceRate,
        activeAlerts,
      },
      healthBreakdown: {
        healthy: healthyCameras,
        warning: warningDevices,
        critical: criticalDevices,
        offline: offlineDevices,
      },
      osDistribution,
      releaseAdoption,
      installationTrends,
      recentActivity,
    });
  } catch (error) {
    console.error('Error in /api/overview:', error);
    return NextResponse.json({ error: 'Failed to fetch overview metrics' }, { status: 500 });
  }
}
