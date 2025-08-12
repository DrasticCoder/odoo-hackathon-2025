'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Clock, TrendingUp, MapPin, Star, Users, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useSearch } from '@/hooks/use-search';
import { SearchResultItem } from '@/services/search.service';

interface UniversalSearchProps {
  placeholder?: string;
  className?: string;
  showRecentSearches?: boolean;
}

export function UniversalSearch({
  placeholder = 'Search courts, facilities, users...',
  className,
  showRecentSearches = true,
}: UniversalSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { query, setQuery, isLoading, error, results } = useSearch({
    debounceMs: 300,
    minQueryLength: 2,
    autoSearch: true,
  });

  // Load recent searches from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && showRecentSearches) {
      const saved = localStorage.getItem('recent_searches');
      if (saved) {
        try {
          setRecentSearches(JSON.parse(saved));
        } catch {
          // Ignore parsing errors
        }
      }
    }
  }, [showRecentSearches]);

  // Save search to recent searches
  const saveToRecentSearches = (searchQuery: string) => {
    if (!showRecentSearches || !searchQuery.trim()) return;

    const updated = [searchQuery, ...recentSearches.filter((s) => s !== searchQuery)].slice(0, 5);
    setRecentSearches(updated);

    if (typeof window !== 'undefined') {
      localStorage.setItem('recent_searches', JSON.stringify(updated));
    }
  };

  // Handle search submission
  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      saveToRecentSearches(searchQuery.trim());
      setIsOpen(false);
      // Navigate to search results page if needed
      // router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    } else if (e.key === 'Enter') {
      handleSearch(query);
    }
  };

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'facilities':
        return <MapPin className='h-4 w-4' />;
      case 'courts':
        return <Calendar className='h-4 w-4' />;
      case 'users':
        return <Users className='h-4 w-4' />;
      case 'reviews':
        return <Star className='h-4 w-4' />;
      case 'matches':
        return <TrendingUp className='h-4 w-4' />;
      default:
        return <Search className='h-4 w-4' />;
    }
  };

  const getEntityColor = (type: string) => {
    switch (type) {
      case 'facilities':
        return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'courts':
        return 'bg-green-500/10 text-green-700 border-green-200';
      case 'users':
        return 'bg-purple-500/10 text-purple-700 border-purple-200';
      case 'reviews':
        return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
      case 'matches':
        return 'bg-red-500/10 text-red-700 border-red-200';
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
  };

  const renderSearchResult = (item: SearchResultItem) => (
    <Link
      key={`${item.type}-${item.id}`}
      href={item.url || '#'}
      className='hover:bg-accent flex items-start space-x-3 rounded-lg p-3 transition-colors'
      onClick={() => {
        handleSearch(query);
        setIsOpen(false);
      }}
    >
      <div className='mt-0.5 flex-shrink-0'>
        {item.imageUrl ? (
          <Image src={item.imageUrl} alt={item.title} width={32} height={32} className='h-8 w-8 rounded object-cover' />
        ) : (
          <div className={cn('flex h-8 w-8 items-center justify-center rounded border', getEntityColor(item.type))}>
            {getEntityIcon(item.type)}
          </div>
        )}
      </div>
      <div className='min-w-0 flex-1'>
        <div className='flex items-center space-x-2'>
          <p className='truncate text-sm font-medium'>{item.title}</p>
          <Badge variant='outline' className='text-xs'>
            {item.type}
          </Badge>
        </div>
        {item.description && <p className='text-muted-foreground mt-1 line-clamp-1 text-xs'>{item.description}</p>}
      </div>
    </Link>
  );

  return (
    <div ref={searchRef} className={cn('relative', className)}>
      <div className='relative'>
        <Search className='text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4' />
        <Input
          ref={inputRef}
          type='search'
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className='pl-8'
        />
      </div>

      {isOpen && (
        <div className='bg-background absolute top-full right-0 left-0 z-50 mt-1 max-h-96 rounded-lg border shadow-lg'>
          <ScrollArea className='max-h-96'>
            {/* Loading State */}
            {isLoading && (
              <div className='text-muted-foreground p-4 text-center'>
                <div className='mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
                Searching...
              </div>
            )}

            {/* Error State */}
            {error && <div className='p-4 text-center text-sm text-red-600'>{error}</div>}

            {/* Search Results */}
            {results && results.totalResults > 0 && (
              <div className='p-2'>
                {Object.entries(results.results).map(
                  ([entityType, items]) =>
                    items &&
                    items.length > 0 && (
                      <div key={entityType} className='mb-4 last:mb-0'>
                        <div className='mb-2 flex items-center space-x-2 px-2 py-1'>
                          {getEntityIcon(entityType)}
                          <span className='text-sm font-medium capitalize'>
                            {entityType} ({items.length})
                          </span>
                        </div>
                        <div className='space-y-1'>{items.map(renderSearchResult)}</div>
                        <Separator className='mt-2' />
                      </div>
                    )
                )}

                {/* Suggestions */}
                {results.suggestions && results.suggestions.length > 0 && (
                  <div className='border-t p-3'>
                    <p className='text-muted-foreground mb-2 text-xs'>Suggestions:</p>
                    <div className='flex flex-wrap gap-1'>
                      {results.suggestions.map((suggestion, index) => (
                        <Button
                          key={index}
                          variant='outline'
                          size='sm'
                          className='h-6 text-xs'
                          onClick={() => setQuery(suggestion)}
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* No Results */}
            {results && results.totalResults === 0 && query.length >= 2 && (
              <div className='text-muted-foreground p-4 text-center'>
                <p className='mb-2'>No results found for &ldquo;{query}&rdquo;</p>
                {results.suggestions && results.suggestions.length > 0 && (
                  <div>
                    <p className='mb-2 text-xs'>Try these suggestions:</p>
                    <div className='flex flex-wrap justify-center gap-1'>
                      {results.suggestions.map((suggestion, index) => (
                        <Button
                          key={index}
                          variant='outline'
                          size='sm'
                          className='h-6 text-xs'
                          onClick={() => setQuery(suggestion)}
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Recent Searches */}
            {!query && showRecentSearches && recentSearches.length > 0 && (
              <div className='p-3'>
                <div className='mb-2 flex items-center space-x-2'>
                  <Clock className='text-muted-foreground h-4 w-4' />
                  <span className='text-sm font-medium'>Recent Searches</span>
                </div>
                <div className='space-y-1'>
                  {recentSearches.map((recentQuery, index) => (
                    <button
                      key={index}
                      className='hover:bg-accent w-full rounded p-2 text-left text-sm transition-colors'
                      onClick={() => setQuery(recentQuery)}
                    >
                      {recentQuery}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {!query && (!showRecentSearches || recentSearches.length === 0) && (
              <div className='text-muted-foreground p-4 text-center'>
                <Search className='mx-auto mb-2 h-8 w-8 opacity-50' />
                <p className='text-sm'>Start typing to search...</p>
              </div>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
