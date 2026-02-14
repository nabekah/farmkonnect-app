import { forwardRef, useState, useCallback, useMemo, useRef, useEffect, ReactNode } from 'react';
import { Search, X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SearchResult<T> {
  /**
   * Result item
   */
  item: T;
  /**
   * Matched fields
   */
  matchedFields: string[];
  /**
   * Relevance score
   */
  score: number;
}

export interface SearchFilterProps<T> {
  /**
   * Data to search
   */
  data: T[];
  /**
   * Searchable fields
   */
  searchFields: (keyof T)[];
  /**
   * On search results change
   */
  onResultsChange?: (results: SearchResult<T>[]) => void;
  /**
   * Render result item
   */
  renderResult?: (item: T, highlighted: string) => ReactNode;
  /**
   * Placeholder text
   */
  placeholder?: string;
  /**
   * Debounce delay in ms
   */
  debounceDelay?: number;
  /**
   * Min search length
   */
  minSearchLength?: number;
  /**
   * Max results to show
   */
  maxResults?: number;
  /**
   * Custom className
   */
  className?: string;
}

/**
 * Highlight matching text
 */
function highlightText(text: string, query: string): string {
  if (!query) return text;
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

/**
 * Calculate relevance score
 */
function calculateScore(text: string, query: string): number {
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();

  if (lowerText === lowerQuery) return 100;
  if (lowerText.startsWith(lowerQuery)) return 80;
  if (lowerText.includes(lowerQuery)) return 60;

  // Fuzzy matching
  let score = 0;
  let queryIndex = 0;
  for (let i = 0; i < lowerText.length && queryIndex < lowerQuery.length; i++) {
    if (lowerText[i] === lowerQuery[queryIndex]) {
      score += 10;
      queryIndex++;
    }
  }

  return queryIndex === lowerQuery.length ? score : 0;
}

/**
 * SearchFilter Component
 * 
 * Advanced search with debouncing and filtering
 */
export const SearchFilter = forwardRef<HTMLDivElement, SearchFilterProps<any>>(
  (
    {
      data,
      searchFields,
      onResultsChange,
      renderResult,
      placeholder = 'Search...',
      debounceDelay = 300,
      minSearchLength = 1,
      maxResults = 10,
      className = '',
    },
    ref
  ) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult<any>[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const debounceTimer = useRef<NodeJS.Timeout>();
    const containerRef = useRef<HTMLDivElement>(null);

    // Debounced search
    useEffect(() => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      if (query.length < minSearchLength) {
        setResults([]);
        onResultsChange?.([]);
        return;
      }

      debounceTimer.current = setTimeout(() => {
        const searchResults: SearchResult<any>[] = [];

        data.forEach((item) => {
          let totalScore = 0;
          const matchedFields: string[] = [];

          searchFields.forEach((field) => {
            const fieldValue = String(item[field] || '').toLowerCase();
            const score = calculateScore(fieldValue, query);

            if (score > 0) {
              totalScore += score;
              matchedFields.push(String(field));
            }
          });

          if (totalScore > 0) {
            searchResults.push({
              item,
              matchedFields,
              score: totalScore,
            });
          }
        });

        // Sort by score
        searchResults.sort((a, b) => b.score - a.score);

        const filtered = searchResults.slice(0, maxResults);
        setResults(filtered);
        onResultsChange?.(filtered);
        setHighlightedIndex(0);
      }, debounceDelay);

      return () => {
        if (debounceTimer.current) {
          clearTimeout(debounceTimer.current);
        }
      };
    }, [query, data, searchFields, debounceDelay, minSearchLength, maxResults, onResultsChange]);

    const handleClear = useCallback(() => {
      setQuery('');
      setResults([]);
      setIsOpen(false);
    }, []);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault();
            setHighlightedIndex((prev) =>
              prev < results.length - 1 ? prev + 1 : prev
            );
            setIsOpen(true);
            break;
          case 'ArrowUp':
            e.preventDefault();
            setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
            break;
          case 'Enter':
            e.preventDefault();
            if (results[highlightedIndex]) {
              setQuery(String(results[highlightedIndex].item[searchFields[0]]));
              setIsOpen(false);
            }
            break;
          case 'Escape':
            e.preventDefault();
            setIsOpen(false);
            break;
          default:
            break;
        }
      },
      [results, highlightedIndex, searchFields]
    );

    // Handle click outside
    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(e.target as Node)
        ) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isOpen]);

    return (
      <div
        ref={ref || containerRef}
        className={cn('relative w-full', className)}
      >
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => query.length >= minSearchLength && setIsOpen(true)}
            placeholder={placeholder}
            className={cn(
              'w-full pl-10 pr-10 py-2 rounded-md border border-input bg-background',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
              'transition-colors'
            )}
          />

          {query && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Results dropdown */}
        {isOpen && results.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border border-input rounded-md shadow-lg max-h-96 overflow-y-auto">
            {results.map((result, index) => {
              const isHighlighted = index === highlightedIndex;
              const firstField = searchFields[0];
              const displayText = String(result.item[firstField] || '');

              return (
                <button
                  key={index}
                  onClick={() => {
                    setQuery(displayText);
                    setIsOpen(false);
                  }}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={cn(
                    'w-full text-left px-4 py-2 transition-colors border-b border-border last:border-0',
                    isHighlighted && 'bg-muted'
                  )}
                >
                  {renderResult ? (
                    renderResult(result.item, displayText)
                  ) : (
                    <div>
                      <div className="font-medium text-sm">
                        {highlightText(displayText, query)}
                      </div>
                      {result.matchedFields.length > 1 && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Matched in: {result.matchedFields.join(', ')}
                        </div>
                      )}
                    </div>
                  )}
                </button>
              );
            })}

            {results.length >= maxResults && (
              <div className="px-4 py-2 text-center text-xs text-muted-foreground">
                Showing {maxResults} of {results.length} results
              </div>
            )}
          </div>
        )}

        {/* No results message */}
        {isOpen && query.length >= minSearchLength && results.length === 0 && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border border-input rounded-md shadow-lg p-4 text-center text-sm text-muted-foreground">
            No results found for "{query}"
          </div>
        )}
      </div>
    );
  }
);

