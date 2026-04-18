import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { AppState, Currency, Expense, TripCategory } from '../../types';
import { byId, calculateBalances, categorySpend, formatCurrency } from '../../lib/utils';
import { Badge } from '../../components/ui/Badge';
import { StatCard } from '../common/StatCard';

const categories: TripCategory[] = ['Stay', 'Food', 'Transport', 'Fun', 'Shopping', 'Misc'];

export function DashboardScreen({
  state,
  tripId,
  userId,
  currency,
  onAddExpense,
  onEditExpense,
  onRequestDeleteExpense
}: {
  state: AppState;
  tripId: string;
  userId: string;
  currency: Currency;
  onAddExpense: () => void;
  onEditExpense: (expense: Expense) => void;
  onRequestDeleteExpense: (expense: Expense) => void;
}) {
  const trip = byId(state.trips, tripId)!;
  const tripExpenses = state.expenses.filter((e) => e.tripId === tripId);
  const spent = tripExpenses.reduce((sum, e) => sum + e.amount, 0);
  const yourShare = tripExpenses.reduce(
    (sum, e) => sum + (e.splitDetails.find((s) => s.userId === userId)?.share ?? 0),
    0
  );

  const balances = calculateBalances(trip.id, trip.members, state.expenses, state.settlements);
  const me = balances.find((b) => b.userId === userId);
  const catSpent = categorySpend(trip.id, state.expenses);

  return (
    <section className="space-y-6">
      <Card className="sticker">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="brand-font text-2xl font-extrabold">{trip.name}</h2>
            <p className="text-sm font-bold">
              {trip.destination} • {trip.startDate} to {trip.endDate}
            </p>
          </div>
          <Badge tone="olive">Trip Crew</Badge>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Spent" value={formatCurrency(spent, currency)} tone="cyan" />
        <StatCard label="Your Share" value={formatCurrency(yourShare, currency)} tone="cream" />
        <StatCard label="You Owe" value={formatCurrency(me ? Math.max(-me.net, 0) : 0, currency)} tone="coral" />
        <StatCard label="You Are Owed" value={formatCurrency(me ? Math.max(me.net, 0) : 0, currency)} tone="olive" />
      </div>

      <Card className="space-y-1">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="brand-font text-xl font-extrabold">Recent Expenses</h3>
          <Button tone="cyan" onClick={onAddExpense}>
            Add expense
          </Button>
        </div>
        <div className="space-y-2">
          {tripExpenses.slice(0, 5).map((e) => (
            <div key={e.id} className="flex items-center justify-between rounded-xl border-[3px] border-ink bg-offwhite p-3">
              <div>
                <div className="text-sm font-extrabold">{e.description}</div>
                <div className="text-xs font-bold opacity-70">{e.category} • {e.date}</div>
              </div>
              <div className="flex items-center gap-2">
                <Badge>{formatCurrency(e.amount, currency)}</Badge>
                <Button tone="cream" className="px-2 py-1 text-xs" onClick={() => onEditExpense(e)}>
                  Edit
                </Button>
                <Button tone="coral" className="px-2 py-1 text-xs" onClick={() => onRequestDeleteExpense(e)}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
          {tripExpenses.length === 0 && (
            <EmptyState title="No expenses yet" body="Drop the first bill and TripTab will crunch balances." />
          )}
        </div>
      </Card>

      <Card>
        <h3 className="brand-font mb-3 text-xl font-extrabold">Spending By Category</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          {categories.map((cat) => (
            <div key={cat} className="rounded-xl border-[3px] border-ink bg-offwhite p-3">
              <div className="flex justify-between text-sm font-extrabold">
                <span>{cat}</span>
                <span>{formatCurrency(catSpent[cat], currency)}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}
