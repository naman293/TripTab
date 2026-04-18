import { SignIn, SignUp } from '@clerk/clerk-react';
import { ReactNode, useEffect } from 'react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

export type AuthMode = 'landing' | 'login' | 'signup';

export function AuthShell({ mode, setMode }: { mode: AuthMode; setMode: (mode: AuthMode) => void }) {
  useEffect(() => {
    const applyFromHash = () => {
      const h = (window.location.hash || '').toLowerCase();
      if (h.includes('signup') || h.includes('sign-up')) setMode('signup');
      else if (h.includes('login') || h.includes('sign-in') || h.includes('signin')) setMode('login');
    };
    applyFromHash();
    window.addEventListener('hashchange', applyFromHash);
    return () => window.removeEventListener('hashchange', applyFromHash);
  }, [setMode]);

  const go = (next: AuthMode) => {
    if (next === 'login') window.location.hash = '#login';
    if (next === 'signup') window.location.hash = '#signup';
    if (next === 'landing') window.location.hash = '';
    setMode(next);
  };

  if (mode === 'landing') {
    return (
      <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-6 md:px-6 md:py-8">
        <header className="paper-card mb-8 flex items-center justify-between px-4 py-3">
          <h1 className="brand-font text-3xl font-extrabold leading-none md:text-4xl">TripTab</h1>
          <Button tone="cream" onClick={() => go('login')}>
            Log In
          </Button>
        </header>

        <section className="grid items-start gap-5 md:grid-cols-[1.2fr_0.8fr]">
          <Card className="space-y-5 p-6 md:p-8">
            <Badge tone="cyan">Group Expense Splitter</Badge>
            <h2 className="brand-font text-5xl font-extrabold leading-[0.9] md:text-6xl">
              Split Bills
              <br />
              Without The Stress
            </h2>
            <p className="max-w-[44ch] text-base font-bold md:text-lg">
              Create trips, track budgets, and settle cleanly with your friends in one place.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button tone="yellow" onClick={() => go('signup')}>
                Create Account
              </Button>
              <Button tone="cream" onClick={() => go('login')}>
                Continue To Login
              </Button>
            </div>
          </Card>

          <Card className="space-y-3 p-6">
            <h3 className="brand-font text-2xl font-extrabold">What You Can Do</h3>
            <div className="rounded-xl border-[3px] border-ink bg-offwhite p-3 text-sm font-bold">Track trip budget by category</div>
            <div className="rounded-xl border-[3px] border-ink bg-offwhite p-3 text-sm font-bold">Split equally, by %, exact, or custom</div>
            <div className="rounded-xl border-[3px] border-ink bg-offwhite p-3 text-sm font-bold">See who owes whom instantly</div>
          </Card>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-6 md:px-6 md:py-8">
      <header className="paper-card mb-6 flex items-center justify-between px-4 py-3">
        <button className="brand-font text-3xl font-extrabold leading-none" onClick={() => go('landing')}>
          TripTab
        </button>
        <Badge tone="olive">Secure Access</Badge>
      </header>

      <section className="mx-auto w-full max-w-xl">
        <Card className="p-4 md:p-5">
          <div className="mb-3 flex gap-2">
            <Button tone={mode === 'login' ? 'cyan' : 'cream'} onClick={() => go('login')}>
              Login
            </Button>
            <Button tone={mode === 'signup' ? 'cyan' : 'cream'} onClick={() => go('signup')}>
              Sign Up
            </Button>
          </div>

          {mode === 'login' ? (
            <ClerkCard>
              <SignIn routing="hash" signUpUrl="#signup" afterSignInUrl="/" redirectUrl="/" />
            </ClerkCard>
          ) : (
            <ClerkCard>
              <SignUp routing="hash" signInUrl="#login" afterSignUpUrl="/" redirectUrl="/" />
            </ClerkCard>
          )}
        </Card>
      </section>
    </main>
  );
}

function ClerkCard({ children }: { children: ReactNode }) {
  return <div className="rounded-[16px] border-[3px] border-ink bg-offwhite p-3 shadow-brutalSm">{children}</div>;
}
