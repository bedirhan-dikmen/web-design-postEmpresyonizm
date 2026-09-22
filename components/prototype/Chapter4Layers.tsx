'use client';

import { layerTransform, type Camera, type FilmState, type LayerXf, type Viewport } from '@/lib/prototype/camera';
import { PLATES, PORTAL, fitPlate } from '@/lib/prototype/sceneConfig';
import { BEAT_TEXTS, CLOSER, MENU_DISHES, ORDER, PRICES, STATE_STYLE, TABLE_STATES, orderTotal } from '@/lib/prototype/chapter4/content';
import { CHART, KDS, LEDGER, MINI_CHART } from '@/lib/prototype/chapter4/formations';
import { COVER, PHYSICAL, PORTALS, type FrameStyle, type PortalDef } from '@/lib/prototype/chapter4/portals';
import { orientOf, project, stageFor, type Stage } from '@/lib/prototype/chapter4/stage3d';
import { CH4, SHOT, pathAt } from '@/lib/prototype/chapter4/timeline';
import G from '@/lib/prototype/chapter4/geometry.json';

/**
 * Chapter 4 DOM layers (Phase 4.9 — one restaurant, one portal):
 *   <Chapter4World>   world-space layers inside World B (figures, devices with product UI, light, foreground).
 *                     Rendered twice: once in the main stage, once inside the management portal's window.
 *   <Chapter4Portal>  the ONE portal window: a clipped second view of the world, seen through the closed
 *                     table's "Hesap kapandı" tile. Every other Chapter 4 transition is camera travel.
 *   <Chapter4Surface> screen-space surfaces (the phone, the kitchen slip, the adisyon, the bill) and the
 *                     large management panel of the final frame, linked down to the rooms it describes
 *   <Chapter4Text>    stage copy inside the design-space text frame
 *   <Chapter4Grade>   time-of-day grade, vignette, threshold bloom
 *
 * Story state comes from FilmState (scroll); ambient life comes from the ticker time.
 * Debug: ?hideText=1 hides stage copy; ?hideText=2 also hides all in-world / surface UI text.
 */

const PROPS = '/prototype-assets/04-journey/props';
const SPR = '/prototype-assets/04-journey/sprites';
const PAPER: React.CSSProperties = {
  backgroundColor: '#f6eedc',
  backgroundImage: `url(${PROPS}/paper.png)`,
  borderRadius: 6,
  boxShadow: '0 10px 22px rgba(40, 24, 10, 0.35), 0 1px 0 rgba(255,255,255,0.6) inset',
};
const INK = '#1f3263';
const GOLD = '#e8c66a';
const SCREEN_TEXT = 'font-sans text-[#e8f1ee]';
const lira = (v: number) => `₺${v}`;

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const smooth = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const win = (v: number, a: number, b: number, fade = 0.15) => clamp01((v - a) / fade) * clamp01((b - v) / fade);
const pulse = (time: number, speed: number, phase = 0) => 0.5 + 0.5 * Math.sin(time * speed + phase);

// ------------------------------------------------------------------ world placements (anchors from geometry.json)

/** figures: sprite size, world anchor (bottom centre), depth, scale (negative = mirrored) */
const FIG = {
  guest: { w: 380, h: 560, at: G.dining.guestSeat, depth: G.dining.depth, s: 0.84 },
  chef: { w: 340, h: 470, at: [G.kitchen.chef[0], G.kitchen.chef[1] + 2], depth: 0, s: 1 },
  cook: { w: 340, h: 470, at: [3760, G.kitchen.chef[1] + 2], depth: 0, s: -0.94 },
  cashier: { w: 320, h: 380, at: [G.service.cashier[0], G.service.cashier[1] - 8], depth: 0, s: -1 },
  waiter: { w: 300, h: 560, at: G.service.waiter, depth: 0, s: 1 },
  keeper: { w: 300, h: 560, at: G.storeroom.keeper, depth: 0, s: 1 },
  manager: { w: 420, h: 520, at: G.office.manager, depth: 0, s: 1 },
} as const;

const CS = G.service.cashierScreen; // [cx, cy, w, h] of the cashier screen glass
const CASHIER_K = CS[2] / 600; // the monitor sprite's glass is 600 × 360
const DEV = {
  printer: { w: 220, h: 150, c: [G.kitchen.printer[0], G.kitchen.printerShelf[2] - 65] },
  kds: { w: 640, h: 390, c: G.kitchen.kdsCenter },
  cashierMon: { w: 680, h: 520, c: [CS[0], CS[1] + 60 * CASHIER_K] },
  monitor: { w: 680, h: 520, c: [G.office.monitorCenter[0], G.office.monitorCenter[1] + 60] },
  aux: { w: 300, h: 200, c: [G.office.monitorCenter[0] + 460, G.office.monitorCenter[1] + 130] },
  tablet: { w: 150, h: 210, c: G.storeroom.tablet },
} as const;

/** cashier screen UI rows (in the 600 × 360 glass box) */
const ROW = { x: 14, w: 356, y0: 58, h: 60, gap: 8 };
const rowY = (i: number) => ROW.y0 + i * (ROW.h + ROW.gap);
/** world point of the Masa 7 row on the cashier screen (where the order leaves for the kitchen) */
const ROW7 = [CS[0] - CS[2] / 2 + (ROW.x + ROW.w * 0.7) * CASHIER_K, CS[1] - CS[3] / 2 + (rowY(2) + 30) * CASHIER_K];
const PASS_WIN = [(G.kitchen.passWindow[0] + G.kitchen.passWindow[1]) / 2, (G.kitchen.passWindow[2] + G.kitchen.passWindow[3]) / 2];

// ------------------------------------------------------------------ JSX helpers

function Prop({ id, w, h, children, style, label }: { id: string; w: number; h: number; children?: React.ReactNode; style?: React.CSSProperties; label?: boolean }) {
  return (
    <div
      data-ch4
      data-prop={id}
      data-ui-label={label ? '1' : undefined}
      className="pointer-events-none absolute left-0 top-0"
      style={{ width: w, height: h, visibility: 'hidden', transformOrigin: '50% 50%', ...style }}
    >
      {children}
    </div>
  );
}

function Img({ src, w, h, pose, style, dir = SPR, ext = 'webp' }: { src: string; w: number; h: number; pose?: number; style?: React.CSSProperties; dir?: string; ext?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      data-lazy-src={`${dir}/${src}.${ext}`}
      data-pose={pose}
      alt=""
      width={w}
      height={h}
      draggable={false}
      className="absolute left-0 top-0 block max-w-none select-none"
      style={{ width: w, height: h, opacity: pose ? 0 : 1, ...style }}
    />
  );
}

function Figure({ id, poses, style }: { id: keyof typeof FIG; poses: string[]; style?: React.CSSProperties }) {
  const { w, h } = FIG[id];
  return (
    <Prop id={`fig-${id}`} w={w} h={h} style={style}>
      <div data-breathe className="absolute inset-0" style={{ transformOrigin: '50% 100%' }}>
        {poses.map((p, i) => (
          <Img key={p} src={p} w={w} h={h} pose={i} />
        ))}
      </div>
    </Prop>
  );
}

function Glow({ id, w, h, color }: { id: string; w: number; h: number; color: string }) {
  return <Prop id={id} w={w} h={h} style={{ background: `radial-gradient(ellipse at 50% 50%, ${color}, rgba(0,0,0,0) 70%)`, mixBlendMode: 'screen' }} />;
}

/** text that ?hideText=2 removes */
function T({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <span data-ui-text className={className} style={style}>
      {children}
    </span>
  );
}

function Chip({ children, bg, fg = '#10262a', className = '' }: { children: React.ReactNode; bg: string; fg?: string; className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-[6px] px-[8px] py-[2px] font-sans font-bold ${className}`} style={{ background: bg, color: fg }}>
      <T>{children}</T>
    </span>
  );
}
/** Masa 7's visual identifier: a gold "7" tile that follows the order through every surface (kept in ?hideText=2) */
function Seven({ size = 22, className = '' }: { size?: number; className?: string }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-[22%] font-sans font-extrabold leading-none ${className}`}
      style={{ width: size * 1.25, height: size * 1.25, fontSize: size, background: GOLD, color: '#10262a', boxShadow: '0 0 0 2px rgba(16,38,42,0.25)' }}
    >
      7
    </span>
  );
}

const chipHTML = (text: string, bg: string, fg: string, size: number) =>
  `<span class="inline-flex items-center rounded-[6px] px-[8px] py-[2px] font-sans font-bold" style="font-size:${size}px;background:${bg};color:${fg}"><span data-ui-text>${text}</span></span>`;

/** torn thermal-paper edge (top and bottom), shared by the printer slip and the kitchen ticket */
const TORN =
  'polygon(0% 1.6%, 6% 0.4%, 13% 1.8%, 20% 0.5%, 27% 1.9%, 34% 0.6%, 41% 1.8%, 48% 0.4%, 55% 1.9%, 62% 0.6%, 69% 1.8%, 76% 0.5%, 83% 1.9%, 90% 0.6%, 97% 1.8%, 100% 0.8%, 100% 98.4%, 94% 99.6%, 87% 98.2%, 80% 99.5%, 73% 98.1%, 66% 99.4%, 59% 98.2%, 52% 99.6%, 45% 98.1%, 38% 99.4%, 31% 98.2%, 24% 99.5%, 17% 98.1%, 10% 99.4%, 3% 98.2%, 0% 99.2%)';

const dishIcon = (i: number, size: number): React.CSSProperties => ({
  width: size,
  height: size,
  borderRadius: '50%',
  flexShrink: 0,
  backgroundImage: `url(${PROPS}/dishes.png)`,
  backgroundSize: `${size * 6}px ${size}px`,
  backgroundPosition: `-${i * size}px 0`,
});

function Spark({ id }: { id: string }) {
  return (
    <Prop id={id} w={120} h={120}>
      <div className="absolute inset-0 rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,246,214,1) 0%, rgba(255,214,120,0.85) 18%, rgba(232,198,106,0.35) 42%, rgba(232,198,106,0) 70%)', mixBlendMode: 'screen' }} />
    </Prop>
  );
}

const [TKW, TKH] = G.ticket.size;
/**
 * Phase 4.10: the ORDER TICKET — the physical object the camera follows from the till to the kitchen. A torn
 * thermal slip carrying the whole order: table, time, items and the guest's note. The gold "7" stays as a
 * secondary mark next to MASA; the paper is the protagonist.
 */
function OrderTicket() {
  const rule = { background: 'repeating-linear-gradient(90deg, #b9a98f 0 8px, transparent 8px 13px)' };
  return (
    <Prop id="ticket" w={TKW} h={TKH} style={{ ...PAPER, borderRadius: 0, clipPath: TORN }}>
      <div className="px-[16px] pt-[14px] font-mono text-[#2f2a22]">
        <div className="flex items-center justify-between text-[12px] tracking-[0.24em] text-[#8a5a31]"><T>MUTFAK</T><T>{ORDER.time}</T></div>
        <div className="mt-[6px] h-[2px]" style={rule} />
        <div className="mt-[8px] flex items-center gap-[8px]"><T className="text-[40px] font-bold leading-none tracking-[-0.01em]">MASA</T><Seven size={30} /></div>
        <div className="mt-[8px] h-[2px]" style={rule} />
        {ORDER.items.map((d) => (
          <div key={d} className="mt-[6px] text-[20px] font-bold leading-[24px]"><T>1 × {MENU_DISHES[d]}</T></div>
        ))}
        <div className="mt-[10px] border-l-[5px] border-[#e8c66a] px-[7px] py-[4px] text-[16px] font-bold leading-[20px]" style={{ background: 'rgba(232,198,106,0.38)' }}>
          <T>Not: {ORDER.note}</T>
        </div>
        <div className="mt-[10px] text-[11px] tracking-[0.12em] text-[#6d6252]"><T>QR · masadan geldi</T></div>
      </div>
    </Prop>
  );
}

/** the extra order's own small ticket (counter → the kitchen pass) */
function ExtraTicket() {
  return (
    <Prop id="ticketX" w={170} h={150} style={{ ...PAPER, borderRadius: 0, clipPath: TORN }}>
      <div className="px-[14px] pt-[12px] font-mono text-[#2f2a22]">
        <div className="flex items-center justify-between text-[11px] tracking-[0.22em] text-[#8a5a31]"><T>EK SİPARİŞ</T></div>
        <div className="mt-[6px] flex items-center gap-[6px]"><T className="text-[30px] font-bold leading-none">MASA</T><Seven size={22} /></div>
        <div className="mt-[10px] border-l-[5px] border-[#e8c66a] px-[6px] py-[3px] text-[19px] font-bold" style={{ background: 'rgba(232,198,106,0.38)' }}>
          <T>+ 1 × {MENU_DISHES[ORDER.extra]}</T>
        </div>
      </div>
    </Prop>
  );
}

// ------------------------------------------------------------------ world

