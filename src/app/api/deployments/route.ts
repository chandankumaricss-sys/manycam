import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const deployments = await prisma.deployment.findMany({
      orderBy: { startedAt: 'desc' },
      include: {
        package: true,
        deploymentDevices: {
          take: 8,
          include: { device: true },
        },
      },
    });
    return NextResponse.json(deployments);
  } catch (error) {
    console.error('Error fetching deployments:', error);
    return NextResponse.json({ error: 'Failed to fetch deployments' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      packageId,
      targetType = 'Group',
      targetId,
      targetName = 'Target Ring',
      deploymentMethod = 'Microsoft Intune',
      installContext = 'per-machine',
      totalDevices = 150,
    } = body;

    if (!packageId) {
      return NextResponse.json({ error: 'packageId is required' }, { status: 400 });
    }

    const pkg = await prisma.package.findUnique({ where: { id: packageId } });
    if (!pkg) return NextResponse.json({ error: 'Package not found' }, { status: 404 });

    const firstUser = await prisma.user.findFirst();
    const validUserId = firstUser ? firstUser.id : undefined;

    const numTotal = parseInt(String(totalDevices), 10) || 120;
    const initialProgress = 15;
    const initialSuccessful = Math.floor(numTotal * 0.15);
    const initialPending = numTotal - initialSuccessful;

    const initialLogs = [
      { time: 'T+00:00:01', level: 'INFO', msg: `Initialized deployment task for package ${pkg.name}` },
      { time: 'T+00:00:08', level: 'INFO', msg: `Pushed installation manifest via ${deploymentMethod} API gateway` },
      { time: 'T+00:00:22', level: 'INFO', msg: `Dispatched silent command: msiexec /i "${pkg.name}.msi" /qn /norestart /L*v "install.log"` },
      { time: 'T+00:00:35', level: 'INFO', msg: `Pre-check validated: Windows Media Foundation platform service is healthy` },
      { time: 'T+00:00:45', level: 'INFO', msg: `Active node batch 1 (25 devices) acknowledged receipt of installer payload` }
    ];

    const deployment = await prisma.deployment.create({
      data: {
        packageId,
        targetType,
        targetId: targetId || null,
        targetName,
        deploymentMethod,
        installContext,
        status: 'Running',
        progress: initialProgress,
        totalDevices: numTotal,
        successfulCount: initialSuccessful,
        failedCount: 0,
        pendingCount: initialPending,
        initiatedBy: validUserId as string,
        logsJson: JSON.stringify(initialLogs),
      },
      include: { package: true },
    });

    // Pick a few sample devices to link
    const sampleDevices = await prisma.device.findMany({ take: 6 });
    for (let i = 0; i < sampleDevices.length; i++) {
      await prisma.deploymentDevice.create({
        data: {
          deploymentId: deployment.id,
          deviceId: sampleDevices[i].id,
          status: i === 0 ? 'Success' : 'In-Progress',
          exitCode: i === 0 ? 0 : null,
          attempts: 1,
          logExcerpt: i === 0 ? 'Windows Installer installed the product. Status: 0' : 'Downloading MSI package from cache...',
        },
      });
    }

    await prisma.auditLog.create({
      data: {
        action: 'DEPLOYMENT_LAUNCHED',
        resourceType: 'Deployment',
        resourceId: deployment.id,
        afterJson: JSON.stringify({ package: pkg.name, target: targetName, method: deploymentMethod }),
        correlationId: `dep-${Date.now()}`,
      },
    });

    return NextResponse.json(deployment, { status: 201 });
  } catch (error) {
    console.error('Error creating deployment:', error);
    return NextResponse.json({ error: 'Failed to launch deployment' }, { status: 500 });
  }
}
