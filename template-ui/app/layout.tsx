import type { Metadata } from 'next';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'Template Automation',
  description: 'Generate PDFs from templates',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#1e1e2f] text-[#e0e0e0] min-h-screen">
        {children}
      </body>
    </html>
  );
} 