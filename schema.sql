-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Events Table
create table if not exists public.events (
  id uuid default uuid_generate_v4() primary key,
  name varchar(255) not null,
  description text,
  event_date date,
  is_active boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone,
  created_by uuid references auth.users(id)
);

-- 2. Certificate Templates Table
create table if not exists public.certificate_templates (
  id uuid default uuid_generate_v4() primary key,
  event_id uuid references public.events(id) on delete cascade not null,
  type varchar(50) not null check (type in ('participation', 'winner')),
  background_url text,
  canvas_width integer default 1123 not null,  -- A4 landscape width at 96 DPI
  canvas_height integer default 794 not null,  -- A4 landscape height at 96 DPI
  placeholder_config jsonb default '[]'::jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone,
  unique(event_id, type)
);

-- 3. Participants Table
create table if not exists public.participants (
  id uuid default uuid_generate_v4() primary key,
  event_id uuid references public.events(id) on delete cascade not null,
  name varchar(255) not null,
  register_number varchar(100),
  email varchar(255),
  status varchar(50) not null check (status in ('participated', '1st', '2nd', '3rd')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Note: We generally search participants by register_number or email
create index if not exists idx_participants_register_number on public.participants(register_number);
create index if not exists idx_participants_email on public.participants(email);
create index if not exists idx_participants_event_id on public.participants(event_id);

-- Setup Row Level Security (RLS)

-- Events RLS
alter table public.events enable row level security;
-- Admin can do everything
create policy "Admins can manage events" on public.events for all using (auth.role() = 'authenticated');
-- Anyone can read active events
create policy "Public can view active events" on public.events for select using (is_active = true);


-- Certificate Templates RLS
alter table public.certificate_templates enable row level security;
-- Admin can do everything
create policy "Admins can manage templates" on public.certificate_templates for all using (auth.role() = 'authenticated');
-- Anyone can read templates for active events
create policy "Public can view active event templates" on public.certificate_templates for select using (
  exists (
    select 1 from public.events where events.id = certificate_templates.event_id and events.is_active = true
  )
);


-- Participants RLS
alter table public.participants enable row level security;
-- Admin can do everything
create policy "Admins can manage participants" on public.participants for all using (auth.role() = 'authenticated');
-- Anyone can read participants for active events
create policy "Public can perfectly match participants" on public.participants for select using (
  exists (
    select 1 from public.events where events.id = participants.event_id and events.is_active = true
  )
);

-- Create a bucket for certificate backgrounds if you haven't already:
insert into storage.buckets (id, name, public) values ('certificate-backgrounds', 'certificate-backgrounds', true) on conflict do nothing;

-- Storage RLS for certificate-backgrounds
create policy "Admins can upload backgrounds" on storage.objects for insert with check (bucket_id = 'certificate-backgrounds' and auth.role() = 'authenticated');
create policy "Admins can update backgrounds" on storage.objects for update using (bucket_id = 'certificate-backgrounds' and auth.role() = 'authenticated');
create policy "Public can view backgrounds" on storage.objects for select using (bucket_id = 'certificate-backgrounds');
