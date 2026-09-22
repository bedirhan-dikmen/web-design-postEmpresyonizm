import HomeHero from '@/components/home/HomeHero';
import HomeSections from '@/components/home/HomeSections';
import ContactSection from '@/components/site/ContactSection';
import SiteFooter from '@/components/site/SiteFooter';
import SiteHeader from '@/components/site/SiteHeader';

/**
 * The homepage: Kerinti itself. The film's opening world greets the visitor and its squares assemble the
 * Kerinti logo; then a short, ordinary page — about, mission & vision, the product — and contact.
 * The NeXa story (the scroll film) lives on /nexa.
 */
export default function Page() {
  return (
    <>
      <SiteHeader page="home" />
      <main>
        <HomeHero />
        <HomeSections />
        <ContactSection bridge={false} />
      </main>
      <SiteFooter />
    </>
  );
}
