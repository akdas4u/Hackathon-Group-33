import { useState, type FormEvent, type ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLogin } from '../../hooks/useLogin';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';
import { isApiErrorEnvelope } from '../../types';

interface DemoRole {
  readonly label: string;
  readonly username: string;
}

/** Matches the 5 seeded demo users (src/tests/fixtures.ts) — all share the password Password123!. */
const DEMO_ROLES: readonly DemoRole[] = [
  { label: 'Coordinator', username: 'coordinator@demo.io' },
  { label: 'Manager', username: 'manager@demo.io' },
  { label: 'QA Lead', username: 'qalead@demo.io' },
  { label: 'DevOps', username: 'devops@demo.io' },
  { label: 'Admin', username: 'admin@demo.io' },
];

const DEMO_PASSWORD = 'Password123!';

export function LoginForm(): ReactElement {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const navigate = useNavigate();
  const loginMutation = useLogin();

  function handleRoleSelect(role: DemoRole): void {
    setSelectedRole(role.label);
    setUsername(role.username);
    setPassword(DEMO_PASSWORD);
    setValidationError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    if (!username.trim() || !password.trim()) {
      setValidationError('Username and password are required.');
      return;
    }
    setValidationError(null);

    try {
      await loginMutation.mutateAsync({ username, password });
      navigate('/dashboard');
    } catch {
      // Error surfaced via loginMutation.error below.
    }
  }

  const serverErrorMessage = (): string | null => {
    const error = loginMutation.error;
    if (!error) {
      return null;
    }
    const responseData = (error as { response?: { data?: unknown } }).response?.data;
    if (isApiErrorEnvelope(responseData)) {
      return responseData.message;
    }
    return 'Login failed. Check your credentials and try again.';
  };

  return (
    <div className="flex w-full max-w-sm flex-col gap-5">
      <div>
        <h1 className="text-lg font-semibold text-text-primary">Release Readiness AI</h1>
        <p className="text-xs text-text-muted">Sign in to assess release readiness</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-text-secondary">Quick sign-in (demo)</span>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Demo role quick-select">
          {DEMO_ROLES.map((role) => (
            <button
              key={role.label}
              type="button"
              onClick={() => handleRoleSelect(role)}
              className={cn(
                'rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors',
                selectedRole === role.label
                  ? 'border-brand-teal bg-brand-teal text-white'
                  : 'border-border-default bg-surface-card text-text-secondary hover:border-brand-teal hover:bg-brand-teal hover:text-white',
              )}
            >
              {role.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-1">
          <label htmlFor="username" className="text-xs font-medium text-text-secondary">
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            value={username}
            onChange={(event) => {
              setUsername(event.target.value);
              setSelectedRole(null);
            }}
            className="h-10 rounded-md border border-border-default bg-surface-card px-3 text-sm text-text-primary outline-none transition-colors focus:border-brand-teal focus:ring-1 focus:ring-brand-teal"
            placeholder="coordinator@demo.io"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="text-xs font-medium text-text-secondary">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setSelectedRole(null);
            }}
            className="h-10 rounded-md border border-border-default bg-surface-card px-3 text-sm text-text-primary outline-none transition-colors focus:border-brand-teal focus:ring-1 focus:ring-brand-teal"
            placeholder="Password123!"
          />
        </div>

        {validationError && (
          <p role="alert" data-testid="login-validation-error" className="animate-shake text-sm text-danger">
            {validationError}
          </p>
        )}
        {!validationError && serverErrorMessage() && (
          <p role="alert" data-testid="login-server-error" className="animate-shake text-sm text-danger">
            {serverErrorMessage()}
          </p>
        )}

        <Button
          type="submit"
          disabled={loginMutation.isPending}
          className="w-full bg-brand-teal hover:bg-brand-teal-hover focus-visible:ring-brand-teal"
        >
          {loginMutation.isPending ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </div>
  );
}
