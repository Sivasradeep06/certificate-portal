'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Save, Undo2, Redo2, Loader2, Trash2 } from 'lucide-react';
import { PlaceholderPanel } from '@/components/editor/PlaceholderPanel';
import { FontControls } from '@/components/editor/FontControls';
import type { CertificateTemplate, PlaceholderConfig, PlaceholderType } from '@/types';
import { createDefaultPlaceholder } from '@/lib/certificate/placeholders';

interface CertificateEditorProps {
  template: CertificateTemplate | null;
  onSave: (config: PlaceholderConfig[], backgroundUrl?: string | null) => Promise<void>;
  onBackgroundUpload: (file: File) => Promise<string | null>;
  isSaving: boolean;
}

export function CertificateEditor({
  template,
  onSave,
  onBackgroundUpload,
  isSaving,
}: CertificateEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(null);
  const [placeholders, setPlaceholders] = useState<PlaceholderConfig[]>(
    template?.placeholder_config || []
  );
  const [bgUrl, setBgUrl] = useState<string | null>(template?.background_url || null);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isReady, setIsReady] = useState(false);

  const canvasWidth = template?.canvas_width || 1122;
  const canvasHeight = template?.canvas_height || 794;

  // Initialize Fabric.js canvas
  useEffect(() => {
    let mounted = true;

    async function init() {
      const fabricModule = await import('fabric');
      const fabric = fabricModule.fabric;
      if (!mounted || !canvasRef.current) return;

      const canvas = new fabric.Canvas(canvasRef.current, {
        width: canvasWidth,
        height: canvasHeight,
        backgroundColor: '#ffffff',
        selection: true,
      });
      fabricRef.current = canvas;

      // Load background if exists
      if (template?.background_url) {
        fabric.Image.fromURL(
          template.background_url,
          (img: fabric.Image) => {
            if (!mounted) return;
            canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
              scaleX: canvasWidth / (img.width || canvasWidth),
              scaleY: canvasHeight / (img.height || canvasHeight),
            });
          },
          { crossOrigin: 'anonymous' }
        );
      }

      // Load existing placeholders
      if (template?.placeholder_config) {
        template.placeholder_config.forEach((p) => {
          const text = new fabric.IText(p.text || `{{${p.type}}}`, {
            left: p.x,
            top: p.y,
            fontSize: p.fontSize,
            fontFamily: p.fontFamily,
            fontWeight: p.fontWeight,
            fill: p.color,
            textAlign: p.align,
            originX: p.align,
            originY: 'top',
            data: { placeholderType: p.type, placeholderId: p.id },
          });
          canvas.add(text);
        });
      }

      // Events
      canvas.on('selection:created', (e) => {
        const selected = (e as fabric.IEvent<MouseEvent>).selected?.[0];
        if (selected) setSelectedObject(selected);
      });
      canvas.on('selection:updated', (e) => {
        const selected = (e as fabric.IEvent<MouseEvent>).selected?.[0];
        if (selected) setSelectedObject(selected);
      });
      canvas.on('selection:cleared', () => setSelectedObject(null));

      canvas.on('object:modified', () => saveToHistory(canvas));

      setIsReady(true);
      saveToHistory(canvas);
    }

    init();

    return () => {
      mounted = false;
      if (fabricRef.current) {
        fabricRef.current.dispose();
        fabricRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Responsive scaling
  useEffect(() => {
    function handleResize() {
      if (!containerRef.current || !paperRef.current) return;
      const containerWidth = containerRef.current.offsetWidth;
      const scale = Math.min(1, (containerWidth - 32) / canvasWidth); // -32 for padding
      
      const paper = paperRef.current;
      paper.style.transform = `scale(${scale})`;
      paper.style.transformOrigin = 'top center';
      paper.style.width = `${canvasWidth}px`;
      paper.style.height = `${canvasHeight}px`;
      
      containerRef.current.style.height = `${canvasHeight * scale + 64}px`;
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [canvasWidth, canvasHeight, isReady]);

  const saveToHistory = (canvas: fabric.Canvas) => {
    const json = JSON.stringify(canvas.toJSON(['data']));
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(json);
      setHistoryIndex(newHistory.length - 1);
      return newHistory;
    });
  };

  const undo = useCallback(() => {
    if (historyIndex <= 0 || !fabricRef.current) return;
    const newIndex = historyIndex - 1;
    fabricRef.current.loadFromJSON(history[newIndex], () => {
      fabricRef.current?.renderAll();
      setHistoryIndex(newIndex);
    });
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1 || !fabricRef.current) return;
    const newIndex = historyIndex + 1;
    fabricRef.current.loadFromJSON(history[newIndex], () => {
      fabricRef.current?.renderAll();
      setHistoryIndex(newIndex);
    });
  }, [history, historyIndex]);

  const addPlaceholder = (type: PlaceholderType) => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    import('fabric').then(({ fabric }) => {
      const config = createDefaultPlaceholder(type, canvasWidth, canvasHeight);
      const text = new fabric.IText(`{{${type}}}`, {
        left: config.x,
        top: config.y,
        fontSize: config.fontSize,
        fontFamily: config.fontFamily,
        fontWeight: config.fontWeight,
        fill: config.color,
        textAlign: config.align,
        originX: config.align,
        originY: 'top',
        data: { placeholderType: type, placeholderId: config.id },
      });
      canvas.add(text);
      canvas.setActiveObject(text);
      canvas.renderAll();
      setPlaceholders((prev) => [...prev, config]);
      saveToHistory(canvas);
    });
  };

  const deleteSelected = () => {
    const canvas = fabricRef.current;
    const obj = canvas?.getActiveObject();
    if (!canvas || !obj) return;

    const pType = (obj as unknown as { data?: { placeholderType: string } }).data?.placeholderType;
    canvas.remove(obj);
    setSelectedObject(null);
    if (pType) {
      setPlaceholders((prev) => prev.filter((p) => p.type !== pType));
    }
    canvas.renderAll();
    saveToHistory(canvas);
  };

  const updateSelectedProperty = (property: string, value: unknown) => {
    const canvas = fabricRef.current;
    const obj = canvas?.getActiveObject();
    if (!canvas || !obj) return;
    
    if (property === 'textAlign') {
      obj.set({ 
        textAlign: value as string, 
        originX: value as string 
      });
    } else {
      obj.set(property as keyof fabric.Object, value as never);
    }
    
    canvas.renderAll();
  };

  const handleSave = async () => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const configs: PlaceholderConfig[] = [];
    canvas.getObjects().forEach((obj) => {
      const data = (obj as unknown as { data?: { placeholderType: PlaceholderType; placeholderId: string } }).data;
      if (!data?.placeholderType) return;

      const textObj = obj as fabric.IText;
      configs.push({
        id: data.placeholderId,
        type: data.placeholderType,
        x: obj.left || 0,
        y: obj.top || 0,
        fontSize: textObj.fontSize || 32,
        fontFamily: textObj.fontFamily || 'Montserrat',
        fontWeight: (textObj.fontWeight as 'normal' | 'bold') || 'normal',
        color: (textObj.fill as string) || '#1a1a2e',
        align: (textObj.textAlign as 'left' | 'center' | 'right') || 'center',
        text: textObj.text?.startsWith('{{') ? undefined : textObj.text || undefined,
      });
    });

    await onSave(configs, bgUrl);
  };

  const handleBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !fabricRef.current) return;

    const url = await onBackgroundUpload(file);
    if (!url) return;
    setBgUrl(url);

    const { fabric } = await import('fabric');
    fabric.Image.fromURL(
      url,
      (img: fabric.Image) => {
        if (!fabricRef.current) return;
        fabricRef.current.setBackgroundImage(
          img,
          fabricRef.current.renderAll.bind(fabricRef.current),
          {
            scaleX: canvasWidth / (img.width || canvasWidth),
            scaleY: canvasHeight / (img.height || canvasHeight),
          }
        );
      },
      { crossOrigin: 'anonymous' }
    );
  };

  const addedTypes = placeholders.map((p) => p.type);

  return (
    <div className="flex flex-col border border-border/60 rounded-2xl overflow-hidden bg-background shadow-sm" id="certificate-editor">
      {/* Top Header / Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/50 bg-muted/30">
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="sm" onClick={undo} disabled={historyIndex <= 0} className="h-8 w-8 p-0" title="Undo">
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={redo} disabled={historyIndex >= history.length - 1} className="h-8 w-8 p-0" title="Redo">
            <Redo2 className="h-4 w-4" />
          </Button>
          
          <div className="w-px h-4 bg-border/80 mx-2" />
          
          {selectedObject ? (
            <Button variant="ghost" size="sm" onClick={deleteSelected} className="h-8 text-destructive hover:bg-destructive/10 hover:text-destructive px-2">
              <Trash2 className="h-4 w-4 mr-1.5" /> Remove
            </Button>
          ) : (
            <span className="text-xs text-muted-foreground ml-1">No element selected</span>
          )}
        </div>

        <Button onClick={handleSave} disabled={isSaving} className="gradient-primary h-8 px-3 rounded-lg text-xs" size="sm">
          {isSaving ? (
            <><Loader2 className="h-3 w-3 mr-1.5 animate-spin" /> Saving</>
          ) : (
            <><Save className="h-3.5 w-3.5 mr-1.5" /> Save Template</>
          )}
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row h-auto lg:h-[700px]">
        {/* Left Sidebar */}
        <div className="w-full lg:w-[320px] shrink-0 border-r border-border/50 bg-card overflow-y-auto p-4 space-y-6 flex flex-col custom-scrollbar">
          
          <div>
            <h3 className="text-sm font-semibold mb-3 px-1">Elements</h3>
            <PlaceholderPanel addedTypes={addedTypes} onAdd={addPlaceholder} />
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold px-1">Background Image</h3>
            <label className="flex flex-col items-center justify-center p-5 rounded-xl border border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 cursor-pointer transition-colors group">
              <input
                type="file"
                accept="image/*"
                onChange={handleBgUpload}
                className="hidden"
                id="bg-upload-input"
              />
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-primary">Upload Design</span>
              <span className="text-[11px] text-muted-foreground mt-1 text-center">Recommended: 1122x794px (A4 Landscape)</span>
            </label>
          </div>

          {selectedObject && (
            <div className="pt-2 border-t border-border/50">
               <FontControls
                 selectedObject={selectedObject}
                 onUpdate={updateSelectedProperty}
                 onDelete={deleteSelected}
               />
            </div>
          )}
        </div>

        {/* Canvas Area */}
        <div ref={containerRef} className="flex-1 w-full bg-neutral-100/50 dark:bg-neutral-950/50 flex justify-center p-4 overflow-hidden relative">
          <div ref={paperRef} className="relative shadow-2xl transition-all duration-300 ring-1 ring-black/5 bg-white shrink-0 mx-auto">
            <canvas ref={canvasRef} id="fabric-canvas" className="absolute top-0 left-0" />
          </div>
        </div>
      </div>
    </div>
  );
}
