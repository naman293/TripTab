import { FormEvent, useMemo, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { buildSplitDetails, byId, formatCurrency, getUser, uid } from '../../lib/utils';
import { AppState, Currency, Expense, SplitType, TripCategory } from '../../types';

const categories: TripCategory[] = ['Stay', 'Food', 'Transport', 'Fun', 'Shopping', 'Misc'];

export function AddExpenseModal({
  state,
  tripId,
  userId,
  currency,
  initialExpense,
  onClose,
  onSave
}: {
  state: AppState;
  tripId: string;
  userId: string;
  currency: Currency;
  initialExpense?: Expense | null;
  onClose: () => void;
  onSave: (expense: Expense) => void;
}) {
  const trip = byId(state.trips, tripId)!;
  const isEditing = Boolean(initialExpense);
  const amountBase = initialExpense?.amount ?? 0;
  const getInitialSplitValues = () => {
    if (!initialExpense) return Object.fromEntries(trip.members.map((m) => [m, 0]));
    if (initialExpense.splitType === 'percentage' && amountBase > 0) {
      return Object.fromEntries(
        initialExpense.splitDetails.map((item) => [item.userId, Math.round((item.share / amountBase) * 100)])
      );
    }
    return Object.fromEntries(initialExpense.splitDetails.map((item) => [item.userId, item.share]));
  };

  const [amount, setAmount] = useState(initialExpense?.amount ?? 0);
  const [description, setDescription] = useState(initialExpense?.description ?? '');
  const [payerId, setPayerId] = useState(initialExpense?.payerId ?? userId);
  const [category, setCategory] = useState<TripCategory>(initialExpense?.category ?? 'Food');
  const [date, setDate] = useState(initialExpense?.date ?? new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState(initialExpense?.notes ?? '');
  const [splitType, setSplitType] = useState<SplitType>(initialExpense?.splitType ?? 'equal');
  const [splitValues, setSplitValues] = useState<Record<string, number>>(getInitialSplitValues);

  const previewDetails = useMemo(() => {
    if (amount <= 0) return [];
    return buildSplitDetails(splitType, trip.members, amount, splitValues);
  }, [amount, splitType, splitValues, trip.members]);

  const splitTotal = previewDetails.reduce((sum, x) => sum + x.share, 0);
  const splitInvalid = amount > 0 && Math.abs(splitTotal - amount) > 0.09;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (splitInvalid || amount <= 0) return;
    onSave({
      id: initialExpense?.id ?? uid(),
      tripId,
      amount,
      description,
      payerId,
      category,
      date,
      notes,
      splitType,
      splitDetails: previewDetails,
      createdBy: initialExpense?.createdBy ?? userId,
      createdAt: initialExpense?.createdAt ?? new Date().toISOString()
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/25 backdrop-blur-xl backdrop-saturate-150 p-4">
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[22px] border-[3px] border-ink bg-cream p-4 shadow-brutal"
        role="dialog"
        aria-modal="true"
      >
        <div className="mb-2 flex items-center justify-between">
          <h3 className="brand-font text-2xl font-extrabold">{isEditing ? 'Edit Expense' : 'Add Expense'}</h3>
          <Button tone="cream" onClick={onClose}>
            Close
          </Button>
        </div>

        <form onSubmit={submit} className="space-y-2">
          <Input
            type="number"
            min={1}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            placeholder="Amount"
            required
          />
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            required
          />
          <div className="grid grid-cols-2 gap-2">
            <select className="outlined-input px-3 py-2" value={payerId} onChange={(e) => setPayerId(e.target.value)}>
              {trip.members.map((id) => (
                <option key={id} value={id}>
                  {getUser(state.users, id).name}
                </option>
              ))}
            </select>
            <select
              className="outlined-input px-3 py-2"
              value={category}
              onChange={(e) => setCategory(e.target.value as TripCategory)}
            >
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes" />

          <div className="rounded-xl border-[3px] border-ink bg-offwhite p-3">
            <div className="mb-2 text-sm font-extrabold">Split method</div>
            <div className="mb-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(['equal', 'unequal', 'percentage', 'exact'] as SplitType[]).map((method) => (
                <Button
                  key={method}
                  tone={splitType === method ? 'cyan' : 'cream'}
                  type="button"
                  onClick={() => setSplitType(method)}
                  className="text-xs capitalize"
                >
                  {method}
                </Button>
              ))}
            </div>

            {splitType !== 'equal' && (
              <div className="space-y-2">
                {trip.members.map((id) => {
                  const user = getUser(state.users, id);
                  return (
                    <div key={id} className="flex items-center gap-2">
                      <span className="w-28 text-xs font-bold">{user.name.split(' ')[0]}</span>
                      <Input
                        type="number"
                        min={0}
                        step={splitType === 'percentage' ? 1 : 0.01}
                        value={splitValues[id] || ''}
                        onChange={(e) =>
                          setSplitValues((prev) => ({ ...prev, [id]: Number(e.target.value || 0) }))
                        }
                        placeholder={splitType === 'percentage' ? '%' : currency}
                      />
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-2 flex items-center justify-between text-xs font-extrabold">
              <span>Split Total</span>
              <span className={splitInvalid ? 'text-coralpop' : ''}>{formatCurrency(splitTotal, currency)}</span>
            </div>
            {splitInvalid && <p className="text-xs font-bold text-coralpop">Split values must match expense amount.</p>}
          </div>

          <Button full tone="olive" type="submit">
            {isEditing ? 'Update expense' : 'Save expense'}
          </Button>
        </form>
      </div>
    </div>
  );
}
