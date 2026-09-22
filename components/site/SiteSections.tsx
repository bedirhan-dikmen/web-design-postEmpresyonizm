/**
 * The standard site between the film's two acts (see lib/prototype/acts.ts).
 *
 *   bridge   the restaurant's last frame ("NeXa Restoran Sipariş Yönetimi") fades into the page's navy
 *   cover    [data-film-cover] — solid navy, ordinary sections. While it fills the viewport the film does not
 *            render, and at its middle the playhead jumps to Act 2 (Kerinti). Keep it at least one viewport
 *            taller than the screen (min-h below) so that jump always happens fully covered.
 *   reveal   navy thins back to the film: the settled Kerinti night frame is already there underneath
 *
 * Replace the placeholder sections with the real ones; keep the bridge, the cover wrapper and the reveal.
 */

const PLACEHOLDERS = [
  { id: 'bolum-1', title: 'Bölüm 1' },
  { id: 'bolum-2', title: 'Bölüm 2' },
  { id: 'bolum-3', title: 'Bölüm 3' },
];

export default function SiteSections() {
  return (
    <div className="relative z-20">
      {/* bridge: the film settles into the page (reaches full navy at 80%, so there is always a fully covered band) */}
      <div
        aria-hidden
        className="flex h-[60vh] items-end justify-center pb-[8vh]"
        style={{ background: 'linear-gradient(to bottom, rgba(5,11,30,0) 0%, rgba(5,11,30,0.85) 45%, #050b1e 80%)' }}
      >
        <span className="eyebrow flex items-center gap-2.5 text-xs text-[#9cc7e0] opacity-60">
          <span className="relative inline-block h-3.5 w-3.5 shadow-[inset_0_0_0_2px_#d80017]">
            <span className="absolute left-[4px] top-[4px] h-1.5 w-1.5 bg-[#d80017]" />
          </span>
          NeXa
        </span>
      </div>

      {/* -mt-px / -mb-px: overlap the gradients by a pixel, so no sub-pixel seam lets the film show through */}
      <div data-film-cover className="page-gutter -my-px min-h-[160vh] bg-[#050b1e]">
        {PLACEHOLDERS.map((p) => (
          <section key={p.id} id={p.id} aria-label={p.title} className="mx-auto flex min-h-[80vh] max-w-[1560px] items-center py-16">
            <div className="w-full rounded-2xl border border-dashed border-[#9cc7e0]/30 p-10 text-center text-[#9cc7e0]/70">
              <p className="eyebrow text-xs">Tasarım alanı</p>
              <p className="display mt-3 text-3xl text-[#eaf0f7]/80">{p.title}</p>
              <p className="mt-2 text-sm">components/site/SiteSections.tsx</p>
            </div>
          </section>
        ))}
      </div>

      {/* reveal: the navy thins, and the Kerinti night is already settled underneath */}
      <div
        aria-hidden
        className="h-[60vh]"
        style={{ background: 'linear-gradient(to bottom, #050b1e 0%, rgba(5,11,30,0.85) 35%, rgba(5,11,30,0) 100%)' }}
      />
    </div>
  );
}
