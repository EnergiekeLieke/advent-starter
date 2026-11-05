import type { Metadata, Viewport } from 'next';
import { Lato, Libre_Baskerville, Poppins } from 'next/font/google';
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

// De lettertypes worden bij het bouwen binnengehaald en vanaf je eigen site getoond. Bezoekers maken dus geen contact met Google.
// Het bestand van een lettertype wordt pas opgehaald als het ergens op de pagina gebruikt wordt.
const lato = Lato({ subsets: ['latin', 'latin-ext'], weight: ['400', '700'], style: ['normal', 'italic'], variable: '--font-lato', display: 'swap', preload: false });
const baskerville = Libre_Baskerville({ subsets: ['latin', 'latin-ext'], weight: ['400', '700'], style: ['normal', 'italic'], variable: '--font-baskerville', display: 'swap', preload: false });
const poppins = Poppins({ subsets: ['latin', 'latin-ext'], weight: ['400', '600', '700'], style: ['normal', 'italic'], variable: '--font-poppins', display: 'swap', preload: false });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" className={`${lato.variable} ${baskerville.variable} ${poppins.variable}`}>
      <body>{children}</body>
    </html>
  );
}
