import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const releases = await prisma.release.findMany({
      orderBy: { publishedAt: 'desc' },
      include: {
        package: true,
        rollouts: {
          include: {
            stages: { orderBy: { stageNumber: 'asc' } },
          },
        },
      },
    });
    return NextResponse.json(releases);
  } catch (error) {
    console.error('Error fetching releases:', error);
    return NextResponse.json({ error: 'Failed to fetch releases' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      version,
      releaseNotes,
      packageId,
      channel = 'Stable',
      minWindowsBuild = 'Windows 10 21H2 (19044)',
    } = body;

    if (!version || !packageId) {
      return NextResponse.json({ error: 'Version and packageId are required' }, { status: 400 });
    }

    const pkg = await prisma.package.findUnique({ where: { id: packageId } });
    if (!pkg) return NextResponse.json({ error: 'Package not found' }, { status: 404 });

    const newRelease = await prisma.release.create({
      data: {
        version,
        packageId,
        channel,
        releaseNotes: releaseNotes || 'Enterprise stability update for virtual camera drivers and Windows Media Foundation pipelines.',
        status: 'Rollout-Active',
        minWindowsBuild,
      },
      include: { package: true },
    });

    // Create companion rollout
    const rollout = await prisma.rollout.create({
      data: {
        releaseId: newRelease.id,
        status: 'Active',
        currentStage: 1,
        targetPercent: 1,
        safetyGatesJson: JSON.stringify({
          maxFailureRate: 2.0,
          maxCrashRate: 0.5,
          cameraErrorGate: true,
          codeSigningGate: true,
        }),
      },
    });

    const defaultStages = [
      { stageNumber: 1, stageName: 'Internal QA Ring', targetPercent: 1, status: 'Active' },
      { stageNumber: 2, stageName: 'Pilot Group (HQ)', targetPercent: 5, status: 'Pending' },
      { stageNumber: 3, stageName: 'Early Adopters', targetPercent: 20, status: 'Pending' },
      { stageNumber: 4, stageName: 'Broad Rollout Wave', targetPercent: 50, status: 'Pending' },
      { stageNumber: 5, stageName: 'General Availability', targetPercent: 100, status: 'Pending' },
    ];

    for (const stg of defaultStages) {
      await prisma.rolloutStage.create({
        data: {
          rolloutId: rollout.id,
          stageNumber: stg.stageNumber,
          stageName: stg.stageName,
          targetPercent: stg.targetPercent,
          status: stg.status,
          successCount: stg.status === 'Active' ? 12 : 0,
          failureCount: 0,
        },
      });
    }

    await prisma.auditLog.create({
      data: {
        action: 'RELEASE_PUBLISHED',
        resourceType: 'Release',
        resourceId: newRelease.id,
        afterJson: JSON.stringify(newRelease),
        correlationId: `rel-${Date.now()}`,
      },
    });

    return NextResponse.json(newRelease, { status: 201 });
  } catch (error) {
    console.error('Error creating release:', error);
    return NextResponse.json({ error: 'Failed to create release' }, { status: 500 });
  }
}
