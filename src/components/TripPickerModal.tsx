import { Trip } from '../types';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

export function TripPickerModal({
  trips,
  selectedTripId,
  onSelect,
  onClose
}: {
  trips: Trip[];
  selectedTripId: string | null;
  onSelect: (tripId: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/25 backdrop-blur-lg backdrop-saturate-150 p-4">
      <div className="w-full max-w-sm">
        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="brand-font text-2xl font-extrabold leading-none">Switch Trip</div>
              <div className="text-xs font-bold opacity-70">Pick the trip you want to edit.</div>
            </div>
            <Button tone="cream" onClick={onClose}>
              Close
            </Button>
          </div>

          <div className="grid gap-3">
            {trips.map((trip) => {
              const active = trip.id === selectedTripId;
              return (
                <button
                  key={trip.id}
                  onClick={() => onSelect(trip.id)}
                  className={`brutal-btn flex h-14 w-full items-center justify-start gap-3 border-[3px] px-4 text-sm font-extrabold ${
                    active ? 'bg-cyanpop' : 'bg-offwhite'
                  }`}
                >
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-ink bg-cream text-base">
                    {active ? '✓' : ' '}
                  </span>
                  <div className="min-w-0">
                    <div className="truncate">{trip.name || 'Untitled trip'}</div>
                    <div className="truncate text-[11px] font-bold opacity-70">{trip.destination}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}

