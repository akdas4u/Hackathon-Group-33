import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { getReleases } from '../api/releasesApi';
import type { Release } from '../types';

export const releasesQueryKey = ['releases'] as const;

export function useReleases(): UseQueryResult<readonly Release[]> {
  return useQuery({
    queryKey: releasesQueryKey,
    queryFn: getReleases,
  });
}
