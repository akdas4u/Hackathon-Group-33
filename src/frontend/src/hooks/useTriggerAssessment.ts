import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { triggerAssessment } from '../api/releasesApi';
import { usePipelineStore } from '../store/pipelineStore';
import { reportQueryKey } from './useReport';
import type { ReleaseReadinessResponse } from '../types';

export function useTriggerAssessment(
  id: string,
): UseMutationResult<ReleaseReadinessResponse, unknown, void> {
  const queryClient = useQueryClient();
  const setResult = usePipelineStore((state) => state.setResult);

  return useMutation({
    mutationFn: () => triggerAssessment(id),
    onSuccess: (response: ReleaseReadinessResponse) => {
      setResult(response);
      void queryClient.invalidateQueries({ queryKey: reportQueryKey(id) });
    },
  });
}
