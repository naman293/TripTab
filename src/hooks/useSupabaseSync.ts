import { useEffect, useState } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { AppState, User, Trip, Expense, Settlement, ActivityItem, Notification, DeleteProposal } from '../types';

export function useSupabaseSync(
  currentUserId: string | null,
  setState: React.Dispatch<React.SetStateAction<AppState>>,
  db: SupabaseClient
) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUserId) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    const fetchAllData = async () => {
      setLoading(true);
      try {
        // 1. Get trips for this user
        const { data: userTrips } = await db
          .from('trip_members')
          .select('trip_id')
          .eq('user_id', currentUserId);

        const tripIds = userTrips?.map((tm: any) => tm.trip_id) || [];

        // Fetch all related data in parallel
        const [
          { data: tripsData },
          { data: tripMembersData },
          { data: expensesData },
          { data: expenseSplitsData },
          { data: settlementsData },
          { data: activitiesData },
          { data: notificationsData },
          { data: deleteProposalsData },
        ] = await Promise.all([
          tripIds.length ? db.from('trips').select('*').in('id', tripIds) : Promise.resolve({ data: [] }),
          tripIds.length ? db.from('trip_members').select('*').in('trip_id', tripIds) : Promise.resolve({ data: [] }),
          tripIds.length ? db.from('expenses').select('*').in('trip_id', tripIds) : Promise.resolve({ data: [] }),
          // We need splits for expenses
          tripIds.length ? db.from('expense_splits').select('*, expenses!inner(trip_id)').in('expenses.trip_id', tripIds) : Promise.resolve({ data: [] }),
          tripIds.length ? db.from('settlements').select('*').in('trip_id', tripIds) : Promise.resolve({ data: [] }),
          tripIds.length ? db.from('activities').select('*').in('trip_id', tripIds) : Promise.resolve({ data: [] }),
          db.from('notifications').select('*').eq('to_user_id', currentUserId),
          tripIds.length ? db.from('delete_proposals').select('*').in('trip_id', tripIds) : Promise.resolve({ data: [] }),
        ]);

        const allUserIds = new Set<string>();
        allUserIds.add(currentUserId);
        tripMembersData?.forEach(tm => allUserIds.add(tm.user_id));

        const { data: usersData, error: usersError } = await db.from('users').select('*').in('id', Array.from(allUserIds));
        if (usersError) console.error('Supabase Users Fetch Error:', usersError);
        console.log(`Sync Debug: Found ${tripsData?.length || 0} trips and ${usersData?.length || 0} users for currentUserId: ${currentUserId}`);

        if (!isMounted) return;

        // Map data to AppState
        const users: User[] = (usersData || []).map(u => ({
          id: u.id,
          name: u.full_name || u.email,
          username: u.username || u.email?.split('@')[0] || u.id,
          email: u.email || '',
          phone: u.phone,
          avatarSeed: u.avatar_seed || 0,
          preferredCurrency: (u.preferred_currency as any) || 'USD'
        }));

        const trips: Trip[] = (tripsData || []).map(t => ({
          id: t.id,
          name: t.title,
          destination: t.destination || '',
          startDate: t.start_date || '',
          endDate: t.end_date || '',
          coverDoodle: t.cover_doodle || '',
          members: tripMembersData?.filter(tm => tm.trip_id === t.id).map(tm => tm.user_id) || []
        }));

        const expenses: Expense[] = (expensesData || []).map(e => ({
          id: e.id,
          tripId: e.trip_id,
          amount: Number(e.amount),
          description: e.title,
          payerId: e.paid_by,
          category: e.category as any,
          date: e.created_at,
          notes: e.notes || '',
          splitType: e.split_type as any || 'equal',
          splitDetails: (expenseSplitsData || []).filter(es => es.expense_id === e.id).map(es => ({
            userId: es.user_id,
            share: Number(es.amount)
          })),
          createdBy: e.paid_by,
          createdAt: e.created_at
        }));

        const settlements: Settlement[] = (settlementsData || []).map(s => ({
          id: s.id,
          tripId: s.trip_id,
          fromUserId: s.from_user_id,
          toUserId: s.to_user_id,
          amount: Number(s.amount),
          date: s.date || s.created_at,
          note: s.note || ''
        }));

        const activities: ActivityItem[] = (activitiesData || []).map(a => ({
          id: a.id,
          tripId: a.trip_id,
          actorId: a.user_id,
          type: a.action as any,
          message: a.metadata?.message || '',
          date: a.created_at,
          refId: a.metadata?.refId
        }));

        const notifications: Notification[] = (notificationsData || []).map(n => ({
          id: n.id,
          toUserId: n.to_user_id,
          tripId: n.trip_id,
          type: n.type as any,
          title: n.title,
          body: n.body,
          createdAt: n.created_at,
          read: n.read,
          meta: n.meta
        }));

        const deleteProposals: DeleteProposal[] = (deleteProposalsData || []).map(dp => ({
          id: dp.id,
          kind: dp.kind as any,
          tripId: dp.trip_id,
          targetId: dp.target_id,
          requestedBy: dp.requested_by,
          status: dp.status as any,
          memberIds: dp.member_ids || [],
          approvals: dp.approvals || {},
          createdAt: dp.created_at
        }));

        setState(prev => {
          // If we want to keep current selectedTripId or default
          const currentSelected = prev.selectedTripId;
          const nextSelected = trips.find(t => t.id === currentSelected) ? currentSelected : trips[0]?.id || null;
          
          return {
            ...prev,
            users,
            trips,
            expenses,
            settlements,
            activities,
            notifications,
            deleteProposals,
            selectedTripId: nextSelected
          };
        });
      } catch (err) {
        console.error('Error fetching Supabase data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAllData();

    // Setup Realtime Subscription
    // For MVP, we can listen to all changes on these tables and trigger a refetch,
    // or handle specific events. Refetching might be easiest to ensure integrity but could be slow.
    // Given optimistic UI, we might not even strictly need immediate refetching if our local state handles it,
    // but Realtime is good for seeing OTHER people's changes.
    const channel = db.channel('app_sync')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => {
        // Debounce or just call fetchAllData
        fetchAllData();
      })
      .subscribe();

    return () => {
      isMounted = false;
      db.removeChannel(channel);
    };
  }, [currentUserId, setState, db]);

  return { loading };
}
