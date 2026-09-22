import type { Metadata } from 'next';
import { Fraunces, Inter_Tight } from 'next/font/google';
import './globals.css';

const display = Fraunces({ subsets: ['latin', 'latin-ext'], variable: '--font-display', axes: ['SOFT', 'opsz'] });
const sans = Inter_Tight({ subsets: ['latin', 'latin-ext'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Kerinti Yazılım — İşletmelerin işini sadeleştiren yazılımlar',
  description: 'Kerinti, restoran ve yeme-içme işletmeleri için dijital operasyon çözümleri geliştirir. Ürünümüz NeXa: masadan siparişten yönetime tek sistem.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${display.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
