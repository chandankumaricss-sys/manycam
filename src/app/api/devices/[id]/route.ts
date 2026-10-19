import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const device = await prisma.device.findUnique({
      where: { id },
      include: {
        organization: true,
        assignedUser: true,
        groups: { include: { group: true } },
        deploymentDevices: {
          include: { deployment: { include: { package: true } } },
          take: 10,
          orderBy: { lastAttemptAt: 'desc' },
        },
        updateHistory: { take: 10, orderBy: { startedAt: 'desc' } },
        diagnosticEvents: { take: 20, orderBy: { createdAt: 'desc' } },
        securityChecks: { take: 10, orderBy: { assessedAt: 'desc' } },
      },
    });

    if (!device) {
      return NextResponse.json({ error: 'Device not found' }, { status: 404 });
    }

    return NextResponse.json(device);
  } catch (error) {
    console.error('Error fetching device details:', error);
    return NextResponse.json({ error: 'Failed to fetch device' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.device.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Device not found' }, { status: 404 });
    }

    const updated = await prisma.device.update({
      where: { id },
      data: body,
      include: { organization: true, assignedUser: true },
    });

    await prisma.auditLog.create({
      data: {
        action: 'DEVICE_UPDATED',
        resourceType: 'Device',
        resourceId: id,
        beforeJson: JSON.stringify(existing),
        afterJson: JSON.stringify(updated),
        correlationId: `upd-${Date.now()}`,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating device:', error);
    return NextResponse.json({ error: 'Failed to update device' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = await prisma.device.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Device not found' }, { status: 404 });
    }

    await prisma.device.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        action: 'DEVICE_DELETED',
        resourceType: 'Device',
        resourceId: id,
        beforeJson: JSON.stringify(existing),
        correlationId: `del-${Date.now()}`,
      },
    });

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    console.error('Error deleting device:', error);
    return NextResponse.json({ error: 'Failed to delete device' }, { status: 500 });
  }
}
