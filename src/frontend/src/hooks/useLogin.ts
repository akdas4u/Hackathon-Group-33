import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { login } from '../api/authApi';
import { useAuthStore } from '../store/authStore';
import type { LoginRequest, LoginResponse } from '../types';

export function useLogin(): UseMutationResult<LoginResponse, unknown, LoginRequest> {
  const storeLogin = useAuthStore((state) => state.login);

  return useMutation({
    mutationFn: (request: LoginRequest) => login(request),
    onSuccess: (response: LoginResponse) => {
      storeLogin(response);
    },
  });
}
