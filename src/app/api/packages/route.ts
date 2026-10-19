import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const packages = await prisma.package.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        deployments: { select: { id: true, status: true, progress: true } },
      },
    });
    return NextResponse.json(packages);
  } catch (error) {
    console.error('Error fetching packages:', error);
    return NextResponse.json({ error: 'Failed to fetch packages' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      version,
      architecture = 'x64',
      packageType = 'MSI',
      fileSize = '145.0 MB',
      sha256,
      signingStatus = 'Valid / Signed',
      installContext = 'per-machine',
    } = body;

    if (!name || !version) {
      return NextResponse.json({ error: 'Package Name and Version are required' }, { status: 400 });
    }

    const calculatedSha = sha256 || Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    const newPkg = await prisma.package.create({
      data: {
        name,
        version,
        architecture,
        packageType,
        fileSize,
        sha256: calculatedSha,
        signingStatus,
        installContext,
        downloadUrl: `/packages/${name.replace(/\s+/g, '-')}.msi`,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'PACKAGE_PUBLISHED',
        resourceType: 'Package',
        resourceId: newPkg.id,
        afterJson: JSON.stringify(newPkg),
        correlationId: `pkg-${Date.now()}`,
      },
    });

    return NextResponse.json(newPkg, { status: 201 });
  } catch (error) {
    console.error('Error creating package:', error);
    return NextResponse.json({ error: 'Failed to create package' }, { status: 500 });
  }
}
