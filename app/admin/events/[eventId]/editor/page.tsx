'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { CertificateEditor } from '@/components/editor/CertificateEditor';
import { TemplatePreview } from '@/components/editor/TemplatePreview';
import { useToast } from '@/components/Toaster';
import { createClient } from '@/lib/supabase/client';
import type { CertificateTemplate, CertificateType, PlaceholderConfig } from '@/types';

interface PageProps {
  params: Promise<{ eventId: string }>;
}

export default function EditorPage({ params }: PageProps) {
  const { eventId } = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [activeType, setActiveType] = useState<CertificateType>('participation');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/events/${eventId}/templates`);
      if (res.ok) {
        const json = await res.json();
        setTemplates(json.data || []);
      }
      setIsLoading(false);
    }
    load();
  }, [eventId]);

  const currentTemplate = templates.find((t) => t.type === activeType) || null;

  const handleSave = async (config: PlaceholderConfig[], backgroundUrl?: string | null) => {
    setIsSaving(true);
    try {
      const method = currentTemplate ? 'PATCH' : 'POST';
      const body = {
        type: activeType,
        placeholder_config: config,
        background_url: backgroundUrl ?? null,
      };

      const res = await fetch(`/api/events/${eventId}/templates`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const json = await res.json();
        setTemplates((prev) => {
          const existing = prev.findIndex((t) => t.type === activeType);
          if (existing >= 0) {
            const updated = [...prev];
            updated[existing] = json.data;
            return updated;
          }
          return [...prev, json.data];
        });
        toast({ title: 'Template saved', variant: 'success' });
      } else {
        const err = await res.json();
        toast({ title: 'Save failed', description: err.error, variant: 'destructive' });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleBackgroundUpload = async (file: File): Promise<string | null> => {
    try {
      const supabase = createClient();
      const path = `templates/${eventId}/${activeType}-bg-${Date.now()}.${file.name.split('.').pop()}`;

      const { error } = await supabase.storage
        .from('certificate-backgrounds')
        .upload(path, file, { upsert: true });

      if (error) {
        toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('certificate-backgrounds')
        .getPublicUrl(path);

      return publicUrl;
    } catch {
      toast({ title: 'Upload failed', variant: 'destructive' });
      return null;
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[500px] w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in" id="editor-page">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => router.push(`/admin/events/${eventId}`)}
          className="text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-xl font-bold">Certificate Editor</h1>
      </div>

      {/* Mobile Warning */}
      {isMobile && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-warning/10 border border-warning/30 text-sm">
          <Monitor className="h-5 w-5 text-warning shrink-0" />
          <p>The certificate editor works best on desktop. Consider using a larger screen for the best experience.</p>
        </div>
      )}

      {/* Template Type Tabs */}
      <div className="flex gap-2" id="template-tabs">
        {(['participation', 'winner'] as CertificateType[]).map((type) => {
          const hasTemplate = templates.some((t) => t.type === type);
          return (
            <Button
              key={type}
              variant={activeType === type ? 'default' : 'outline'}
              onClick={() => setActiveType(type)}
              className={`rounded-xl capitalize ${activeType === type ? 'gradient-primary' : ''}`}
              id={`tab-${type}`}
            >
              {type}
              {hasTemplate && (
                <Badge className="ml-2 bg-white/20 text-white border-0 text-[10px] py-0">
                  ✓
                </Badge>
              )}
            </Button>
          );
        })}
      </div>

      {/* Editor */}
      <CertificateEditor
        key={activeType}
        template={currentTemplate}
        onSave={handleSave}
        onBackgroundUpload={handleBackgroundUpload}
        isSaving={isSaving}
      />

      {/* Preview */}
      {currentTemplate && <TemplatePreview template={currentTemplate} />}
    </div>
  );
}
