import { useEffect } from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { AppRouter } from '@/router';
import { useDocumentStore } from '@/stores/document-store';
import '@/index.postcss';

function App() {
  const loadInitialData = useDocumentStore((state) => state.loadInitialData);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="annotator-ui-theme">
      <div className="min-h-screen bg-[#0f1419] font-sans antialiased">
        <AppRouter />
        <Toaster
          theme="dark"
          className="toaster group"
          toastOptions={{
            classNames: {
              toast: "group toast group-[.toaster]:bg-[#1a1f2e] group-[.toaster]:text-gray-200 group-[.toaster]:border-gray-700",
            },
          }}
        />
      </div>
    </ThemeProvider>
  );
}

export default App;
