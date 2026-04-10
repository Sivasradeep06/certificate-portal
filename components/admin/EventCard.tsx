'use client';

import { Calendar, Users, ChevronRight, Settings, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Event } from '@/types';

interface EventCardProps {
  event: Event;
  onManage: (eventId: string) => void;
  onDelete?: (eventId: string) => void;
}

export function EventCard({ event, onManage, onDelete }: EventCardProps) {
  const formattedDate = event.event_date
    ? new Date(event.event_date).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : 'No date set';

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) onDelete(event.id);
  };

  return (
    <Card
      className="group cursor-pointer border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 relative"
      onClick={() => onManage(event.id)}
      id={`event-card-${event.id}`}
    >
      <CardContent className="p-5">
        <div className="flex items-center gap-4">
          {/* Icon */}
          <div className="rounded-xl gradient-primary p-3 shrink-0 group-hover:scale-105 transition-transform">
            <Settings className="h-5 w-5 text-white" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 pr-12">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-foreground truncate">{event.name}</h3>
              <Badge
                variant={event.is_active ? 'default' : 'outline'}
                className={event.is_active
                  ? 'bg-success/10 text-green-700 dark:text-green-400 border-0 shrink-0'
                  : 'text-muted-foreground shrink-0'
                }
              >
                {event.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {formattedDate}
              </span>
              {event.participant_count !== undefined && (
                <span className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" />
                  {event.participant_count} participants
                </span>
              )}
            </div>
            {event.description && (
              <p className="text-sm text-muted-foreground mt-1.5 line-clamp-1">{event.description}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="text-destructive hover:bg-destructive/10 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Delete Event"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <ChevronRight className="h-5 w-5 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
