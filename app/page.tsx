'use client';

import { useState } from 'react';
import { Award, ShieldCheck, Sparkles, GraduationCap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { SearchForm } from '@/components/portal/SearchForm';
import { CertificateCard } from '@/components/portal/CertificateCard';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useSearch } from '@/lib/hooks/useSearch';
import type { ParticipantSearchResult } from '@/types';

export default function PortalPage() {
  const [results, setResults] = useState<ParticipantSearchResult[] | null>(null);
  const { mutate: search, isPending, error } = useSearch();

  const handleSearch = (query: string) => {
    search(
      { query },
      {
        onSuccess: (data) => setResults(data),
        onError: () => setResults([]),
      }
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Decorative background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-primary/3 rounded-full blur-[80px]" />
      </div>

      {/* Header */}
      <header className="border-b border-border/50 glass sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl gradient-primary p-2.5">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">
                <span className="gradient-text">CertPortal</span>
              </h1>
              <p className="text-xs text-muted-foreground">VSBEC Certificate Platform</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <a
              href="/admin/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Admin
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-start px-4 sm:px-6 pt-12 sm:pt-20 pb-16">
        {/* Hero */}
        <div className="text-center max-w-2xl mx-auto mb-10 animate-fade-in">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
            <Sparkles className="h-4 w-4" />
            Quick &amp; Secure Download
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.15] mb-4">
            Download Your{' '}
            <span className="gradient-text">Event Certificates</span>
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto">
            Enter your register number or email address to find and download your certificates instantly.
          </p>
        </div>

        {/* Search Card */}
        <Card className="w-full max-w-lg glass border-border/40 shadow-xl shadow-primary/5 animate-slide-up" id="search-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Search Certificates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SearchForm onSearch={handleSearch} isLoading={isPending} />
          </CardContent>
        </Card>

        {/* Error State */}
        {error && (
          <div className="mt-6 w-full max-w-lg animate-scale-in">
            <Card className="border-destructive/30 bg-destructive/5">
              <CardContent className="p-4 text-center text-destructive text-sm">
                {error instanceof Error ? error.message : 'Something went wrong. Please try again.'}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Loading State */}
        {isPending && (
          <div className="mt-8 w-full max-w-lg space-y-3 animate-fade-in">
            {[1, 2].map((i) => (
              <Card key={i} className="border-border/30">
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-16 rounded-lg" />
                      <Skeleton className="h-8 w-16 rounded-lg" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Results */}
        {results && !isPending && (
          <div className="mt-8 w-full max-w-lg space-y-3 animate-fade-in">
            {results.length === 0 ? (
              <Card className="border-border/30">
                <CardContent className="p-8 text-center">
                  <Award className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
                  <h3 className="font-semibold text-foreground mb-1">No Certificates Found</h3>
                  <p className="text-sm text-muted-foreground">
                    We couldn&apos;t find any certificates matching your search. Double-check your register number or email.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-2">
                  Found <span className="font-semibold text-foreground">{results.length}</span> certificate{results.length > 1 ? 's' : ''}
                </p>
                {results.map((result, index) => (
                  <CertificateCard key={result.participant.id} result={result} index={index} />
                ))}
              </>
            )}
          </div>
        )}

        {/* Trust Indicators */}
        {!results && !isPending && (
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl w-full animate-fade-in" style={{ animationDelay: '300ms' }}>
            {[
              { icon: ShieldCheck, title: 'Secure', desc: 'Verified certificates' },
              { icon: Sparkles, title: 'Instant', desc: 'Download in seconds' },
              { icon: Award, title: 'Official', desc: 'College authenticated' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center group">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-3 group-hover:bg-primary/20 transition-colors">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-sm">{title}</h3>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-6 text-center text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} VSBEC • CertPortal</p>
      </footer>
    </div>
  );
}
