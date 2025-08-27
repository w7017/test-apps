import AppLayout from '@/components/app-layout';
import { ClientProvider } from '@/contexts/client-context';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClientProvider>
      <AppLayout>{children}</AppLayout>
    </ClientProvider>
  );
}
