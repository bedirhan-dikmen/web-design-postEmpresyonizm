/**
 * Chapter 4 copy (Turkish). Phase 4.9 structure: one block per major stage, each one saying plainly what
 * just happened, in simple Turkish. No abstract marketing lines inside the product story.
 *
 * Seven blocks, one per stage, shown only once the camera has arrived and the state they explain is on
 * screen, and taken away before the next move begins (see timeline.ts → text()).
 *
 *   Masa / QR    tTable    every table has its own QR; the guest orders from it
 *   Kasa         tSystem   the order drops straight into the till
 *   Mutfak       tKitchen  the kitchen gets the same order, with the note
 *   Servis       tWaiter   the waiter only delivers
 *   Ek sipariş   tExtra    the extra item joins the same adisyon
 *   Hesap        tBill     the bill is asked for from the table; the cashier sees it, the table closes
 *   Yönetim      tOps      the whole operation is run from one place
 *
 * Product statements follow the client's brief (see CHAPTER4_NOTES.md → Product claims). Secondary detail
 * (items, prices, times, statuses) is carried by the UI in the scene, not by the copy.
 * Boxes are in the 1920×1080 design frame; every box sits inside x 280–1660 and y ≥ 170, so neither 4:3 nor 21:9 crops it.
 */

export type BeatKey = 'tTable' | 'tSystem' | 'tKitchen' | 'tWaiter' | 'tExtra' | 'tBill' | 'tOps';

export interface BeatText {
  key: BeatKey;
  eyebrow: string;
  heading: string;
  line?: string;
  box: { x: number; y: number; w: number };
  tone: 'ink' | 'light';
}

export const BEAT_TEXTS: BeatText[] = [
  {
    key: 'tTable',
    eyebrow: 'MASADAN SİPARİŞ',
    heading: 'Her masanın kendi QR kodu var.',
    line: 'Misafir menüyü açar, ürününü seçer ve siparişini kendisi gönderir.',
    box: { x: 280, y: 230, w: 560 },
    tone: 'ink',
  },
  {
    key: 'tSystem',
    eyebrow: 'SİPARİŞ SİSTEMDE',
    heading: 'Sipariş doğrudan kasaya düşer.',
    line: 'Masa, ürün, saat ve sipariş notu tek ekranda görünür.',
    box: { x: 280, y: 220, w: 560 },
    tone: 'ink',
  },
  {
    key: 'tKitchen',
    eyebrow: 'MUTFAK',
    heading: 'Sipariş mutfağa notuyla birlikte ulaşır.',
    line: 'Ekip siparişi ekrandan veya fiş üzerinden takip eder.',
    box: { x: 380, y: 185, w: 470 },
    tone: 'ink',
  },
  {
    key: 'tWaiter',
    eyebrow: 'SERVİS',
    heading: 'Garson sipariş toplamaz; hazır olanı masaya getirir.',
    box: { x: 280, y: 230, w: 540 },
    tone: 'ink',
  },
  {
    key: 'tExtra',
    eyebrow: 'EK SİPARİŞ',
    heading: 'Yeni ürün aynı masanın adisyonuna eklenir.',
    box: { x: 1080, y: 230, w: 560 },
    tone: 'ink',
  },
  {
    key: 'tBill',
    eyebrow: 'HESAP',
    heading: 'Misafir hesabı masadan ister.',
    line: 'Kasa talebi görür, ödeme tamamlandığında masa kapanır.',
    box: { x: 1090, y: 230, w: 540 },
    tone: 'ink',
  },
  {
    key: 'tOps',
    eyebrow: 'OPERASYON TEK YERDEN',
    heading: 'Restoranın tüm akışını tek yerden yönetin.',
    line: 'Siparişler, masa durumları, mutfak, stok, cari ve raporlar aynı sistemde.',
    box: { x: 280, y: 230, w: 580 },
    tone: 'light',
  },
];

/** The closing statement on the final, dimensional management frame. */
export const CLOSER = ['Sipariş masadan başlar.', 'İşletmenin tamamı tek yerden yönetilir.'];

export const MENU_DISHES = ['Mercimek', 'Köfte', 'Salata', 'Pide', 'Ayran', 'Künefe'];
export const PRICES = [110, 260, 140, 220, 45, 180];

export const ORDER = {
  table: 'Masa 7',
  time: '12:41',
  items: [1, 4],
  note: 'Az acı olsun',
  extra: 5,
};

export const orderTotal = () => ORDER.items.reduce((s, i) => s + PRICES[i], 0) + PRICES[ORDER.extra];

/**
 * The restaurant's twelve tables as the operations screen shows them once Masa 7 has closed. The same list
 * feeds the monitor's "Masalar" view and the large management panel in the final frame.
 */
export const TABLE_STATES: [string, 'free' | 'served' | 'kitchen' | 'bill' | 'closed' | 'new'][] = [
  ['Masa 1', 'free'],
  ['Masa 2', 'served'],
  ['Masa 3', 'served'],
  ['Masa 4', 'free'],
  ['Masa 5', 'bill'],
  ['Masa 6', 'kitchen'],
  ['Masa 7', 'closed'],
  ['Masa 8', 'free'],
  ['Masa 9', 'new'],
  ['Masa 10', 'served'],
  ['Masa 11', 'free'],
  ['Masa 12', 'kitchen'],
];

export const STATE_STYLE = {
  free: { label: 'Boş', color: '#8fa3a0' },
  served: { label: 'Serviste', color: '#9fc9c2' },
  kitchen: { label: 'Mutfakta', color: '#e8c66a' },
  bill: { label: 'Hesap istendi', color: '#e3a83b' },
  closed: { label: 'Kapandı ✓', color: '#7dffb0' },
  new: { label: 'Yeni sipariş', color: '#e8c66a' },
} as const;
