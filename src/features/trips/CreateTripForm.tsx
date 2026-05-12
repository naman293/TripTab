import { FormEvent, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { AppState, Notification } from '../../types';
import { uid } from '../../lib/utils';
import { SupabaseClient } from '@supabase/supabase-js';

export function CreateTripForm({
  state,
  persist,
  userId,
  db
}: {
  state: AppState;
  persist: (s: AppState) => void;
  userId: string;
  db: SupabaseClient;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const [name, setName] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [doodle, setDoodle] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const trip = {
      id: uid(),
      name,
      destination,
      startDate,
      endDate,
      coverDoodle: doodle,
      members: [userId]
    };
    
    db.from('trips').insert({
      id: trip.id,
      title: trip.name,
      destination: trip.destination,
      start_date: trip.startDate,
      end_date: trip.endDate,
      cover_doodle: trip.coverDoodle,
      created_by: userId
    }).then(() => {
      db.from('trip_members').insert({
        trip_id: trip.id,
        user_id: userId,
        role: 'owner'
      }).then();
    });

    const notifId = uid();
    const createdAt = new Date().toISOString();
    
    db.from('notifications').insert({
      id: notifId,
      to_user_id: userId,
      trip_id: trip.id,
      type: 'trip_created',
      title: 'Trip created',
      body: `You created “${trip.name}”.`,
      read: false,
      created_at: createdAt
    }).then();

    persist({
      ...state,
      trips: [...state.trips, trip],
      selectedTripId: trip.id,
      notifications: [
        {
          id: notifId,
          toUserId: userId,
          tripId: trip.id,
          type: 'trip_created',
          title: 'Trip created',
          body: `You created “${trip.name}”.`,
          createdAt,
          read: false
        } as Notification,
        ...state.notifications
      ]
    });
  };

  return (
    <Card>
      <h3 className="brand-font mb-2 text-xl font-extrabold">Create Trip</h3>
      <form onSubmit={submit} className="grid gap-2 sm:grid-cols-2">
        <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Trip name (e.g., Bangkok Bounce)" />
        <Input value={destination} onChange={(e) => setDestination(e.target.value)} required placeholder="Destination (e.g., Bangkok)" />
        <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
        <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
        <Input value={doodle} onChange={(e) => setDoodle(e.target.value)} required placeholder="Cover doodle (e.g., Palm + Scooter)" />
        <div className="sm:col-span-2">
          <Button full tone="olive" type="submit">
            Create trip group
          </Button>
        </div>
      </form>
    </Card>
  );
}
