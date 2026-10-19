import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const presets = await prisma.cameraPreset.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(presets);
  } catch (error) {
    console.error('Error fetching presets:', error);
    return NextResponse.json({ error: 'Failed to fetch presets' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, configurationJson, createdBy = 'Olivia Chen (Admin)' } = body;

    if (!name || !configurationJson) {
      return NextResponse.json({ error: 'Name and configurationJson are required' }, { status: 400 });
    }

    const preset = await prisma.cameraPreset.create({
      data: {
        name,
        configurationJson: typeof configurationJson === 'string' ? configurationJson : JSON.stringify(configurationJson),
        createdBy,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'CAMERA_PRESET_SAVED',
        resourceType: 'CameraPreset',
        resourceId: preset.id,
        afterJson: preset.configurationJson,
        correlationId: `preset-${Date.now()}`,
      },
    });

    return NextResponse.json(preset, { status: 201 });
  } catch (error) {
    console.error('Error saving preset:', error);
    return NextResponse.json({ error: 'Failed to save preset' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    await prisma.cameraPreset.delete({ where: { id } });
    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    console.error('Error deleting preset:', error);
    return NextResponse.json({ error: 'Failed to delete preset' }, { status: 500 });
  }
}
