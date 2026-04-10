'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, CalendarDays, Users, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EventCard } from '@/components/admin/EventCard';
import { useToast } from '@/components/Toaster';
import type { Event } from '@/types';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadEvents() {
      try {
        const res = await fetch('/api/events');
        if (res.ok) {
          const json = await res.json();
          setEvents(json.data || []);
        }
      } catch {
        // silently fail
      } finally {
        setIsLoading(false);
      }
    }
    loadEvents();
  }, []);

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you strictly sure you want to delete this event? This will permanently erase ALL associated certificates, templates, and participants.')) return;
    
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setEvents((prev) => prev.filter((e) => e.id !== eventId));
        toast({ title: 'Event successfully deleted', variant: 'success' });
      } else {
        const err = await res.json();
        toast({ title: 'Delete failed', description: err.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Delete failed. Check your connection.', variant: 'destructive' });
    }
  };

  const totalParticipants = events.reduce((sum, e) => sum + (e.participant_count || 0), 0);
  const activeEvents = events.filter((e) => e.is_active).length;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in" id="admin-dashboard">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your events and certificates</p>
        </div>
        <Button
          onClick={() => router.push('/admin/events/new')}
          className="gradient-primary hover:opacity-90 rounded-xl h-11"
          id="create-event-btn"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Event
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Events', value: events.length, icon: CalendarDays },
          { label: 'Active Events', value: activeEvents, icon: CalendarDays },
          { label: 'Participants', value: totalParticipants, icon: Users },
        ].map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="rounded-xl border border-border/50 p-4 bg-card hover:bg-muted/20 transition-colors"
          >
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Icon className="h-4 w-4" />
              <span className="text-xs font-medium">{label}</span>
            </div>
            {isLoading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <p className="text-2xl font-bold">{value}</p>
            )}
          </div>
        ))}
      </div>

      {/* Events List */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Events</h2>
        
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border border-border/30 p-5">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-11 w-11 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-16 rounded-xl border border-dashed border-border/50">
            <CalendarDays className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <h3 className="font-semibold mb-1">No Events Yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Create your first event to get started</p>
            <Button
              onClick={() => router.push('/admin/events/new')}
              className="rounded-xl gradient-primary hover:opacity-90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onManage={(id) => router.push(`/admin/events/${id}`)}
                onDelete={handleDeleteEvent}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
