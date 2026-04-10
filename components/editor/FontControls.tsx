'use client';

import { Bold, Italic, AlignLeft, AlignCenter, AlignRight, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FONT_FAMILIES, COLOR_SWATCHES } from '@/lib/certificate/placeholders';

interface FontControlsProps {
  selectedObject: fabric.Object;
  onUpdate: (property: string, value: unknown) => void;
  onDelete: () => void;
}

export function FontControls({ selectedObject, onUpdate, onDelete }: FontControlsProps) {
  const textObj = selectedObject as fabric.IText;

  return (
    <Card className="p-4 space-y-4" id="font-controls">
      <h3 className="text-sm font-semibold">Text Properties</h3>

      {/* Font Family */}
      <div className="space-y-1.5">
        <Label className="text-xs">Font Family</Label>
        <select
          value={textObj.fontFamily || 'Montserrat'}
          onChange={(e) => onUpdate('fontFamily', e.target.value)}
          className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
          id="font-family-select"
        >
          {FONT_FAMILIES.map((font) => (
            <option key={font} value={font}>{font}</option>
          ))}
        </select>
      </div>

      {/* Font Size */}
      <div className="space-y-1.5">
        <Label className="text-xs">Font Size: {textObj.fontSize || 32}px</Label>
        <input
          type="range"
          min={8}
          max={120}
          value={textObj.fontSize || 32}
          onChange={(e) => onUpdate('fontSize', Number(e.target.value))}
          className="w-full accent-primary"
          id="font-size-slider"
        />
      </div>

      {/* Bold / Italic */}
      <div className="flex gap-1.5">
        <Button
          variant={textObj.fontWeight === 'bold' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onUpdate('fontWeight', textObj.fontWeight === 'bold' ? 'normal' : 'bold')}
          className="flex-1"
          id="bold-toggle"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant={textObj.fontStyle === 'italic' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onUpdate('fontStyle', textObj.fontStyle === 'italic' ? 'normal' : 'italic')}
          className="flex-1"
          id="italic-toggle"
        >
          <Italic className="h-4 w-4" />
        </Button>
      </div>

      {/* Text Alignment */}
      <div className="flex gap-1.5">
        {[
          { align: 'left', icon: AlignLeft },
          { align: 'center', icon: AlignCenter },
          { align: 'right', icon: AlignRight },
        ].map(({ align, icon: Icon }) => (
          <Button
            key={align}
            variant={textObj.textAlign === align ? 'default' : 'outline'}
            size="sm"
            onClick={() => onUpdate('textAlign', align)}
            className="flex-1"
            id={`align-${align}-btn`}
          >
            <Icon className="h-4 w-4" />
          </Button>
        ))}
      </div>

      {/* Color Picker */}
      <div className="space-y-1.5">
        <Label className="text-xs">Color</Label>
        <div className="flex items-center gap-2">
          <Input
            type="color"
            value={(textObj.fill as string) || '#1a1a2e'}
            onChange={(e) => onUpdate('fill', e.target.value)}
            className="w-10 h-9 p-1 cursor-pointer"
            id="color-picker-input"
          />
          <Input
            type="text"
            value={(textObj.fill as string) || '#1a1a2e'}
            onChange={(e) => onUpdate('fill', e.target.value)}
            className="flex-1 h-9 text-xs font-mono"
            id="color-hex-input"
          />
        </div>
        <div className="grid grid-cols-6 gap-1.5 mt-2">
          {COLOR_SWATCHES.map((color) => (
            <button
              key={color}
              onClick={() => onUpdate('fill', color)}
              className="w-full aspect-square rounded-md border border-border/50 hover:scale-110 transition-transform"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>

      {/* Delete */}
      <Button
        variant="outline"
        size="sm"
        onClick={onDelete}
        className="w-full text-destructive hover:bg-destructive/10"
        id="delete-selected-btn"
      >
        <Trash2 className="h-4 w-4 mr-1.5" />
        Delete Selected
      </Button>
    </Card>
  );
}
