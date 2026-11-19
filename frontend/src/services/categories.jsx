import { Crosshair, Swords, Target, Trophy, Castle, Flag, Zap, Gamepad2 } from 'lucide-react';

// game categories (each one has its own cover artwork in public/images/covers)
export const CATEGORIES = [
  { value: 'battle-royale', label: 'Battle Royale', icon: Crosshair },
  { value: 'moba', label: 'MOBA', icon: Swords },
  { value: 'shooter', label: 'Shooter', icon: Target },
  { value: 'sports', label: 'Sports', icon: Trophy },
  { value: 'strategy', label: 'Strategy', icon: Castle },
  { value: 'racing', label: 'Racing', icon: Flag },
  { value: 'fighting', label: 'Fighting', icon: Zap },
  { value: 'other', label: 'Other', icon: Gamepad2 },
];
export const coverFor = (cat) => `/images/covers/${CATEGORIES.some((c) => c.value === cat) ? cat : 'other'}.jpg`;
export const categoryLabel = (cat) => (CATEGORIES.find((c) => c.value === cat) || CATEGORIES[7]).label;
export const CategoryIcon = ({ cat, size = 20 }) => { const I = (CATEGORIES.find((c) => c.value === cat) || CATEGORIES[7]).icon; return <I size={size} />; };

// artwork made for the well-known games (public/images/games), matched by the game's name
const GAME_ART = [[/pubg|battleground/i, 'pubg-mobile'], [/mobile legends|mlbb|bang bang/i, 'mobile-legends'], [/valorant/i, 'valorant'],
  [/free ?fire/i, 'free-fire'], [/e-?football|fifa|pes|soccer/i, 'efootball']];
export const gameArt = (name) => { const hit = GAME_ART.find(([re]) => re.test(name || '')); return hit ? `/images/games/${hit[1]}.svg` : null; };

// order: image uploaded by the admin -> artwork for that game -> artwork of its category
export const gameImg = (g) => g.image_url || gameArt(g.name) || coverFor(g.category);
export const tournamentImg = (t) => t.banner_url || t.game_image || gameArt(t.game) || coverFor(t.category);
