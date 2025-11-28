import { Suspense } from 'react';
import SearchResults from '@/components/search/SearchResults';
import { Skeleton } from '@/components/ui/skeleton';

function SearchLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Skeleton className="h-8 w-1/2 mb-2" />
      <Skeleton className="h-6 w-3/4 mb-6" />

      <div className="mb-8">
        <Skeleton className="h-8 w-1/4 mb-4" />
        <div className="grid gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>

       <div className="mb-8">
        <Skeleton className="h-8 w-1/4 mb-4" />
        <div className="grid md:grid-cols-2 gap-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    </div>
  )
}

export default function SearchPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const query = typeof searchParams?.q === 'string' ? searchParams.q : '';

  return (
    <div className="min-h-screen bg-background text-foreground pt-8">
      <Suspense fallback={<SearchLoading />}>
        <SearchResults query={query} />
      </Suspense>
    </div>
  );
}

    