'use client';

import { Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PLACEHOLDER_TYPES } from '@/lib/certificate/placeholders';
import type { PlaceholderType } from '@/types';

interface PlaceholderPanelProps {
  addedTypes: PlaceholderType[];
  onAdd: (type: PlaceholderType) => void;
}

export function PlaceholderPanel({ addedTypes, onAdd }: PlaceholderPanelProps) {
  return (
    <Card className="p-4" id="placeholder-panel">
      <h3 className="text-sm font-semibold mb-3">Placeholders</h3>
      <div className="space-y-1.5">
        {PLACEHOLDER_TYPES.map(({ type, label }) => {
          const isAdded = addedTypes.includes(type);
          return (
            <Button
              key={type}
              variant="ghost"
              size="sm"
              className={`w-full justify-start text-sm h-9 ${
                isAdded ? 'text-muted-foreground' : ''
              }`}
              onClick={() => !isAdded && onAdd(type)}
              disabled={isAdded}
              id={`add-placeholder-${type}`}
            >
              {isAdded ? (
                <Check className="h-4 w-4 mr-2 text-success" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              {label}
            </Button>
          );
        })}
      </div>
    </Card>
  );
}
