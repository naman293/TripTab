import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { byId, formatCurrency } from '../../lib/utils';
import { AppState, Currency } from '../../types';
import { StatCard } from '../common/StatCard';
import { CreateTripForm } from './CreateTripForm';

export function TripScreen({
  state,
  tripId,
  currency,
  onAddExpense,
  onRequestDeleteTrip,
  persist,
  userId
}: {
  state: AppState;
  tripId: string;
  currency: Currency;
  onAddExpense: () => void;
  onRequestDeleteTrip: () => void;
  persist: (s: AppState) => void;
  userId: string;
}) {
  const trip = byId(state.trips, tripId)!;
  const tripExpenses = state.expenses.filter((e) => e.tripId === tripId);
  const spent = tripExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <section className="space-y-6">
      <Card className="space-y-1">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="brand-font text-2xl font-extrabold">Trip Detail</h2>
          <Badge tone="cyan">{tripExpenses.length} expenses</Badge>
        </div>
        <p className="text-sm font-bold">
          {trip.destination} • {trip.startDate} to {trip.endDate}
        </p>
        <p className="text-sm font-bold">Cover doodle: {trip.coverDoodle}</p>

        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <StatCard label="Total Spent" value={formatCurrency(spent, currency)} tone="cyan" />
          <StatCard label="Members" value={`${trip.members.length}`} tone="cream" />
        </div>

        <Button className="mt-3" tone="yellow" onClick={onAddExpense}>
          Add Expense
        </Button>
        <Button className="mt-3" tone="coral" onClick={onRequestDeleteTrip}>
          Delete Trip
        </Button>
      </Card>

      <CreateTripForm state={state} persist={persist} userId={userId} />
    </section>
  );
}
