import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Talenfy',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-white min-h-screen flex flex-col antialiased">


        {children}

      </body>
    </html>
  );
}
