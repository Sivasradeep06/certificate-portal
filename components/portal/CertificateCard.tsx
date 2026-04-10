'use client';

import { Download, FileText, Calendar, Award, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCertificateDownload } from '@/lib/hooks/useCertificateDownload';
import type { ParticipantSearchResult } from '@/types';

interface CertificateCardProps {
  result: ParticipantSearchResult;
  index: number;
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof Award }> = {
  participated: { label: 'Participated', color: 'bg-blue-500/10 text-blue-700 dark:text-blue-400', icon: Award },
  '1st': { label: '🥇 1st Place', color: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400', icon: Award },
  '2nd': { label: '🥈 2nd Place', color: 'bg-gray-400/10 text-gray-700 dark:text-gray-400', icon: Award },
  '3rd': { label: '🥉 3rd Place', color: 'bg-orange-500/10 text-orange-700 dark:text-orange-400', icon: Award },
};

export function CertificateCard({ result, index }: CertificateCardProps) {
  const { participant, event, template } = result;
  const { isGenerating, error, download } = useCertificateDownload();
  const config = statusConfig[participant.status] || statusConfig.participated;

  const handleDownload = async (format: 'png' | 'pdf') => {
    if (!template) return;
    await download({
      template,
      participant,
      event,
      format,
      filename: `${event.name}-${participant.name}`.replace(/\s+/g, '_'),
    });
  };

  const formattedDate = event.event_date
    ? new Date(event.event_date).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : null;

  return (
    <Card
      className="group overflow-hidden border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
      style={{ animationDelay: `${index * 100}ms` }}
      id={`certificate-card-${participant.id}`}
    >
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Event Info */}
          <div className="flex-1 space-y-2">
            <div className="flex items-start gap-3">
              <div className="rounded-lg gradient-primary p-2 shrink-0">
                <Award className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground leading-tight">{event.name}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">{participant.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <Badge className={`${config.color} border-0 font-medium`}>
                {config.label}
              </Badge>
              {formattedDate && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {formattedDate}
                </span>
              )}
            </div>
          </div>

          {/* Download Buttons */}
          <div className="flex gap-2 shrink-0">
            {template ? (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownload('png')}
                  disabled={isGenerating}
                  id={`download-png-${participant.id}`}
                  className="rounded-lg"
                >
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-1.5" />
                      PNG
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleDownload('pdf')}
                  disabled={isGenerating}
                  id={`download-pdf-${participant.id}`}
                  className="rounded-lg gradient-primary hover:opacity-90"
                >
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-1.5" />
                      PDF
                    </>
                  )}
                </Button>
              </>
            ) : (
              <Badge variant="outline" className="text-muted-foreground">
                Template pending
              </Badge>
            )}
          </div>
        </div>

        {error && (
          <p className="text-destructive text-sm mt-3">⚠️ {error}</p>
        )}
      </CardContent>
    </Card>
  );
}