SearchFilter.displayName = 'SearchFilter';

/**
 * AdvancedFilter Component
 * 
 * Multi-field filter with multiple filter options
 */
export interface FilterOption {
  /**
   * Filter key
   */
  key: string;
  /**
   * Filter label
   */
  label: string;
  /**
   * Filter values
   */
  values: { label: string; value: string }[];
}

export interface AdvancedFilterProps {
  /**
   * Filter options
   */
  filters: FilterOption[];
  /**
   * Selected filters
   */
  selectedFilters?: Record<string, string[]>;
  /**
   * On filters change
   */
  onFiltersChange?: (filters: Record<string, string[]>) => void;
  /**
   * Custom className
   */
  className?: string;
}

export const AdvancedFilter = forwardRef<HTMLDivElement, AdvancedFilterProps>(
  (
    {
      filters,
      selectedFilters = {},
      onFiltersChange,
      className = '',
    },
    ref
  ) => {
    const [openFilters, setOpenFilters] = useState<Set<string>>(new Set());

    const handleToggleFilter = useCallback((key: string) => {
      setOpenFilters((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(key)) {
          newSet.delete(key);
        } else {
          newSet.add(key);
        }
        return newSet;
      });
    }, []);

    const handleToggleValue = useCallback(
      (key: string, value: string) => {
        const current = selectedFilters[key] || [];
        let newValues: string[];

        if (current.includes(value)) {
          newValues = current.filter((v) => v !== value);
        } else {
          newValues = [...current, value];
        }

        onFiltersChange?.({
          ...selectedFilters,
          [key]: newValues.length > 0 ? newValues : undefined,
        });
      },
      [selectedFilters, onFiltersChange]
    );

    const handleClearAll = useCallback(() => {
      onFiltersChange?.({});
    }, [onFiltersChange]);

    const activeFilterCount = Object.values(selectedFilters).reduce(
      (sum, values) => sum + (values?.length || 0),
      0
    );

    return (
      <div
        ref={ref}
        className={cn('space-y-2', className)}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">Filters</h3>
          {activeFilterCount > 0 && (
            <button
              onClick={handleClearAll}
              className="text-xs text-primary hover:underline"
            >
              Clear all ({activeFilterCount})
            </button>
          )}
        </div>

        {/* Filter groups */}
        <div className="space-y-2">
          {filters.map((filter) => (
            <div key={filter.key} className="border border-border rounded-lg">
              {/* Filter header */}
              <button
                onClick={() => handleToggleFilter(filter.key)}
                className="w-full px-3 py-2 flex items-center justify-between hover:bg-muted transition-colors"
              >
                <span className="font-medium text-sm">{filter.label}</span>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 transition-transform',
                    openFilters.has(filter.key) && 'rotate-180'
                  )}
                />
              </button>

              {/* Filter values */}
              {openFilters.has(filter.key) && (
                <div className="border-t border-border px-3 py-2 space-y-2 bg-muted/50">
                  {filter.values.map((value) => (
                    <label
                      key={value.value}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={(selectedFilters[filter.key] || []).includes(
                          value.value
                        )}
                        onChange={() =>
                          handleToggleValue(filter.key, value.value)
                        }
                        className="rounded border-input"
                      />
                      <span className="text-sm">{value.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }
);

AdvancedFilter.displayName = 'AdvancedFilter';

/**
 * useSearch Hook
 * 
 * Manage search state
 */
export function useSearch<T>(
  data: T[],
  searchFields: (keyof T)[],
  debounceDelay = 300
) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult<T>[]>([]);
  const debounceTimer = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (!query) {
      setResults([]);
      return;
    }

    debounceTimer.current = setTimeout(() => {
      const searchResults: SearchResult<T>[] = [];

      data.forEach((item) => {
        let totalScore = 0;
        const matchedFields: string[] = [];

        searchFields.forEach((field) => {
          const fieldValue = String(item[field] || '').toLowerCase();
          const score = calculateScore(fieldValue, query);

          if (score > 0) {
            totalScore += score;
            matchedFields.push(String(field));
          }
        });

        if (totalScore > 0) {
          searchResults.push({
            item,
            matchedFields,
            score: totalScore,
          });
        }
      });

      searchResults.sort((a, b) => b.score - a.score);
      setResults(searchResults);
    }, debounceDelay);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query, data, searchFields, debounceDelay]);

  return {
    query,
    setQuery,
    results,
  };
}