export function Chapter4World({ inner = false }: { inner?: boolean }) {
  const kdsCardTop = DEV.kds.h / 2 + KDS.cardY - KDS.cardH / 2;
  const mon = { x: 40, y: 20, w: 600, h: 360 };
  return (
    <div data-ch4 data-ch4-world={inner ? 'inner' : 'main'} lang="tr" className="pointer-events-none absolute inset-0">
      {/* light */}
      {G.kitchen.heatLamps.map((x, i) => (
        <Glow key={x} id={`heat${i}`} w={300} h={200} color="rgba(255,170,80,0.75)" />
      ))}
      <Glow id="kdsGlow" w={900} h={560} color="rgba(120,220,210,0.32)" />
      <Glow id="cashierGlow" w={760} h={520} color="rgba(130,210,220,0.3)" />
      <Prop id="beamService" w={900} h={1100} style={{ background: 'linear-gradient(200deg, rgba(220,235,245,0.5), rgba(255,230,190,0) 75%)', clipPath: 'polygon(58% 0%, 100% 0%, 62% 100%, 0% 100%)', mixBlendMode: 'screen' }} />
      <Glow id="lampGlow" w={520} h={360} color="rgba(255,205,130,0.6)" />
      <Glow id="bulbGlow" w={1100} h={900} color="rgba(255,190,110,0.42)" />
      <Prop id="beamOffice" w={1500} h={1000} style={{ background: 'linear-gradient(160deg, rgba(255,190,120,0.55), rgba(255,170,110,0) 80%)', clipPath: 'polygon(0% 0%, 22% 0%, 100% 100%, 55% 100%)', mixBlendMode: 'screen' }} />
      <Glow id="monitorGlow" w={1000} h={640} color="rgba(130,200,220,0.3)" />
      <Glow id="deskLampGlow" w={420} h={300} color="rgba(255,210,140,0.65)" />
      <Glow id="hatchGlow" w={420} h={360} color="rgba(255,200,120,0.6)" />
      <Glow id="passGlow" w={380} h={420} color="rgba(255,196,110,0.7)" />
      <Glow id="counterPool" w={1300} h={520} color="rgba(255,196,120,0.34)" />
      <Glow id="kitchenPool" w={1500} h={700} color="rgba(255,176,96,0.3)" />

      {/* sky */}
      <Prop id="cloudA" w={1000} h={260}><Img src="cloud-a" w={1000} h={260} /></Prop>
      <Prop id="cloudB" w={760} h={200}><Img src="cloud-b" w={760} h={200} /></Prop>
      <Prop id="stringLights" w={3800} h={40}>
        {Array.from({ length: 38 }, (_, i) => (
          <span key={i} data-bulb={i} className="absolute top-[14px] h-[12px] w-[12px] rounded-full" style={{ left: i * 100 + 44, background: '#ffd98f', boxShadow: '0 0 14px 4px rgba(255,200,120,0.7)' }} />
        ))}
      </Prop>

      {/* figures */}
      <Figure id="cook" poses={['chef-work']} style={{ filter: 'brightness(0.78) saturate(0.85)' }} />
      <Figure id="waiter" poses={['waiter-idle', 'waiter-walk-a', 'waiter-walk-b']} />
      <Figure id="guest" poses={['guest-rest', 'guest-reach']} />
      <Figure id="chef" poses={['chef-work', 'chef-look', 'chef-pass']} />
      <Figure id="cashier" poses={['cashier-idle', 'cashier-hand']} />
      <Figure id="keeper" poses={['keeper']} />
      <Figure id="manager" poses={['manager-idle', 'manager-lean']} />

      {/* ── kitchen: printed slip, printer, KDS, stove, plate to the hatch ───────────────── */}
      <Prop id="slip" w={120} h={170} style={{ ...PAPER, borderRadius: 0, clipPath: TORN }}>
        <div className="px-[9px] pt-[7px] font-mono text-[11px] leading-[15px] text-[#3b3328]">
          <div className="flex items-center justify-between text-[9px] tracking-[0.2em] text-[#8a7a66]"><T>MUTFAK</T><T>{ORDER.time}</T></div>
          <div className="mt-[3px] flex items-center gap-[4px] text-[15px] font-bold tracking-[0.06em]"><T>MASA</T><Seven size={11} /></div>
          <div className="mt-[4px] h-[2px]" style={{ background: 'repeating-linear-gradient(90deg, #b9a98f 0 6px, transparent 6px 10px)' }} />
          <div className="mt-[3px]"><T>1 × {MENU_DISHES[ORDER.items[0]]}</T></div>
          <div><T>1 × {MENU_DISHES[ORDER.items[1]]}</T></div>
          <div className="mt-[4px] border-l-[4px] border-[#e8c66a] px-[4px] font-bold" style={{ background: 'rgba(232,198,106,0.4)' }}><T>{ORDER.note}</T></div>
        </div>
      </Prop>
      <Prop id="printer" w={DEV.printer.w} h={DEV.printer.h}>
        <Img src="printer" w={DEV.printer.w} h={DEV.printer.h} />
        <span data-led className="absolute left-[178px] top-[102px] h-[12px] w-[12px] rounded-full bg-[#7dffb0]" style={{ boxShadow: '0 0 12px 4px rgba(125,255,176,0.8)' }} />
      </Prop>
      <Prop id="kds" w={DEV.kds.w} h={DEV.kds.h}>
        <Img src="kds" w={DEV.kds.w} h={DEV.kds.h} />
        <div className="absolute left-[18px] right-[18px] top-[18px] flex h-[34px] items-center justify-between border-b border-[#2c5a58] px-[16px]">
          <T className={`${SCREEN_TEXT} text-[16px] font-semibold uppercase tracking-[0.18em]`}>Mutfak</T>
          <span className="flex items-center gap-[8px]">
            <span data-kds-dot className="h-[9px] w-[9px] rounded-full bg-[#7dffb0]" />
            <T className={`${SCREEN_TEXT} text-[15px] opacity-80`}>QR siparişleri</T>
          </span>
        </div>
        {KDS.cards.map((cx, i) => (
          <div key={i} data-kds-card={i} className="absolute" style={{ left: DEV.kds.w / 2 + cx - KDS.cardW / 2, top: kdsCardTop, width: KDS.cardW, height: KDS.cardH }}>
            <div className={`${SCREEN_TEXT} mt-[6px] flex items-center justify-center gap-[5px] text-[17px] font-bold`}>
              {i === 0 ? (
                <>
                  <T>Masa</T>
                  <Seven size={16} />
                </>
              ) : (
                <T>{['', 'Masa 3', 'Masa 12'][i]}</T>
              )}
            </div>
            {i === 0 ? (
              <div className="absolute bottom-[38px] left-[6px] right-[6px] rounded-[3px] px-[3px] text-center font-sans text-[12px] font-bold leading-[15px] text-[#10262a]" style={{ background: 'rgba(232,198,106,0.9)' }}>
                <T>Not: {ORDER.note}</T>
              </div>
            ) : (
              <div data-kds-timer={i} className={`${SCREEN_TEXT} absolute bottom-[40px] left-0 right-0 text-center font-mono text-[15px] opacity-80`}>00:00</div>
            )}
            <div data-kds-status={i} className="absolute bottom-[12px] left-[8px] right-[8px] rounded-[3px] py-[2px] text-center font-sans text-[13px] font-semibold text-[#10262a]" style={{ background: i === 0 ? GOLD : '#9fc9c2' }}>
              <T>{i === 0 ? 'Yeni' : 'Hazırlanıyor'}</T>
            </div>
          </div>
        ))}
        {/* the extra item arriving on the same Masa 7 card */}
        <div data-kds-extra className="absolute rounded-[8px] px-[6px] py-[6px] text-center font-sans text-[26px] font-extrabold text-[#10262a]" style={{ left: DEV.kds.w / 2 + KDS.cards[0] - KDS.cardW / 2 - 40, top: kdsCardTop - 70, width: KDS.cardW + 80, background: GOLD, boxShadow: '0 0 18px 4px rgba(232,198,106,0.7)', opacity: 0 }}>
          <T>+1 {MENU_DISHES[ORDER.extra]}</T>
        </div>
      </Prop>
      {[0, 1].map((i) => (
        <Prop key={i} id={`flame${i}`} w={120} h={40} style={{ background: 'radial-gradient(ellipse at 50% 80%, rgba(120,170,255,0.9), rgba(255,150,60,0.7) 45%, rgba(255,120,40,0) 75%)', mixBlendMode: 'screen', transformOrigin: '50% 100%' }} />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <Prop key={i} id={`steam${i}`} w={90} h={150} style={{ background: 'radial-gradient(ellipse at 50% 60%, rgba(250,246,238,0.6), rgba(250,246,238,0) 70%)', filter: 'blur(7px)' }} />
      ))}
      <Prop id="plate" w={160} h={70}><Img src="served-plate" dir={PROPS} ext="png" w={160} h={70} /></Prop>
      <Prop id="tableTag" w={250} h={40} label>
        <div className="flex h-full items-center justify-center gap-[6px] rounded-[6px] bg-[#7dffb0] font-sans text-[20px] font-bold text-[#10262a]"><Seven size={18} /><T>Hesap kapandı</T></div>
      </Prop>
      <Prop id="readyTag" w={170} h={40} label>
        <div className="flex h-full items-center justify-center gap-[6px] rounded-[6px] bg-[#7dffb0] font-sans text-[20px] font-bold text-[#10262a]"><Seven size={18} /><T>Hazır</T></div>
      </Prop>
      {/* the sent order leaving the table and running across the restaurant to the till (light only) */}
      <Spark id="pulse" />

      {/* ── front counter: pendant, cashier screen with the table-tied order list ─────────── */}
      <Prop id="pendant" w={140} h={440}>
        <div data-sway className="absolute inset-0" style={{ transformOrigin: '50% 0%' }}>
          <Img src="pendant" w={140} h={440} />
        </div>
      </Prop>
      <Prop id="cashierMon" w={DEV.cashierMon.w} h={DEV.cashierMon.h}>
        <Img src="monitor" w={DEV.cashierMon.w} h={DEV.cashierMon.h} />
        <div className="absolute overflow-hidden" style={{ left: mon.x, top: mon.y, width: mon.w, height: mon.h }}>
          <div className="flex h-[46px] items-center justify-between border-b border-[#2c5a58] px-[14px]">
            <T className={`${SCREEN_TEXT} text-[19px] font-semibold`}>Kasa · Aktif siparişler</T>
            <T className={`${SCREEN_TEXT} text-[15px] opacity-70`}>Kaynak: masa QR</T>
          </div>
          {[
            ['Masa 3', '12:18', 'Serviste'],
            ['Masa 12', '12:33', 'Mutfakta'],
          ].map(([table, time, status], i) => (
            <div key={table} className="absolute flex items-center justify-between rounded-[6px] px-[12px]" style={{ left: ROW.x, top: rowY(i), width: ROW.w, height: ROW.h, background: 'rgba(255,255,255,0.06)' }}>
              <T className={`${SCREEN_TEXT} text-[20px] font-bold`}>{table}</T>
              <T className={`${SCREEN_TEXT} text-[16px] opacity-75`}>{time}</T>
              <Chip bg="#9fc9c2" className="text-[14px]">{status}</Chip>
            </div>
          ))}
          <div data-row7 className="absolute rounded-[6px] px-[12px] py-[5px]" style={{ left: ROW.x, top: rowY(2), width: ROW.w, height: ROW.h + 58, background: 'rgba(232,198,106,0.16)', opacity: 0 }}>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-[6px]"><T className={`${SCREEN_TEXT} text-[22px] font-bold`}>Masa</T><Seven size={20} /></span>
              <T className={`${SCREEN_TEXT} text-[16px]`}>{ORDER.time}</T>
              <span data-row7-status />
            </div>
            <div data-row7-items className={`${SCREEN_TEXT} mt-[2px] text-[15px] leading-[20px] opacity-90`} />
          </div>
          <div className="absolute rounded-[8px]" style={{ left: 384, top: 58, width: 202, height: 290, background: 'rgba(255,255,255,0.05)' }}>
            <span className="absolute left-0 right-0 top-[8px] flex items-center justify-center gap-[6px]"><T className={`${SCREEN_TEXT} text-[17px] font-semibold`}>Masa</T><Seven size={16} /></span>
            <div data-panel-foot className={`${SCREEN_TEXT} absolute bottom-[8px] left-[8px] right-[8px] text-center text-[14px] font-semibold leading-[18px]`} />
            <div data-paid-stamp className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[8px] border-[4px] border-[#7dffb0] px-[14px] py-[6px] font-sans text-[26px] font-extrabold tracking-[0.12em] text-[#7dffb0]" style={{ opacity: 0 }}>
              <T>ÖDENDİ</T>
            </div>
          </div>
        </div>
      </Prop>

      {/* ── storeroom (seen in the building overview) ─────────────────────────────────── */}
      <Prop id="bulb" w={80} h={380}>
        <div data-sway className="absolute inset-0" style={{ transformOrigin: '50% 0%' }}>
          <Img src="bulb" w={80} h={380} />
        </div>
      </Prop>
      <Prop id="tablet" w={DEV.tablet.w} h={DEV.tablet.h}><Img src="tablet" w={DEV.tablet.w} h={DEV.tablet.h} /></Prop>

      {/* ── office: clock, desk lamp, e-invoice, monitor (Siparişler · Stok · Cari · e-Fatura · Rapor) ── */}
      <Prop id="clock" w={130} h={130} style={{ borderRadius: '50%', background: '#f1e7d2', border: '8px solid #2a211b' }}>
        <span data-hand="h" className="absolute left-[53px] top-[26px] h-[36px] w-[8px] rounded bg-[#2a211b]" style={{ transformOrigin: '50% 100%' }} />
        <span data-hand="m" className="absolute left-[55px] top-[14px] h-[48px] w-[4px] rounded bg-[#2a211b]" style={{ transformOrigin: '50% 100%' }} />
        <span data-hand="s" className="absolute left-[56px] top-[10px] h-[52px] w-[2px] bg-[#c8643b]" style={{ transformOrigin: '50% 100%' }} />
      </Prop>
      <Prop id="deskLamp" w={120} h={140}>
        <div className="absolute left-[56px] top-[40px] h-[90px] w-[8px] bg-[#2a2420]" />
        <div className="absolute bottom-0 left-[25px] h-[14px] w-[70px] rounded bg-[#2a2420]" />
        <div className="absolute left-[10px] top-[10px] h-[44px] w-[100px] bg-[#2f5a45]" style={{ clipPath: 'polygon(22% 0, 78% 0, 100% 100%, 0 100%)' }} />
        <div className="absolute left-[12px] top-[50px] h-[6px] w-[96px] rounded bg-[#ffe2a8]" />
      </Prop>
      <Prop id="invoice" w={190} h={250} style={{ ...PAPER, borderRadius: 3 }}>
        <div className="px-[14px] pt-[12px] font-sans text-[#3b3328]">
          <div className="flex items-center justify-between">
            <T className="text-[17px] font-bold tracking-[0.06em] text-[#1f3263]">e-Fatura</T>
            <span className="h-[26px] w-[26px] rounded-full border-2 border-[#c8643b]" />
          </div>
          <T className="mt-[2px] block font-mono text-[10px] text-[#8a7a66]">No 2026·000418</T>
          {[88, 70, 96, 60, 80].map((w, i) => (
            <div key={i} className="mt-[10px] h-[6px] rounded bg-[#cdbfa6]" style={{ width: `${w}%` }} />
          ))}
          <div className="mt-[14px] flex justify-between border-t border-[#b9a98f] pt-[6px]">
            <T className="text-[12px] text-[#8a7a66]">Toplam</T>
            <T className="text-[14px] font-bold">₺12.480</T>
          </div>
        </div>
      </Prop>
      <Prop id="auxScreen" w={DEV.aux.w} h={DEV.aux.h}>
        <div className="absolute inset-0 rounded-[10px] bg-[#0f1c1f]" style={{ boxShadow: 'inset 0 0 0 7px #15181b, 0 10px 24px rgba(12,8,4,0.5)' }}>
          <div className="absolute left-[16px] right-[16px] top-[14px] flex items-center justify-between">
            <T className={`${SCREEN_TEXT} text-[15px] font-semibold uppercase tracking-[0.14em]`}>Mutfak kuyruğu</T>
            <span data-aux-dot className="h-[8px] w-[8px] rounded-full bg-[#7dffb0]" />
          </div>
          {['Masa 12', 'Masa 6', 'Masa 3'].map((t, i) => (
            <div key={t} className="absolute left-[16px] right-[16px] flex items-center justify-between rounded-[6px] px-[10px] py-[6px]" style={{ top: 46 + i * 40, background: 'rgba(255,255,255,0.06)' }}>
              <T className={`${SCREEN_TEXT} text-[15px] font-bold`}>{t}</T>
              <Chip bg={i === 0 ? GOLD : '#9fc9c2'} className="text-[12px]">{i === 0 ? 'Hazırlanıyor' : 'Serviste'}</Chip>
            </div>
          ))}
        </div>
      </Prop>
      <Prop id="monitor" w={DEV.monitor.w} h={DEV.monitor.h}>
        <Img src="monitor" w={DEV.monitor.w} h={DEV.monitor.h} />
        <div className="absolute overflow-hidden" style={{ left: mon.x, top: mon.y, width: mon.w, height: mon.h }}>
          <div className="flex h-[40px] items-center gap-[4px] border-b border-[#2c5a58] px-[10px]">
            {['Siparişler', 'Stok', 'Cari', 'e-Fatura', 'Rapor'].map((tab) => (
              <span key={tab} data-tab={tab} className={`${SCREEN_TEXT} rounded-[4px] px-[9px] py-[3px] text-[14px] font-semibold`}>
                <T>{tab}</T>
              </span>
            ))}
          </div>
          <div data-view="1" className="absolute inset-x-0 bottom-0 top-[40px] p-[14px]">
            <T className={`${SCREEN_TEXT} text-[17px] font-semibold`}>Masalar · bugün</T>
            <div className="mt-[10px] grid grid-cols-4 gap-[8px]">
              {TABLE_STATES.map(([name, state]) => {
                const { label, color } = STATE_STYLE[state];
                return (
                  <div key={name} className="rounded-[6px] px-[8px] py-[6px]" style={{ background: 'rgba(255,255,255,0.06)', boxShadow: name === 'Masa 7' ? `inset 0 0 0 2px ${color}` : undefined }}>
                    <span className="flex items-center gap-[4px]"><T className={`${SCREEN_TEXT} text-[15px] font-bold`}>{name === 'Masa 7' ? 'Masa' : name}</T>{name === 'Masa 7' && <Seven size={13} />}</span>
                    <T className="block font-sans text-[12px] font-semibold" style={{ color }}>{label}</T>
                  </div>
                );
              })}
            </div>
          </div>
          <div data-view="2" className="absolute inset-x-0 bottom-0 top-[40px]" style={{ opacity: 0 }}>
            <T className={`${SCREEN_TEXT} absolute left-[14px] top-[10px] text-[17px] font-semibold`}>Stok seviyeleri</T>
            {G.storeroom.binLabels.map((label, i) => (
              <span key={label} className="absolute flex items-center justify-center gap-[6px]" style={{ left: 300 + G.storeroom.binXs[i] * 0.5 - 60, width: 120, top: 232 }}>
                <T className={`${SCREEN_TEXT} text-[13px]`}>{label}</T>
                {i === 0 && (
                  <span data-low className="rounded-[3px] bg-[#e3a83b] px-[4px] font-sans text-[11px] font-bold text-[#2a1d14]" style={{ opacity: 0 }}>
                    <T>Az</T>
                  </span>
                )}
              </span>
            ))}
          </div>
          <div data-view="3" className="absolute inset-x-0 bottom-0 top-[40px]" style={{ opacity: 0 }}>
            {LEDGER.labels.map((label, r) => (
              <T key={label} className={`${SCREEN_TEXT} absolute text-[15px] opacity-90`} style={{ left: 22, top: mon.h / 2 + 30 + LEDGER.rowY[r] - 10 - 40, width: 180 }}>
                {label}
              </T>
            ))}
          </div>
          <div data-view="4" className="absolute inset-x-0 bottom-0 top-[40px]" style={{ opacity: 0 }}>
            <T className={`${SCREEN_TEXT} absolute left-[22px] top-[12px] text-[18px] font-semibold`}>Bu hafta</T>
            <div className="absolute h-[2px] bg-[#9fc9c2]" style={{ left: 300 - CHART.spacing * 3.6 * MINI_CHART.scale, width: CHART.spacing * 7.2 * MINI_CHART.scale, top: mon.h / 2 + MINI_CHART.dy - 40 + 4 }} />
            {CHART.labels.map((l, i) => (
              <T key={l} className={`${SCREEN_TEXT} absolute text-center text-[12px] opacity-80`} style={{ left: 300 + (i - 3) * CHART.spacing * MINI_CHART.scale - 22, width: 44, top: mon.h / 2 + MINI_CHART.dy - 40 + 10 }}>
                {l}
              </T>
            ))}
          </div>
        </div>
      </Prop>

      {/* ── the guest's phone in the hand (scan · sent · extra order · bill) ─────────────────── */}
      <Prop id="scanLines" w={550} h={300}>
        <svg width="550" height="300" className="absolute inset-0 overflow-visible">
          <g stroke="#1f3263" strokeOpacity="0.35" strokeWidth="7">
            <line x1="475" y1="60" x2="23" y2="164" />
            <line x1="475" y1="60" x2="128" y2="164" />
            <line x1="475" y1="140" x2="128" y2="269" />
            <line x1="475" y1="140" x2="23" y2="269" />
          </g>
          <g data-scan-dash stroke="#fff8e6" strokeWidth="3.5" strokeDasharray="14 10">
            <line x1="475" y1="60" x2="23" y2="164" />
            <line x1="475" y1="60" x2="128" y2="164" />
            <line x1="475" y1="140" x2="128" y2="269" />
            <line x1="475" y1="140" x2="23" y2="269" />
          </g>
        </svg>
      </Prop>
      <Prop id="tentFlash" w={150} h={150}>
        <div className="absolute inset-0 rounded-[6px]" style={{ boxShadow: '0 0 34px 10px rgba(255,244,214,0.85), inset 0 0 22px rgba(255,244,214,0.6)' }} />
        {[['left-0 top-0', 'border-l-[7px] border-t-[7px]'], ['right-0 top-0', 'border-r-[7px] border-t-[7px]'], ['bottom-0 left-0', 'border-b-[7px] border-l-[7px]'], ['bottom-0 right-0', 'border-b-[7px] border-r-[7px]']].map(([pos, b]) => (
          <span key={pos} className={`absolute h-[40px] w-[40px] border-[#1f3263] ${pos} ${b}`} />
        ))}
        <div data-sweep className="absolute left-[6px] right-[6px] h-[5px] bg-[#fff6dc]" style={{ boxShadow: '0 0 14px 6px rgba(255,240,200,0.95)' }} />
        <div className="absolute -bottom-[40px] left-1/2 flex -translate-x-1/2 items-center gap-[6px] whitespace-nowrap rounded-[4px] bg-[#1f3263] px-[8px] py-[2px] font-sans text-[16px] font-bold text-[#f6eedc]">
          <T>Masa</T>
          <Seven size={18} />
        </div>
      </Prop>
      <Prop id="phone" w={170} h={320} style={{ borderRadius: 26, background: '#15181b', boxShadow: '0 16px 30px rgba(20,10,5,0.45)' }}>
        <div className="absolute inset-[10px] overflow-hidden rounded-[18px] bg-[#0f1c1f]">
          <div data-phone-scan className="absolute inset-0">
            <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 45%, #3b4a44, #0f1c1f 75%)' }} />
            {[[18, 70, 'border-l-4 border-t-4'], [104, 70, 'border-r-4 border-t-4'], [18, 170, 'border-b-4 border-l-4'], [104, 170, 'border-b-4 border-r-4']].map(([l, t, c]) => (
              <span key={`${l}${t}`} className={`absolute h-[28px] w-[28px] border-[#fff6dc] ${c}`} style={{ left: l as number, top: t as number }} />
            ))}
            <div data-phone-sweep className="absolute left-[16px] right-[16px] h-[3px] bg-[#fff6dc]" style={{ boxShadow: '0 0 12px 3px rgba(255,240,200,0.9)' }} />
            <T className={`${SCREEN_TEXT} absolute bottom-[18px] left-0 right-0 text-center text-[13px] opacity-80`}>QR okutuluyor</T>
          </div>
          <div data-phone-app className="absolute inset-0 bg-[#f6eedc]" style={{ opacity: 0 }}>
            <div className="bg-[#1f3263] py-[7px] text-center font-sans text-[13px] font-semibold text-[#f6eedc]">
              <T>NeXa · Masa 7</T>
            </div>
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="mx-[8px] mt-[6px] h-[22px] rounded-[5px] bg-[#e7dcc5]" />
            ))}
          </div>
          <div data-phone-sent className="absolute inset-0 flex flex-col items-center justify-center gap-[10px] bg-[#1f5a45]" style={{ opacity: 0 }}>
            <span className="flex h-[62px] w-[62px] items-center justify-center rounded-full bg-[#7dffb0] font-sans text-[40px] font-bold text-[#10262a]">✓</span>
            <T className="px-[8px] text-center font-sans text-[14px] font-bold leading-[18px] text-[#f6eedc]">Sipariş gönderildi</T>
            <span className="flex items-center gap-[4px]"><T className="font-sans text-[13px] text-[#d9efe6]">Masa</T><Seven size={12} /></span>
          </div>
        </div>
      </Prop>

      {/* the order ticket the camera follows from the till to the kitchen printer, and the extra order's ticket —
          after every device, so a ticket is always in front of the screen it comes out of */}
      <OrderTicket />
      <ExtraTicket />

      {/* foreground parallax: dark, rim-lit, slightly out of focus (depth of field) */}
      <Prop id="fg-hatch" w={420} h={1900}><Img src="fg-hatch" w={420} h={1900} /></Prop>
      <Prop id="fg-rail" w={1600} h={300}><div data-sway className="absolute inset-0" style={{ transformOrigin: '50% 0%' }}><Img src="fg-rail" w={1600} h={300} style={{ filter: 'blur(2px)' }} /></div></Prop>
      <Prop id="fg-crates" w={700} h={520}><Img src="fg-crates" w={700} h={520} style={{ filter: 'blur(3px)' }} /></Prop>
      <Prop id="fg-stools" w={1000} h={360}><Img src="fg-stools" w={1000} h={360} style={{ filter: 'blur(2.5px)' }} /></Prop>
      <Prop id="fg-counter" w={1400} h={340}><Img src="fg-counter" w={1400} h={340} style={{ filter: 'blur(3px)' }} /></Prop>
      <Prop id="fg-chair" w={520} h={700}><Img src="fg-chair" w={520} h={700} style={{ filter: 'blur(3.5px)' }} /></Prop>
      <Prop id="fg-plant2" w={560} h={760}><div data-sway className="absolute inset-0" style={{ transformOrigin: '50% 100%' }}><Img src="fg-plant" w={560} h={760} style={{ filter: 'blur(4px)' }} /></div></Prop>
      <Prop id="fg-plant" w={560} h={760}><div data-sway className="absolute inset-0" style={{ transformOrigin: '50% 100%' }}><Img src="fg-plant" w={560} h={760} /></div></Prop>
    </div>
  );
}

