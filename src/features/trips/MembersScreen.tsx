import { FormEvent, useState } from 'react';
import { AvatarDoodle } from '../../components/AvatarDoodle';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { AppState, ActivityItem, Notification } from '../../types';
import { byId, getUser, uid } from '../../lib/utils';

export function MembersScreen({
  state,
  tripId,
  persist,
  currentUserId,
  addActivity
}: {
  state: AppState;
  tripId: string;
  persist: (s: AppState) => void;
  currentUserId: string;
  addActivity: (item: Omit<ActivityItem, 'id'>, snap?: AppState) => AppState;
}) {
  const [invite, setInvite] = useState('');
  const [error, setError] = useState<string | null>(null);
  const trip = byId(state.trips, tripId)!;

  const inviteMember = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const raw = invite.trim();
    const isUsername = raw.startsWith('@') || (!raw.includes('@') && raw.replace(/\s/g, '').length > 0);
    const usernameCandidate = raw.startsWith('@') ? raw.slice(1) : raw;
    const isEmail = !raw.startsWith('@') && raw.includes('@');
    const phoneCandidate = raw.replace(/[^\d+]/g, '');
    const isPhone = !isEmail && phoneCandidate.replace(/\D/g, '').length >= 8;

    if (!isEmail && !isPhone && !isUsername) {
      setError('Enter @username, email, or phone number.');
      return;
    }

    const normalizedEmail = isEmail ? raw.toLowerCase() : null;
    const normalizedPhone = isPhone ? phoneCandidate : null;
    const normalizedUsername = !isEmail && !isPhone ? usernameCandidate.trim().replace(/^@/, '').toLowerCase() : null;

    const existing = state.users.find((u) => {
      if (normalizedEmail) return u.email.toLowerCase() === normalizedEmail;
      if (normalizedPhone) return (u.phone || '').replace(/[^\d+]/g, '') === normalizedPhone;
      if (normalizedUsername) return u.username.toLowerCase() === normalizedUsername;
      return false;
    });

    const candidate =
      existing ??
      ({
        id: uid(),
        name: normalizedEmail
          ? normalizedEmail.split('@')[0]
          : normalizedPhone
            ? `Friend ${normalizedPhone?.slice(-4)}`
            : `${normalizedUsername}`,
        username: normalizedEmail
          ? normalizedEmail.split('@')[0].slice(0, 14)
          : normalizedPhone
            ? `friend_${normalizedPhone?.replace(/\D/g, '').slice(-6)}`
            : `${normalizedUsername}`.slice(0, 20),
        email:
          normalizedEmail ??
          (normalizedPhone ? `phone_${normalizedPhone?.replace(/\D/g, '')}@triptab.local` : `${normalizedUsername}@triptab.local`),
        phone: normalizedPhone ?? undefined,
        avatarSeed: Math.floor(Math.random() * 10),
        preferredCurrency: getUser(state.users, currentUserId).preferredCurrency
      } as AppState['users'][number]);

    if (trip.members.includes(candidate.id)) {
      setError('Already invited/added.');
      return;
    }

    let next = {
      ...state,
      users: existing ? state.users : [...state.users, candidate],
      trips: state.trips.map((t) => (t.id === trip.id ? { ...t, members: [...t.members, candidate.id] } : t)),
      notifications: [
        {
          id: uid(),
          toUserId: candidate.id,
          tripId,
          type: 'invite_received',
          title: 'You were added to a trip',
          body: `You were added to “${trip.name}”.`,
          createdAt: new Date().toISOString(),
          read: false,
          meta: { invitedBy: currentUserId }
        } as Notification,
        ...state.notifications
      ]
    };
    next = addActivity(
      {
        tripId,
        actorId: currentUserId,
        type: 'invite_sent',
        message: `invited ${normalizedEmail ?? normalizedPhone ?? `@${normalizedUsername}`}`,
        date: new Date().toISOString()
      },
      next
    );
    persist(next);
    setInvite('');
  };

  return (
    <section className="space-y-6">
      <Card>
        <h2 className="brand-font text-2xl font-extrabold">Members</h2>
        <p className="text-sm font-bold">Invite friends and keep every split transparent.</p>
        <form className="mt-3 flex gap-2" onSubmit={inviteMember}>
          <Input
            value={invite}
            onChange={(e) => setInvite(e.target.value)}
            placeholder="@username, email, or phone number"
            required
          />
          <Button tone="cyan" type="submit">
            Invite
          </Button>
        </form>
        {error && <div className="mt-2 text-sm font-extrabold text-coralpop">{error}</div>}
      </Card>
      <div className="grid gap-3 sm:grid-cols-2">
        {trip.members.map((id) => {
          const user = getUser(state.users, id);
          return (
            <Card key={id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AvatarDoodle seed={user.avatarSeed} />
                <div>
                  <div className="font-extrabold">{user.name}</div>
                  <div className="text-xs font-bold">@{user.username}</div>
                </div>
              </div>
              <Badge tone={id === currentUserId ? 'olive' : 'cream'}>{id === currentUserId ? 'You' : 'Crew'}</Badge>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
