import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const pipelines = await prisma.pipelineRun.findMany({
      orderBy: { startedAt: 'desc' },
      take: 10,
      include: {
        stages: { orderBy: { stageOrder: 'asc' } },
      },
    });
    return NextResponse.json(pipelines);
  } catch (error) {
    console.error('Error fetching pipelines:', error);
    return NextResponse.json({ error: 'Failed to fetch pipelines' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pipelineName = 'ManyCam-Windows-Client-CI', provider = 'GitHub Actions' } = body;

    const buildNumber = `2026.10.${Math.floor(Math.random() * 800) + 200}`;
    const commitSha = Math.random().toString(16).substring(2, 9);

    const pipelineRun = await prisma.pipelineRun.create({
      data: {
        pipelineName,
        provider,
        buildNumber,
        branch: 'main',
        commitSha,
        status: 'Running',
      },
    });

    const stageNames = [
      'Checkout Source',
      'Dependency Restore (vcpkg / NuGet)',
      'Static Analysis (Clang-Tidy & SonarQube)',
      'Compile C++ Core & .NET Host',
      'Unit Tests (GoogleTest / NUnit)',
      'Windows Integration Tests (MF & DirectShow)',
      'Build MSI & MSIX Packages (WiX 4.0)',
      'Sign Binaries with DigiCert EV HSM',
      'Validate Signatures & Authenticode',
      'Windows Defender / SmartScreen Scan',
      'Enterprise Release Gate Approval',
      'Publish to Enterprise CDN',
      'Deploy to Pilot Ring (Microsoft Intune)',
    ];

    for (let i = 0; i < stageNames.length; i++) {
      await prisma.pipelineStage.create({
        data: {
          pipelineRunId: pipelineRun.id,
          stageOrder: i + 1,
          stageName: stageNames[i],
          status: i === 0 ? 'Success' : i === 1 ? 'Running' : 'Pending',
          durationSec: i === 0 ? 12 : 0,
          logText: i === 0 ? `Successfully checked out git ref refs/heads/main at commit ${commitSha}` : null,
        },
      });
    }

    const created = await prisma.pipelineRun.findUnique({
      where: { id: pipelineRun.id },
      include: { stages: { orderBy: { stageOrder: 'asc' } } },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Error triggering pipeline:', error);
    return NextResponse.json({ error: 'Failed to trigger pipeline' }, { status: 500 });
  }
}
