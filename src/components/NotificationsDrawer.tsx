import { useMemo, useState } from 'react';
import { Notification, DeleteProposal, AppState } from '../types';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { byId } from '../lib/utils';

export function NotificationsDrawer({
  open,
  onClose,
  currentUserId,
  state,
  onMarkRead,
  onApproveDelete,
  onRejectDelete
}: {
  open: boolean;
  onClose: () => void;
  currentUserId: string;
  state: AppState;
  onMarkRead: (notificationId: string) => void;
  onApproveDelete: (proposalId: string) => void;
  onRejectDelete: (proposalId: string) => void;
}) {
  const [showAll, setShowAll] = useState(false);

  const items = useMemo(() => {
    const list = state.notifications
      .filter((n) => n.toUserId === currentUserId)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    return showAll ? list : list.filter((n) => !n.read);
  }, [state.notifications, currentUserId, showAll]);

  const proposalById = useMemo(() => {
    const map = new Map<string, DeleteProposal>();
    state.deleteProposals.forEach((p) => map.set(p.id, p));
    return map;
  }, [state.deleteProposals]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        className="absolute inset-0 bg-black/10 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close notifications"
      />
      <aside className="absolute right-0 top-0 h-full w-[min(420px,92vw)] border-l-[3px] border-ink bg-cream p-4 shadow-brutal">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="brand-font text-2xl font-extrabold leading-none">Notifications</div>
            <div className="text-xs font-bold opacity-70">{showAll ? 'All' : 'Unread'} updates</div>
          </div>
          <div className="flex gap-2">
            <Button tone="cream" onClick={() => setShowAll((v) => !v)}>
              {showAll ? 'Unread' : 'All'}
            </Button>
            <Button tone="cream" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>

        {items.length === 0 ? (
          <Card className="bg-offwhite text-center">
            <div className="brand-font text-xl font-extrabold">All quiet</div>
            <div className="text-sm font-bold opacity-70">No {showAll ? '' : 'new '}notifications right now.</div>
          </Card>
        ) : (
          <div className="space-y-3 overflow-y-auto pb-6" style={{ maxHeight: 'calc(100vh - 120px)' }}>
            {items.map((n) => (
              <NotificationCard
                key={n.id}
                notification={n}
                currentUserId={currentUserId}
                state={state}
                proposal={n.type === 'delete_request' ? proposalById.get(n.meta?.proposalId || '') ?? null : null}
                onMarkRead={onMarkRead}
                onApproveDelete={onApproveDelete}
                onRejectDelete={onRejectDelete}
              />
            ))}
          </div>
        )}
      </aside>
    </div>
  );
}

function NotificationCard({
  notification,
  currentUserId,
  state,
  proposal,
  onMarkRead,
  onApproveDelete,
  onRejectDelete
}: {
  notification: Notification;
  currentUserId: string;
  state: AppState;
  proposal: DeleteProposal | null;
  onMarkRead: (notificationId: string) => void;
  onApproveDelete: (proposalId: string) => void;
  onRejectDelete: (proposalId: string) => void;
}) {
  const trip = notification.tripId ? byId(state.trips, notification.tripId) : null;
  const isUnread = !notification.read;
  const mine = proposal ? proposal.approvals[currentUserId] : null;

  return (
    <Card className={`bg-offwhite ${isUnread ? '' : 'opacity-80'}`}>
      <button
        className="w-full text-left"
        onClick={() => {
          if (isUnread) onMarkRead(notification.id);
        }}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-sm font-extrabold">{notification.title}</div>
            <div className="text-xs font-bold opacity-70">{trip ? trip.name : 'General'}</div>
          </div>
          {isUnread && <span className="inline-flex h-3 w-3 rounded-full border-[2px] border-ink bg-cyanpop" />}
        </div>
        <div className="mt-2 text-sm font-bold">{notification.body}</div>
        <div className="mt-2 text-[11px] font-bold opacity-60">{new Date(notification.createdAt).toLocaleString()}</div>
      </button>

      {notification.type === 'delete_request' && proposal && proposal.status === 'pending' && (
        <div className="mt-3 rounded-xl border-[3px] border-ink bg-cream p-3">
          <div className="text-xs font-extrabold uppercase tracking-wide">Group approval required</div>
          <div className="mt-1 text-sm font-bold">
            Your vote: <span className="font-extrabold">{mine ?? 'pending'}</span>
          </div>
          <div className="mt-2 flex gap-2">
            <Button tone="olive" className="flex-1" onClick={() => onApproveDelete(proposal.id)} disabled={mine === 'approved'}>
              Agree
            </Button>
            <Button tone="coral" className="flex-1" onClick={() => onRejectDelete(proposal.id)} disabled={mine === 'rejected'}>
              Disagree
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

