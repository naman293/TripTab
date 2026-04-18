import { FormEvent, useState } from 'react';
import { AvatarDoodle } from '../../components/AvatarDoodle';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Input } from '../../components/ui/Input';
import { ActivityItem, AppState, Currency } from '../../types';
import { byId, calculateBalances, formatCurrency, getUser, simplifySettlements, uid } from '../../lib/utils';

export function BalancesScreen({
  state,
  tripId,
  currency,
  currentUserId,
  persist,
  addActivity
}: {
  state: AppState;
  tripId: string;
  currency: Currency;
  currentUserId: string;
  persist: (s: AppState) => void;
  addActivity: (item: Omit<ActivityItem, 'id'>, snap?: AppState) => AppState;
}) {
  const trip = byId(state.trips, tripId)!;
  const balances = calculateBalances(tripId, trip.members, state.expenses, state.settlements);
  const recommendations = simplifySettlements(balances);

  const [from, setFrom] = useState(trip.members[0] ?? '');
  const [to, setTo] = useState(trip.members[1] ?? '');
  const [amount, setAmount] = useState(0);
  const [note, setNote] = useState('');

  const submitSettlement = (e: FormEvent) => {
    e.preventDefault();
    if (!from || !to || from === to || amount <= 0) return;

    const settlement = {
      id: uid(),
      tripId,
      fromUserId: from,
      toUserId: to,
      amount,
      date: new Date().toISOString().slice(0, 10),
      note
    };
    let next = { ...state, settlements: [settlement, ...state.settlements] };
    const fromName = getUser(state.users, from).name.split(' ')[0];
    const toName = getUser(state.users, to).name.split(' ')[0];
    next = addActivity(
      {
        tripId,
        actorId: currentUserId,
        type: 'settlement_added',
        message: `${fromName} settled ${formatCurrency(amount, currency)} with ${toName}`,
        date: new Date().toISOString()
      },
      next
    );
    persist(next);
    setAmount(0);
    setNote('');
  };

  return (
    <section className="space-y-6">
      <Card>
        <h2 className="brand-font mb-2 text-2xl font-extrabold">Net Balances</h2>
        <div className="grid gap-2">
          {balances.map((bal) => {
            const user = getUser(state.users, bal.userId);
            return (
              <div key={bal.userId} className="flex items-center justify-between rounded-xl border-[3px] border-ink bg-offwhite p-3">
                <div className="flex items-center gap-2">
                  <AvatarDoodle seed={user.avatarSeed} />
                  <span className="font-extrabold">{user.name}</span>
                </div>
                <Badge tone={bal.net < 0 ? 'coral' : bal.net > 0 ? 'olive' : 'cream'}>
                  {bal.net >= 0 ? '+' : ''}
                  {formatCurrency(bal.net, currency)}
                </Badge>
              </div>
            );
          })}
        </div>
      </Card>

      <Card>
        <h3 className="brand-font mb-2 text-xl font-extrabold">Settlement Suggestions</h3>
        <div className="space-y-2">
          {recommendations.length ? (
            recommendations.map((r, idx) => (
              <div key={idx} className="rounded-xl border-[3px] border-ink bg-offwhite p-3 text-sm font-extrabold">
                {getUser(state.users, r.from).name.split(' ')[0]} pays {getUser(state.users, r.to).name.split(' ')[0]}{' '}
                {formatCurrency(r.amount, currency)}
              </div>
            ))
          ) : (
            <EmptyState title="All settled" body="Crew balances are already squared up." />
          )}
        </div>
      </Card>

      <Card>
        <h3 className="brand-font mb-2 text-xl font-extrabold">Record Payment</h3>
        <form className="grid gap-2 sm:grid-cols-2" onSubmit={submitSettlement}>
          <select className="outlined-input px-3 py-2 text-sm" value={from} onChange={(e) => setFrom(e.target.value)}>
            {trip.members.map((id) => {
              const user = getUser(state.users, id);
              return (
                <option key={`f-${id}`} value={id}>
                  {user.name} paid
                </option>
              );
            })}
          </select>
          <select className="outlined-input px-3 py-2 text-sm" value={to} onChange={(e) => setTo(e.target.value)}>
            {trip.members.map((id) => {
              const user = getUser(state.users, id);
              return (
                <option key={`t-${id}`} value={id}>
                  {user.name} received
                </option>
              );
            })}
          </select>
          <Input type="number" min={1} value={amount} onChange={(e) => setAmount(Number(e.target.value))} required />
          <Input placeholder="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
          <div className="sm:col-span-2">
            <Button full tone="olive" type="submit">
              Record settlement
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        <h3 className="brand-font mb-2 text-xl font-extrabold">Settlement History</h3>
        <div className="space-y-2">
          {state.settlements
            .filter((s) => s.tripId === tripId)
            .slice(0, 12)
            .map((s) => (
              <div key={s.id} className="rounded-xl border-[3px] border-ink bg-offwhite p-3 text-sm font-extrabold">
                {getUser(state.users, s.fromUserId).name.split(' ')[0]} paid{' '}
                {getUser(state.users, s.toUserId).name.split(' ')[0]} {formatCurrency(s.amount, currency)} on {s.date}
                {s.note ? ` • ${s.note}` : ''}
              </div>
            ))}
          {!state.settlements.filter((s) => s.tripId === tripId).length && (
            <EmptyState title="No settlements yet" body="Payments recorded here will build your trip settlement history." />
          )}
        </div>
      </Card>
    </section>
  );
}
