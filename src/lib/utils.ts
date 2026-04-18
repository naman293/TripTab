import { Expense, SplitDetail, SplitType, TripCategory, User } from '../types';

export const uid = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const formatCurrency = (value: number, code: string) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: code,
    maximumFractionDigits: 2
  }).format(value);

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

export const buildSplitDetails = (
  splitType: SplitType,
  members: string[],
  amount: number,
  rawValues: Record<string, number>
): SplitDetail[] => {
  if (splitType === 'equal') {
    const share = round2(amount / members.length);
    const result = members.map((m) => ({ userId: m, share }));
    const diff = round2(amount - result.reduce((sum, x) => sum + x.share, 0));
    if (result[0]) result[0].share = round2(result[0].share + diff);
    return result;
  }

  if (splitType === 'percentage') {
    return members.map((m) => ({
      userId: m,
      share: round2((amount * (rawValues[m] || 0)) / 100)
    }));
  }

  return members.map((m) => ({ userId: m, share: round2(rawValues[m] || 0) }));
};

export type MemberBalance = {
  userId: string;
  paid: number;
  owes: number;
  net: number;
};

export const calculateBalances = (
  tripId: string,
  members: string[],
  expenses: Expense[],
  settlements: { fromUserId: string; toUserId: string; amount: number; tripId: string }[]
): MemberBalance[] => {
  const map = new Map<string, MemberBalance>();

  members.forEach((id) =>
    map.set(id, {
      userId: id,
      paid: 0,
      owes: 0,
      net: 0
    })
  );

  expenses
    .filter((e) => e.tripId === tripId)
    .forEach((expense) => {
      map.get(expense.payerId)!.paid += expense.amount;
      expense.splitDetails.forEach((split) => {
        map.get(split.userId)!.owes += split.share;
      });
    });

  settlements
    .filter((s) => s.tripId === tripId)
    .forEach((s) => {
      map.get(s.fromUserId)!.paid += s.amount;
      map.get(s.toUserId)!.owes += s.amount;
    });

  map.forEach((v) => {
    v.net = round2(v.paid - v.owes);
    v.paid = round2(v.paid);
    v.owes = round2(v.owes);
  });

  return [...map.values()];
};

export const simplifySettlements = (balances: MemberBalance[]) => {
  const debtors = balances
    .filter((b) => b.net < 0)
    .map((b) => ({ userId: b.userId, amount: Math.abs(b.net) }))
    .sort((a, b) => b.amount - a.amount);

  const creditors = balances
    .filter((b) => b.net > 0)
    .map((b) => ({ userId: b.userId, amount: b.net }))
    .sort((a, b) => b.amount - a.amount);

  const transfers: { from: string; to: string; amount: number }[] = [];
  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const amt = round2(Math.min(debtors[i].amount, creditors[j].amount));
    if (amt > 0) transfers.push({ from: debtors[i].userId, to: creditors[j].userId, amount: amt });
    debtors[i].amount = round2(debtors[i].amount - amt);
    creditors[j].amount = round2(creditors[j].amount - amt);
    if (debtors[i].amount <= 0.001) i += 1;
    if (creditors[j].amount <= 0.001) j += 1;
  }

  return transfers;
};

export const categorySpend = (tripId: string, expenses: Expense[]) => {
  const categories: TripCategory[] = ['Stay', 'Food', 'Transport', 'Fun', 'Shopping', 'Misc'];
  const totalByCat = Object.fromEntries(categories.map((c) => [c, 0])) as Record<TripCategory, number>;
  expenses
    .filter((e) => e.tripId === tripId)
    .forEach((e) => {
      totalByCat[e.category] += e.amount;
    });
  return totalByCat;
};

export const byId = <T extends { id: string }>(arr: T[], id: string) => arr.find((x) => x.id === id);

export const initials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

export const getUser = (users: User[], id: string) => users.find((u) => u.id === id)!;
