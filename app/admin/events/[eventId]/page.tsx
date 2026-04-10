'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Calendar, Users, Palette, Upload, Settings, Loader2,
  ToggleLeft, ToggleRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/Toaster';
import type { Event } from '@/types';

interface PageProps {
  params: Promise<{ eventId: string }>;
}

export default function EventDetailPage({ params }: PageProps) {
  const { eventId } = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const [event, setEvent] = useState<Event | null>(null);
  const [participantCount, setParticipantCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [eventRes, partRes] = await Promise.all([
          fetch(`/api/events/${eventId}`),
          fetch(`/api/events/${eventId}/participants`),
        ]);
        if (eventRes.ok) {
          const json = await eventRes.json();
          setEvent(json.data);
        }
        if (partRes.ok) {
          const json = await partRes.json();
          setParticipantCount(json.data?.length || 0);
        }
      } catch {
        // ignore
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [eventId]);

  const toggleActive = async () => {
    if (!event) return;
    setIsToggling(true);
    const res = await fetch(`/api/events/${eventId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !event.is_active }),
    });
    if (res.ok) {
      const json = await res.json();
      setEvent(json.data);
      toast({
        title: json.data.is_active ? 'Event activated' : 'Event deactivated',
        variant: 'success',
      });
    }
    setIsToggling(false);
  };

  const formattedDate = event?.event_date
    ? new Date(event.event_date).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : 'No date set';

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold mb-2">Event Not Found</h2>
        <Button variant="outline" onClick={() => router.push('/admin/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in" id="event-detail-page">
      {/* Back */}
      <Button
        variant="ghost"
        onClick={() => router.push('/admin/dashboard')}
        className="text-muted-foreground"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Dashboard
      </Button>

      {/* Event Header */}
      <Card className="border-border/50">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="rounded-xl gradient-primary p-3 shrink-0">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-bold">{event.name}</h1>
                <Badge
                  className={event.is_active
                    ? 'bg-success/10 text-green-700 dark:text-green-400 border-0'
                    : 'text-muted-foreground'
                  }
                >
                  {event.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              {event.description && (
                <p className="text-sm text-muted-foreground">{event.description}</p>
              )}
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {formattedDate}
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" />
                  {participantCount} participants
                </span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleActive}
              disabled={isToggling}
              className="shrink-0 rounded-lg"
              id="toggle-active-btn"
            >
              {isToggling ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : event.is_active ? (
                <>
                  <ToggleRight className="h-4 w-4 mr-1.5 text-success" />
                  Deactivate
                </>
              ) : (
                <>
                  <ToggleLeft className="h-4 w-4 mr-1.5" />
                  Activate
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Actions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card
          className="group cursor-pointer border-border/50 hover:border-primary/30 hover:shadow-lg transition-all"
          onClick={() => router.push(`/admin/events/${eventId}/editor`)}
          id="editor-link"
        >
          <CardContent className="p-6 flex items-center gap-4">
            <div className="rounded-xl bg-primary/10 p-3 group-hover:bg-primary/20 transition-colors">
              <Palette className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Certificate Editor</h3>
              <p className="text-sm text-muted-foreground">Design certificate templates</p>
            </div>
          </CardContent>
        </Card>

        <Card
          className="group cursor-pointer border-border/50 hover:border-primary/30 hover:shadow-lg transition-all"
          onClick={() => router.push(`/admin/events/${eventId}/participants`)}
          id="participants-link"
        >
          <CardContent className="p-6 flex items-center gap-4">
            <div className="rounded-xl bg-primary/10 p-3 group-hover:bg-primary/20 transition-colors">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Manage Participants</h3>
              <p className="text-sm text-muted-foreground">Upload CSV / Excel data</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
