import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { DemoTour } from '@/components/DemoTour';
import { CommandMenu } from '@/components/CommandMenu';
import { NotificationDrawer } from '@/components/NotificationDrawer';
import { HelpModal } from '@/components/HelpModal';
import { ResetDemoDialog } from '@/components/ResetDemoDialog';

export const metadata: Metadata = {
  title: 'ManyCam Enterprise Control Center | Windows Virtual Camera Fleet Administration',
  description: 'Enterprise fleet management, deployment, policy administration, and diagnostics for Windows Virtual Camera applications.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-[#182230] antialiased flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content Workspace */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-white">
          <Header />
          <main className="flex-1 overflow-y-auto bg-white p-6 2xl:p-8">
            <div className="max-w-[1720px] mx-auto w-full">
              {children}
            </div>
          </main>
        </div>

        {/* Global Overlays & Modals */}
        <DemoTour />
        <CommandMenu />
        <NotificationDrawer />
        <HelpModal />
        <ResetDemoDialog />
      </body>
    </html>
  );
}
