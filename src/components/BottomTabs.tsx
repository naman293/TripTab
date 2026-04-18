import { Button } from './ui/Button';

export type TabKey = 'dashboard' | 'trip' | 'members' | 'balances' | 'activity' | 'profile';

const tabs: { key: TabKey; label: string; icon: string }[] = [
  { key: 'dashboard', label: 'Home', icon: '⌂' },
  { key: 'trip', label: 'Trip', icon: '✦' },
  { key: 'members', label: 'Pals', icon: '☺' },
  { key: 'balances', label: 'Split', icon: '₹' },
  { key: 'activity', label: 'Buzz', icon: '☼' },
  { key: 'profile', label: 'Me', icon: '⚙' }
];

export function BottomTabs({
  active,
  onChange
}: {
  active: TabKey;
  onChange: (tab: TabKey) => void;
}) {
  return (
    <>
      <nav className="mb-3 rounded-[18px] border-[3px] border-ink bg-cream p-2 shadow-brutal md:hidden">
        <div className="grid grid-cols-3 gap-2">
          {tabs.map((tab) => (
            <Button
              key={tab.key}
              tone={active === tab.key ? 'cyan' : 'cream'}
              className="flex h-12 items-center justify-center gap-1 border-[2px] text-xs leading-tight shadow-brutalSm"
              onClick={() => onChange(tab.key)}
            >
              <span className="text-sm leading-none">{tab.icon}</span>
              {tab.label}
            </Button>
          ))}
        </div>
      </nav>
      <aside className="fixed left-0 top-0 hidden h-screen w-[270px] overflow-y-auto border-r-[3px] border-ink bg-cream p-4 md:block">
        <div className="mb-5">
          <div className="brand-font text-3xl font-extrabold leading-none">TripTab</div>
          <div className="text-xs font-extrabold uppercase tracking-wide">Navigation</div>
        </div>
        <div className="grid gap-3">
          {tabs.map((tab) => {
            const isActive = active === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => onChange(tab.key)}
                className={`brutal-btn flex h-14 w-full items-center justify-start gap-3 border-[3px] px-4 text-sm font-extrabold ${
                  isActive ? 'bg-cyanpop' : 'bg-offwhite'
                }`}
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-ink bg-cream text-base">
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </aside>
    </>
  );
}
