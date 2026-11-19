import { Users, Shield, Eye, Database, Lock, Smartphone } from 'lucide-react';
import { PageHeader } from '../components/ui';

const roles = [
  { icon: Users, title: 'Players', items: ['Create an account and manage a profile', 'Create or join teams', 'Register for tournaments', 'View schedules, results and rankings'] },
  { icon: Shield, title: 'Administrators', items: ['Manage players, teams and tournaments', 'Approve or reject registrations', 'Schedule matches and enter scores', 'Publish results and leaderboards'] },
  { icon: Eye, title: 'Viewers', items: ['Browse games and tournaments', 'View teams and match schedules', 'Follow results and leaderboards'] },
];
const quality = [[Database, 'MySQL database', 'All data is stored in one database.'], [Lock, 'Secure access', 'Hashed passwords, JWT login and role checks.'], [Smartphone, 'Responsive', 'Works on desktop and mobile screens.']];

export default function About() {
  return (
    <div className="space-y-10">
      <PageHeader title="About the system" subtitle="A centralized platform for e-sports information and tournament management." />
      <div className="card p-6 leading-relaxed">
        <h3 className="mb-2 text-2xl font-bold uppercase">Why we built it</h3>
        <p>E-sports information is often scattered across social media, spreadsheets and separate pages. Manual registration, scheduling and score updates can cause mistakes, and players or fans may miss announcements and results. The E-Sports Management System brings players, teams, tournaments, matches and leaderboards together in one easy-to-use website.</p>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {roles.map((r) => (
          <div key={r.title} className="card p-6">
            <r.icon className="mb-3 text-brand-400" size={28} /><h3 className="mb-3 text-2xl font-bold uppercase">{r.title}</h3>
            <ul className="list-disc space-y-1.5 pl-5 text-sm text-slate-400">{r.items.map((i) => <li key={i}>{i}</li>)}</ul>
          </div>
        ))}
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {quality.map(([Icon, t, d]) => (<div key={t} className="card flex gap-4 p-5"><Icon className="shrink-0 text-violet-400" /><div><h4 className="text-lg font-bold">{t}</h4><p className="text-sm text-slate-400">{d}</p></div></div>))}
      </div>
      <p className="text-center text-sm text-slate-500">Developed by Ashok Acharya, Kanjur Wangmo and Kezang Sherab - Jigme Namgyal Engineering College, Bhutan.</p>
    </div>
  );
}
