import { useEffect, useRef, useState } from 'react';

/**
 * Hook for lazy loading images
 */
export const useLazyLoadImages = () => {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            observerRef.current?.unobserve(img);
          }
        }
      });
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  const observeImage = (element: HTMLImageElement) => {
    if (observerRef.current) {
      observerRef.current.observe(element);
    }
  };

  return { observeImage };
};

/**
 * Hook for infinite scroll pagination
 */
export const useInfiniteScroll = <T>(
  fetchFn: (page: number) => Promise<T[]>,
  pageSize: number = 10
) => {
  const [data, setData] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

  const loadMore = async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const newData = await fetchFn(page);
      if (newData.length < pageSize) {
        setHasMore(false);
      }
      setData((prev) => [...prev, ...newData]);
      setPage((prev) => prev + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !isLoading) {
        loadMore();
      }
    });

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoading]);

  return {
    data,
    isLoading,
    hasMore,
    error,
    observerTarget,
    reset: () => {
      setData([]);
      setPage(1);
      setHasMore(true);
      setError(null);
    },
  };
};

/**
 * Hook for paginated data with manual pagination
 */
export const usePagination = <T>(
  fetchFn: (page: number, limit: number) => Promise<{ data: T[]; total: number }>,
  initialLimit: number = 10
) => {
  const [data, setData] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(initialLimit);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalPages = Math.ceil(total / limit);

  const loadPage = async (pageNum: number) => {
    setIsLoading(true);
    try {
      const result = await fetchFn(pageNum, limit);
      setData(result.data);
      setTotal(result.total);
      setPage(pageNum);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPage(1);
  }, [limit]);

  return {
    data,
    page,
    limit,
    total,
    totalPages,
    isLoading,
    error,
    goToPage: (pageNum: number) => {
      if (pageNum >= 1 && pageNum <= totalPages) {
        loadPage(pageNum);
      }
    },
    nextPage: () => loadPage(Math.min(page + 1, totalPages)),
    prevPage: () => loadPage(Math.max(page - 1, 1)),
    setLimit: (newLimit: number) => setLimit(newLimit),
  };
};

/**
 * Hook for virtual scrolling (for very large lists)
 */
export const useVirtualScroll = <T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) => {
  const [scrollTop, setScrollTop] = useState(0);

  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.ceil((scrollTop + containerHeight) / itemHeight);
  const visibleItems = items.slice(startIndex, endIndex);
  const offsetY = startIndex * itemHeight;

  return {
    visibleItems,
    offsetY,
    totalHeight: items.length * itemHeight,
    onScroll: (e: React.UIEvent<HTMLDivElement>) => {
      setScrollTop(e.currentTarget.scrollTop);
    },
  };
};

/**
 * Hook for debounced search
 */
export const useDebouncedSearch = <T>(
  searchFn: (query: string) => Promise<T[]>,
  delayMs: number = 300
) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    setIsLoading(true);

    timeoutRef.current = setTimeout(async () => {
      try {
        const data = await searchFn(query);
        setResults(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed');
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, delayMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [query, searchFn, delayMs]);

  return {
    query,
    setQuery,
    results,
    isLoading,
    error,
  };
};

/**
 * Hook for lazy loading components
 */
export const useLazyLoadComponent = (
  importFn: () => Promise<any>,
  fallback?: React.ReactNode
) => {
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    importFn()
      .then((module) => {
        setComponent(() => module.default || module);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err);
        setIsLoading(false);
      });
  }, [importFn]);

  return { Component, isLoading, error };
};

/**
 * Hook for intersection observer (generic)
 */
export const useIntersectionObserver = (
  callback: (isVisible: boolean) => void,
  options?: IntersectionObserverInit
) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      callback(entry.isIntersecting);
    }, options);

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [callback, options]);

  return ref;
};
