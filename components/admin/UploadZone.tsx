'use client';

import { useCallback, useState, useRef } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { parseCsv } from '@/lib/parsers/csv';
import { parseExcel } from '@/lib/parsers/excel';
import type { CsvRow } from '@/types';
import type { ParseResult } from '@/lib/parsers/csv';

interface UploadZoneProps {
  onConfirm: (rows: CsvRow[]) => void;
  isUploading: boolean;
}

const MAX_SIZE_MB = 5;

export function UploadZone({ onConfirm, isUploading }: UploadZoneProps) {
  const [dragActive, setDragActive] = useState(false);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    setFileError(null);
    setParseResult(null);

    // Validate type
    const isCSV = file.name.endsWith('.csv');
    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
    if (!isCSV && !isExcel) {
      setFileError('Please upload a .csv or .xlsx file');
      return;
    }

    // Validate size
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setFileError(`File must be under ${MAX_SIZE_MB}MB`);
      return;
    }

    setFileName(file.name);

    try {
      const result = isCSV ? await parseCsv(file) : await parseExcel(file);
      setParseResult(result);
    } catch (err) {
      setFileError(err instanceof Error ? err.message : 'Failed to parse file');
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const reset = () => {
    setParseResult(null);
    setFileError(null);
    setFileName(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="space-y-4" id="upload-zone">
      {/* Drop Zone */}
      {!parseResult && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            dragActive
              ? 'border-primary bg-primary/5 scale-[1.01]'
              : 'border-border/60 hover:border-primary/40 hover:bg-muted/30'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileInput}
            className="hidden"
            id="file-upload-input"
          />
          <div className="flex flex-col items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-3">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">
                Drop your file here or <span className="text-primary">browse</span>
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Supports CSV and Excel (.xlsx) • Max {MAX_SIZE_MB}MB
              </p>
            </div>
          </div>
        </div>
      )}

      {/* File Error */}
      {fileError && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
            <p className="text-sm text-destructive">{fileError}</p>
          </CardContent>
        </Card>
      )}

      {/* Parse Results Preview */}
      {parseResult && (
        <div className="space-y-4 animate-scale-in">
          {/* Summary */}
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-primary" />
                  <span className="font-medium text-sm">{fileName}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={reset} className="h-8 w-8 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex gap-3">
                <Badge className="bg-success/10 text-green-700 dark:text-green-400 border-0">
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                  {parseResult.rows.length} valid
                </Badge>
                {parseResult.errors.length > 0 && (
                  <Badge className="bg-destructive/10 text-destructive border-0">
                    <AlertCircle className="h-3.5 w-3.5 mr-1" />
                    {parseResult.errors.length} errors
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Preview Table */}
          {parseResult.rows.length > 0 && (
            <div className="overflow-x-auto rounded-lg border border-border/50 max-h-64">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/30">
                    <th className="text-left font-semibold px-3 py-2">#</th>
                    <th className="text-left font-semibold px-3 py-2">Name</th>
                    <th className="text-left font-semibold px-3 py-2">Reg No.</th>
                    <th className="text-left font-semibold px-3 py-2">Email</th>
                    <th className="text-left font-semibold px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {parseResult.rows.slice(0, 10).map((row, i) => (
                    <tr key={i} className="hover:bg-muted/20">
                      <td className="px-3 py-2 text-muted-foreground">{i + 1}</td>
                      <td className="px-3 py-2 font-medium">{row.name}</td>
                      <td className="px-3 py-2 text-muted-foreground">{row.register_number || '—'}</td>
                      <td className="px-3 py-2 text-muted-foreground">{row.email || '—'}</td>
                      <td className="px-3 py-2">{row.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {parseResult.rows.length > 10 && (
                <div className="px-3 py-2 text-xs text-muted-foreground bg-muted/20 text-center">
                  Showing 10 of {parseResult.rows.length} rows
                </div>
              )}
            </div>
          )}

          {/* Error Table */}
          {parseResult.errors.length > 0 && (
            <div className="overflow-x-auto rounded-lg border border-destructive/30 max-h-48">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-destructive/20 bg-destructive/5">
                    <th className="text-left font-semibold px-3 py-2">Row</th>
                    <th className="text-left font-semibold px-3 py-2">Error</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-destructive/10">
                  {parseResult.errors.map((err, i) => (
                    <tr key={i}>
                      <td className="px-3 py-2 text-muted-foreground">{err.row}</td>
                      <td className="px-3 py-2 text-destructive">{err.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Confirm Button */}
          {parseResult.rows.length > 0 && (
            <Button
              onClick={() => onConfirm(parseResult.rows)}
              disabled={isUploading}
              className="w-full h-11 rounded-xl gradient-primary hover:opacity-90"
              id="confirm-upload-btn"
            >
              {isUploading ? 'Uploading...' : `Upload ${parseResult.rows.length} Participants`}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
