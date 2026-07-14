import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { getRelease } from '../api/releasesApi';
import type { Release } from '../types';

export const releaseQueryKey = (id: string) => ['releases', id] as const;

export function useRelease(id: string | undefined): UseQueryResult<Release> {
  return useQuery({
    queryKey: releaseQueryKey(id ?? ''),
    queryFn: () => getRelease(id as string),
    enabled: Boolean(id),
  });
}
