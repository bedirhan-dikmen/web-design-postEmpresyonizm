import { SITE } from '@/lib/site/config';

/**
 * The homepage after the hero: an ordinary, short page on the film's navy — who Kerinti is, its mission and
 * vision, and the product (with the way into the NeXa story). Kept brief on purpose: a few scrolls to the
 * contact section.
 *
 * Copy is a draft (kerinti.com.tr has no company text yet): it stays at the level the film's copy already
 * claims — Kerinti builds NeXa, analyses real operational needs and turns them into usable, maintainable
 * software. Replace freely.
 */

const ABOUT_FACTS = [
  ['Merkez', 'Giresun Teknopark'],
  ['Odak', 'Restoran ve yeme-içme operasyonu'],
  ['Ürün', 'NeXa — masadan yönetime tek sistem'],
] as const;

const PILLARS = [
  {
    title: 'Misyonumuz',
    text: 'İşletmelerin günlük operasyonunu sadeleştiren, kolay öğrenilen ve uzun süre güvenle kullanılabilen yazılımlar geliştirmek.',
  },
  {
    title: 'Vizyonumuz',
    text: 'Yeme-içme sektörünün dijital dönüşümünde işletmelerin ilk akla gelen, yerli ve sürdürülebilir çözüm ortağı olmak.',
  },
  {
    title: 'Yaklaşımımız',
    text: 'Sahadaki işi yerinde anlarız, sade tasarlarız, işletmeyle birlikte geliştiririz ve ürünü yaşadığı sürece destekleriz.',
  },
] as const;

const NEXA_POINTS = [
  ['QR ile sipariş', 'misafir menüyü masadan açar, siparişini kendisi verir.'],
  ['Mutfaktan kasaya', 'sipariş bir kez girilir, kimse yeniden yazmaz.'],
  ['Anlık takip', 'işletmede olanı, olduğu anda görün.'],
] as const;

/** the Kerinti mark: the film's QR finder core, small */
function Mark() {
  return (
    <span aria-hidden className="relative inline-block h-3.5 w-3.5 shrink-0 shadow-[inset_0_0_0_2px_#d80017]">
      <span className="absolute left-[4px] top-[4px] h-1.5 w-1.5 bg-[#d80017]" />
    </span>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="eyebrow flex items-center gap-2.5 text-xs text-[#9cc7e0] sm:text-sm">
      <Mark />
      {children}
    </p>
  );
}

export default function HomeSections() {
  return (
    <div className="relative z-20 bg-[#050b1e]">
      {/* ── Hakkımızda ─────────────────────────────────────────── */}
      <section id="hakkimizda" aria-labelledby="hakkimizda-baslik" className="page-gutter scroll-mt-16 py-20 lg:py-28">
        <div className="mx-auto grid max-w-[1560px] gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-20">
          <div>
            <Eyebrow>Hakkımızda</Eyebrow>
            <h2 id="hakkimizda-baslik" className="display mt-4 text-4xl leading-tight text-[#eaf0f7] sm:text-5xl">
              İşletmenin ihtiyacından ürüne.
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[#b9cbe3]">
              {SITE.name} Yazılım, restoran ve yeme-içme işletmelerinin günlük operasyonlarını teknolojiyle daha sade,
              hızlı ve yönetilebilir hâle getiren çözümler geliştirir.
            </p>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[#b9cbe3]">
              Tasarım, yazılım ve işletme süreçlerini aynı ürün yaklaşımında bir araya getiriyoruz: önce operasyonu yerinde
              anlıyor, sonra onu herkesin kolayca kullanabileceği sistemlere dönüştürüyoruz.
            </p>
          </div>
          <dl className="self-end border-l border-white/10">
            {ABOUT_FACTS.map(([k, v]) => (
              <div key={k} className="border-b border-white/10 py-5 pl-6 last:border-b-0">
                <dt className="text-sm font-semibold text-[#9cc7e0]">{k}</dt>
                <dd className="mt-1 text-lg text-[#eaf0f7]">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── Misyon & Vizyon ────────────────────────────────────── */}
      <section id="misyon-vizyon" aria-labelledby="misyon-baslik" className="page-gutter scroll-mt-16 py-20 lg:py-24">
        <div className="mx-auto max-w-[1560px]">
          <Eyebrow>Misyon & Vizyon</Eyebrow>
          <h2 id="misyon-baslik" className="display mt-4 max-w-2xl text-4xl leading-tight text-[#eaf0f7] sm:text-5xl">
            Neden varız, nereye gidiyoruz.
          </h2>
          <ul className="mt-12 grid gap-5 md:grid-cols-3">
            {PILLARS.map((p) => (
              <li key={p.title} className="rounded-2xl bg-white/[0.035] p-7 ring-1 ring-white/10">
                <h3 className="text-lg font-semibold text-[#eaf0f7]">{p.title}</h3>
                <p className="mt-3 leading-relaxed text-[#b9cbe3]">{p.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Ürünümüz: NeXa ─────────────────────────────────────── */}
      <section id="urunumuz" aria-labelledby="urun-baslik" className="page-gutter scroll-mt-16 py-20 lg:py-24">
        <div className="mx-auto grid max-w-[1560px] items-center gap-10 overflow-hidden rounded-3xl bg-[#0b1733] ring-1 ring-white/10 lg:grid-cols-2 lg:gap-0">
          {/* the restaurant from the NeXa story's opening */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/nexa-scene.webp"
            alt="NeXa hikâyesinden: sabah ışığında restoran, masada NeXa QR menü kartı"
            width={1440}
            height={900}
            loading="lazy"
            className="h-full min-h-[260px] w-full object-cover"
          />
          <div className="px-7 pb-10 sm:px-10 lg:py-14">
            <Eyebrow>Ürünümüz · {SITE.product}</Eyebrow>
            <h2 id="urun-baslik" className="display mt-4 text-3xl leading-tight text-[#eaf0f7] sm:text-4xl">
              Her masa, her sipariş, her ödeme tek sistemde.
            </h2>
            <ul className="mt-6 space-y-3 text-[#b9cbe3]">
              {NEXA_POINTS.map(([k, v]) => (
                <li key={k} className="leading-relaxed">
                  <strong className="font-semibold text-[#eaf0f7]">{k}</strong> — {v}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
              <a href="/nexa" className="cta-primary inline-flex items-center rounded-xl px-6 py-3.5 text-base font-bold text-white">
                NeXa&apos;yı tanıyın
              </a>
              <span className="text-sm text-[#8ea3c2]">Hikâyesini kaydırarak izleyin.</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
