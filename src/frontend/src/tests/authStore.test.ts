import { useAuthStore } from '../store/authStore';
import { mockLoginResponse } from './fixtures';

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
    window.localStorage.clear();
  });

  it('starts logged out with no token or user', () => {
    const state = useAuthStore.getState();
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.user).toBeNull();
  });

  it('login() stores tokens and user, and hasPermission reflects granted permissions', () => {
    const response = mockLoginResponse('coordinator');
    useAuthStore.getState().login(response);

    const state = useAuthStore.getState();
    expect(state.accessToken).toBe(response.accessToken);
    expect(state.refreshToken).toBe(response.refreshToken);
    expect(state.user).toEqual(response.user);
    expect(state.hasPermission('TriggerAssessment')).toBe(true);
    expect(state.hasPermission('ApproveDecision')).toBe(false);
  });

  it('logout() clears tokens and user', () => {
    useAuthStore.getState().login(mockLoginResponse('admin'));
    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.user).toBeNull();
  });

  it('a QA Lead login does not carry the TriggerAssessment permission (drives the 403 gate)', () => {
    useAuthStore.getState().login(mockLoginResponse('qalead'));
    expect(useAuthStore.getState().hasPermission('TriggerAssessment')).toBe(false);
  });

  it('setAccessToken() rotates only the access token, leaving refreshToken/user intact', () => {
    const response = mockLoginResponse('manager');
    useAuthStore.getState().login(response);
    useAuthStore.getState().setAccessToken('rotated-access-token');

    const state = useAuthStore.getState();
    expect(state.accessToken).toBe('rotated-access-token');
    expect(state.refreshToken).toBe(response.refreshToken);
    expect(state.user).toEqual(response.user);
  });
});
