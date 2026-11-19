import { useState } from 'react';
import useFetch from '../hooks/useFetch';
import { Async, PageHeader } from '../components/ui';
import { MatchRow } from '../components/Cards';
import { useLive } from '../context/LiveContext';

export default function Matches() {
  const [tab, setTab] = useState('scheduled');
  const state = useFetch(`/matches?status=${tab}`);
  const { count } = useLive();
  // NEW: "Live" tab first, with the pulsing dot
  const tabs = [['live', 'Live'], ['scheduled', 'Upcoming matches'], ['completed', 'Results']];
  const emptyText = { live: 'No matches are live right now.', scheduled: 'No upcoming matches.', completed: 'No results published yet.' }[tab];
  return (
    <div>
      <PageHeader title="Matches & Results" subtitle="Schedules and final scores published by the administrators." />
      <div className="mb-6 inline-flex max-w-full overflow-x-auto rounded-lg border border-ink-600 bg-ink-900 p-1">
        {tabs.map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={`shrink-0 rounded-md px-4 py-2 text-sm font-semibold transition ${tab === k ? 'bg-gradient-to-r from-brand to-violet-600 text-white' : 'text-slate-400 hover:text-white'}`}>{k === 'live' && <span className="live-dot mr-2 inline-block align-middle" aria-hidden />}{l}{k === 'live' && count > 0 && <span className="ml-2 rounded bg-live px-1.5 text-[11px] font-bold text-white">{count}</span>}</button>
        ))}
      </div>
      <Async state={state} empty={emptyText}>{(d) => <div key={tab} className="grid gap-4 md:grid-cols-2">{d.map((m, i) => <MatchRow key={m.id} m={m} index={i} />)}</div>}</Async>
    </div>
  );
}