// ------------------------------------------------------------------ portal window

const INNER_PLATES = PLATES.filter((p) => p.world !== 'A' && p.chapter !== 5);

export function Chapter4Portal() {
  return (
    <>
      <div data-ch4 data-portal-clip className="pointer-events-none absolute inset-0 overflow-hidden" style={{ visibility: 'hidden' }}>
        <div data-portal-stage className="absolute inset-0 origin-top-left">
          {INNER_PLATES.map((p) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={p.id}
              data-inner-plate={p.id}
              data-lazy-src={p.src}
              alt=""
              width={p.w}
              height={p.h}
              draggable={false}
              className="pointer-events-none absolute left-0 top-0 max-w-none origin-top-left select-none"
              style={{ width: p.w, height: p.h, mixBlendMode: p.blend as React.CSSProperties['mixBlendMode'], visibility: 'hidden' }}
            />
          ))}
          <Chapter4World inner />
        </div>
        {/* a little of the table we are leaving still glows on the far side of the threshold */}
        <div data-portal-haze className="absolute inset-0" style={{ mixBlendMode: 'screen', opacity: 0 }} />
      </div>
      <div data-ch4 data-portal-rim className="pointer-events-none absolute left-0 top-0" style={{ visibility: 'hidden' }} />
    </>
  );
}

// ------------------------------------------------------------------ THROUGH surface (screen space)

/** fixed design boxes of the surface screens; each is fitted into the animated surface rectangle */
const BOX = {
  menu: [520, 1000],
  ticket: [560, 840],
  session: [520, 1000],
  bill: [560, 840],
} as const;
type ScreenId = keyof typeof BOX;

function PhoneHeader({ title }: { title: string }) {
  return (
    <>
      <div className="flex h-[34px] items-center justify-between px-[26px] font-sans text-[16px] font-semibold text-[#3b3328]">
        <T>{ORDER.time}</T>
        <span className="h-[10px] w-[60px] rounded-full bg-[#3b3328] opacity-60" />
      </div>
      <div className="mx-[18px] flex items-center justify-between rounded-[16px] bg-[#1f3263] px-[20px] py-[16px]">
        <T className="font-sans text-[30px] font-bold text-[#f6eedc]">{title}</T>
        <span className="flex items-center gap-[8px]"><T className="font-sans text-[20px] font-bold text-[#f6eedc]">Masa</T><Seven size={26} /></span>
      </div>
    </>
  );
}

const KPIS: [string, string, string][] = [
  ['Aktif sipariş', '9', '#e8c66a'],
  ['Mutfakta', '4', '#9fc9c2'],
  ['Hesap bekleyen', '1', '#e3a83b'],
  ['Kapanan masa', '23', '#7dffb0'],
];

