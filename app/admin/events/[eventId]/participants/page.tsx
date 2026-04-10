'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Users, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { UploadZone } from '@/components/admin/UploadZone';
import { ParticipantTable } from '@/components/admin/ParticipantTable';
import { useToast } from '@/components/Toaster';
import type { Participant, CsvRow } from '@/types';

interface PageProps {
  params: Promise<{ eventId: string }>;
}

export default function ParticipantsPage({ params }: PageProps) {
  const { eventId } = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isClearingAll, setIsClearingAll] = useState(false);

  const loadParticipants = async () => {
    try {
      const res = await fetch(`/api/events/${eventId}/participants`);
      if (res.ok) {
        const json = await res.json();
        setParticipants(json.data || []);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadParticipants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const handleUpload = async (rows: CsvRow[]) => {
    setIsUploading(true);
    try {
      const res = await fetch(`/api/events/${eventId}/participants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participants: rows }),
      });

      if (res.ok) {
        const json = await res.json();
        toast({
          title: 'Upload successful',
          description: `${json.data.inserted} participants added`,
          variant: 'success',
        });
        await loadParticipants();
      } else {
        const err = await res.json();
        toast({
          title: 'Upload failed',
          description: err.error,
          variant: 'destructive',
        });
      }
    } catch {
      toast({ title: 'Upload failed', variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (targetId: string) => {
    setIsDeleting(targetId);
    try {
      const res = await fetch(`/api/events/${eventId}/participants`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [targetId] }),
      });
      if (res.ok) {
        setParticipants((prev) => prev.filter((p) => p.id !== targetId));
        toast({ title: 'Participant removed' });
      } else {
        const err = await res.json();
        toast({ title: 'Delete failed', description: err.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Delete failed', variant: 'destructive' });
    } finally {
      setIsDeleting(null);
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to delete all participants? This cannot be undone.')) return;
    setIsClearingAll(true);
    try {
      const res = await fetch(`/api/events/${eventId}/participants`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clear_all: true }),
      });
      if (res.ok) {
        setParticipants([]);
        toast({ title: 'All participants removed' });
      } else {
        const err = await res.json();
        toast({ title: 'Delete failed', description: err.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Delete failed', variant: 'destructive' });
    } finally {
      setIsClearingAll(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in" id="participants-page">
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
        <div>
          <h1 className="text-xl font-bold">Manage Participants</h1>
          <p className="text-sm text-muted-foreground">
            Upload participant data via CSV or Excel file
          </p>
        </div>
      </div>

      {/* Upload Section */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Upload Participants
          </CardTitle>
        </CardHeader>
        <CardContent>
          <UploadZone onConfirm={handleUpload} isUploading={isUploading} />
        </CardContent>
      </Card>

      {/* Existing Participants */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span>
              Existing Participants
              {!isLoading && (
                <span className="text-muted-foreground font-normal ml-2">
                  ({participants.length})
                </span>
              )}
            </span>
            {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          </CardTitle>
          {!isLoading && participants.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              disabled={isClearingAll}
              className="text-destructive h-8 border-destructive/30 hover:bg-destructive/10"
            >
              {isClearingAll ? 'Clearing...' : 'Clear All'}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <ParticipantTable 
              participants={participants} 
              onDelete={handleDelete} 
              isDeleting={isDeleting} 
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
