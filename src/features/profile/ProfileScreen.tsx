import { FormEvent, useState } from 'react';
import { AvatarDoodle } from '../../components/AvatarDoodle';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { AppState, Currency } from '../../types';
import { byId } from '../../lib/utils';

const currencies: Currency[] = ['USD', 'INR', 'EUR', 'GBP'];

export function ProfileScreen({
  state,
  userId,
  persist,
  onLogout
}: {
  state: AppState;
  userId: string;
  persist: (s: AppState) => void;
  onLogout: () => void;
}) {
  const user = byId(state.users, userId)!;
  const [name, setName] = useState(user.name);
  const [username, setUsername] = useState(user.username);
  const [currency, setCurrency] = useState<Currency>(user.preferredCurrency);
  const [error, setError] = useState<string | null>(null);

  const save = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const normalizedUsername = username.trim().replace(/^@/, '').toLowerCase();
    if (!/^[a-z0-9_]{3,20}$/.test(normalizedUsername)) {
      setError('Username must be 3-20 chars: lowercase letters, numbers, underscore.');
      return;
    }
    const taken = state.users.some((u) => u.id !== userId && u.username.toLowerCase() === normalizedUsername);
    if (taken) {
      setError('That username is already taken.');
      return;
    }
    persist({
      ...state,
      users: state.users.map((u) =>
        u.id === userId ? { ...u, name: name.trim(), username: normalizedUsername, preferredCurrency: currency } : u
      )
    });
  };

  return (
    <section className="space-y-6">
      <Card className="flex items-center gap-3">
        <AvatarDoodle seed={user.avatarSeed} size={60} />
        <div>
          <h2 className="brand-font text-2xl font-extrabold">Profile & Settings</h2>
          <p className="text-sm font-bold">Name, username (for invites), and preferred currency.</p>
        </div>
      </Card>

      <Card className="space-y-2">
        <form onSubmit={save} className="space-y-4">
          <div className="space-y-1">
            <div className="text-xs font-extrabold uppercase tracking-wide">Full Name</div>
            <Input className="h-14 text-base" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Your name" />
          </div>
          <div className="space-y-1">
            <div className="text-xs font-extrabold uppercase tracking-wide">Username</div>
            <Input
              className="h-14 text-base"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="@your_handle"
            />
            <div className="text-xs font-bold opacity-70">Friends can invite you using this username.</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-extrabold uppercase tracking-wide">Currency</div>
          <select
            className="outlined-input h-14 w-full px-3 py-2 text-base"
            value={currency}
            onChange={(e) => setCurrency(e.target.value as Currency)}
          >
            {currencies.map((cur) => (
              <option key={cur}>{cur}</option>
            ))}
          </select>
          </div>
          {error && <div className="text-sm font-extrabold text-coralpop">{error}</div>}
          <div className="grid grid-cols-2 gap-2">
            <Button tone="cyan" type="submit">
              Save profile
            </Button>
            <Button tone="coral" type="button" onClick={onLogout}>
              Log out
            </Button>
          </div>
        </form>
      </Card>
    </section>
  );
}
