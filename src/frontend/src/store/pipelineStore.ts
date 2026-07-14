import { create } from 'zustand';
import type { ReleaseReadinessResponse } from '../types';

export interface PipelineState {
  readonly result: ReleaseReadinessResponse | null;
  readonly setResult: (result: ReleaseReadinessResponse) => void;
  readonly clear: () => void;
}

export const usePipelineStore = create<PipelineState>((set) => ({
  result: null,
  setResult: (result: ReleaseReadinessResponse) => set({ result }),
  clear: () => set({ result: null }),
}));
