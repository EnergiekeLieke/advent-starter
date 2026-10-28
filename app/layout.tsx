import type { Metadata, Viewport } from 'next';
import { laadConfig } from '@/lib/configLaden';
import './globals.css';

export const viewport: Viewport = { width: 'device-width', initialScale: 1 };

export async function generateMetadata(): Promise<Metadata> {
  try {
    const config = await laadConfig();
    return { title: config.titel, description: config.ondertitel || undefined };
  } catch {
    // Een fout hier mag de pagina niet blokkeren, de foutpagina legt het uit
    return { title: 'Adventkalender' };
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  );
}
