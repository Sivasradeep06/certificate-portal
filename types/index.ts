export type CertificateType = 'participation' | 'winner';
export type ParticipantStatus = 'participated' | '1st' | '2nd' | '3rd';
export type PlaceholderType =
  | 'name'
  | 'register_number'
  | 'event_name'
  | 'event_date'
  | 'status';

export interface PlaceholderConfig {
  id: string;
  type: PlaceholderType;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  fontWeight: 'normal' | 'bold';
  color: string;
  align: 'left' | 'center' | 'right';
  text?: string;
}

export interface Event {
  id: string;
  name: string;
  description: string | null;
  event_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  created_by?: string;
  participant_count?: number;
}

export interface CertificateTemplate {
  id: string;
  event_id: string;
  type: CertificateType;
  background_url: string | null;
  canvas_width: number;
  canvas_height: number;
  placeholder_config: PlaceholderConfig[];
  created_at?: string;
  updated_at?: string;
}

export interface Participant {
  id: string;
  event_id: string;
  name: string;
  register_number: string | null;
  email: string | null;
  status: ParticipantStatus;
  created_at?: string;
}

export interface ParticipantSearchResult {
  participant: Participant;
  event: Event;
  template: CertificateTemplate | null;
}

export interface CsvRow {
  name: string;
  register_number?: string;
  email?: string;
  status: ParticipantStatus;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  code?: string;
}

export interface GenerateParams {
  template: CertificateTemplate;
  participant: Participant;
  event: Event;
  format: 'png' | 'pdf';
  filename: string;
}
