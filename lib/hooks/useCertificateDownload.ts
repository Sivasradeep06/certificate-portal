'use client';

import { useState, useCallback } from 'react';
import { generateCertificate } from '@/lib/certificate/generator';
import type { GenerateParams } from '@/types';

interface UseCertificateDownloadReturn {
  isGenerating: boolean;
  error: string | null;
  download: (params: GenerateParams) => Promise<void>;
}

/** React hook wrapping generateCertificate with loading/error state */
export function useCertificateDownload(): UseCertificateDownloadReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const download = useCallback(async (params: GenerateParams) => {
    setIsGenerating(true);
    setError(null);
    try {
      await generateCertificate(params);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Certificate generation failed';
      setError(message);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return { isGenerating, error, download };
}
