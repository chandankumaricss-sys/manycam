import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const rollout = await prisma.rollout.findUnique({
      where: { id },
      include: {
        release: { include: { package: true } },
        stages: { orderBy: { stageNumber: 'asc' } },
      },
    });

    if (!rollout) return NextResponse.json({ error: 'Rollout not found' }, { status: 404 });
    return NextResponse.json(rollout);
  } catch (error) {
    console.error('Error fetching rollout:', error);
    return NextResponse.json({ error: 'Failed to fetch rollout' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action, reason } = body;

    const rollout = await prisma.rollout.findUnique({
      where: { id },
      include: { stages: { orderBy: { stageNumber: 'asc' } } },
    });

    if (!rollout) return NextResponse.json({ error: 'Rollout not found' }, { status: 404 });

    let updatedRollout: any = {};

    if (action === 'pause') {
      updatedRollout = await prisma.rollout.update({
        where: { id },
        data: {
          status: 'Paused',
          pausedReason: reason || 'Rollout paused manually by operator.',
        },
        include: { stages: true, release: true },
      });
    } else if (action === 'resume') {
      updatedRollout = await prisma.rollout.update({
        where: { id },
        data: {
          status: 'Active',
          pausedReason: null,
        },
        include: { stages: true, release: true },
      });
    } else if (action === 'advance') {
      const nextStageNum = Math.min(5, rollout.currentStage + 1);
      const stagePercents = [1, 5, 20, 65, 100];
      const targetPercent = stagePercents[nextStageNum - 1];

      // Update stages in DB
      for (const stg of rollout.stages) {
        if (stg.stageNumber < nextStageNum) {
          await prisma.rolloutStage.update({
            where: { id: stg.id },
            data: { status: 'Completed', completedAt: new Date() },
          });
        } else if (stg.stageNumber === nextStageNum) {
          await prisma.rolloutStage.update({
            where: { id: stg.id },
            data: { status: 'Active', startedAt: new Date() },
          });
        }
      }

      updatedRollout = await prisma.rollout.update({
        where: { id },
        data: {
          currentStage: nextStageNum,
          targetPercent,
          status: nextStageNum === 5 ? 'Completed' : 'Active',
          pausedReason: null,
        },
        include: { stages: { orderBy: { stageNumber: 'asc' } }, release: true },
      });
    } else if (action === 'tripSafetyGate') {
      // Automatic safety gate simulation
      updatedRollout = await prisma.rollout.update({
        where: { id },
        data: {
          status: 'Paused',
          pausedReason: 'Automatic Safety Gate Tripped: Crash rate spike (0.82% > 0.50% threshold) detected on Windows 11 24H2 endpoints. Rollout halted to preserve fleet stability.',
        },
        include: { stages: true, release: true },
      });

      // Record alert notification
      await prisma.notification.create({
        data: {
          type: 'alert',
          title: 'Safety Gate Automatically Paused Rollout',
          message: 'Rollout halted: Crash rate threshold exceeded (0.82% > 0.5%). Immediate diagnostic review recommended.',
          link: '/updates',
        },
      });
    } else if (action === 'rollback') {
      // Safe rollback execution
      updatedRollout = await prisma.rollout.update({
        where: { id },
        data: {
          status: 'Rolled Back',
          pausedReason: 'Rolled back to baseline v3.8.1 LTS. Preserved registry configuration and user camera presets.',
        },
        include: { stages: true, release: true },
      });

      await prisma.auditLog.create({
        data: {
          action: 'ROLLOUT_ROLLED_BACK',
          resourceType: 'Rollout',
          resourceId: id,
          outcome: 'Success',
          correlationId: `rb-${Date.now()}`,
        },
      });
    }

    return NextResponse.json(updatedRollout);
  } catch (error) {
    console.error('Error updating rollout:', error);
    return NextResponse.json({ error: 'Failed to update rollout' }, { status: 500 });
  }
}
