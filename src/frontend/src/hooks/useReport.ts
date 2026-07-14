import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { getReport } from '../api/releasesApi';
import type { ReleaseReadinessResponse } from '../types';

export const reportQueryKey = (id: string) => ['releases', id, 'report'] as const;

export function useReport(id: string | undefined): UseQueryResult<ReleaseReadinessResponse> {
  return useQuery({
    queryKey: reportQueryKey(id ?? ''),
    queryFn: () => getReport(id as string),
    enabled: Boolean(id),
  });
}
