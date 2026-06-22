// Central color palette for the Northwind Command Center.
// Dark UI shell + amber/gold accents, plus data-viz colors for charts.

// --- UI shell ---
export const UI = {
  bg: '#161616', // general background
  surface: '#212121', // cards, tabs
  field: '#1b1b1b', // inputs and selects
  line: '#3a3a3a', // borders and separators
  text: '#f2f2f2', // primary text
  muted: '#c2c2c2', // secondary text, hints
  acc: '#E2A53C', // amber accent (buttons, KPI numbers)
  accText: '#F2BB60', // light accent (section labels)
  accDark: '#cf9430', // accent borders and hover
} as const;

// --- Data-viz / dashboard ---
export const VIZ = {
  card: '#1E1E1E',
  line: '#2C2C2C',
  headBg: '#2A2520',
  txt: '#E0E0E0',
  white: '#FFFFFF',
  gold: '#D4AF37',
  gold2: '#F9E5B6', // light gold (forecast)
  amber: '#FFC107',
  bronze: '#B87333',
  red: '#CF6679', // soft red (risk / lost)
  teal: '#03DAC6', // upsell / won
} as const;

// Lead size (priority) -> background + text color (good contrast)
export const PRIORITY_COLORS: Record<string, { bg: string; text: string }> = {
  Hot: { bg: VIZ.red, text: '#161616' },
  Warm: { bg: UI.acc, text: '#161616' },
  Cold: { bg: UI.line, text: UI.text },
};

// Inquiry lifecycle status -> background + text color for the Status cell.
// Keys match the raw values used in inquiries.json.
export const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  new: { bg: UI.acc, text: '#161616' }, // needs attention
  contacted: { bg: VIZ.bronze, text: '#FFFFFF' }, // reached out
  qualified: { bg: VIZ.teal, text: '#161616' }, // promising
  closed: { bg: UI.line, text: UI.muted }, // done / parked
};

// Ordered lifecycle for the Action dropdown.
export const STATUSES = ['new', 'contacted', 'qualified', 'closed'] as const;

// Capitalize a raw value (e.g. "trade show" -> "Trade show") for display.
export const titleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// Canonical option lists — these match the raw values in the data exactly,
// so every dropdown stays aligned with what the data can contain.
export const REGIONS = ['Bay Area', 'Mountain West', 'Pacific Northwest', 'Southwest'] as const;
export const CHANNELS = ['website', 'referral', 'trade show', 'cold inbound', 'instagram'] as const;
export const ACCOUNT_STATUSES = ['active', 'paused'] as const;
export const PRIORITIES = ['Hot', 'Warm', 'Cold'] as const;

// Rotating palette for category breakdown bars (regions, channels, etc.).
export const CATEGORY_COLORS = [VIZ.gold, VIZ.teal, VIZ.bronze, VIZ.amber, UI.accDark];

// Account status -> colors (active / paused).
export const ACCOUNT_STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  active: { bg: VIZ.teal, text: '#161616' },
  paused: { bg: VIZ.amber, text: '#161616' },
};
