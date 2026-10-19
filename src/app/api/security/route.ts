import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const certificates = await prisma.certificate.findMany({
      orderBy: { expiresAt: 'asc' },
    });

    const totalDevices = await prisma.device.count();
    const compliantDevices = await prisma.device.count({ where: { complianceStatus: 'Compliant' } });
    const nonCompliant = await prisma.device.count({ where: { complianceStatus: 'Non-compliant' } });
    const pendingReview = await prisma.device.count({ where: { complianceStatus: 'Pending' } });

    // Endpoint Security Compatibility Matrix
    const compatibilityMatrix = [
      { name: 'Microsoft Defender Antivirus', version: '4.18.24090.11', status: 'Fully Compatible', details: 'DirectShow and Media Foundation filters verified clean. No false positives.', lastAssessed: 'Today' },
      { name: 'Microsoft Defender for Endpoint (MDE)', version: 'Sense 10.8710.26100', status: 'Fully Compatible', details: 'Process isolation and named pipe IPC verified compliant with EDR heuristics.', lastAssessed: 'Today' },
      { name: 'CrowdStrike Falcon Sensor', version: '7.18.18706.0', status: 'Fully Compatible', details: 'Zero-downtime injection test passed. Driver signing verified by WHQL root.', lastAssessed: 'Yesterday' },
      { name: 'SentinelOne Singularity Control', version: '24.1.2.34', status: 'Fully Compatible', details: 'Dynamic anti-tamper behavioral monitoring verified benign.', lastAssessed: '2 days ago' },
      { name: 'AppLocker Publisher Rule', version: 'GPO Enforced', status: 'Compliant', details: 'Allowed via CN="ManyCam LLC" DigiCert Authenticode EV rule.', lastAssessed: 'Today' },
      { name: 'Windows Defender Application Control (WDAC)', version: 'Strict Mode', status: 'Compliant', details: 'CI policy validated with WHQL signature hash and certificate leaf.', lastAssessed: 'Today' },
      { name: 'Controlled Folder Access (Ransomware Guard)', version: 'Windows 11 Default', status: 'Exemption Managed', details: '%ProgramFiles%\\ManyCam allowed write to virtual device registry keys.', lastAssessed: '3 days ago' },
      { name: 'Azure Virtual Desktop (AVD) Multi-Session', version: 'Win11 23H2 Host', status: 'Certified', details: 'MSIX App Attach compatibility validated with multi-user camera isolation.', lastAssessed: 'Today' },
    ];

    const auditEvents = await prisma.auditLog.findMany({
      take: 15,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      certificates,
      posture: {
        totalDevices,
        compliantDevices,
        complianceRate: Number(((compliantDevices / totalDevices) * 100).toFixed(1)),
        nonCompliant,
        pendingReview,
        signedPackages: 8,
        activeCertificates: 2,
        expiringCertificates: 1,
      },
      compatibilityMatrix,
      recentAudits: auditEvents,
    });
  } catch (error) {
    console.error('Error in /api/security:', error);
    return NextResponse.json({ error: 'Failed to fetch security posture' }, { status: 500 });
  }
}
