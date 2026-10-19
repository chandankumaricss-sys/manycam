import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const resourceType = searchParams.get('resourceType') || '';
    const outcome = searchParams.get('outcome') || '';
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const exportCsv = searchParams.get('export') === 'csv';

    const where: any = {};
    if (search) {
      where.OR = [
        { action: { contains: search } },
        { actorName: { contains: search } },
        { resourceId: { contains: search } },
        { correlationId: { contains: search } },
      ];
    }
    if (resourceType) where.resourceType = resourceType;
    if (outcome) where.outcome = outcome;

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: exportCsv ? 1000 : limit,
    });

    if (exportCsv) {
      const header = 'Timestamp,Actor,Action,Resource Type,Resource ID,Outcome,Correlation ID\n';
      const rows = logs.map((l) =>
        `"${l.createdAt.toISOString()}","${l.actorName}","${l.action}","${l.resourceType}","${l.resourceId || ''}","${l.outcome}","${l.correlationId}"`
      ).join('\n');

      return new NextResponse(header + rows, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="manycam-audit-trail.csv"',
        },
      });
    }

    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 });
  }
}
