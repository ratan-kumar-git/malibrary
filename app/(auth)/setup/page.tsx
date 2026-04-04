'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LibrarySetupForm } from '@/components/setup/LibrarySetupForm';
import { useLibraryStore } from '@/lib/store';
import { Loader2 } from 'lucide-react';

const SetupPage = () => {
  const router = useRouter();
  const { data, isLoading, fetchAll } = useLibraryStore();
  const [isReady, setIsReady] = useState(false);

  // Handle Mounting and Initial Fetch
  useEffect(() => {
    const init = async () => {
      if (!data) {
        try {
          await fetchAll();
        } catch (err) {
          console.log('No existing library found, proceeding to setup.', err);
        }
      }
      setIsReady(true);
    };

    init();
  }, [data, fetchAll]);

  // Optimized Redirect Logic
  useEffect(() => {
    if (isReady && !isLoading && data) {
      router.replace('/settings');
    }
  }, [isReady, isLoading, data, router]);

  // 3. Loading State
  if (!isReady || (isLoading && !data)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">
          Initializing workspace...
        </p>
      </div>
    );
  }

  // 4. Prevent rendering the form if we are about to redirect
  if (data) return null;

  return (
    <main className="w-full min-h-screen bg-background">
      <div className="max-w-3xl mt-10 mx-auto p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Welcome to Library Manager
          </h1>
          <p className="text-muted-foreground">
            Let&apos;s set up your library information to get started
          </p>
        </div>

        {/* Setup Form */}
        <LibrarySetupForm />
      </div>
    </main>
  );
};

export default SetupPage;