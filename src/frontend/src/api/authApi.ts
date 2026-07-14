import { axiosInstance } from './axiosInstance';
import type { LoginRequest, LoginResponse, RefreshRequest, RefreshResponse } from '../types';

export async function login(request: LoginRequest): Promise<LoginResponse> {
  const { data } = await axiosInstance.post<LoginResponse>('/auth/login', request);
  return data;
}

export async function refresh(request: RefreshRequest): Promise<RefreshResponse> {
  const { data } = await axiosInstance.post<RefreshResponse>('/auth/refresh', request);
  return data;
}
