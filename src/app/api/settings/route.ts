import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const setting = await prisma.appSetting.findUnique({
      where: { key: 'general' },
    });
    const parsed = setting ? JSON.parse(setting.valueJson) : {};
    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const updated = await prisma.appSetting.upsert({
      where: { key: 'general' },
      update: { valueJson: JSON.stringify(body) },
      create: { key: 'general', valueJson: JSON.stringify(body) },
    });

    await prisma.auditLog.create({
      data: {
        action: 'SETTINGS_UPDATED',
        resourceType: 'AppSetting',
        resourceId: 'general',
        afterJson: JSON.stringify(body),
        correlationId: `set-${Date.now()}`,
      },
    });

    return NextResponse.json(JSON.parse(updated.valueJson));
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
