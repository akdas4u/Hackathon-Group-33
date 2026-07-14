// Contract-mandated filename "useAssessment.test.tsx". The scaffold's
// equivalent hook is useTriggerAssessment (hooks/useTriggerAssessment.ts),
// which drives the "Run Assessment" mutation — tested here with a mocked
// releasesApi module so no real HTTP call or import.meta.env touchpoint is
// ever loaded by Jest.
import type { ReactElement, ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTriggerAssessment } from '../hooks/useTriggerAssessment';
import { NO_GO_FIXTURE } from './fixtures';

jest.mock('../api/releasesApi', () => ({
  triggerAssessment: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { triggerAssessment } = jest.requireMock('../api/releasesApi') as {
  triggerAssessment: jest.Mock;
};

function createWrapper(): (props: { children: ReactNode }) => ReactElement {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }): ReactElement {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useTriggerAssessment (useAssessment hook)', () => {
  beforeEach(() => {
    triggerAssessment.mockReset();
  });

  it('starts idle, then resolves to success state with the mocked response', async () => {
    triggerAssessment.mockResolvedValueOnce(NO_GO_FIXTURE);

    const { result } = renderHook(() => useTriggerAssessment(NO_GO_FIXTURE.releaseId), {
      wrapper: createWrapper(),
    });

    expect(result.current.isIdle).toBe(true);
    expect(result.current.isPending).toBe(false);

    act(() => {
      result.current.mutate();
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(NO_GO_FIXTURE);
    expect(triggerAssessment).toHaveBeenCalledWith(NO_GO_FIXTURE.releaseId);
  });

  it('surfaces an error state when the mocked fetch rejects (e.g. 403 forbidden)', async () => {
    triggerAssessment.mockRejectedValueOnce(new Error('Forbidden'));

    const { result } = renderHook(() => useTriggerAssessment('release-x'), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate();
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.isSuccess).toBe(false);
  });
});
