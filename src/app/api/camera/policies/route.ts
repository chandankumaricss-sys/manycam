import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const policies = await prisma.cameraPolicy.findMany({
      include: { assignments: true },
      orderBy: { priority: 'desc' },
    });
    return NextResponse.json(policies);
  } catch (error) {
    console.error('Error fetching policies:', error);
    return NextResponse.json({ error: 'Failed to fetch camera policies' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, version = '1.0.0', priority = 100, settingsJson, assignments = [] } = body;

    const policy = await prisma.cameraPolicy.create({
      data: {
        name,
        version,
        priority: parseInt(String(priority), 10),
        settingsJson: typeof settingsJson === 'string' ? settingsJson : JSON.stringify(settingsJson),
        status: 'Active',
      },
    });

    if (assignments.length > 0) {
      for (const a of assignments) {
        await prisma.cameraPolicyAssignment.create({
          data: {
            policyId: policy.id,
            targetType: a.targetType || 'Group',
            targetId: a.targetId || null,
          },
        });
      }
    }

    await prisma.auditLog.create({
      data: {
        action: 'CAMERA_POLICY_CREATED',
        resourceType: 'CameraPolicy',
        resourceId: policy.id,
        afterJson: policy.settingsJson,
        correlationId: `pol-${Date.now()}`,
      },
    });

    return NextResponse.json(policy, { status: 201 });
  } catch (error) {
    console.error('Error creating camera policy:', error);
    return NextResponse.json({ error: 'Failed to create policy' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, version, priority, settingsJson, status } = body;

    const existing = await prisma.cameraPolicy.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Policy not found' }, { status: 404 });

    const updated = await prisma.cameraPolicy.update({
      where: { id },
      data: {
        name: name !== undefined ? name : existing.name,
        version: version !== undefined ? version : existing.version,
        priority: priority !== undefined ? parseInt(String(priority), 10) : existing.priority,
        settingsJson: settingsJson !== undefined ? (typeof settingsJson === 'string' ? settingsJson : JSON.stringify(settingsJson)) : existing.settingsJson,
        status: status !== undefined ? status : existing.status,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'CAMERA_POLICY_UPDATED',
        resourceType: 'CameraPolicy',
        resourceId: id,
        beforeJson: existing.settingsJson,
        afterJson: updated.settingsJson,
        correlationId: `pol-upd-${Date.now()}`,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating camera policy:', error);
    return NextResponse.json({ error: 'Failed to update policy' }, { status: 500 });
  }
}
