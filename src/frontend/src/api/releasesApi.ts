import { axiosInstance } from './axiosInstance';
import type { Release, ReleaseReadinessResponse } from '../types';

export async function getReleases(): Promise<readonly Release[]> {
  const { data } = await axiosInstance.get<readonly Release[]>('/releases');
  return data;
}

export async function getRelease(id: string): Promise<Release> {
  const { data } = await axiosInstance.get<Release>(`/releases/${id}`);
  return data;
}

export async function triggerAssessment(id: string): Promise<ReleaseReadinessResponse> {
  const { data } = await axiosInstance.post<ReleaseReadinessResponse>(
    `/releases/${id}/assess`,
  );
  return data;
}

export async function getReport(id: string): Promise<ReleaseReadinessResponse> {
  const { data } = await axiosInstance.get<ReleaseReadinessResponse>(
    `/releases/${id}/report`,
  );
  return data;
}

export async function getReportPdf(id: string): Promise<Blob> {
  const { data } = await axiosInstance.get<Blob>(`/releases/${id}/report/pdf`, {
    responseType: 'blob',
  });
  return data;
}
