import type { Metadata } from 'next';
import PortalFilm from '@/components/prototype/PortalFilm';
import ContactSection from '@/components/site/ContactSection';
import SiteFooter from '@/components/site/SiteFooter';
import SiteHeader from '@/components/site/SiteHeader';
import SiteSections from '@/components/site/SiteSections';

export const metadata: Metadata = {
  title: "NeXa'yı tanıyın — Kerinti",
  description: 'NeXa: masadan siparişten yönetime, restoran operasyonu tek sistemde. Bir Kerinti ürünü.',
};

/**
 * NeXa'yı tanıyın: film Act 1 (Chapters 1–3, up to NeXa on the table), the standard site sections, film Act 2
 * (Kerinti → team → final QR and CTA), then the page continues as a normal document — İletişim
 * (#iletisim) rising over the film's last frame, and the footer.
 */
export default function NexaPage() {
  return (
    <>
      <SiteHeader page="nexa" />
      <main>
        <PortalFilm>
          <SiteSections />
        </PortalFilm>
        <ContactSection />
      </main>
      <SiteFooter />
    </>
  );
}
