import { Trophy, ClipboardList, Shield, Swords, Medal, Gamepad2, User, Bell } from 'lucide-react';

// icon + colour for each kind of notification
export const KIND = {
  tournament: { icon: Trophy, cls: 'bg-amber-500/15 text-amber-300' },
  registration: { icon: ClipboardList, cls: 'bg-cyan-500/15 text-cyan-300' },
  team: { icon: Shield, cls: 'bg-violet-500/15 text-violet-300' },
  match: { icon: Swords, cls: 'bg-blue-500/15 text-blue-300' },
  result: { icon: Medal, cls: 'bg-emerald-500/15 text-emerald-300' },
  game: { icon: Gamepad2, cls: 'bg-pink-500/15 text-pink-300' },
  player: { icon: User, cls: 'bg-sky-500/15 text-sky-300' },
  account: { icon: User, cls: 'bg-slate-500/20 text-slate-300' },
};
export const kindOf = (t) => KIND[t] || { icon: Bell, cls: 'bg-slate-500/20 text-slate-300' };

export function timeAgo(s) {
  const d = new Date(String(s).replace(' ', 'T'));
  const sec = Math.max(0, (Date.now() - d.getTime()) / 1000);
  if (sec < 60) return 'just now';
  if (sec < 3600) return `${Math.floor(sec / 60)} min ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)} h ago`;
  if (sec < 604800) return `${Math.floor(sec / 86400)} d ago`;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}
