import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action, payload } = body;

    const device = await prisma.device.findUnique({ where: { id } });
    if (!device) {
      return NextResponse.json({ error: 'Device not found' }, { status: 404 });
    }

    let result: any = { success: true };

    if (action === 'checkin') {
      const updated = await prisma.device.update({
        where: { id },
        data: {
          lastSeenAt: new Date(),
          healthStatus: device.healthStatus === 'Offline' ? 'Healthy' : device.healthStatus,
        },
      });
      await prisma.diagnosticEvent.create({
        data: {
          deviceId: id,
          severity: 'Info',
          component: 'Update Agent',
          eventCode: 2008,
          message: `Heartbeat check-in received from endpoint ${device.hostname}. All policies synchronized.`,
          correlationId: `chk-${Date.now()}`,
        },
      });
      result = { message: 'Device check-in simulated successfully', device: updated };
    } else if (action === 'repair') {
      // Simulate msiexec /fa
      const updated = await prisma.device.update({
        where: { id },
        data: {
          cameraStatus: 'Healthy',
          healthStatus: 'Healthy',
          serviceStatus: 'Running',
        },
      });

      await prisma.diagnosticEvent.create({
        data: {
          deviceId: id,
          severity: 'Info',
          component: 'Windows Installer',
          eventCode: 1000,
          message: `Command executed: msiexec /fa {MANYCAM-PROD-CODE} /qn /L*v "%ProgramData%\\ManyCam\\repair.log". Re-registered Media Foundation virtual camera filter. Exit code: 0.`,
          correlationId: `rep-${Date.now()}`,
        },
      });

      await prisma.auditLog.create({
        data: {
          action: 'DEVICE_REPAIR_EXECUTED',
          resourceType: 'Device',
          resourceId: id,
          outcome: 'Success',
          correlationId: `rep-${Date.now()}`,
        },
      });

      result = { message: 'Virtual Camera components repaired (msiexec /fa)', device: updated };
    } else if (action === 'uninstall') {
      // Simulate msiexec /x
      const updated = await prisma.device.update({
        where: { id },
        data: {
          serviceStatus: 'Stopped',
          cameraStatus: 'Offline',
          healthStatus: 'Offline',
        },
      });

      await prisma.diagnosticEvent.create({
        data: {
          deviceId: id,
          severity: 'Warning',
          component: 'Windows Installer',
          eventCode: 1001,
          message: `Product uninstalled cleanly via msiexec /x {MANYCAM-PROD-CODE} /qn. Virtual Camera driver and background service deregistered.`,
          correlationId: `uninst-${Date.now()}`,
        },
      });

      result = { message: 'Clean uninstall executed', device: updated };
    } else if (action === 'diagnostics') {
      const diagLogs = [
        `[1/4] Checking Media Foundation registration in HKLM\\Software\\Classes\\CLSID... PASS`,
        `[2/4] Verifying Named Pipe IPC communication with ManyCamSvc.exe... ACTIVE`,
        `[3/4] Testing DirectShow virtual video capture filter binding... VALIDATED`,
        `[4/4] Hardware acceleration state: DirectML GPU fallback available (Arc Gen13)... OPTIMAL`,
      ];

      await prisma.diagnosticEvent.create({
        data: {
          deviceId: id,
          severity: 'Info',
          component: 'Virtual Camera',
          eventCode: 3001,
          message: `On-demand diagnostic completed: ${diagLogs.join(' | ')}`,
          correlationId: `diag-${Date.now()}`,
        },
      });

      result = {
        message: 'On-demand diagnostics completed with status: Healthy',
        logs: diagLogs,
      };
    } else if (action === 'changeChannel') {
      const newChannel = payload?.channel || 'Stable';
      const updated = await prisma.device.update({
        where: { id },
        data: { updateChannel: newChannel },
      });

      await prisma.auditLog.create({
        data: {
          action: 'UPDATE_CHANNEL_CHANGED',
          resourceType: 'Device',
          resourceId: id,
          afterJson: JSON.stringify({ channel: newChannel }),
          correlationId: `chn-${Date.now()}`,
        },
      });

      result = { message: `Update channel changed to ${newChannel}`, device: updated };
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in device action:', error);
    return NextResponse.json({ error: 'Action execution failed' }, { status: 500 });
  }
}
