import { cookies } from 'next/headers';

import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { auth } from '../(auth)/auth';
import Script from 'next/script';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';
import { DataStreamProvider } from '@/components/data-stream-provider';

export const experimental_ppr = true;

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, cookieStore] = await Promise.all([auth(), cookies()]);
  const isCollapsed = cookieStore.get('sidebar:state')?.value !== 'true';

  const chatModelFromCookie = cookieStore.get('chat-model');

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js"
        strategy="beforeInteractive"
      />
      <DataStreamProvider>
        <SidebarProvider defaultOpen={!isCollapsed}>
          {chatModelFromCookie ? (
            <AppSidebar
              user={session?.user}
              session={session}
              selectedModelId={chatModelFromCookie.value}
            />
          ) : (
            <AppSidebar
              user={session?.user}
              session={session}
              selectedModelId={DEFAULT_CHAT_MODEL}
            />
          )}
          <SidebarInset>{children}</SidebarInset>
        </SidebarProvider>
      </DataStreamProvider>
    </>
  );
}
