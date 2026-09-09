// Reuses design.md §5.11.2 "Colorful Badge — Subtle" surface/icon token pairs
// so each school's crest-style avatar stays inside the documented palette.
export const SCHOOL_ICON_COLORS = {
  blue: { bg: '#DBEAFE', fg: '#1D4ED8' },
  red: { bg: '#FEE2E2', fg: '#991B1B' },
  green: { bg: '#D1FAE5', fg: '#065F46' },
  gold: { bg: '#FEF3C7', fg: '#92400E' },
  teal: { bg: '#CCFBF1', fg: '#134E4A' },
  purple: { bg: '#EDE9FE', fg: '#5B21B6' },
}

export function schoolIconStyle(colorName) {
  const c = SCHOOL_ICON_COLORS[colorName] || SCHOOL_ICON_COLORS.blue
  return { background: c.bg, color: c.fg }
}