export function Chapter4Surface() {
  const dishRows = [0, 1, 4, 5, 3];
  return (
    <>
    {/* the room stays present behind every surface: defocused and dimmed, never replaced */}
    <div
      data-ch4
      data-surface-veil
      className="pointer-events-none absolute inset-0"
      style={{ opacity: 0, backdropFilter: 'blur(7px) saturate(0.92)', WebkitBackdropFilter: 'blur(7px) saturate(0.92)' }}
    />
    <div data-ch4 data-surface lang="tr" className="pointer-events-none absolute left-0 top-0" style={{ visibility: 'hidden' }}>
      <div data-surface-bg className="absolute inset-0 overflow-hidden" />
      <div data-surface-screens className="absolute overflow-hidden" />

      {/* screens (moved into [data-surface-screens] at runtime) */}
      {/* phone: menu → select → note → send */}
      <div data-screen="menu" className="absolute left-0 top-0 origin-top-left overflow-hidden bg-[#f6eedc]" style={{ width: BOX.menu[0], height: BOX.menu[1], visibility: 'hidden' }}>
        <PhoneHeader title="NeXa Menü" />
        <div className="mx-[18px] mt-[14px] flex gap-[8px]">
          {['Ana yemek', 'İçecek', 'Tatlı', 'Çorba'].map((c, i) => (
            <Chip key={c} bg={i === 0 ? INK : '#e3d7bf'} fg={i === 0 ? '#f6eedc' : '#3b3328'} className="text-[17px]">
              {c}
            </Chip>
          ))}
        </div>
        {dishRows.map((d) => (
          <div key={d} className="mx-[18px] mt-[12px] flex items-center gap-[14px] rounded-[14px] bg-white/60 px-[12px] py-[10px]">
            <span style={dishIcon(d, 70)} />
            <div className="flex-1">
              <T className="block font-sans text-[25px] font-bold text-[#2a241c]">{MENU_DISHES[d]}</T>
              <T className="block font-sans text-[19px] text-[#7a6a55]">{lira(PRICES[d])}</T>
            </div>
            <span data-menu-add={d} className="flex h-[48px] min-w-[48px] items-center justify-center rounded-full bg-[#1f3263] px-[12px] font-sans text-[26px] font-bold text-[#f6eedc]">
              +
            </span>
          </div>
        ))}
        <div className="mx-[18px] mt-[14px] rounded-[14px] border-2 border-[#1f3263]/30 bg-white/70 px-[16px] py-[12px]">
          <T className="block font-sans text-[16px] font-semibold uppercase tracking-[0.1em] text-[#7a6a55]">Sipariş notu</T>
          <span data-ui-text data-note className="block min-h-[34px] font-sans text-[26px] text-[#2a241c]" />
        </div>
        <div data-send className="absolute bottom-[22px] left-[18px] right-[18px] flex items-center justify-between rounded-[18px] bg-[#1f3263] px-[22px] py-[18px]">
          <span data-ui-text data-cart className="font-sans text-[22px] text-[#f6eedc]">0 ürün</span>
          <T className="font-sans text-[26px] font-bold text-[#f6eedc]">Siparişi gönder →</T>
        </div>
        <div data-sent className="absolute inset-0 flex flex-col items-center justify-center gap-[18px] bg-[#1f5a45]" style={{ opacity: 0 }}>
          <span className="flex h-[140px] w-[140px] items-center justify-center rounded-full bg-[#7dffb0] font-sans text-[90px] font-bold text-[#10262a]">✓</span>
          <T className="font-sans text-[38px] font-bold text-[#f6eedc]">Sipariş gönderildi</T>
          <T className="px-[40px] text-center font-sans text-[24px] leading-[34px] text-[#d9efe6]">Masa 7 · {ORDER.time} · garson beklemeden kasaya ve mutfağa iletildi</T>
        </div>
      </div>

      {/* kitchen ticket: a torn thermal slip, not a UI card */}
      <div
        data-screen="ticket"
        className="absolute left-0 top-0 origin-top-left px-[44px] pt-[34px] font-mono text-[#2f2a22]"
        style={{ ...PAPER, width: BOX.ticket[0], height: BOX.ticket[1], borderRadius: 0, clipPath: TORN, visibility: 'hidden' }}
      >
        <div className="flex items-center justify-between">
          <T className="text-[22px] font-bold uppercase tracking-[0.34em] text-[#8a5a31]">Mutfak</T>
          <T className="text-[22px] tracking-[0.1em] text-[#8a7a66]">{ORDER.time}</T>
        </div>
        <div className="mt-[10px] h-[3px] w-full" style={{ background: 'repeating-linear-gradient(90deg, #b9a98f 0 14px, transparent 14px 24px)' }} />
        <div className="mt-[20px] flex items-end gap-[18px]">
          <T className="text-[80px] font-bold leading-none tracking-[-0.02em]">MASA</T>
          <Seven size={64} className="mb-[4px]" />
        </div>
        <div className="mt-[8px] text-[24px] tracking-[0.16em] text-[#8a7a66]"><T>QR SİPARİŞİ</T></div>
        <div className="mt-[22px] h-[3px] w-full" style={{ background: 'repeating-linear-gradient(90deg, #b9a98f 0 14px, transparent 14px 24px)' }} />
        {ORDER.items.map((d, i) => (
          <div key={d} data-ticket-line={i} className="mt-[16px] flex items-baseline gap-[10px] text-[42px] leading-[52px]">
            <T className="font-bold">1×</T>
            <T className="font-bold">{MENU_DISHES[d]}</T>
            <span className="mx-[6px] flex-1 translate-y-[-8px] border-b-[3px] border-dotted border-[#c3b49a]" />
          </div>
        ))}
        <div data-ticket-line={2} className="mt-[26px] border-l-[10px] border-[#e8c66a] bg-[rgba(232,198,106,0.34)] px-[18px] py-[14px]">
          <T className="block text-[20px] font-bold uppercase tracking-[0.24em] text-[#8a5a31]">Not</T>
          <T className="block text-[38px] font-bold leading-[46px]">{ORDER.note}</T>
        </div>
        <div data-ticket-line={3} className="absolute bottom-[54px] left-[44px] right-[44px]">
          <div className="h-[3px] w-full" style={{ background: 'repeating-linear-gradient(90deg, #b9a98f 0 14px, transparent 14px 24px)' }} />
          <T className="mt-[12px] block text-[26px] tracking-[0.06em] text-[#6d6252]">Garson almadı · masadan geldi</T>
        </div>
      </div>

      {/* phone again: the table's adisyon — extra order + bill request */}
      <div data-screen="session" className="absolute left-0 top-0 origin-top-left overflow-hidden bg-[#f6eedc]" style={{ width: BOX.session[0], height: BOX.session[1], visibility: 'hidden' }}>
        <PhoneHeader title="Adisyonum" />
        {ORDER.items.map((d) => (
          <div key={d} className="mx-[18px] mt-[12px] flex items-center gap-[14px] rounded-[14px] bg-white/60 px-[12px] py-[10px]">
            <span style={dishIcon(d, 60)} />
            <T className="flex-1 font-sans text-[25px] font-bold text-[#2a241c]">{MENU_DISHES[d]}</T>
            <Chip bg="#cfe9dc" fg="#1f5a45" className="text-[17px]">Servis edildi ✓</Chip>
          </div>
        ))}
        <div data-extra-row className="mx-[18px] mt-[12px] flex items-center gap-[14px] rounded-[14px] px-[12px] py-[10px]" style={{ opacity: 0, background: 'rgba(232,198,106,0.35)', boxShadow: `inset 0 0 0 3px ${GOLD}` }}>
          <span style={dishIcon(ORDER.extra, 60)} />
          <T className="flex-1 font-sans text-[25px] font-bold text-[#2a241c]">{MENU_DISHES[ORDER.extra]}</T>
          <span data-extra-status />
        </div>
        <div data-extra-toast className="mx-[18px] mt-[14px] rounded-[14px] bg-[#1f5a45] px-[18px] py-[14px] text-center" style={{ opacity: 0 }}>
          <T className="font-sans text-[22px] font-bold text-[#f6eedc]">✓ Ek sipariş Masa 7 adisyonuna eklendi</T>
        </div>
        <div className="absolute bottom-[22px] left-[18px] right-[18px] flex gap-[12px]">
          <div data-btn-extra className="flex-1 rounded-[18px] border-[3px] border-[#1f3263] py-[18px] text-center">
            <T className="font-sans text-[24px] font-bold text-[#1f3263]">+ Ek sipariş</T>
          </div>
          <div data-btn-bill className="flex-1 rounded-[18px] bg-[#1f3263] py-[18px] text-center">
            <T className="font-sans text-[24px] font-bold text-[#f6eedc]">Hesap iste</T>
          </div>
        </div>
        <div data-bill-banner className="absolute bottom-[110px] left-[18px] right-[18px] rounded-[14px] bg-[#e3a83b] px-[18px] py-[14px] text-center" style={{ opacity: 0 }}>
          <T className="font-sans text-[24px] font-bold text-[#2a1d14]">Hesap istendi · Toplam {lira(orderTotal())}</T>
        </div>
      </div>

      {/* the table's bill */}
      <div data-screen="bill" className="absolute left-0 top-0 origin-top-left px-[46px] pt-[40px] font-sans text-[#2f2a22]" style={{ ...PAPER, width: BOX.bill[0], height: BOX.bill[1], borderRadius: 18, boxShadow: `inset 0 0 0 6px ${GOLD}`, visibility: 'hidden' }}>
        <div className="flex items-center justify-between">
          <T className="text-[30px] font-bold uppercase tracking-[0.14em] text-[#8a5a31]">Hesap</T>
          <Chip bg="#e3a83b" fg="#2a1d14" className="text-[20px]">Masadan istendi</Chip>
        </div>
        <span className="mt-[14px] flex items-center gap-[16px]"><T className="text-[80px] font-bold leading-none text-[#1f3263]">Masa</T><Seven size={66} /></span>
        <div className="my-[20px] border-t-4 border-dashed border-[#cdbfa6]" />
        {[...ORDER.items, ORDER.extra].map((d) => (
          <div key={d} className="flex justify-between text-[38px] leading-[64px]">
            <T>{MENU_DISHES[d]}</T>
            <T>{lira(PRICES[d])}</T>
          </div>
        ))}
        <div className="my-[20px] border-t-4 border-dashed border-[#cdbfa6]" />
        <div className="flex justify-between text-[48px] font-bold">
          <T>Toplam</T>
          <T>{lira(orderTotal())}</T>
        </div>
      </div>
      {/* the panel is lit by the room it sits in, and casts into it */}
      <div data-surface-light className="absolute inset-0" style={{ mixBlendMode: 'screen', opacity: 0 }} />
      <div data-surface-gloss className="absolute inset-0" style={{ mixBlendMode: 'screen', opacity: 0.16, background: 'linear-gradient(126deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.06) 26%, rgba(255,255,255,0) 52%)' }} />
    </div>

    {/* ── the management panel of the final frame, with thin links down to the real rooms it describes ── */}
    <svg data-ch4 data-mgmt-links className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" style={{ visibility: 'hidden' }}>
      {[0, 1, 2].map((i) => (
        <g key={i} data-mgmt-link={i}>
          <path fill="none" stroke={i === 0 ? GOLD : '#9fc9c2'} strokeWidth={i === 0 ? 2.6 : 1.6} strokeDasharray={i === 0 ? '0' : '5 6'} />
          <circle r={i === 0 ? 5 : 3.5} fill={i === 0 ? GOLD : '#9fc9c2'} />
        </g>
      ))}
    </svg>
    <div data-ch4 data-mgmt lang="tr" className="pointer-events-none absolute left-0 top-0 origin-top-left" style={{ visibility: 'hidden', width: 560 }}>
      <div className="rounded-[22px] p-[22px]" style={{ background: 'linear-gradient(160deg, rgba(20,34,38,0.88), rgba(12,22,26,0.82))', boxShadow: '0 24px 60px rgba(8,6,4,0.45), inset 0 0 0 1.5px rgba(232,198,106,0.35)', backdropFilter: 'blur(6px)' }}>
        <div className="flex items-center justify-between border-b border-[#2c5a58] pb-[12px]">
          <T className={`${SCREEN_TEXT} text-[22px] font-bold`}>NeXa · Operasyon</T>
          <span className="flex items-center gap-[8px]"><span data-mgmt-live className="h-[9px] w-[9px] rounded-full bg-[#7dffb0]" /><T className={`${SCREEN_TEXT} text-[15px] opacity-75`}>Canlı · bugün</T></span>
        </div>
        <div className="mt-[14px] grid grid-cols-4 gap-[8px]">
          {KPIS.map(([label, value, color], i) => (
            <div key={label} data-mgmt-kpi={i} className="rounded-[10px] px-[10px] py-[8px]" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <T className={`${SCREEN_TEXT} block text-[12px] leading-[15px] opacity-75`}>{label}</T>
              <T className="block font-sans text-[30px] font-bold leading-[36px]" style={{ color }}>{value}</T>
            </div>
          ))}
        </div>
        <div className="mt-[12px] grid grid-cols-4 gap-[6px]">
          {TABLE_STATES.map(([name, state]) => {
            const { label, color } = STATE_STYLE[state];
            const seven = name === 'Masa 7';
            return (
              <div key={name} data-mgmt-tile={name} className="rounded-[8px] px-[8px] py-[5px]" style={{ background: seven ? 'rgba(125,255,176,0.12)' : 'rgba(255,255,255,0.05)', boxShadow: seven ? `inset 0 0 0 2px ${color}` : undefined }}>
                <span className="flex items-center gap-[4px]"><T className={`${SCREEN_TEXT} text-[14px] font-bold`}>{seven ? 'Masa' : name}</T>{seven && <Seven size={12} />}</span>
                <T className="block font-sans text-[11px] font-semibold" style={{ color }}>{label}</T>
              </div>
            );
          })}
        </div>
        {/* the modules the business is actually run from — the same system, one row */}
        <div className="mt-[14px] flex flex-wrap gap-[6px] border-t border-[#2c5a58] pt-[12px]">
          {['Siparişler', 'Masalar', 'Mutfak', 'Stok', 'Cari', 'e-Fatura', 'Rapor'].map((m) => (
            <span key={m} className="rounded-[6px] px-[9px] py-[4px]" style={{ background: 'rgba(232,198,106,0.14)', boxShadow: 'inset 0 0 0 1px rgba(232,198,106,0.35)' }}>
              <T className="font-sans text-[13px] font-semibold text-[#f0dcae]">{m}</T>
            </span>
          ))}
        </div>
      </div>
    </div>
    </>
  );
}

/**
 * The soft frosted pool behind each block of copy. It is a SIBLING of the text, not a child: `film-text`'s wipe
 * mask clips its children to the text box, which used to cut the pool into a visible rectangle. Its own mask is a
 * closest-side ellipse, so it fades to nothing before its edges. Its opacity follows its text (the updater).
 */
function Pool({ id, x, y, w, h, tone }: { id: string; x: number; y: number; w: number; h: number; tone: 'ink' | 'light' }) {
  const mask = 'radial-gradient(closest-side at 50% 50%, #000 55%, transparent 100%)';
  return (
    <div
      aria-hidden
      data-ch4
      data-pool4={id}
      className="pointer-events-none absolute"
      style={{
        left: x,
        top: y,
        width: w,
        height: h,
        opacity: 0,
        background: tone === 'light' ? 'rgba(22,14,10,0.42)' : 'rgba(250,242,226,0.62)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        maskImage: mask,
        WebkitMaskImage: mask,
      }}
    />
  );
}

export function Chapter4Text({ textClass }: { textClass: string }) {
  return (
    <>
      {BEAT_TEXTS.map((t) => (
        <Pool key={`pool-${t.key}`} id={t.key} x={t.box.x - 110} y={t.box.y - 80} w={t.box.w + 220} h={t.line ? 330 : 260} tone={t.tone} />
      ))}
      <Pool id="textCloser" x={280 - 110} y={290 - 80} w={620 + 220} h={250} tone="light" />
      {BEAT_TEXTS.map((t) => (
        <div
          key={t.key}
          data-ch4
          data-text={t.key}
          lang="tr"
          className={`${textClass} absolute`}
          style={{ left: t.box.x, top: t.box.y, width: t.box.w, visibility: 'hidden' }}
        >
          <p className={`eyebrow text-[13px] ${t.tone === 'light' ? 'text-[#ffe9c4]' : 'text-[#8a5a31]'}`}>{t.eyebrow}</p>
          <h2 className={`display mt-[12px] text-[44px] leading-[1.08] ${t.tone === 'light' ? 'text-[#fff4e2]' : 'text-[#1e2430]'}`}>{t.heading}</h2>
          {t.line && <p className={`mt-[14px] text-[21px] leading-[1.45] ${t.tone === 'light' ? 'text-[#f3dcc0]' : 'text-[#3b3328]'}`}>{t.line}</p>}
        </div>
      ))}
      {/* the closing statement, on the final dimensional management frame */}
      <div data-ch4 data-text="textCloser" lang="tr" className={`${textClass} absolute`} style={{ left: 280, top: 290, width: 620, visibility: 'hidden' }}>
        {CLOSER.map((line, i) => (
          <p key={line} className="display text-[32px] leading-[1.25]" style={{ color: i === 0 ? '#f3dcc0' : '#ffe3b8' }}>
            {line}
          </p>
        ))}
      </div>
    </>
  );
}

export function Chapter4Grade() {
  return (
    <>
      <div data-ch4 data-grade className="pointer-events-none absolute inset-0" style={{ opacity: 0, mixBlendMode: 'multiply' }} />
      <div
        data-ch4
        data-grade-glow
        className="pointer-events-none absolute inset-0"
        style={{ opacity: 0, mixBlendMode: 'screen', background: 'radial-gradient(ellipse at 80% 15%, rgba(255,170,100,0.9), rgba(255,140,90,0) 60%)' }}
      />
      {/* threshold bloom at a portal crossing (the Chapter 2 feeling, not the same effect) */}
      <div
        data-ch4
        data-portal-flare
        className="pointer-events-none absolute inset-0"
        style={{ opacity: 0, mixBlendMode: 'screen', background: 'radial-gradient(ellipse at 50% 50%, rgba(255,246,222,0.95) 0%, rgba(255,216,152,0.5) 38%, rgba(255,190,120,0) 74%)' }}
      />
      <div
        data-ch4
        data-vignette
        className="pointer-events-none absolute inset-0"
        style={{ opacity: 0, mixBlendMode: 'multiply', background: 'radial-gradient(ellipse at 50% 48%, rgba(255,255,255,0) 52%, rgba(60,36,24,0.55) 100%)' }}
      />
    </>
  );
}

// ------------------------------------------------------------------ update

const GRADE: [number, number[], number, number][] = [
  [0, [255, 255, 255], 0, 0],
  [0.5, [255, 244, 226], 0.08, 0.02],
  [0.8, [255, 226, 190], 0.14, 0.06],
  [1, [240, 186, 150], 0.24, 0.16],
];

function gradeAt(day: number) {
  let i = 0;
  while (i < GRADE.length - 2 && day > GRADE[i + 1][0]) i++;
  const [d0, c0, o0, g0] = GRADE[i];
  const [d1, c1, o1, g1] = GRADE[i + 1];
  const t = clamp01((day - d0) / (d1 - d0));
  return { color: c0.map((v, k) => Math.round(lerp(v, c1[k], t))), opacity: lerp(o0, o1, t), glow: lerp(g0, g1, t) };
}

