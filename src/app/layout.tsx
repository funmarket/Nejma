import type {Metadata} from 'next';
import './globals.css';
import { DevappProvider } from '@/components/providers/devapp-provider';
import { ToastProvider } from '@/components/providers/toast-provider';
import { AuthHandler } from '@/components/auth/auth-handler';

export const metadata: Metadata = {
  title: 'Firebase NEJMA',
  description: 'The next big thing in talent!',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background text-foreground">
        <DevappProvider>
            <ToastProvider>
              <AuthHandler>
                {children}
              </AuthHandler>
            </ToastProvider>
        </DevappProvider>
      </body>
    </html>
  );
}
