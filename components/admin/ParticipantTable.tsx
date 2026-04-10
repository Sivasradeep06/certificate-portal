'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import type { Participant } from '@/types';

interface ParticipantTableProps {
  participants: Participant[];
  onDelete?: (id: string) => void;
  isDeleting?: string | null;
}

const statusStyles: Record<string, string> = {
  participated: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
  '1st': 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
  '2nd': 'bg-gray-400/10 text-gray-700 dark:text-gray-400',
  '3rd': 'bg-orange-500/10 text-orange-700 dark:text-orange-400',
};

const statusLabels: Record<string, string> = {
  participated: 'Participated',
  '1st': '1st Place',
  '2nd': '2nd Place',
  '3rd': '3rd Place',
};

export function ParticipantTable({ participants, onDelete, isDeleting }: ParticipantTableProps) {
  if (participants.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground" id="empty-participants">
        <p className="font-medium">No participants yet</p>
        <p className="text-sm mt-1">Upload a CSV or Excel file to add participants.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border/50" id="participants-table">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/50 bg-muted/30">
            <th className="text-left font-semibold px-4 py-3 sticky left-0 bg-muted/30 z-10">Name</th>
            <th className="text-left font-semibold px-4 py-3">Register No.</th>
            <th className="text-left font-semibold px-4 py-3">Email</th>
            <th className="text-left font-semibold px-4 py-3">Status</th>
            {onDelete && <th className="text-right font-semibold px-4 py-3">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/30">
          {participants.map((p) => (
            <tr
              key={p.id}
              className="hover:bg-muted/20 transition-colors"
              id={`participant-row-${p.id}`}
            >
              <td className="px-4 py-3 font-medium sticky left-0 bg-background z-10">{p.name}</td>
              <td className="px-4 py-3 text-muted-foreground">{p.register_number || '—'}</td>
              <td className="px-4 py-3 text-muted-foreground">{p.email || '—'}</td>
              <td className="px-4 py-3">
                <Badge className={`${statusStyles[p.status] || ''} border-0`}>
                  {statusLabels[p.status] || p.status}
                </Badge>
              </td>
              {onDelete && (
                <td className="px-4 py-2 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(p.id)}
                    disabled={isDeleting === p.id}
                    className="text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
