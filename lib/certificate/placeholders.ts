import type { PlaceholderConfig, PlaceholderType } from '@/types';

/** Available placeholder types with display labels */
export const PLACEHOLDER_TYPES: Array<{ type: PlaceholderType; label: string }> = [
  { type: 'name', label: 'Participant Name' },
  { type: 'register_number', label: 'Register Number' },
  { type: 'event_name', label: 'Event Name' },
  { type: 'event_date', label: 'Event Date' },
  { type: 'status', label: 'Status / Position' },
];

/** Sample values for preview mode */
export const SAMPLE_DATA: Record<PlaceholderType, string> = {
  name: 'John Doe',
  register_number: '22CSE101',
  event_name: 'National Tech Fest 2024',
  event_date: '15 March 2024',
  status: '1st Place Winner',
};

/** Create a default PlaceholderConfig at center of canvas */
export function createDefaultPlaceholder(
  type: PlaceholderType,
  canvasWidth: number,
  canvasHeight: number
): PlaceholderConfig {
  return {
    id: `${type}_${Date.now()}`,
    type,
    x: canvasWidth / 2,
    y: canvasHeight / 2,
    fontSize: type === 'name' ? 48 : 32,
    fontFamily: 'Montserrat',
    fontWeight: type === 'name' ? 'bold' : 'normal',
    color: '#1a1a2e',
    align: 'center',
  };
}

/** Available font families for the certificate editor */
export const FONT_FAMILIES = [
  'Roboto',
  'Montserrat',
  'Playfair Display',
  'Open Sans',
  'Lato',
] as const;

/** Preset colour swatches for the colour picker */
export const COLOR_SWATCHES = [
  '#1a1a2e', '#16213e', '#0f3460', '#533483',
  '#e94560', '#f38181', '#fce38a', '#eaffd0',
  '#95e1d3', '#aa96da', '#c4edde', '#ffffff',
] as const;
