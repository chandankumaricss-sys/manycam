import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deployment = await prisma.deployment.findUnique({
      where: { id },
      include: {
        package: true,
        deploymentDevices: {
          include: { device: true },
          take: 50,
        },
      },
    });

    if (!deployment) return NextResponse.json({ error: 'Deployment not found' }, { status: 404 });
    return NextResponse.json(deployment);
  } catch (error) {
    console.error('Error fetching deployment:', error);
    return NextResponse.json({ error: 'Failed to fetch deployment' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action } = body;

    const existing = await prisma.deployment.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Deployment not found' }, { status: 404 });

    let updatedData: any = {};
    let logMsg = '';

    if (action === 'pause') {
      updatedData.status = 'Paused';
      logMsg = 'Deployment operation paused by administrator.';
    } else if (action === 'resume') {
      updatedData.status = 'Running';
      logMsg = 'Deployment operation resumed.';
    } else if (action === 'cancel') {
      updatedData.status = 'Cancelled';
      logMsg = 'Deployment operation cancelled. Running nodes received termination signal.';
    } else if (action === 'retryFailed') {
      // Clear failure and advance
      const newSuccess = existing.successfulCount + existing.failedCount;
      updatedData = {
        status: newSuccess >= existing.totalDevices ? 'Completed' : 'Running',
        progress: Math.min(100, Math.floor((newSuccess / existing.totalDevices) * 100)),
        successfulCount: newSuccess,
        failedCount: 0,
        pendingCount: Math.max(0, existing.totalDevices - newSuccess),
      };
      logMsg = `Retried failed nodes with elevated system token. Status: Exit code 0 (Success).`;

      // Update failed deployment_devices
      await prisma.deploymentDevice.updateMany({
        where: { deploymentId: id, status: 'Failed' },
        data: { status: 'Success', exitCode: 0, errorReason: null },
      });
    } else if (action === 'advanceSimulation') {
      // Deterministically advance simulation progress
      const newProgress = Math.min(100, existing.progress + 25);
      const isDone = newProgress >= 100;
      const newSuccess = Math.floor(existing.totalDevices * (newProgress / 100)) - (isDone ? 2 : 0);
      const newFailed = isDone ? 2 : 0;
      const newPending = existing.totalDevices - newSuccess - newFailed;

      updatedData = {
        progress: newProgress,
        status: isDone ? (newFailed > 0 ? 'Completed' : 'Completed') : 'Running',
        successfulCount: newSuccess,
        failedCount: newFailed,
        pendingCount: newPending,
        completedAt: isDone ? new Date() : null,
      };
      logMsg = isDone
        ? `Deployment completed. ${newSuccess} nodes succeeded. 2 nodes reported exit code 1603 (Access Denied).`
        : `Progress advanced to ${newProgress}%. Synchronized node state.`;

      if (isDone) {
        // Mark one sample node as failed with 1603
        const devDevices = await prisma.deploymentDevice.findMany({ where: { deploymentId: id }, take: 2 });
        if (devDevices.length > 0) {
          await prisma.deploymentDevice.update({
            where: { id: devDevices[0].id },
            data: {
              status: 'Failed',
              exitCode: 1603,
              errorReason: 'Fatal error 1603: Custom Action VirtualCamRegisterServer failed due to access denial.',
            },
          });
        }
      }
    }

    const currentLogs = JSON.parse(existing.logsJson || '[]');
    if (logMsg) {
      currentLogs.push({
        time: new Date().toLocaleTimeString(),
        level: updatedData.status === 'Cancelled' ? 'WARN' : 'INFO',
        msg: logMsg,
      });
      updatedData.logsJson = JSON.stringify(currentLogs);
    }

    const updated = await prisma.deployment.update({
      where: { id },
      data: updatedData,
      include: { package: true },
    });

    await prisma.auditLog.create({
      data: {
        action: `DEPLOYMENT_${(action || 'UPDATED').toUpperCase()}`,
        resourceType: 'Deployment',
        resourceId: id,
        afterJson: JSON.stringify(updatedData),
        correlationId: `dep-act-${Date.now()}`,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error modifying deployment:', error);
    return NextResponse.json({ error: 'Failed to update deployment' }, { status: 500 });
  }
}
