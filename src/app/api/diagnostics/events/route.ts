import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const severity = searchParams.get('severity') || '';
    const component = searchParams.get('component') || '';
    const deviceId = searchParams.get('deviceId') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const exportCsv = searchParams.get('export') === 'csv';

    const where: any = {};
    if (search) {
      where.OR = [
        { message: { contains: search } },
        { correlationId: { contains: search } },
        { device: { hostname: { contains: search } } },
      ];
    }
    if (severity) where.severity = severity;
    if (component) where.component = component;
    if (deviceId) where.deviceId = deviceId;

    if (exportCsv) {
      const allEvents = await prisma.diagnosticEvent.findMany({
        where,
        include: { device: { select: { hostname: true } } },
        take: 2000,
        orderBy: { createdAt: 'desc' },
      });

      const header = 'Timestamp,Severity,Component,Event Code,Device,Message,Correlation ID\n';
      const rows = allEvents.map((e) =>
        `"${e.createdAt.toISOString()}","${e.severity}","${e.component}",${e.eventCode},"${e.device?.hostname || 'System/Global'}","${e.message.replace(/"/g, '""')}","${e.correlationId}"`
      ).join('\n');

      return new NextResponse(header + rows, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="manycam-diagnostic-events.csv"',
        },
      });
    }

    const total = await prisma.diagnosticEvent.count({ where });
    const events = await prisma.diagnosticEvent.findMany({
      where,
      include: { device: { select: { id: true, hostname: true } } },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      events,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      limit,
    });
  } catch (error) {
    console.error('Error in /api/diagnostics/events:', error);
    return NextResponse.json({ error: 'Failed to fetch diagnostic events' }, { status: 500 });
  }
}
