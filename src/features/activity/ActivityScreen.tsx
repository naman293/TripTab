import { AvatarDoodle } from '../../components/AvatarDoodle';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { AppState } from '../../types';
import { getUser } from '../../lib/utils';

export function ActivityScreen({ state, tripId }: { state: AppState; tripId: string }) {
  const feed = state.activities.filter((a) => a.tripId === tripId).slice(0, 25);

  return (
    <section>
      <Card className="space-y-1">
        <h2 className="brand-font mb-3 text-2xl font-extrabold">Activity Feed</h2>
        <div className="space-y-2">
          {feed.map((item) => {
            const actor = getUser(state.users, item.actorId);
            return (
              <div key={item.id} className="flex items-start gap-2 rounded-xl border-[3px] border-ink bg-offwhite p-3">
                <AvatarDoodle seed={actor.avatarSeed} size={38} />
                <div>
                  <div className="text-sm font-extrabold">
                    {actor.name.split(' ')[0]} {item.message}
                  </div>
                  <div className="text-xs font-bold opacity-70">{new Date(item.date).toLocaleString()}</div>
                </div>
              </div>
            );
          })}
          {!feed.length && <EmptyState title="Quiet right now" body="New actions will pop in here." />}
        </div>
      </Card>
    </section>
  );
}
