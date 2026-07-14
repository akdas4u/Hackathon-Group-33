import type { ReactElement } from 'react';
import { LoginForm } from '../components/auth/LoginForm';

export function Login(): ReactElement {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <LoginForm />
    </div>
  );
}

export default Login;
