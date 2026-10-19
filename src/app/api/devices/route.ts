import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const os = searchParams.get('os') || '';
    const health = searchParams.get('health') || '';
    const channel = searchParams.get('channel') || '';
    const orgId = searchParams.get('org') || '';
    const compliance = searchParams.get('compliance') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '25', 10);
    const sortBy = searchParams.get('sortBy') || 'hostname';
    const sortOrder = (searchParams.get('sortOrder') || 'asc') as 'asc' | 'desc';
    const exportCsv = searchParams.get('export') === 'csv';

    const where: any = {};

    if (search) {
      where.OR = [
        { hostname: { contains: search } },
        { id: { contains: search } },
        { osBuild: { contains: search } },
        { assignedUser: { fullName: { contains: search } } },
      ];
    }

    if (os) where.osName = { contains: os };
    if (health) where.healthStatus = health;
    if (channel) where.updateChannel = channel;
    if (orgId) where.organizationId = orgId;
    if (compliance) where.complianceStatus = compliance;

    if (exportCsv) {
      const allMatching = await prisma.device.findMany({
        where,
        include: { organization: true, assignedUser: true },
        take: 2500,
        orderBy: { [sortBy]: sortOrder },
      });

      const header = 'Device ID,Hostname,Organization,Assigned User,OS Version,OS Build,Architecture,App Version,Camera Status,Update Channel,Compliance,Last Seen\n';
      const rows = allMatching.map((d) =>
        `"${d.id}","${d.hostname}","${d.organization?.name || ''}","${d.assignedUser?.fullName || ''}","${d.osName}","${d.osBuild}","${d.architecture}","${d.appVersion}","${d.cameraStatus}","${d.updateChannel}","${d.complianceStatus}","${d.lastSeenAt.toISOString()}"`
      ).join('\n');

      return new NextResponse(header + rows, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="manycam-device-inventory.csv"',
        },
      });
    }

    const total = await prisma.device.count({ where });
    const devices = await prisma.device.findMany({
      where,
      include: {
        organization: { select: { id: true, name: true, region: true } },
        assignedUser: { select: { id: true, fullName: true, email: true } },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    });

    return NextResponse.json({
      devices,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      limit,
    });
  } catch (error) {
    console.error('Error fetching devices:', error);
    return NextResponse.json({ error: 'Failed to query devices' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      hostname,
      organizationId,
      assignedUserId,
      osName = 'Windows 11 Enterprise',
      osBuild = '24H2 (26100.2894)',
      architecture = 'x64',
      appVersion = 'v3.8.2',
      updateChannel = 'Stable',
      managementSource = 'Microsoft Intune',
    } = body;

    let targetOrgId = organizationId;
    const existingOrg = await prisma.organization.findUnique({ where: { id: targetOrgId } });
    if (!existingOrg) {
      const firstOrg = await prisma.organization.findFirst();
      if (firstOrg) targetOrgId = firstOrg.id;
    }

    // Check unique hostname
    const existing = await prisma.device.findUnique({ where: { hostname } });
    if (existing) {
      return NextResponse.json({ error: 'A device with this hostname already exists' }, { status: 409 });
    }

    const newDevice = await prisma.device.create({
      data: {
        hostname,
        organizationId: targetOrgId,
        assignedUserId: null,
        osName,
        osBuild,
        architecture,
        appVersion,
        agentVersion: 'v2.4.1',
        cameraStatus: 'Healthy',
        serviceStatus: 'Running',
        managementSource,
        updateChannel,
        complianceStatus: 'Compliant',
        healthStatus: 'Healthy',
      },
      include: { organization: true, assignedUser: true },
    });

    // Record audit event
    await prisma.auditLog.create({
      data: {
        action: 'DEVICE_ENROLLED',
        resourceType: 'Device',
        resourceId: newDevice.id,
        afterJson: JSON.stringify(newDevice),
        correlationId: `enr-${Date.now()}`,
      },
    });

    return NextResponse.json(newDevice, { status: 201 });
  } catch (error) {
    console.error('Error creating device:', error);
    return NextResponse.json({ error: 'Failed to create device' }, { status: 500 });
  }
}
