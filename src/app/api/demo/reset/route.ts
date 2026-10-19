import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';

export async function POST() {
  return new Promise<Response>((resolve) => {
    const seedPath = path.join(process.cwd(), 'prisma', 'seed.js');
    exec(`node "${seedPath}"`, (error, stdout, stderr) => {
      if (error) {
        console.error('Error executing seed script:', error, stderr);
        resolve(NextResponse.json({ error: 'Failed to reset demo database' }, { status: 500 }));
      } else {
        console.log('Seed executed cleanly:', stdout);
        resolve(NextResponse.json({ success: true, message: 'Database reset to initial deterministic seed' }));
      }
    });
  });
}