export type TextStyleFn = (el: HTMLElement | null, v: number) => void;

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
  r: number;
}
const lerpRect = (a: Rect, b: Rect, t: number): Rect => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), w: lerp(a.w, b.w, t), h: lerp(a.h, b.h, t), r: lerp(a.r, b.r, t) });

/** per-frame anchors the world layer hands to the surface / portal code */
interface WorldOut {
  phoneX: number;
  phoneY: number;
}

/**
 * The world layer (figures, devices, light, foreground) as a pure function of the film state. It is created
 * twice: for the main stage and for the view inside the portal window, each with its own camera.
 */
function createWorldUpdater(world: HTMLElement, hideText: number) {
  const props = new Map<string, HTMLElement>();
  world.querySelectorAll<HTMLElement>('[data-prop]').forEach((el) => props.set(el.dataset.prop!, el));
  const q = (sel: string) => (world.querySelector(sel) as HTMLElement | null) ?? document.createElement('div');
  const qa = (sel: string) => Array.from(world.querySelectorAll<HTMLElement>(sel));
  const poses = new Map<string, HTMLElement[]>();
  const breathe = new Map<string, HTMLElement>();
  const sways = new Map<string, HTMLElement>();
  for (const [id, el] of props) {
    const p = Array.from(el.querySelectorAll<HTMLElement>('[data-pose]'));
    if (p.length) poses.set(id, p);
    const b = el.querySelector<HTMLElement>('[data-breathe]');
    if (b) breathe.set(id, b);
    const s = el.querySelector<HTMLElement>('[data-sway]');
    if (s) sways.set(id, s);
  }
  const sizes = new Map<HTMLElement, [number, number]>();
  for (const el of props.values()) sizes.set(el, [parseFloat(el.style.width), parseFloat(el.style.height)]);
  const ui = {
    led: q('[data-led]'),
    kdsDot: q('[data-kds-dot]'),
    kdsCards: qa('[data-kds-card]'),
    kdsTimers: qa('[data-kds-timer]'),
    kdsStatus0: q('[data-kds-status="0"]'),
    kdsExtra: q('[data-kds-extra]'),
    row7: q('[data-row7]'),
    row7Status: q('[data-row7-status]'),
    row7Items: q('[data-row7-items]'),
    panelFoot: q('[data-panel-foot]'),
    low: q('[data-low]'),
    hands: { h: q('[data-hand="h"]'), m: q('[data-hand="m"]'), s: q('[data-hand="s"]') },
    tabs: new Map(qa('[data-tab]').map((el) => [el.dataset.tab!, el])),
    views: qa('[data-view]'),
    bulbs: qa('[data-bulb]'),
    phoneScan: q('[data-phone-scan]'),
    phoneApp: q('[data-phone-app]'),
    phoneSent: q('[data-phone-sent]'),
    phoneSweep: q('[data-phone-sweep]'),
    sweep: q('[data-sweep]'),
    scanDash: q('[data-scan-dash]'),
    paidStamp: q('[data-paid-stamp]'),
    auxDot: q('[data-aux-dot]'),
  };
  const xf: LayerXf = { m: 1, tx: 0, ty: 0, ok: true };
  const cache = new Map<HTMLElement, string>();
  let lastSecond = -1;
  const setText = (el: HTMLElement | null, value: string) => {
    if (!el) return;
    if (cache.get(el) !== value) {
      el.textContent = value;
      cache.set(el, value);
    }
  };
  const setHTML = (el: HTMLElement | null, value: string) => {
    if (!el) return;
    if (cache.get(el) !== value) {
      el.innerHTML = value;
      cache.set(el, value);
      if (hideText >= 2) el.querySelectorAll<HTMLElement>('[data-ui-text]').forEach((t) => (t.style.visibility = 'hidden'));
    }
  };
  const setOpacity = (el: HTMLElement | null, v: number) => {
    if (!el) return;
    const s = clamp01(v).toFixed(3);
    if (el.style.opacity !== s) el.style.opacity = s;
  };

  let camB: Camera;
  let vp: Viewport;
  /** extra culling margin (px) while the stage is turned: things just off screen can swing into view */
  let pad = 0;
  /**
   * place a world-space prop centred on (wx, wy); hidden when transparent or entirely off screen. Layers in
   * front of the wall (depth < 0) fade as they pass the camera, unless `keep` (the portal object itself).
   */
  const place = (id: string, wx: number, wy: number, depth: number, opacity: number, opts: { rot?: number; sx?: number; sy?: number; keep?: boolean } = {}) => {
    const el = props.get(id);
    if (!el) return;
    const hide = () => {
      if (el.style.visibility !== 'hidden') el.style.visibility = 'hidden';
    };
    if (opacity <= 0.002 || el.dataset.hiddenLabel) return hide();
    layerTransform(camB, depth, xf);
    if (!xf.ok) return hide();
    if (depth < 0 && !opts.keep) opacity *= clamp01((7 - xf.m) / 3.2);
    if (opacity <= 0.002) return hide();
    const [w, h] = sizes.get(el)!;
    const k = xf.m * vp.b;
    const cx = (wx * xf.m + xf.tx) * vp.b + vp.ox;
    const cy = (wy * xf.m + xf.ty) * vp.b + vp.oy;
    const rx = (w / 2) * k * Math.max(1, Math.abs(opts.sx ?? 1)) * 1.2;
    const ry = (h / 2) * k * Math.max(1, Math.abs(opts.sy ?? 1)) * 1.2;
    if (cx + rx < -pad || cy + ry < -pad || cx - rx > vp.vw + pad || cy - ry > vp.vh + pad) return hide();
    el.style.visibility = 'visible';
    el.style.opacity = String(Math.min(1, opacity));
    el.style.transform = `translate3d(${cx - w / 2}px, ${cy - h / 2}px, 0) scale(${k * (opts.sx ?? 1)}, ${k * (opts.sy ?? 1)}) rotate(${opts.rot ?? 0}rad)`;
  };
  const figure = (id: keyof typeof FIG, time: number, weights: number[], opacity = 1, at: readonly number[] = FIG[id].at, scale = 1, depth: number = FIG[id].depth) => {
    const f = FIG[id];
    const s = Math.abs(f.s) * scale;
    place(`fig-${id}`, at[0], at[1] - (f.h * s) / 2, depth, opacity, { sx: Math.sign(f.s) * s, sy: s });
    poses.get(`fig-${id}`)?.forEach((img, i) => setOpacity(img, weights[i] ?? 0));
    const phase = id.length * 1.7;
    const breath = breathe.get(`fig-${id}`);
    if (breath) breath.style.transform = `scale(${1 + 0.006 * Math.sin(time * 0.9 + phase)}, ${1 + 0.012 * Math.sin(time * 1.5 + phase)}) rotate(${0.004 * Math.sin(time * 0.6 + phase)}rad)`;
  };
  const poseWeights = (v: number, n: number) => Array.from({ length: n }, (_, i) => clamp01(1 - Math.abs(v - i)));
  const sway = (id: string, rad: number) => {
    const s = sways.get(id);
    if (s) s.style.transform = `rotate(${rad}rad)`;
  };
  /** a point along a quadratic curve through the room */
  const bez = (a: number[], c: number[], b: number[], t: number) => [
    (1 - t) * (1 - t) * a[0] + 2 * (1 - t) * t * c[0] + t * t * b[0],
    (1 - t) * (1 - t) * a[1] + 2 * (1 - t) * t * c[1] + t * t * b[1],
  ];

  function update(st: FilmState, cam: Camera, v: Viewport, stage: Stage, time: number, now: number): WorldOut {
    camB = cam;
    vp = v;
    pad = stage.on ? Math.max(v.vw, v.vh) * 0.35 : 0;
    const B = CH4.beats;
    const f = st.form;

    // ── dining: the guest, the phone, the scan ──────────────────────────────────────
    const lift = clamp01(st.phone);
    const second = clamp01(st.phone2);
    const inHand = st.th1 < 1.999 || now < B.b1 ? 1 : 0; // once we have passed through it, the phone goes down until the adisyon
    const reach = clamp01(clamp01(lift * 1.6) * inHand + second);
    // while the camera pushes into the closed table's tile, the guest (just as near) steps out of the way
    const through = st.gMgmt > 0 && st.gMgmt < 1 ? smooth(0.05, 0.4, st.gMgmt) : 0;
    figure('guest', time, [1 - reach, reach], 1 - through);
    const [pr0, pr1] = G.dining.phoneRest;
    const [ps0, ps1] = G.dining.phoneScan;
    const up = Math.max(ease(lift) * inHand, ease(second));
    const phoneX = lerp(pr0, ps0, up);
    const phoneY = lerp(pr1, ps1, up);
    const phS = G.dining.phoneScale;
    // the phone exists while the guest holds it; while a surface is open it IS the surface, so it steps aside
    const held = win(now, B.a2 - 0.05, B.b1, 0.12) + win(now, B.e1 - 0.05, B.t5 + 0.4, 0.12);
    const inSurface =
      st.th1 > 0 && st.th1 < 2 ? (st.th1 <= 1 ? clamp01(st.th1 / 0.4) : 1 - clamp01((st.th1 - 1.78) / 0.22))
      : st.th5 > 0 && st.th5 < 2 ? clamp01(st.th5 / 0.4)
      : st.th7 > 0 && st.th7 < 3 ? clamp01(st.th7 / 0.4) : 0;
    const phoneOpacity = clamp01(Math.max(lift * inHand, second) * 1.5) * (1 - inSurface) * clamp01(held);
    place('phone', phoneX, phoneY, G.dining.depth, phoneOpacity, { rot: lerp(0.22, 0.06, up), sx: phS, sy: phS, keep: true });
    ui.phoneSweep.style.top = `${70 + 120 * (0.5 + 0.5 * Math.sin(time * 3.2))}px`;
    const appShown = st.phone2 > 0 ? 1 : clamp01((st.scan - 0.85) / 0.15);
    const sent = st.phone2 > 0 ? 0 : clamp01((st.send - 0.5) * 2);
    setOpacity(ui.phoneScan, 1 - appShown);
    setOpacity(ui.phoneApp, appShown);
    setOpacity(ui.phoneSent, sent);
    const scanOn = Math.sin(Math.PI * clamp01(st.scan));
    place('scanLines', 1445, 650, G.dining.depth, scanOn);
    const lock = ease(clamp01(st.scan / 0.6));
    const [tentX, tentY] = G.tableTent;
    place('tentFlash', tentX, tentY - 1, G.dining.depth, clamp01(st.scan * 4) * (1 - clamp01((st.th1 - 0.3) / 0.4)), { sx: lerp(1.5, 1, lock), sy: lerp(1.5, 1, lock) });
    ui.sweep.style.top = `${6 + 132 * (0.5 + 0.5 * Math.sin(time * 3.2))}px`;
    ui.scanDash.style.strokeDashoffset = String(-time * 40);
    // after payment the table's own session is visibly finished, at the table
    place('tableTag', tentX, tentY - 150, G.dining.depth, clamp01(st.tableDone * 1.6) * (1 - clamp01(st.gMgmt * 4)), { sy: lerp(0.6, 1, ease(clamp01(st.tableDone))), keep: true });

    // waiter: idle at the counter (he never takes the order) → waits at the hatch → carries the dish to Masa 7
    let tray: [number, number] | null = null;
    let trayDepth = G.dining.waiterDepth;
    const atCounter = now < B.t3 || now >= B.t4;
    if (atCounter) {
      figure('waiter', time, [1, 0, 0], 1, G.service.waiter);
    } else if (now >= B.e1) {
      // served: he walks back out of the frame, so the table moments stay uncluttered
      const e = ease(clamp01((now - B.e1) / 0.45));
      const [wx0, wy0] = G.dining.waiterTo;
      const [wx1] = G.dining.waiterFrom;
      const x = lerp(wx0 + 160, wx1 + 300, e);
      const stepping = e > 0.02 && e < 0.98;
      figure('waiter', time, stepping && Math.floor(x / 60) % 2 ? [0, 0, 1] : [stepping ? 0 : 1, stepping ? 1 : 0, 0], 1 - clamp01((e - 0.7) / 0.3), [x, wy0], G.dining.waiterScale, G.dining.waiterDepth);
    } else {
      const c = clamp01(st.carry);
      const [wx0, wy0] = G.dining.waiterFrom;
      const [wx1, wy1] = G.dining.waiterTo;
      const walkX = lerp(wx0, wx1, ease(c));
      const walking = c > 0.2 && c < 0.98;
      const step = Math.floor(walkX / 60) % 2;
      const hold = clamp01(st.carry / 0.08) * (1 - clamp01((st.carry - 1.2) / 0.1));
      const weights = walking && step ? [1 - hold, 0, hold] : [1 - hold, hold, 0];
      const back = clamp01(st.carry - 1) * 160;
      const ax = walkX + back;
      const ay = lerp(wy0, wy1, c) - (walking ? Math.abs(Math.sin(walkX / 38)) * 6 : 0);
      // he walks out of the depth of the room toward the table: further back at the hatch, nearer at Masa 7
      trayDepth = lerp(-0.04, G.dining.waiterDepth, ease(c));
      const sc = lerp(0.74, G.dining.waiterScale, ease(c));
      figure('waiter', time, weights, 1, [ax, ay], sc, trayDepth);
      // the tray sits on his raised forearm (sprite-local 30, 144 of a 300 × 560 figure)
      tray = [ax + (30 - 150) * sc, ay + (144 - 560) * sc];
    }

    // ── kitchen ────────────────────────────────────────────────────────────────────
    const K = G.kitchen;
    K.heatLamps.forEach((x, i) => place(`heat${i}`, x, K.pass[2] - 40, 0, 0.8 + 0.2 * Math.sin(time * (2.3 + i * 0.7) + i * 2) * Math.sin(time * 5.1 + i)));
    place('kitchenPool', 3900, 560, 0, 0.75 + 0.1 * pulse(time, 0.7));
    const [prx] = K.printer;
    const printerY = DEV.printer.c[1];
    place('printer', prx, printerY - 10, 0, 1, { sx: 1.25, sy: 1.25 });
    setOpacity(ui.led, 0.5 + 0.5 * pulse(time, 3));
    const slipH = 170 * ease(clamp01(st.printer));
    const slipCy = printerY - 10 - DEV.printer.h * 0.625 + 36 - slipH / 2;
    place('slip', prx, slipCy, 0, clamp01(st.printer * 3) * (1 - (st.th2 > 0 && st.th2 < 2 ? 1 : 0)), { sy: Math.max(0.001, slipH / 170), rot: 0.03 * Math.sin(time * 1.3) * clamp01(st.printer) });
    // the KDS brightens as the printed ticket comes out: the same order, on the screen too
    place('kdsGlow', K.kdsCenter[0], K.kdsCenter[1], 0, 0.7 + 0.18 * pulse(time, 1.4) + 0.3 * win(f, 2.6, 3.2, 0.2) + 0.4 * clamp01(st.kdsExtra) + 0.45 * Math.sin(Math.PI * clamp01(st.printer)));
    place('kds', K.kdsCenter[0], K.kdsCenter[1], 0, 1);
    // Masa 7's card is on the kitchen screen as soon as the ticket prints; the painted modules settle into it later
    setOpacity(ui.kdsCards[0], Math.max((f - 2.75) / 0.25, st.printer * 2 - 0.4));
    setOpacity(ui.kdsDot, 0.4 + 0.6 * pulse(time, 4));
    const extraOn = clamp01(st.kdsExtra);
    setOpacity(ui.kdsExtra, extraOn);
    ui.kdsExtra.style.transform = `translateY(${(1 - ease(extraOn)) * 14}px) scale(${1 + 0.05 * pulse(time, 4) * extraOn})`;
    const sec = Math.floor(time);
    if (sec !== lastSecond) {
      lastSecond = sec;
      const fmt = (s: number) => `${String(Math.floor(s / 60) % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
      ui.kdsTimers.forEach((el, i) => setText(el, fmt(400 + i * 173 + (sec % 3600))));
    }
    const status0 = extraOn > 0.5 ? 'Ek · Yeni' : st.kdsReady > 0.5 ? 'Hazır' : st.chefLook > 0.5 ? 'Hazırlanıyor' : 'Yeni';
    const statusLabel = ui.kdsStatus0.firstElementChild as HTMLElement | null;
    if (statusLabel) setText(statusLabel, status0);
    ui.kdsStatus0.style.background = status0 === 'Hazır' ? '#7dffb0' : GOLD;
    figure('chef', time, poseWeights(st.chefLook, 3));
    figure('cook', time, [1]);
    [0, 1].forEach((i) => place(`flame${i}`, [4460, 4630][i], K.stove[2] - 12, 0, 0.75 + 0.25 * Math.sin(time * 9 + i * 3), { sy: 0.8 + 0.3 * Math.abs(Math.sin(time * 7.3 + i)) }));
    for (let i = 0; i < 4; i++) {
      const rise = (time * 0.28 + i / 4) % 1;
      const x = (i % 2 ? 4630 : 4460) + Math.sin(time * 0.8 + i) * 20 + rise * 30;
      place(`steam${i}`, x, K.stove[2] - 110 - rise * 260, 0, Math.sin(Math.PI * rise) * 0.85, { sx: 0.8 + rise * 0.9, sy: 0.8 + rise * 0.7 });
    }
    // the dish is a single object all the way: the chef slides it to the hatch, the waiter lifts it onto
    // his tray, carries it and sets it down on Masa 7 — no teleporting, no floating
    const [hx, hy] = K.hatchShelf;
    const passX = lerp(K.chef[0] - 120, hx + 40, ease(clamp01(st.plate)));
    let dishX = passX;
    let dishY = hy - 22;
    let dishDepth = 0;
    let dishScale = 1;
    if (tray) {
      const liftD = ease(clamp01((st.carry - 0.02) / 0.16));
      const down = ease(clamp01((st.carry - 1.0) / 0.34));
      const [tpx2, tpy2] = G.dining.tablePlate;
      dishX = lerp(lerp(passX, tray[0], liftD), tpx2, down);
      dishY = lerp(lerp(hy - 22, tray[1] - 12, liftD), tpy2, down);
      dishDepth = lerp(lerp(0, trayDepth, liftD), G.dining.depth, down);
      dishScale = lerp(lerp(1, 0.52, liftD), 0.82, down);
    }
    place('plate', dishX, dishY, dishDepth, clamp01(st.plate * 6), { sx: dishScale, sy: dishScale });
    place('readyTag', passX, hy - 90, 0, clamp01((st.plate - 0.6) / 0.2) * (1 - clamp01(st.carry / 0.06)));
    place('hatchGlow', hx, 540, 0, 0.5 + 0.2 * pulse(time, 1.2) + 0.45 * win(now, B.c5, B.d1 + 0.3, 0.3));
    place('fg-rail', 3150, -170, -0.25, 1);
    sway('fg-rail', 0.004 * Math.sin(time * 0.7));
    place('fg-crates', 2620, 1060, -0.3, win(now, B.t2, B.t3 + 0.2, 0.2));
    // the hatch pillar frames the kitchen; during the walk it would stand in front of the one thing that matters
    place('fg-hatch', 2700, 470, -0.2, 1 - 0.9 * win(now, B.c5, B.e1, 0.25));
    // dining foreground: a chair and a plant the tracking camera passes, so the walk reads as distance
    place('fg-chair', 1960, 1080, -0.42, win(now, B.t3 + 0.3, B.e1 + 0.3, 0.2));
    place('fg-plant2', 2440, 1160, -0.4, win(now, B.t3 + 0.3, B.d3 + 0.4, 0.2));
    sway('fg-plant2', 0.01 * Math.sin(time * 0.5));

    // ── front counter: the cashier sees which table ordered what, when, with which note ──
    const S = G.service;
    place('pendant', S.lamp[0], S.lamp[1] + 220, 0, 1);
    const swing = 0.03 * Math.sin(time * 0.8);
    sway('pendant', swing);
    place('lampGlow', S.lamp[0] - Math.sin(swing) * 420, S.lamp[1] + 470, 0, 0.85 + 0.1 * pulse(time, 2.1));
    place('counterPool', 5900, 640, 0, 0.8 + 0.1 * pulse(time, 0.6));
    place('beamService', 5950, 480, 0, 0.55 + 0.2 * pulse(time, 0.35));
    const look = clamp01(st.cashierLook + st.posPaid * 0.8 + clamp01(st.billReq) * (now > B.t5 ? 1 : 0));
    figure('cashier', time, [1 - look, look]);
    place('cashierGlow', CS[0], CS[1], 0, 0.6 + 0.2 * pulse(time, 1.3) + 0.3 * clamp01(st.posPaid));
    place('cashierMon', DEV.cashierMon.c[0], DEV.cashierMon.c[1], 0, 1, { sx: CASHIER_K, sy: CASHIER_K });
    const billState = now >= B.p2 || st.posPaid > 0.5 ? 2 : st.billReq > 0.5 ? 1 : 0;
    const extraState = st.extra >= 1.5;
    ui.row7.style.transform = `translateX(${(1 - ease(clamp01(st.rowNew))) * 60}px)`;
    setOpacity(ui.row7, st.rowNew + (billState || extraState ? 1 : 0));
    const row7Pulse = billState ? 0 : pulse(time, 4) * clamp01(st.rowNew) * (1 - clamp01(st.ticket));
    ui.row7.style.boxShadow = `inset 0 0 0 3px ${billState === 2 ? '#7dffb0' : billState === 1 ? '#e3a83b' : GOLD}, 0 0 ${10 + 14 * row7Pulse}px rgba(232,198,106,${(0.5 * row7Pulse).toFixed(2)})`;
    setHTML(
      ui.row7Status,
      billState === 2 ? chipHTML('Ödendi ✓', '#7dffb0', '#10262a', 14) : billState === 1 ? chipHTML('Hesap istendi', '#e3a83b', '#2a1d14', 14) : extraState ? chipHTML('+ Ek', GOLD, '#10262a', 14) : chipHTML('YENİ', GOLD, '#10262a', 14),
    );
    setHTML(
      ui.row7Items,
      `<span data-ui-text>${
        billState
          ? `${[...ORDER.items, ORDER.extra].map((d) => MENU_DISHES[d]).join(', ')} · ₺${orderTotal()}`
          : extraState
            ? `${MENU_DISHES[ORDER.items[0]]}, ${MENU_DISHES[ORDER.items[1]]} <b style="color:${GOLD}">+ ${MENU_DISHES[ORDER.extra]}</b><br/>Not: ${ORDER.note}`
            : `${MENU_DISHES[ORDER.items[0]]}, ${MENU_DISHES[ORDER.items[1]]}<br/>Not: ${ORDER.note}`
      }</span>`,
    );
    setHTML(ui.panelFoot, `<span data-ui-text>${billState === 2 ? 'Masa kapandı' : billState === 1 ? `Toplam ₺${orderTotal()}` : `Not: ${ORDER.note}`}</span>`);
    const paid = clamp01(st.posPaid);
    setOpacity(ui.paidStamp, paid);
    ui.paidStamp.style.transform = `rotate(${lerp(-0.34, -0.12, ease(paid))}rad) scale(${lerp(1.5, 1, ease(paid))})`;
    ui.row7.style.background = billState === 2 ? 'rgba(125,255,176,0.16)' : billState === 1 ? 'rgba(227,168,59,0.16)' : 'rgba(232,198,106,0.16)';
    place('fg-stools', 5750, 1060, -0.2, 1);
    place('fg-counter', 6200, 1010, -0.34, win(now, B.t1 + 1.4, B.t2 + 0.9, 0.25) + win(now, B.t4 + 0.7, B.e3 + 0.2, 0.25) + win(now, B.t5 + 0.8, B.t6 + 0.5, 0.25));
    place('passGlow', PASS_WIN[0], PASS_WIN[1], 0, 0.45 + 0.15 * pulse(time, 1.1) + 0.6 * win(st.ticket, 1.35, 1.75, 0.12) + 0.5 * win(st.sparkX, 0.2, 0.7, 0.1));

    // the sent order leaves the table and runs along the room to the till, ahead of the camera
    const op = clamp01(st.orderPulse);
    const [opx, opy] = bez([1640, 440], [3700, 110], ROW7, ease(op));
    const opGlow = op > 0 && op < 1 ? Math.sin(Math.PI * Math.min(1, op * 1.1)) + 0.25 : 0;
    place('pulse', opx, opy, 0, opGlow, { sx: 2.2 + 0.3 * pulse(time, 9), sy: 2.2 + 0.3 * pulse(time, 9) });

    // ── the ORDER TICKET: produced by the Masa 7 row, followed by the camera to the kitchen printer ──
    //   0 → 1  it slides up out of the till, small, and turns into a slip of paper
    //   1 → 2  the flight: the same path curve and easing as the camera's t2 travel, so the two stay locked
    //   2 → 3  down into the printer's slot (the printed slip then comes out: st.printer)
    // Exists only strictly between 0 and 3, so it can never linger before or after its range, in either direction.
    const tk = st.ticket;
    if (tk > 0.001 && tk < 2.999) {
      const TP = G.ticket.path as number[][];
      const path6 = TP.map(([x, y, s]) => [x, y, s, 0, 0, 0]);
      let tx: number;
      let ty: number;
      let ts: number;
      let a = 1;
      let rot: number;
      if (tk <= 1) {
        const e = ease(tk);
        tx = lerp(ROW7[0], TP[0][0], e);
        ty = lerp(ROW7[1], TP[0][1], e);
        ts = lerp(0.18, TP[0][2], e);
        a = clamp01(tk * 3);
        rot = lerp(0, -0.06, e);
      } else if (tk <= 2) {
        const u = tk - 1;
        const p = pathAt(path6, u * u * (3 - 2 * u));
        tx = p[0];
        ty = p[1];
        ts = p[2];
        // a sheet of paper in moving air: a slow flutter, strongest mid-flight
        rot = -0.06 + Math.sin(Math.PI * u) * 0.05 * Math.sin(time * 2.2) - 0.03 * Math.sin(Math.PI * u);
      } else {
        const e = ease(tk - 2);
        const last = TP[TP.length - 1];
        const [slx, sly, sls] = G.ticket.slot;
        tx = lerp(last[0], slx, e);
        ty = lerp(last[1], sly, e);
        ts = lerp(last[2], sls, e);
        a = 1 - clamp01((tk - 2.45) / 0.5);
        rot = lerp(-0.02, 0, e);
      }
      place('ticket', tx, ty, G.ticket.depth, a, { sx: ts, sy: ts, rot, keep: true });
    } else place('ticket', 0, 0, 0, 0);

    // the extra order's small ticket: counter → through the service arch → onto the kitchen pass under the KDS
    const sx = st.sparkX;
    if (sx > 0.001 && sx < 1.999) {
      const u = ease(clamp01(sx));
      const [epx, epy] = G.ticket.extraPass;
      const [ax2, ay2] = u < 0.45 ? bez(ROW7, [5560, 180], PASS_WIN, u / 0.45) : bez(PASS_WIN, [4300, 260], [epx, epy], (u - 0.45) / 0.55);
      place('ticketX', ax2, ay2, G.ticket.depth, clamp01(sx * 4) * (1 - clamp01(sx - 1)), { sx: 1.15, sy: 1.15, rot: sx < 1 ? 0.04 * Math.sin(time * 2.4) : -0.05 });
    } else place('ticketX', 0, 0, 0, 0);

    // ── storeroom (building overview) ──────────────────────────────────────────────
    const R = G.storeroom;
    const bulbSwing = 0.05 * Math.sin(time * 0.55) + 0.02 * Math.sin(time * 1.3);
    place('bulb', R.bulb[0], 1400 + 190, 0, 1);
    sway('bulb', bulbSwing);
    place('bulbGlow', R.bulb[0] - Math.sin(bulbSwing) * 380, 1880, 0, 0.75 + 0.08 * Math.sin(time * 13) * Math.sin(time * 3.1) + 0.1 * pulse(time, 0.9));
    figure('keeper', time, [1]);
    place('tablet', DEV.tablet.c[0], DEV.tablet.c[1], 0, 1, { rot: -0.08 + 0.01 * Math.sin(time * 0.9) });

    // ── office: the business side ───────────────────────────────────────────────────
    const O = G.office;
    place('beamOffice', 3900, -1150, 0, 0.6 + 0.2 * pulse(time, 0.3));
    place('clock', O.clock[0], O.clock[1], 0, 1);
    const minutes = 60 * (9 + st.day * 9) + (time % 60) / 60;
    ui.hands.h.style.transform = `rotate(${(minutes / 720) * 360}deg)`;
    ui.hands.m.style.transform = `rotate(${(minutes % 60) * 6}deg)`;
    ui.hands.s.style.transform = `rotate(${Math.floor(time) * 6}deg)`;
    figure('manager', time, [1 - clamp01(st.managerLean), clamp01(st.managerLean)]);
    place('deskLamp', O.lamp[0], O.desk[2] - 70, 0, 1);
    place('deskLampGlow', O.lamp[0], O.desk[2] - 20, 0, 0.75 + 0.1 * pulse(time, 1.7));
    place('monitorGlow', O.monitorCenter[0], O.monitorCenter[1], 0, 0.55 + 0.15 * pulse(time, 1.1) + 0.1 * clamp01(st.ops - 3));
    place('monitor', DEV.monitor.c[0], DEV.monitor.c[1], 0, 1);
    place('auxScreen', DEV.aux.c[0], DEV.aux.c[1], 0, 1, { rot: -0.05 });
    setOpacity(ui.auxDot, 0.4 + 0.6 * pulse(time, 3.4));
    const view = Math.max(1, st.ops);
    ui.views.forEach((el, i) => setOpacity(el, 1 - Math.abs(view - (i + 1))));
    const activeTab = ['Siparişler', 'Stok', 'Cari', 'Rapor'][Math.min(3, Math.round(view) - 1)];
    for (const [tab, el] of ui.tabs) el.style.background = tab === activeTab || (tab === 'e-Fatura' && activeTab === 'Cari' && st.invoice > 0.5) ? '#2c5a58' : 'transparent';
    setOpacity(ui.low, clamp01(st.reorder) * (0.65 + 0.35 * pulse(time, 4)));
    const inv = ease(clamp01(st.invoice));
    place('invoice', O.invoice[0], O.invoice[1] - 60 * inv - 60, 0, clamp01(st.invoice * 5), { rot: lerp(0, -0.05, inv), sy: Math.max(0.001, lerp(0.2, 1, inv)) });
    place('fg-plant', 5560, -560, -0.25, win(now, B.h2 - 0.3, B.h4 + 0.3, 0.1));

    // ── sky ─────────────────────────────────────────────────────────────────────────
    place('cloudA', 2600 + ((time * 14) % 3600), -3500, 0, 0.85);
    place('cloudB', 4200 + ((time * 9 + 1800) % 3600), -3050, 0, 0.75);
    place('stringLights', 4250, -2215, 0, 0.5 + 0.5 * clamp01((st.day - 0.7) / 0.3));
    ui.bulbs.forEach((b, i) => (b.style.opacity = String(0.55 + 0.45 * Math.sin(time * (1.2 + (i % 5) * 0.37) + i))));

    return { phoneX, phoneY };
  }

  const clear = () => {
    for (const el of props.values()) if (el.style.visibility !== 'hidden') el.style.visibility = 'hidden';
  };
  return { update, clear };
}

export function createChapter4Updater(root: HTMLElement) {
  const q = (sel: string) => (root.querySelector(sel) as HTMLElement | null) ?? document.createElement('div');
  const qa = (sel: string) => Array.from(root.querySelectorAll<HTMLElement>(sel));
  const hideText = process.env.NODE_ENV !== 'production' && typeof window !== 'undefined' ? Number(new URLSearchParams(window.location.search).get('hideText') ?? 0) : 0;
  const texts = BEAT_TEXTS.map((t) => ({ key: t.key, el: q(`[data-text="${t.key}"]`), pool: q(`[data-pool4="${t.key}"]`) }));
  const closerPool = q('[data-pool4="textCloser"]');
  /** a pool follows its text's own fade (the same curve as PortalFilm's textStyle) */
  const poolOpacity = (v: number) => (v <= 0.001 || v >= 1.999 ? '0' : (v <= 1 ? Math.min(1, v * 1.6) : 1 - (v - 1)).toFixed(3));
  const closer = q('[data-text="textCloser"]');
  const grade = q('[data-grade]');
  const gradeGlow = q('[data-grade-glow]');
  const vignette = q('[data-vignette]');
  const portalFlare = q('[data-portal-flare]');
  const wall = q('[data-wall]');
  const mainWorldEl = q('[data-ch4-world="main"]');
  const innerWorldEl = q('[data-ch4-world="inner"]');
  const mainWorld = createWorldUpdater(mainWorldEl, hideText);
  const innerWorld = createWorldUpdater(innerWorldEl, hideText);
  const surface = q('[data-surface]');
  const surfaceBg = q('[data-surface-bg]');
  const surfaceScreens = q('[data-surface-screens]');
  const surfaceVeil = q('[data-surface-veil]');
  const surfaceLight = q('[data-surface-light]');
  const surfaceGloss = q('[data-surface-gloss]');
  const screens = Object.fromEntries((Object.keys(BOX) as ScreenId[]).map((id) => [id, q(`[data-screen="${id}"]`)])) as Record<ScreenId, HTMLElement>;
  for (const el of Object.values(screens)) if (el.parentElement !== surfaceScreens) surfaceScreens.appendChild(el);
  const portalClip = q('[data-portal-clip]');
  const portalStage = q('[data-portal-stage]');
  const portalHaze = q('[data-portal-haze]');
  const portalRim = q('[data-portal-rim]');
  const innerPlates = INNER_PLATES.map((def) => ({ def, el: q(`[data-inner-plate="${def.id}"]`) }));
  const mgmt = q('[data-mgmt]');
  const mgmtLinks = q('[data-mgmt-links]');
  const mgmtLinkEls = qa('[data-mgmt-link]').map((g) => ({ path: g.querySelector('path')!, dot: g.querySelector('circle')! }));
  const mgmtKpiActive = q('[data-mgmt-kpi="0"]');
  const mgmtKpiKitchen = q('[data-mgmt-kpi="1"]');
  const mgmtKpiBill = q('[data-mgmt-kpi="2"]');
  const mgmtLive = q('[data-mgmt-live]');
  const ui = {
    menuAdds: qa('[data-menu-add]'),
    note: q('[data-note]'),
    cart: q('[data-cart]'),
    send: q('[data-send]'),
    sent: q('[data-sent]'),
    ticketLines: qa('[data-ticket-line]'),
    extraRow: q('[data-extra-row]'),
    extraStatus: q('[data-extra-status]'),
    extraToast: q('[data-extra-toast]'),
    btnExtra: q('[data-btn-extra]'),
    btnBill: q('[data-btn-bill]'),
    billBanner: q('[data-bill-banner]'),
  };
  const cache = new Map<Element, string>();
  const setText = (el: HTMLElement | null, value: string) => {
    if (!el) return;
    if (cache.get(el) !== value) {
      el.textContent = value;
      cache.set(el, value);
    }
  };
  const setHTML = (el: HTMLElement | null, value: string) => {
    if (!el) return;
    if (cache.get(el) !== value) {
      el.innerHTML = value;
      cache.set(el, value);
      if (hideText >= 2) el.querySelectorAll<HTMLElement>('[data-ui-text]').forEach((t) => (t.style.visibility = 'hidden'));
    }
  };
  const vis = (el: HTMLElement | SVGElement, show: boolean) => {
    const v = show ? 'visible' : 'hidden';
    if (el.style.visibility !== v) el.style.visibility = v;
  };
  if (hideText >= 2) {
    root.querySelectorAll<HTMLElement>('[data-ui-text]').forEach((el) => (el.style.visibility = 'hidden'));
    root.querySelectorAll<HTMLElement>('[data-ui-label]').forEach((el) => el.setAttribute('data-hidden-label', '1'));
  }
  const setOpacity = (el: HTMLElement | SVGElement | null, v: number) => {
    if (!el) return;
    const s = clamp01(v).toFixed(3);
    if (el.style.opacity !== s) el.style.opacity = s;
  };
  const xf: LayerXf = { m: 1, tx: 0, ty: 0, ok: true };
  /** camera speed in screen px per second, used to defocus the room while the camera travels */
  const cam0 = { tx: 0, ty: 0, m: 0, time: -1, speed: 0 };

  /** screen rectangle (px) of a world rectangle at `depth`, through the stage orientation */
  const worldRect = (stage: Stage, camB: Camera, vp: Viewport, x0: number, y0: number, x1: number, y1: number, depth: number, r = 0): Rect => {
    layerTransform(camB, depth, xf);
    const px = (x: number) => (x * xf.m + xf.tx) * vp.b + vp.ox;
    const py = (y: number) => (y * xf.m + xf.ty) * vp.b + vp.oy;
    const pts = [[px(x0), py(y0)], [px(x1), py(y0)], [px(x1), py(y1)], [px(x0), py(y1)]].map(([x, y]) => (stage.on ? project(stage.wall, x, y) : { x, y }));
    const xs = pts.map((p) => p.x);
    const ys = pts.map((p) => p.y);
    const k = xf.m * vp.b;
    return { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys), r: r * k };
  };

  const fitScreen = (id: ScreenId, inner: Rect, opacity: number) => {
    const el = screens[id];
    if (opacity <= 0.002) {
      if (el.style.visibility !== 'hidden') el.style.visibility = 'hidden';
      return;
    }
    const [bw, bh] = BOX[id];
    const s = Math.min(inner.w / bw, inner.h / bh);
    el.style.visibility = 'visible';
    el.style.opacity = clamp01(opacity).toFixed(3);
    el.style.transform = `translate3d(${inner.w / 2 - (bw * s) / 2}px, ${inner.h / 2 - (bh * s) / 2}px, 0) scale(${s})`;
  };

  const clearSurface = () => {
    if (surface.style.visibility !== 'hidden') {
      surface.style.visibility = 'hidden';
      surface.style.opacity = '0';
      surface.style.transform = 'translate3d(0px, 0px, 0)';
      surface.style.width = surface.style.height = '0px';
    }
    for (const el of Object.values(screens)) if (el.style.visibility !== 'hidden') el.style.visibility = 'hidden';
    setOpacity(surfaceVeil, 0);
  };
  const clearPortal = () => {
    if (portalClip.style.visibility !== 'hidden') {
      portalClip.style.visibility = 'hidden';
      innerWorld.clear();
      for (const p of innerPlates) p.el.style.visibility = 'hidden';
    }
    if (portalRim.style.visibility !== 'hidden') portalRim.style.visibility = 'hidden';
  };
  const clearMgmt = () => {
    if (mgmt.style.visibility !== 'hidden') mgmt.style.visibility = 'hidden';
    if (mgmtLinks.style.visibility !== 'hidden') mgmtLinks.style.visibility = 'hidden';
  };
  const setWall = (css: string) => {
    if (wall.style.transform !== css) wall.style.transform = css === 'none' ? '' : css;
  };

  /** the plates of the portal view: same layout rules as the main stage (PortalFilm.tsx), another camera */
  const renderInnerPlates = (cam: Camera, vp: Viewport) => {
    for (const { def, el } of innerPlates) {
      layerTransform(cam, def.depth, xf);
      let opacity = def.opacity ?? 1;
      if (!xf.ok) {
        if (el.style.visibility !== 'hidden') el.style.visibility = 'hidden';
        continue;
      }
      if (def.depth < 0) opacity *= clamp01((7 - xf.m) / 3.2);
      if (opacity <= 0.001) {
        if (el.style.visibility !== 'hidden') el.style.visibility = 'hidden';
        continue;
      }
      const k = xf.m * vp.b;
      const [fx, fy] = fitPlate(el as HTMLImageElement, def);
      el.style.visibility = 'visible';
      el.style.opacity = String(opacity);
      el.style.transform = `translate3d(${(def.x * xf.m + xf.tx) * vp.b + vp.ox}px, ${(def.y * xf.m + xf.ty) * vp.b + vp.oy}px, 0) scale(${k * fx}, ${k * fy})`;
    }
  };

  /**
   * The rim of the one portal: the closed table's status tile keeps its own green edge while it grows, and
   * the warm light of the place beyond it builds up around that edge as we cross.
   */
  const RIM: Record<FrameStyle, (r: number, k: number, glow: number) => string> = {
    tile: (r, k, g) => `inset 0 0 0 ${4 * k}px #7dffb0, inset 0 0 ${22 * k}px ${6 * k}px rgba(125,255,176,${0.3 * g}), 0 0 ${58 * k}px ${16 * k}px rgba(255,214,150,${0.55 * g})`,
  };
  const HAZE: Record<FrameStyle, string> = {
    tile: 'rgba(255,220,160,0.55)',
  };

  /** look (x, y, zoom, yaw, pitch, roll) between two shots, in log-zoom */
  const mixShot = (a: number[], b: number[], t: number) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), Math.exp(lerp(Math.log(a[2]), Math.log(b[2]), t)), lerp(a[3] ?? 0, b[3] ?? 0, t), lerp(a[4] ?? 0, b[4] ?? 0, t), lerp(a[5] ?? 0, b[5] ?? 0, t)];
  /** a camera looking at wall point (cx, cy) with zoom z, placed so that point sits at (sx, sy) design px */
  const camAt = (cx: number, cy: number, z: number, sx: number, sy: number): Camera => {
    const s = PORTAL.B.size * z;
    const d = PORTAL.B.size / s;
    const px = sx + (PORTAL.B.cx - cx) * z;
    const py = sy + (PORTAL.B.cy - cy) * z;
    return { d, camX: PORTAL.B.cx - (px - 960) * d, camY: PORTAL.B.cy - (py - 540) * d };
  };

  return function update(st: FilmState, camB: Camera, vp: Viewport, time: number, textStyle: TextStyleFn, now = 0) {
    const active = st.ch4 >= 0.5;
    mainWorldEl.style.display = active ? 'block' : 'none';
    grade.style.opacity = '0';
    gradeGlow.style.opacity = '0';
    vignette.style.opacity = '0';
    setOpacity(portalFlare, active ? st.portalFlare * 0.9 : 0);
    for (const t of texts) {
      const v = active && !hideText ? st[t.key] : 0;
      textStyle(t.el, v);
      t.pool.style.opacity = poolOpacity(v);
    }
    const vc = active && !hideText ? st.textCloser : 0;
    textStyle(closer, vc);
    closerPool.style.opacity = poolOpacity(vc);
    if (!active) {
      setWall('none');
      wall.style.opacity = '';
      wall.style.display = '';
      wall.style.filter = '';
      clearSurface();
      mainWorld.clear();
      clearPortal();
      clearMgmt();
      return;
    }
    const stage = stageFor(orientOf(st), camB, vp);
    setWall(stage.wallCss);
    // Chapter 4 rooms get a little more contrast and depth than the soft Chapter 3 morning
    const grade4 = `contrast(${(1 + 0.1 * clamp01((now - CH4.start) / 1.5)).toFixed(3)}) saturate(1.06)`;
    if (wall.style.filter !== grade4) wall.style.filter = grade4;
    if (wall.style.opacity !== '') wall.style.opacity = '';
    if (wall.style.display !== '') wall.style.display = '';
    const g = gradeAt(st.day);
    // Chapter 5 hand-off: the warm restaurant grade gives way to the Kerinti night (st.night is 0 in Chapter 4)
    const warm = 1 - st.night;
    grade.style.backgroundColor = `rgb(${g.color.join(',')})`;
    grade.style.opacity = String(g.opacity * warm);
    gradeGlow.style.opacity = String(g.glow * warm);
    vignette.style.opacity = String(0.85 * clamp01(st.phone * 1.2 + st.form * 0.5) * warm);

    const w = mainWorld.update(st, camB, vp, stage, time, now);

    // camera speed (screen px/s) — measured from the wall plane's transform, direction-agnostic
    layerTransform(camB, 0, xf);
    if (cam0.time >= 0 && time !== cam0.time) {
      const dt = Math.min(0.2, Math.max(1 / 240, Math.abs(time - cam0.time)));
      const dx = (xf.tx - cam0.tx) * vp.b;
      const dy = (xf.ty - cam0.ty) * vp.b;
      const dz = Math.abs(xf.m - cam0.m) * 900 * vp.b;
      cam0.speed = lerp(cam0.speed, (Math.hypot(dx, dy) + dz) / dt, 0.5);
    }
    cam0.tx = xf.tx;
    cam0.ty = xf.ty;
    cam0.m = xf.m;
    cam0.time = time;

    // ── the management panel of the final frame ────────────────────────────────────
    // Not a diagram over a floor plan any more: the panel floats beside the workstation while the camera
    // pulls back, and three thin links reach down into the restaurant that is still working below it —
    // the till, the kitchen screen and the counter where the next bill is waiting.
    const mg = clamp01(st.mgmt);
    if (mg > 0.002) {
      const s = vp.b;
      vis(mgmt, true);
      mgmt.style.opacity = mg.toFixed(3);
      mgmt.style.transform = `translate3d(${vp.ox + 1044 * s}px, ${vp.oy + (166 + (1 - ease(mg)) * 26) * s}px, 0) scale(${s})`;
      setOpacity(mgmtLive, 0.45 + 0.55 * pulse(time, 3));
      vis(mgmtLinks, true);
      mgmtLinks.style.opacity = clamp01((mg - 0.4) / 0.6).toFixed(3);
      const anchor = (el: HTMLElement) => {
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.bottom - 2 };
      };
      /** the screen point of a place in the restaurant, under the live camera */
      const room = (x: number, y: number) => {
        const r = worldRect(stage, camB, vp, x - 2, y - 2, x + 2, y + 2, 0);
        return { x: r.x + r.w / 2, y: r.y + r.h / 2 };
      };
      const links: [{ x: number; y: number }, { x: number; y: number }][] = [
        [anchor(mgmtKpiActive), room(CS[0], CS[1])],
        [anchor(mgmtKpiKitchen), room(G.kitchen.kdsCenter[0], G.kitchen.kdsCenter[1])],
        [anchor(mgmtKpiBill), room(G.service.counter[1] - 260, G.service.counter[2] - 40)],
      ];
      links.forEach(([a, b], i) => {
        const e = ease(clamp01((mg - 0.45 - i * 0.12) / 0.4));
        const bx = lerp(a.x, b.x, e);
        const by = lerp(a.y, b.y, e);
        const cx = (a.x + bx) / 2;
        const cy = Math.min(a.y, by) - 40 * vp.b;
        mgmtLinkEls[i].path.setAttribute('d', `M${a.x.toFixed(1)} ${a.y.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${bx.toFixed(1)} ${by.toFixed(1)}`);
        mgmtLinkEls[i].dot.setAttribute('cx', bx.toFixed(1));
        mgmtLinkEls[i].dot.setAttribute('cy', by.toFixed(1));
        mgmtLinkEls[i].dot.setAttribute('opacity', e > 0.98 ? String(0.6 + 0.4 * pulse(time, 3, i)) : '0');
      });
    } else clearMgmt();

    // ── surfaces (screen space) ─────────────────────────────────────────────────────
    // A surface is an object held up in the room (phone, slip, adisyon, bill): it grows out of the real
    // object, the room stays visible and defocused behind it, and it goes back where it came from.
    let rect: Rect | null = null;
    const show: Partial<Record<ScreenId, number>> = {};
    let bezel = 0;
    let bg = '#15181b';
    let frame: 'device' | 'paper' = 'device';
    let tilt = 0;
    let fade = 1;
    const growFade = (p: number) => clamp01(p / 0.22);
    const landFade = (p: number) => 1 - clamp01((p - 0.78) / 0.22);
    const phS = G.dining.phoneScale;
    const phoneRect = () => worldRect(stage, camB, vp, w.phoneX - 75 * phS, w.phoneY - 150 * phS, w.phoneX + 75 * phS, w.phoneY + 150 * phS, G.dining.depth, 18 * phS);
    const gate = (): Rect => ({ x: -vp.vw * 0.07, y: -vp.vh * 0.07, w: vp.vw * 1.14, h: vp.vh * 1.14, r: 26 * vp.b });
    const peak = (from: Rect, aspect: number, hFrac: number, anchorX: number, radius: number, keep: 'right' | 'left' | null = null): Rect => {
      const h = Math.min(vp.vh * hFrac, vp.vh - 90 * vp.b);
      const wd = Math.min(h * aspect, vp.vw * 0.66);
      const srcCx = from.x + from.w / 2;
      let cx = Math.min(Math.max(lerp(srcCx, vp.vw * anchorX, 0.5), wd / 2 + 24), vp.vw - wd / 2 - 24);
      if (keep === 'right') cx = Math.max(cx, vp.vw * 0.44 + wd / 2);
      if (keep === 'left') cx = Math.min(cx, vp.vw * 0.5 - wd / 2);
      const cy = Math.min(Math.max(lerp(from.y + from.h / 2, vp.vh * 0.5, 0.7), h / 2 + 24), vp.vh - h / 2 - 24);
      return { x: cx - wd / 2, y: cy - h / 2, w: wd, h, r: radius * vp.b };
    };
    /** a surface that is being crossed as a portal opens past the screen edges */
    const open = (r: Rect, gp: number) => lerpRect(r, gate(), ease(clamp01((gp - PHYSICAL) / (COVER - PHYSICAL))));

    if (st.th1 > 0.001 && st.th1 < 1.999) {
      // the guest's phone, held up: menu → choose → note → send, then back into his hand
      const src = phoneRect();
      const top = peak(src, 0.52, 0.7, 0.6, 40, 'right');
      rect = st.th1 <= 1 ? lerpRect(src, top, ease(st.th1)) : lerpRect(top, src, ease(st.th1 - 1));
      fade = st.th1 <= 1 ? growFade(st.th1) : landFade(st.th1 - 1);
      show.menu = 1;
      tilt = lerp(0.14, 0.022, ease(Math.min(1, st.th1))) * (st.th1 <= 1 ? 1 : 1 - ease(st.th1 - 1) * 0.6);
      bezel = 16 * vp.b;
    } else if (st.th2 > 0.001 && st.th2 < 1.999) {
      // a LOCAL PUSH-IN, not a portal: the slip that just printed is lifted up to be read and set back down
      const [prx] = G.kitchen.printer;
      const cy = DEV.printer.c[1] - 10 - DEV.printer.h * 0.625 + 36 - 85;
      const slipRect = worldRect(stage, camB, vp, prx - 60, cy - 85, prx + 60, cy + 85, 0, 2);
      const top = peak(slipRect, 0.66, 0.72, 0.36, 8, 'left');
      rect = st.th2 <= 1 ? lerpRect(slipRect, top, ease(st.th2)) : lerpRect(top, slipRect, ease(st.th2 - 1));
      fade = st.th2 <= 1 ? growFade(st.th2) : landFade(st.th2 - 1);
      show.ticket = 1;
      frame = 'paper';
      tilt = lerp(0.05, -0.018, ease(Math.min(1, st.th2)));
      bg = '#f6eedc';
    } else if (st.th5 > 0.001 && st.th5 < 1.999) {
      // the same table's adisyon on the same phone, and back down into the guest's hand afterwards
      const src = phoneRect();
      const beside = peak(src, 0.52, 0.68, 0.3, 40, 'left');
      rect = st.th5 <= 1 ? lerpRect(src, beside, ease(st.th5)) : lerpRect(beside, src, ease(st.th5 - 1));
      fade = st.th5 <= 1 ? growFade(st.th5) : landFade(st.th5 - 1);
      show.session = 1;
      tilt = lerp(0.14, 0.03, ease(Math.min(1, st.th5))) * (st.th5 <= 1 ? 1 : 1 - ease(st.th5 - 1) * 0.6);
      bezel = 16 * vp.b;
    } else if (st.th7 > 0.001 && st.th7 < 2.999) {
      // the bill: the phone reopens, the request becomes the bill in his hand, and the bill is set back down
      const src = phoneRect();
      const beside = peak(src, 0.52, 0.68, 0.3, 40, 'left');
      const billTop = peak(src, 0.66, 0.64, 0.34, 20, 'left');
      const paper = st.th7 > 1.2;
      rect =
        st.th7 <= 1 ? lerpRect(src, beside, ease(st.th7))
        : st.th7 <= 2 ? lerpRect(beside, billTop, ease(st.th7 - 1))
        : lerpRect(billTop, src, ease(st.th7 - 2));
      fade = st.th7 <= 2 ? growFade(st.th7) : landFade(st.th7 - 2);
      show.session = 1 - clamp01((st.th7 - 1.2) * 2);
      show.bill = clamp01((st.th7 - 1.2) * 2);
      frame = paper ? 'paper' : 'device';
      tilt = lerp(0.14, paper ? -0.015 : 0.03, ease(Math.min(1, st.th7))) * (st.th7 <= 2 ? 1 : 1 - ease(st.th7 - 2) * 0.6);
      bezel = paper ? 0 : 16 * vp.b;
      bg = paper ? '#f6eedc' : '#15181b';
    }

    // ── the one portal window: the closed table's status tile ───────────────────────
    let portal: PortalDef | null = null;
    let gp = 0;
    for (const p of PORTALS) {
      const v = st[p.key];
      if (v > 0.0005 && v < 0.9995) {
        portal = p;
        gp = v;
        break;
      }
    }
    if (portal) {
      const reveal = smooth(0.02, 0.3, gp);
      const [tx0, ty0, tx1, ty1] = portal.src.rect;
      const win0: Rect = open(worldRect(stage, camB, vp, tx0, ty0, tx1, ty1, portal.src.depth, 8), gp);
      // the next place, seen through the object: its camera drifts from the first glimpse to the arrival
      const shot = mixShot(SHOT[portal.wide], SHOT[portal.arrive], ease(gp));
      const cxs = (win0.x + win0.w / 2 - vp.ox) / vp.b;
      const cys = (win0.y + win0.h / 2 - vp.oy) / vp.b;
      const cover = clamp01((gp - PHYSICAL) / (COVER - PHYSICAL));
      const innerCam = camAt(shot[0], shot[1], shot[2], lerp(cxs, 960, ease(cover)), lerp(cys, 540, ease(cover)));
      const innerStage = stageFor({ yaw: shot[3], pitch: shot[4], roll: shot[5] }, innerCam, vp);
      // once the window reaches past every edge its corners are off screen too: no rounding left to leak through
      const past = Math.min(-win0.x, -win0.y, win0.x + win0.w - vp.vw, win0.y + win0.h - vp.vh);
      const rr = win0.r * clamp01(1 - past / Math.max(1, win0.r));
      const clip = `inset(${Math.max(0, win0.y).toFixed(1)}px ${Math.max(0, vp.vw - win0.x - win0.w).toFixed(1)}px ${Math.max(0, vp.vh - win0.y - win0.h).toFixed(1)}px ${Math.max(0, win0.x).toFixed(1)}px round ${rr.toFixed(1)}px)`;
      vis(portalClip, true);
      portalClip.style.clipPath = clip;
      portalClip.style.opacity = reveal.toFixed(3);
      portalStage.style.transform = innerStage.wallCss === 'none' ? '' : innerStage.wallCss;
      renderInnerPlates(innerCam, vp);
      innerWorld.update(st, innerCam, vp, innerStage, time, now);
      portalHaze.style.background = `radial-gradient(ellipse at ${((win0.x + win0.w / 2) / vp.vw * 100).toFixed(1)}% ${((win0.y + win0.h / 2) / vp.vh * 100).toFixed(1)}%, rgba(0,0,0,0) 30%, ${HAZE[portal.frame]} 100%)`;
      setOpacity(portalHaze, (1 - cover) * 0.7);
      // the rim of the object: it stays the object's own frame until it passes the edges of the screen
      const k = Math.max(0.35, Math.min(6, win0.w / (160 * vp.b))) * vp.b;
      vis(portalRim, cover < 0.999);
      portalRim.style.transform = `translate3d(${win0.x}px, ${win0.y}px, 0)`;
      portalRim.style.width = `${win0.w}px`;
      portalRim.style.height = `${win0.h}px`;
      portalRim.style.borderRadius = `${win0.r}px`;
      portalRim.style.boxShadow = RIM[portal.frame](win0.r, k, reveal);
      portalRim.style.opacity = (1 - cover * 0.6).toFixed(3);
    } else clearPortal();

    if (!rect || now < CH4.start - 0.05 || now > CH4.end + 0.05) {
      clearSurface();
    } else {
      // the room behind: dimmed and defocused in proportion to how much of it the panel takes, and further
      // defocused while the camera travels behind the panel
      const grip = clamp01((rect.w * rect.h) / (vp.vw * vp.vh) / 0.34) * fade;
      setOpacity(surfaceVeil, grip);
      const g2 = gradeAt(st.day);
      const travel = clamp01(cam0.speed / 2600);
      const blur = (3.5 + 11 * travel) * Math.max(0.6, vp.b);
      const veilBlur = `blur(${blur.toFixed(1)}px) saturate(${(0.92 - 0.12 * travel).toFixed(2)})`;
      if (surfaceVeil.style.backdropFilter !== veilBlur) {
        surfaceVeil.style.backdropFilter = veilBlur;
        surfaceVeil.style.setProperty('-webkit-backdrop-filter', veilBlur);
      }
      surfaceVeil.style.background = `rgba(${Math.round(g2.color[0] * 0.16)}, ${Math.round(g2.color[1] * 0.13)}, ${Math.round(g2.color[2] * 0.12)}, ${((0.24 + 0.16 * travel) * grip).toFixed(3)})`;
      surface.style.visibility = 'visible';
      surface.style.opacity = fade.toFixed(3);
      surface.style.width = `${rect.w}px`;
      surface.style.height = `${rect.h}px`;
      surface.style.transform = `translate3d(${rect.x}px, ${rect.y}px, 0) rotate(${tilt.toFixed(4)}rad)`;
      surface.style.borderRadius = `${rect.r}px`;
      const warm = `rgba(${g2.color[0]}, ${Math.round(g2.color[1] * 0.86)}, ${Math.round(g2.color[2] * 0.66)}`;
      surface.style.boxShadow = frame === 'paper'
        ? `0 ${(22 * vp.b).toFixed(0)}px ${(54 * vp.b).toFixed(0)}px rgba(26,14,6,${(0.42 * grip).toFixed(2)}), 0 0 ${(40 * vp.b).toFixed(0)}px ${warm},${(0.16 * grip).toFixed(2)})`
        : `0 ${(26 * vp.b).toFixed(0)}px ${(62 * vp.b).toFixed(0)}px rgba(8,10,12,${(0.5 * grip).toFixed(2)}), 0 0 ${(46 * vp.b).toFixed(0)}px ${warm},${(0.2 * grip).toFixed(2)}), inset 0 0 0 ${Math.max(1, 1.5 * vp.b).toFixed(1)}px rgba(255,255,255,0.1)`;
      setOpacity(surfaceBg, 1);
      surfaceBg.style.background = bg;
      surfaceBg.style.borderRadius = `${rect.r}px`;
      const inner: Rect = { x: bezel, y: bezel, w: rect.w - bezel * 2, h: rect.h - bezel * 2, r: Math.max(0, rect.r - bezel * 0.6) };
      surfaceScreens.style.left = `${inner.x}px`;
      surfaceScreens.style.top = `${inner.y}px`;
      surfaceScreens.style.width = `${inner.w}px`;
      surfaceScreens.style.height = `${inner.h}px`;
      surfaceScreens.style.borderRadius = `${inner.r}px`;
      surfaceLight.style.background = `linear-gradient(135deg, rgba(${g2.color.join(',')},0.55) 0%, rgba(${g2.color.join(',')},0.12) 34%, rgba(0,0,0,0) 62%)`;
      setOpacity(surfaceLight, 0.1 + 0.16 * (1 - grip));
      setOpacity(surfaceGloss, frame === 'paper' ? 0.07 : 0.14);
      surfaceLight.style.borderRadius = surfaceGloss.style.borderRadius = `${rect.r}px`;
      (Object.keys(BOX) as ScreenId[]).forEach((id) => fitScreen(id, { x: 0, y: 0, w: inner.w, h: inner.h, r: inner.r }, show[id] ?? 0));
    }

    // phone menu: add Köfte, add Ayran, type the note, send
    ui.menuAdds.forEach((el) => {
      const d = Number(el.dataset.menuAdd);
      const added = (d === ORDER.items[0] && st.menuStep >= 1) || (d === ORDER.items[1] && st.menuStep >= 2);
      el.style.background = added ? GOLD : INK;
      el.style.color = added ? '#10262a' : '#f6eedc';
      setText(el, added ? '1' : '+');
    });
    const n = st.menuStep >= 2 ? 2 : st.menuStep >= 1 ? 1 : 0;
    setText(ui.cart, `${n} ürün · ₺${ORDER.items.slice(0, n).reduce((s, i) => s + PRICES[i], 0)}`);
    const typed = ORDER.note.slice(0, Math.round(ORDER.note.length * clamp01(st.note)));
    setText(ui.note, typed + (st.note > 0 && st.note < 1 && Math.sin(time * 8) > 0 ? '|' : ''));
    const tap = clamp01(st.send);
    ui.send.style.transform = `scale(${1 - 0.06 * Math.sin(Math.PI * tap)})`;
    ui.send.style.background = tap >= 1 ? '#2f7a5a' : INK;
    setOpacity(ui.sent, (st.send - 0.4) / 0.4);
    ui.ticketLines.forEach((el) => setOpacity(el, st.th2 * 3 - Number(el.dataset.ticketLine) * 0.4));
    setOpacity(ui.extraRow, st.extra * 2);
    setHTML(ui.extraStatus, st.extra >= 1.5 ? chipHTML('Mutfağa iletildi', '#cfe9dc', '#1f5a45', 17) : chipHTML('Ek sipariş', GOLD, '#10262a', 17));
    setOpacity(ui.extraToast, clamp01((st.extra - 1.3) * 3) * (1 - clamp01(st.billReq * 2)));
    ui.btnExtra.style.background = st.extra > 0.2 && st.extra < 1.6 ? 'rgba(31,50,99,0.15)' : 'transparent';
    ui.btnBill.style.transform = `scale(${1 - 0.06 * Math.sin(Math.PI * clamp01(st.billReq))})`;
    ui.btnBill.style.background = st.billReq >= 1 ? '#e3a83b' : INK;
    setOpacity(ui.billBanner, (st.billReq - 0.4) / 0.4);
  };
}

