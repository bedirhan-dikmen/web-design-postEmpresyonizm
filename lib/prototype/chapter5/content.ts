/**
 * Chapter 5 copy (Turkish) and the call-to-action configuration.
 *
 * Four blocks, one per beat, shown only on a settled frame (see chapter5/timeline.ts → text()).
 * Claims stay at the level the brief allows: Kerinti builds NeXa, analyses real operational needs and
 * turns them into usable, maintainable software. No certifications, client counts or integrations are claimed.
 */

export type Beat5Key = 't5Kerinti' | 't5Company' | 't5Team' | 't5Cta';

export interface Beat5Text {
  key: Beat5Key;
  eyebrow: string;
  heading: string;
  line: string;
  box: { x: number; y: number; w: number };
}

export const BEAT5_TEXTS: Beat5Text[] = [
  {
    key: 't5Kerinti',
    eyebrow: "NEXA'NIN ARKASINDA",
    heading: 'Kerinti.',
    line: 'Restoranların günlük operasyonlarını teknolojiyle daha sade, hızlı ve yönetilebilir hâle getiren çözümler geliştiriyoruz.',
    box: { x: 280, y: 250, w: 600 },
  },
  {
    key: 't5Company',
    eyebrow: 'KERİNTİ',
    heading: 'İşletmenin ihtiyacından ürüne.',
    line: 'Operasyonun gerçek ihtiyaçlarını analiz ediyor, kullanılabilir ve sürdürülebilir yazılım çözümlerine dönüştürüyoruz.',
    box: { x: 290, y: 250, w: 560 },
  },
  {
    key: 't5Team',
    eyebrow: 'EKİP',
    heading: 'Ürünü, operasyonu anlayarak geliştiriyoruz.',
    line: 'Tasarım, yazılım ve işletme süreçlerini aynı ürün yaklaşımında bir araya getiriyoruz.',
    box: { x: 290, y: 175, w: 580 },
  },
  {
    key: 't5Cta',
    eyebrow: "NEXA'YI KEŞFEDİN",
    heading: 'Restoranınızın operasyonunu tek yerden yönetin.',
    line: "NeXa'yı işletmenizde nasıl kullanabileceğinizi birlikte konuşalım.",
    box: { x: 290, y: 260, w: 600 },
  },
];

/**
 * The one call to action of the film. The button and the final QR lead to the same place: the homepage's
 * contact section (#iletisim). The QR's full URL comes from lib/site/config.ts → qrTarget().
 */
export const CTA = {
  label: 'İletişime Geç',
  qrHint: 'Ya da QR kodu telefonunuzla okutun',
};
