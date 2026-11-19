import { Link, useSearchParams } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import { Async, PageHeader } from '../components/ui';
import { CATEGORIES, gameImg, categoryLabel, coverFor } from '../services/categories.jsx';
import useBase from '../hooks/useBase';

export default function Games() {
  const [params, setParams] = useSearchParams();
  const cat = params.get('category') || '';
  const state = useFetch('/games');
  const base = useBase();

  return (
    <div>
      <PageHeader title="Games" subtitle="Games featured in our tournaments." />
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <button
          type="button"
          onClick={() => setParams({})}
          className={`card group relative h-24 overflow-hidden text-left transition duration-300 hover:-translate-y-0.5 ${!cat ? 'border-brand ring-2 ring-brand/50' : 'hover:border-brand/50'}`}
        >
          <img src="/images/covers/other.jpg" alt="All categories" className="absolute inset-0 h-full w-full object-cover opacity-55 transition duration-500 group-hover:scale-110" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/55 to-transparent" />
          <div className="relative flex h-full flex-col justify-end p-3">
            <span className="font-game text-sm font-bold uppercase tracking-wider text-white">All Games</span>
          </div>
        </button>
        {CATEGORIES.map((c) => {
          const Icon = c.icon;
          return (
            <button
              key={c.value}
              type="button"
              onClick={() => setParams({ category: c.value })}
              className={`card group relative h-24 overflow-hidden text-left transition duration-300 hover:-translate-y-0.5 ${cat === c.value ? 'border-brand ring-2 ring-brand/50' : 'hover:border-brand/50'}`}
            >
              <img src={coverFor(c.value)} alt={c.label} className="absolute inset-0 h-full w-full object-cover opacity-70 transition duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/50 to-transparent" />
              <div className="relative flex h-full flex-col justify-end p-3">
                <span className="flex items-center gap-1.5 font-game text-sm font-bold uppercase tracking-wider text-white">
                  <Icon size={14} className="text-brand-400" /> {c.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
      <Async state={state} empty="The administrator has not added any games yet.">{(all) => {
        const d = cat ? all.filter((g) => g.category === cat) : all;
        if (!d.length) return <div className="card border-dashed p-10 text-center text-sm text-slate-400">No games in this category yet.</div>;
        return (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {d.map((g) => (
              <div key={g.id} className="card group overflow-hidden transition duration-300 hover:-translate-y-1 hover:border-brand/60">
                <div className="h-40 overflow-hidden"><img src={gameImg(g)} alt={g.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /></div>
                <div className="p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-brand-400">{categoryLabel(g.category)}</p>
                  <h3 className="text-2xl font-bold">{g.name}</h3>
                  <p className="mt-1 min-h-[2.5rem] text-sm text-slate-400">{g.description || 'No description.'}</p>
                  <Link to={`${base}/tournaments?game=${g.id}`} className="btn-ghost mt-4 w-full">{g.tournaments} tournament(s)</Link>
                </div>
              </div>
            ))}
          </div>
        );
      }}</Async>
    </div>
  );
}
