'use client';

import { useForm } from 'react-hook-form';
import { Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SearchFormProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

interface FormValues {
  query: string;
}

export function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    defaultValues: { query: '' },
  });

  const onSubmit = (data: FormValues) => {
    const trimmed = data.query.trim();
    if (trimmed) onSearch(trimmed);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3" id="search-form">
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          {...register('query', {
            required: 'Please enter your register number or email',
            minLength: { value: 1, message: 'Enter at least 1 character' },
          })}
          id="search-input"
          placeholder="Enter your register number or email..."
          className="pl-11 h-12 text-base rounded-xl border-border/60 bg-secondary/30 focus:bg-background transition-colors"
          autoComplete="off"
          disabled={isLoading}
        />
      </div>
      {errors.query && (
        <p className="text-destructive text-sm ml-1">{errors.query.message}</p>
      )}
      <Button
        type="submit"
        disabled={isLoading}
        id="search-submit-btn"
        className="h-12 rounded-xl text-base font-semibold gradient-primary hover:opacity-90 transition-opacity"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Searching...
          </>
        ) : (
          <>
            <Search className="mr-2 h-5 w-5" />
            Search Certificates
          </>
        )}
      </Button>
    </form>
  );
}
