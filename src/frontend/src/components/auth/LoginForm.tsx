import { useState, type FormEvent, type ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLogin } from '../../hooks/useLogin';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { isApiErrorEnvelope } from '../../types';

export function LoginForm(): ReactElement {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const navigate = useNavigate();
  const loginMutation = useLogin();

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
    <Card className="mx-auto w-full max-w-sm">
      <CardHeader>
        <CardTitle>Release Readiness AI Assistant</CardTitle>
        <CardDescription>Sign in to trigger and review release assessments.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1">
            <label htmlFor="username" className="text-sm font-medium text-slate-700">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="h-10 rounded-md border border-slate-300 px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              placeholder="coordinator@demo.io"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-10 rounded-md border border-slate-300 px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              placeholder="Password123!"
            />
          </div>

          {validationError && (
            <p role="alert" data-testid="login-validation-error" className="text-sm text-status-fail">
              {validationError}
            </p>
          )}
          {!validationError && serverErrorMessage() && (
            <p role="alert" data-testid="login-server-error" className="text-sm text-status-fail">
              {serverErrorMessage()}
            </p>
          )}

          <Button type="submit" disabled={loginMutation.isPending} className="w-full">
            {loginMutation.isPending ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
