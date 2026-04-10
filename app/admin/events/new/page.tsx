'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Loader2, CalendarPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/components/Toaster';
import type { EventFormData } from '@/lib/validators/event';

export default function NewEventPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EventFormData>({
    defaultValues: {
      name: '',
      description: '',
      event_date: '',
      is_active: true,
    },
  });

  const onSubmit = async (data: EventFormData) => {
    setError(null);
    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        description: data.description || null,
        event_date: data.event_date || null,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      setError(err.error || 'Failed to create event');
      return;
    }

    const json = await res.json();
    toast({ title: 'Event created', description: data.name, variant: 'success' });
    router.push(`/admin/events/${json.data.id}`);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in" id="new-event-page">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.push('/admin/dashboard')}
        className="text-muted-foreground"
        id="back-to-dashboard"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Button>

      <Card className="border-border/50" id="new-event-card">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-xl gradient-primary p-2.5">
              <CalendarPlus className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Create New Event</CardTitle>
              <CardDescription>Set up a new event for certificate generation</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" id="new-event-form">
            {/* Event Name */}
            <div className="space-y-2">
              <Label htmlFor="event-name">Event Name *</Label>
              <Input
                {...register('name', {
                  required: 'Event name is required',
                  maxLength: { value: 200, message: 'Max 200 characters' },
                })}
                id="event-name"
                placeholder="e.g. National Tech Fest 2024"
                className="h-11 rounded-xl"
              />
              {errors.name && (
                <p className="text-destructive text-xs">{errors.name.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="event-desc">Description</Label>
              <textarea
                {...register('description', {
                  maxLength: { value: 1000, message: 'Max 1000 characters' },
                })}
                id="event-desc"
                placeholder="Brief description of the event..."
                rows={3}
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {errors.description && (
                <p className="text-destructive text-xs">{errors.description.message}</p>
              )}
            </div>

            {/* Event Date */}
            <div className="space-y-2">
              <Label htmlFor="event-date">Event Date</Label>
              <Input
                {...register('event_date')}
                id="event-date"
                type="date"
                className="h-11 rounded-xl"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}

            {/* Submit */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/admin/dashboard')}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl gradient-primary hover:opacity-90 flex-1"
                id="submit-event-btn"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Event'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
