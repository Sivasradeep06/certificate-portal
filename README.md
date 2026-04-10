# CertPortal - VSBEC Certificate Platform

CertPortal is a complete, production-ready certificate management and generation platform built for VSBEC. It enables administrators to manage events, upload participants, design certificate templates, and allows participants to search and download their certificates.

## Features

- **Admin Dashboard**: Manage events, participants, and templates securely.
- **Certificate Editor**: WYSIWYG editor using Fabric.js for designing dynamic templates with customizable placeholders.
- **Participant Management**: Upload CSV / Excel participant data (registration numbers, names, emails, and status).
- **Public Portal**: Secure, rate-limited public search portal for students to find and download their certificates.
- **Client-side Engine**: Fast and storage-tight. Certificates are rendered purely on the client-side using `fabric.js` canvas APIs to save on backend storage costs. Generated in PNG or PDF.
- **Responsive Design**: Glassmorphic UI styled with Tailwind CSS and shadcn/ui. Adaptive Light/Dark mode.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database / Auth / Storage**: Supabase
- **Certificate Editor Engine**: Fabric.js (v5)
- **Styling**: Tailwind CSS v3, Shadcn UI (`radix-ui`), Lucide Icons
- **State Management**: Tanstack Query v5, React Hook Form
- **Validation**: Zod (v4)
- **Package Manager**: pnpm

## Environment Variables

Create a `.env.local` file in the root of your project and add the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Upstash Redis / Vercel KV (For Search Rate Limiting)
KV_URL=your-kv-url
KV_REST_API_URL=your-kv-rest-api-url
KV_REST_API_TOKEN=your-kv-rest-api-token
KV_REST_API_READ_ONLY_TOKEN=your-kv-rest-api-read-only-token
```

## Setup Instructions

1. **Install dependencies**
   ```bash
   pnpm install
   ```
   *(Ensure you have pnpm installed. If not, `npm install -g pnpm`)*

2. **Supabase Setup**
   - Create a `certificate-backgrounds` bucket in Supabase Storage with public access configured.
   - Execute the schema migration SQL to create tables for `events`, `participants`, and `templates`. Let Supabase auto-generate types or extract from `types/index.ts`.
   - Setup an admin user in Supabase Authentication.

3. **Run the Development Server**
   ```bash
   pnpm dev
   ```
   The portal will be available at `http://localhost:3000`.
   The admin panel is accessible under `http://localhost:3000/admin/login`.

## Deployment

Deploy this project easily using [Vercel](https://vercel.com/):
1. Connect your GitHub repository to Vercel.
2. Add your Environment Variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `KV_*`).
3. Click "Deploy". Next.js (Turbopack) build configuration is already optimized.
