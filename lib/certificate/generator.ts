import type { GenerateParams, PlaceholderConfig, Participant, Event as AppEvent } from '@/types';

/**
 * Resolve the text value for a given placeholder, using participant/event data.
 * If the placeholder has a static `text` override, that takes precedence.
 */
function resolveValue(
  placeholder: PlaceholderConfig,
  participant: Participant,
  event: AppEvent
): string {
  if (placeholder.text) return placeholder.text;

  switch (placeholder.type) {
    case 'name':
      return participant.name;
    case 'register_number':
      return participant.register_number ?? '';
    case 'event_name':
      return event.name;
    case 'event_date': {
      if (!event.event_date) return '';
      const d = new Date(event.event_date);
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
    }
    case 'status': {
      const statusMap: Record<string, string> = {
        'participated': 'Participated',
        '1st': '1st Place Winner',
        '2nd': '2nd Place Winner',
        '3rd': '3rd Place Winner',
      };
      return statusMap[participant.status] ?? participant.status;
    }
    default:
      return '';
  }
}

/** Load a font via the FontFace API to ensure it's available for canvas rendering */
async function loadFont(fontFamily: string, fontSize: number): Promise<void> {
  try {
    await document.fonts.load(`${fontSize}px '${fontFamily}'`);
  } catch {
    // Font may not be available; canvas will fall back to sans-serif
  }
}

/** Fetch an image as a blob and create a bitmap to avoid CORS issues */
async function loadImage(url: string): Promise<HTMLImageElement> {
  const response = await fetch(url, { mode: 'cors' });
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load background image'));
    };
    img.src = objectUrl;
  });
}

/**
 * Generate a certificate as PNG or PDF entirely client-side.
 * Creates an offscreen canvas, draws the background + placeholder text,
 * then triggers a download.
 */
export async function generateCertificate(params: GenerateParams): Promise<void> {
  const { template, participant, event, format, filename } = params;

  const canvas = document.createElement('canvas');
  canvas.width = template.canvas_width;
  canvas.height = template.canvas_height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  // Draw background
  if (template.background_url) {
    const img = await loadImage(template.background_url);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Load and draw each placeholder
  for (const p of template.placeholder_config) {
    await loadFont(p.fontFamily, p.fontSize);

    const value = resolveValue(p, participant, event);
    ctx.font = `${p.fontWeight} ${p.fontSize}px '${p.fontFamily}', sans-serif`;
    ctx.fillStyle = p.color;
    ctx.textAlign = p.align as CanvasTextAlign;
    ctx.textBaseline = 'top';
    ctx.fillText(value, p.x, p.y);
  }

  if (format === 'png') {
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/png', 1.0)
    );
    if (!blob) throw new Error('Failed to generate PNG blob');
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } else {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [canvas.width, canvas.height],
    });
    const imgData = canvas.toDataURL('image/png', 1.0);
    doc.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    doc.save(`${filename}.pdf`);
  }
}
