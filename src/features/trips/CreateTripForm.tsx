import { FormEvent, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { AppState, Notification } from '../../types';
import { uid } from '../../lib/utils';

export function CreateTripForm({
  state,
  persist,
  userId
}: {
  state: AppState;
  persist: (s: AppState) => void;
  userId: string;
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
    persist({
      ...state,
      trips: [...state.trips, trip],
      selectedTripId: trip.id,
      notifications: [
        {
          id: uid(),
          toUserId: userId,
          tripId: trip.id,
          type: 'trip_created',
          title: 'Trip created',
          body: `You created “${trip.name}”.`,
          createdAt: new Date().toISOString(),
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
