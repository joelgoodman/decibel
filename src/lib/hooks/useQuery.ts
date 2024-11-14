import { 
  createQuery,
  type CreateQueryOptions,
  type CreateQueryResult 
} from '@tanstack/svelte-query';
import { derived, type Readable } from 'svelte/store';

export function useQuery<TData, TError>(
  options: CreateQueryOptions<TData, TError>
): Readable<CreateQueryResult<TData, TError>> {
  const query = createQuery({
    ...options,
    staleTime: options.staleTime ?? 1000 * 60 * 5, // 5 minutes
    cacheTime: options.cacheTime ?? 1000 * 60 * 30, // 30 minutes
  });
  
  return derived(query, $query => $query);
}

export function usePaginatedQuery<TData, TError>(
  options: CreateQueryOptions<TData, TError> & {
    page?: number;
    limit?: number;
  }
) {
  const { page = 1, limit = 10, ...queryOptions } = options;
  
  return useQuery({
    ...queryOptions,
    queryKey: [...(queryOptions.queryKey || []), { page, limit }],
    keepPreviousData: true,
  });
}