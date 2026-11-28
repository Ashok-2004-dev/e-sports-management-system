import { Users, Shield, Trophy, Clock, CheckCircle2, Activity } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import { Async, PageHeader, Empty } from '../../components/ui';
import { fmtDateTime } from '../../services/format';
import RecentNotifications from '../../components/RecentNotifications';

export default function AdminOverview() {
  const state = useFetch('/admin/stats');
  return (
    <div>
      <PageHeader title="Admin overview" subtitle="Live numbers from the database." />
      <Async state={state}>{({ stats: s, activities }) => (
        <div className="space-y-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[[Users, 'Total players', s.players], [Shield, 'Total teams', s.teams], [Trophy, 'Total tournaments', s.tournaments],
              [Clock, 'Upcoming tournaments', s.upcoming], [Activity, 'Ongoing tournaments', s.ongoing], [CheckCircle2, 'Completed tournaments', s.completed]].map(([I, l, v]) => (
              <div key={l} className="card card-hover flex items-center gap-4 p-5">
                <span className="rounded-xl bg-gradient-to-br from-brand/30 to-cyan-400/20 p-3 text-cyan-300 ring-1 ring-inset ring-fg/10"><I size={24} /></span>
                <div><p className="font-display text-3xl font-bold text-fg">{v}</p><p className="text-sm text-slate-400">{l}</p></div>
              </div>))}
          </div>
          <RecentNotifications title="Latest changes" />
          <div className="card p-6">
            <h3 className="mb-4 text-2xl font-bold">Recent activities</h3>
            {!activities.length && <Empty title="No activity yet" text="Activity appears here as players join, register and results are published." />}
            <ul className="divide-y divide-ink-700">
              {activities.map((a, i) => (<li key={i} className="flex items-center justify-between gap-4 py-3 text-sm"><span>{a.text}</span><span className="shrink-0 text-xs text-slate-500">{fmtDateTime(a.happened_at)}</span></li>))}
            </ul>
          </div>
        </div>
      )}</Async>
    </div>
  );
}
