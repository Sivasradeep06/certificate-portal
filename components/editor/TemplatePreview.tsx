'use client';

import { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { SAMPLE_DATA } from '@/lib/certificate/placeholders';
import type { CertificateTemplate } from '@/types';

interface TemplatePreviewProps {
  template: CertificateTemplate | null;
}

export function TemplatePreview({ template }: TemplatePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!template || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = template.canvas_width;
    canvas.height = template.canvas_height;

    // Draw background
    if (template.background_url) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        drawPlaceholders(ctx, template);
      };
      img.src = template.background_url;
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      drawPlaceholders(ctx, template);
    }
  }, [template]);

  if (!template) return null;

  return (
    <Card className="p-4 space-y-3" id="template-preview">
      <h3 className="text-sm font-semibold">Preview</h3>
      <div className="overflow-hidden rounded-lg border border-border/50">
        <canvas
          ref={canvasRef}
          className="w-full h-auto"
          id="preview-canvas"
        />
      </div>
    </Card>
  );
}

function drawPlaceholders(ctx: CanvasRenderingContext2D, template: CertificateTemplate) {
  for (const p of template.placeholder_config) {
    const value = p.text || SAMPLE_DATA[p.type] || '';
    ctx.font = `${p.fontWeight} ${p.fontSize}px '${p.fontFamily}', sans-serif`;
    ctx.fillStyle = p.color;
    ctx.textAlign = p.align as CanvasTextAlign;
    ctx.textBaseline = 'top';
    ctx.fillText(value, p.x, p.y);
  }
}
