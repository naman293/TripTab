import { useEffect, useState } from 'react';
import { useClerk, useUser } from '@clerk/clerk-react';
import { AvatarDoodle } from './components/AvatarDoodle';
import { BottomTabs } from './components/BottomTabs';
import { DotField } from './components/DotField';
import { TripPickerModal } from './components/TripPickerModal';
import { NotificationsDrawer } from './components/NotificationsDrawer';
import { Button } from './components/ui/Button';
import { Card } from './components/ui/Card';
import { EmptyState } from './components/ui/EmptyState';
import { mockState } from './data/mockData';
import { AddExpenseModal } from './features/expenses/AddExpenseModal';
import { DashboardScreen } from './features/dashboard/DashboardScreen';
import { TripScreen } from './features/trips/TripScreen';
import { MembersScreen } from './features/trips/MembersScreen';
import { BalancesScreen } from './features/balances/BalancesScreen';
import { ActivityScreen } from './features/activity/ActivityScreen';
import { ProfileScreen } from './features/profile/ProfileScreen';
import { CreateTripForm } from './features/trips/CreateTripForm';
import { AuthMode, AuthShell } from './features/auth/AuthShell';
import { ActivityItem, AppState, Currency, DeleteProposal, Expense, Notification } from './types';
import { byId, uid } from './lib/utils';

// Bump this when state shape/defaults change to avoid stale demo data sticking around.
const STORAGE_KEY = 'triptab-v2';

const normalizeState = (raw: unknown): AppState => {
  const base = mockState;
  const obj = (raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}) as Record<string, unknown>;

  const users = Array.isArray(obj.users) ? (obj.users as AppState['users']) : base.users;
  const trips = Array.isArray(obj.trips) ? (obj.trips as AppState['trips']) : base.trips;
  const expenses = Array.isArray(obj.expenses) ? (obj.expenses as AppState['expenses']) : base.expenses;
  const settlements = Array.isArray(obj.settlements) ? (obj.settlements as AppState['settlements']) : base.settlements;
  const activities = Array.isArray(obj.activities) ? (obj.activities as AppState['activities']) : base.activities;
  const notifications = Array.isArray(obj.notifications)
    ? (obj.notifications as AppState['notifications'])
    : base.notifications;
  const deleteProposals = Array.isArray(obj.deleteProposals)
    ? (obj.deleteProposals as AppState['deleteProposals'])
    : base.deleteProposals;

  const currentUserId = typeof obj.currentUserId === 'string' ? (obj.currentUserId as string) : base.currentUserId;
  const selectedTripId = typeof obj.selectedTripId === 'string' ? (obj.selectedTripId as string) : base.selectedTripId;

  const tripExists = selectedTripId ? trips.some((t) => t.id === selectedTripId) : false;
  const userExists = currentUserId ? users.some((u) => u.id === currentUserId) : false;

  return {
    users,
    trips,
    expenses,
    settlements,
    activities,
    notifications,
    deleteProposals,
    currentUserId: userExists ? currentUserId : null,
    selectedTripId: tripExists ? selectedTripId : (trips[0]?.id ?? null)
  };
};

const loadState = (): AppState => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return mockState;
  try {
    return normalizeState(JSON.parse(raw));
  } catch {
    return mockState;
  }
};

function App() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();

  const [state, setState] = useState<AppState>(loadState);
  const [authMode, setAuthMode] = useState<AuthMode>('landing');
  const [tab, setTab] = useState<'dashboard' | 'trip' | 'members' | 'balances' | 'activity' | 'profile'>('dashboard');
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);
  const [showTripPicker, setShowTripPicker] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const persist = (next: AppState) => {
    const normalized = normalizeState(next);
    setState(normalized);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  };

  const addActivity = (item: Omit<ActivityItem, 'id'>, snap?: AppState) => {
    const source = snap ?? state;
    return { ...source, activities: [{ ...item, id: uid() }, ...source.activities] };
  };

  const addNotification = (snap: AppState, n: Omit<Notification, 'id'>) => {
    const next: AppState = { ...snap, notifications: [{ ...n, id: uid() }, ...snap.notifications] };
    return next;
  };

  const notifyTripMembers = (
    snap: AppState,
    tripId: string | null,
    toUserIds: string[],
    payload: { type: Notification['type']; title: string; body: string; meta?: Record<string, string> }
  ) => {
    let next = snap;
    for (const memberId of toUserIds) {
      next = addNotification(next, {
        toUserId: memberId,
        tripId,
        type: payload.type,
        title: payload.title,
        body: payload.body,
        createdAt: new Date().toISOString(),
        read: false,
        meta: payload.meta
      });
    }
    return next;
  };

  const createDeleteProposal = (snap: AppState, proposal: Omit<DeleteProposal, 'id'>) => {
    const full: DeleteProposal = { ...proposal, id: uid() };
    return { next: { ...snap, deleteProposals: [full, ...snap.deleteProposals] }, proposal: full };
  };

  const requestDeleteExpense = (expense: Expense) => {
    if (!selectedTrip || !currentUser) return;
    const memberIds = selectedTrip.members;
    const approvals = Object.fromEntries(memberIds.map((m) => [m, m === currentUser.id ? 'approved' : 'pending'])) as DeleteProposal['approvals'];
    const { next, proposal } = createDeleteProposal(state, {
      kind: 'expense',
      tripId: selectedTrip.id,
      targetId: expense.id,
      requestedBy: currentUser.id,
      createdAt: new Date().toISOString(),
      status: 'pending',
      memberIds,
      approvals
    });

    const actorName = currentUser.name.split(' ')[0];
    const title = 'Delete expense request';
    const body = `${actorName} wants to delete “${expense.description}”. Please vote.`;
    const notified = notifyTripMembers(next, selectedTrip.id, memberIds, {
      type: 'delete_request',
      title,
      body,
      meta: { proposalId: proposal.id }
    });
    persist(notified);
    setShowNotifications(true);
  };

  const requestDeleteTrip = () => {
    if (!selectedTrip || !currentUser) return;
    const memberIds = selectedTrip.members;
    const approvals = Object.fromEntries(memberIds.map((m) => [m, m === currentUser.id ? 'approved' : 'pending'])) as DeleteProposal['approvals'];
    const { next, proposal } = createDeleteProposal(state, {
      kind: 'trip',
      tripId: selectedTrip.id,
      targetId: selectedTrip.id,
      requestedBy: currentUser.id,
      createdAt: new Date().toISOString(),
      status: 'pending',
      memberIds,
      approvals
    });

    const actorName = currentUser.name.split(' ')[0];
    const title = 'Delete trip request';
    const body = `${actorName} wants to delete the trip “${selectedTrip.name}”. Please vote.`;
    const notified = notifyTripMembers(next, selectedTrip.id, memberIds, {
      type: 'delete_request',
      title,
      body,
      meta: { proposalId: proposal.id }
    });
    persist(notified);
    setShowNotifications(true);
  };

  const markNotificationRead = (notificationId: string) => {
    setState((prev) => {
      const next: AppState = {
        ...prev,
        notifications: prev.notifications.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const executeProposalIfApproved = (snap: AppState, proposalId: string) => {
    const proposal = snap.deleteProposals.find((p) => p.id === proposalId);
    if (!proposal || proposal.status !== 'pending') return snap;
    const allApproved = proposal.memberIds.every((m) => proposal.approvals[m] === 'approved');
    if (!allApproved) return snap;

    let next = { ...snap };
    if (proposal.kind === 'expense') {
      next = {
        ...next,
        expenses: next.expenses.filter((e) => e.id !== proposal.targetId),
        activities: next.activities.filter((a) => a.refId !== proposal.targetId)
      };
    } else {
      const tripId = proposal.tripId;
      next = {
        ...next,
        trips: next.trips.filter((t) => t.id !== tripId),
        expenses: next.expenses.filter((e) => e.tripId !== tripId),
        settlements: next.settlements.filter((s) => s.tripId !== tripId),
        activities: next.activities.filter((a) => a.tripId !== tripId),
        notifications: next.notifications.filter((n) => n.tripId !== tripId),
        deleteProposals: next.deleteProposals.filter((p) => p.tripId !== tripId || p.id === proposalId)
      };
      if (next.selectedTripId === tripId) {
        next.selectedTripId = next.trips[0]?.id ?? null;
      }
    }

    next = {
      ...next,
      deleteProposals: next.deleteProposals.map((p) => (p.id === proposalId ? { ...p, status: 'executed' } : p))
    };

    const title = proposal.kind === 'trip' ? 'Trip deleted' : 'Expense deleted';
    const body = proposal.kind === 'trip' ? 'Trip was deleted after everyone agreed.' : 'Expense was deleted after everyone agreed.';
    next = notifyTripMembers(next, proposal.kind === 'trip' ? null : proposal.tripId, proposal.memberIds, {
      type: 'delete_result',
      title,
      body,
      meta: { proposalId }
    });

    return next;
  };

  const approveDelete = (proposalId: string) => {
    if (!currentUser) return;
    setState((prev) => {
      const proposal = prev.deleteProposals.find((p) => p.id === proposalId);
      if (!proposal || proposal.status !== 'pending') return prev;
      const approvals = { ...proposal.approvals, [currentUser.id]: 'approved' as const };
      let next: AppState = {
        ...prev,
        deleteProposals: prev.deleteProposals.map((p) => (p.id === proposalId ? { ...p, approvals } : p))
      };
      next = executeProposalIfApproved(next, proposalId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const rejectDelete = (proposalId: string) => {
    if (!currentUser) return;
    setState((prev) => {
      const proposal = prev.deleteProposals.find((p) => p.id === proposalId);
      if (!proposal || proposal.status !== 'pending') return prev;
      const approvals = { ...proposal.approvals, [currentUser.id]: 'rejected' as const };
      let next: AppState = {
        ...prev,
        deleteProposals: prev.deleteProposals.map((p) =>
          p.id === proposalId ? { ...p, approvals, status: 'rejected' as const } : p
        )
      };

      next = notifyTripMembers(next, proposal.tripId, proposal.memberIds, {
        type: 'delete_result',
        title: 'Delete canceled',
        body: 'A member disagreed, so the delete request was canceled.',
        meta: { proposalId }
      });

      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  useEffect(() => {
    let mounted = true;
    fetch('/api/meta')
      .then((res) => res.json())
      .then(() => mounted && setApiOnline(true))
      .catch(() => mounted && setApiOnline(false));
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn || !user) {
      setState((prev) => {
        if (prev.currentUserId === null) return prev;
        const next = { ...prev, currentUserId: null };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
      return;
    }

    const email = user.primaryEmailAddress?.emailAddress || user.emailAddresses[0]?.emailAddress || `${user.id}@local.dev`;
    const username = user.username || email.split('@')[0] || `traveler_${user.id.slice(-6)}`;
    const name = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || username;
    setState((prev) => {
      const existing = prev.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        if (prev.currentUserId === existing.id) return prev;
        const next = { ...prev, currentUserId: existing.id };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      }

      const newUser = {
        id: uid(),
        name,
        username,
        email,
        avatarSeed: Math.floor(Math.random() * 10),
        preferredCurrency: 'USD' as Currency
      };
      const next = { ...prev, users: [...prev.users, newUser], currentUserId: newUser.id };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, [isLoaded, isSignedIn, user]);

  const currentUser = state.currentUserId ? byId(state.users, state.currentUserId) ?? null : null;
  const selectedTrip = state.selectedTripId ? byId(state.trips, state.selectedTripId) ?? null : null;
  const currency = (currentUser?.preferredCurrency ?? 'USD') as Currency;
  const unreadCount = currentUser
    ? state.notifications.filter((n) => n.toUserId === currentUser.id && !n.read).length
    : 0;

  useEffect(() => {
    if (!currentUser) return;
    if (state.trips.length > 0 && !state.selectedTripId) {
      persist({ ...state, selectedTripId: state.trips[0].id });
    }
  }, [currentUser, state.trips.length, state.selectedTripId]);

  if (!isLoaded) {
    return (
      <main className="relative z-10 mx-auto flex min-h-screen max-w-xl items-center justify-center p-6">
        <DotField mode="auth" />
        <Card className="text-center">
          <h2 className="brand-font text-2xl font-extrabold">Loading TripTab...</h2>
        </Card>
      </main>
    );
  }

  if (!isSignedIn || !currentUser) {
    return (
      <>
        <DotField mode="auth" />
        <div className="relative z-10">
          <AuthShell mode={authMode} setMode={setAuthMode} />
        </div>
      </>
    );
  }

  return (
    <main className="min-h-screen w-full px-3 pb-8 pt-4 md:pl-[290px] md:pr-5">
      <DotField mode="app" />
      <BottomTabs active={tab} onChange={setTab} />

      <div className="relative z-10 mx-auto w-full max-w-6xl space-y-6">
        <header className="paper-card section-enter flex items-center justify-between px-4 py-3">
          <div>
            <h1 className="brand-font text-3xl font-extrabold leading-none">TripTab</h1>
            <p className="text-xs font-bold uppercase tracking-wide">Group expense splitter</p>
          </div>
          <div className="flex items-center gap-2">
            {state.trips.length > 0 && (
              <button
                type="button"
                className="outlined-input hidden h-12 items-center gap-2 px-4 text-sm font-extrabold shadow-brutalSm md:inline-flex"
                onClick={() => setShowTripPicker(true)}
                aria-label="Select trip"
              >
                <span className="max-w-[220px] truncate">{selectedTrip?.name ?? 'Select trip'}</span>
                <span className="text-lg leading-none">▾</span>
              </button>
            )}
            {selectedTrip && (
              <Button tone="cyan" className="hidden md:inline-flex" onClick={() => setShowAddExpense(true)}>
                Add Expense
              </Button>
            )}
            <button
              type="button"
              className="relative hidden h-12 w-12 items-center justify-center rounded-full border-[3px] border-ink bg-offwhite shadow-brutalSm md:inline-flex"
              aria-label="Open notifications"
              onClick={() => setShowNotifications(true)}
            >
              <span className="text-lg">☰</span>
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 inline-flex h-6 min-w-[24px] items-center justify-center rounded-full border-[3px] border-ink bg-coralpop px-1 text-xs font-extrabold">
                  {unreadCount}
                </span>
              )}
            </button>
            <AvatarDoodle seed={currentUser.avatarSeed} size={46} />
            <div className="text-right text-xs font-bold">
              <div>@{currentUser.username}</div>
              <div>{currentUser.preferredCurrency}</div>
              <div className={apiOnline ? 'text-olivepop' : 'text-coralpop'}>
                API {apiOnline === null ? 'checking...' : apiOnline ? 'online' : 'offline'}
              </div>
            </div>
          </div>
        </header>

        {!selectedTrip ? (
          <Card>
            <EmptyState title="No Trip Yet" body="Create your first crew trip to start splitting and planning budgets." />
            <CreateTripForm state={state} persist={persist} userId={currentUser.id} />
          </Card>
        ) : (
          <div className="section-enter">
            {tab === 'dashboard' && (
              <DashboardScreen
                state={state}
                tripId={selectedTrip.id}
                userId={currentUser.id}
                currency={currency}
                onAddExpense={() => setShowAddExpense(true)}
                onEditExpense={(expense) => {
                  setEditingExpense(expense);
                  setShowAddExpense(true);
                }}
                onRequestDeleteExpense={(expense) => requestDeleteExpense(expense)}
              />
            )}
            {tab === 'trip' && (
              <TripScreen
                state={state}
                tripId={selectedTrip.id}
                currency={currency}
                onAddExpense={() => setShowAddExpense(true)}
                onRequestDeleteTrip={() => requestDeleteTrip()}
                persist={persist}
                userId={currentUser.id}
              />
            )}
            {tab === 'members' && (
              <MembersScreen
                state={state}
                tripId={selectedTrip.id}
                persist={persist}
                currentUserId={currentUser.id}
                addActivity={addActivity}
              />
            )}
            {tab === 'balances' && (
              <BalancesScreen
                state={state}
                tripId={selectedTrip.id}
                currency={currency}
                currentUserId={currentUser.id}
                persist={persist}
                addActivity={addActivity}
              />
            )}
            {tab === 'activity' && <ActivityScreen state={state} tripId={selectedTrip.id} />}
            {tab === 'profile' && (
              <ProfileScreen
                state={state}
                userId={currentUser.id}
                persist={persist}
                onLogout={() => {
                  persist({ ...state, currentUserId: null });
                  signOut();
                }}
              />
            )}
          </div>
        )}
      </div>

      {selectedTrip && (
        <button
          className="brutal-btn fixed bottom-6 right-4 z-10 h-14 w-14 rounded-full bg-mustard text-3xl leading-none md:hidden"
          onClick={() => setShowAddExpense(true)}
          aria-label="Add expense"
        >
          +
        </button>
      )}

      {showAddExpense && selectedTrip && (
        <AddExpenseModal
          state={state}
          tripId={selectedTrip.id}
          userId={currentUser.id}
          currency={currency}
          onClose={() => {
            setShowAddExpense(false);
            setEditingExpense(null);
          }}
          onSave={(expense) => {
            const isEdit = Boolean(editingExpense);
            let next = isEdit
              ? { ...state, expenses: state.expenses.map((e) => (e.id === expense.id ? expense : e)) }
              : { ...state, expenses: [expense, ...state.expenses] };
            next = addActivity(
              {
                actorId: currentUser.id,
                tripId: selectedTrip.id,
                type: isEdit ? 'expense_edited' : 'expense_added',
                message: `${isEdit ? 'edited' : 'added'} ${expense.description}`,
                date: new Date().toISOString(),
                refId: expense.id
              },
              next
            );
            // Notify other members (unread) without duplicating history cards.
            const otherMembers = selectedTrip.members.filter((m) => m !== currentUser.id);
            next = notifyTripMembers(next, selectedTrip.id, otherMembers, {
              type: 'expense_added',
              title: `New expense in ${selectedTrip.name}`,
              body: `${currentUser.name.split(' ')[0]} added “${expense.description}”.`,
              meta: { expenseId: expense.id }
            });
            persist(next);
            setEditingExpense(null);
          }}
          initialExpense={editingExpense}
        />
      )}

      {showTripPicker && state.trips.length > 0 && (
        <TripPickerModal
          trips={state.trips}
          selectedTripId={state.selectedTripId}
          onClose={() => setShowTripPicker(false)}
          onSelect={(tripId) => {
            persist({ ...state, selectedTripId: tripId });
            setShowTripPicker(false);
          }}
        />
      )}

      {currentUser && (
        <NotificationsDrawer
          open={showNotifications}
          onClose={() => setShowNotifications(false)}
          currentUserId={currentUser.id}
          state={state}
          onMarkRead={markNotificationRead}
          onApproveDelete={approveDelete}
          onRejectDelete={rejectDelete}
        />
      )}
    </main>
  );
}

export default App;
