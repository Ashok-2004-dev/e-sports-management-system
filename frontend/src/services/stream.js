// LIVE GAMES: turns the stream link an admin pasted into something we can safely show.
//   YouTube / Twitch links  -> an embeddable player URL (plays inside the site)
//   TikTok links            -> recorded videos embed via player/v1; live streams open safely in TikTok
//   any other http(s) link  -> shown as a "Watch on <site>" button (opens in a new tab, never embedded)
//   empty / invalid         -> null (the page shows the live score only)
export function streamInfo(raw) {
  if (!raw) return null;
  let u;
  try { u = new URL(String(raw).trim()); } catch { return null; }
  if (u.protocol !== 'https:' && u.protocol !== 'http:') return null;
  const host = u.hostname.replace(/^(www|m|vm|vt)\./, '');

  // YouTube: watch?v=ID, youtu.be/ID, /live/ID, /embed/ID
  let id = null;
  if (host === 'youtu.be') id = u.pathname.slice(1).split('/')[0];
  else if (host === 'youtube.com') id = u.searchParams.get('v') || (/^\/(?:live|embed|shorts)\/([\w-]{6,20})/.exec(u.pathname) || [])[1];
  if (id && /^[\w-]{6,20}$/.test(id)) {
    return { kind: 'youtube', host: 'YouTube', href: u.href, src: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&rel=0&modestbranding=1` };
  }

  // Twitch: twitch.tv/<channel> or twitch.tv/videos/<id>. Twitch requires the embedding site's hostname in `parent`.
  if (host === 'twitch.tv') {
    const parent = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    const parts = u.pathname.split('/').filter(Boolean);
    if (parts[0] === 'videos' && /^\d+$/.test(parts[1] || '')) return { kind: 'twitch', host: 'Twitch', href: u.href, src: `https://player.twitch.tv/?video=v${parts[1]}&parent=${parent}&autoplay=true&muted=true` };
    if (/^\w{3,25}$/.test(parts[0] || '')) return { kind: 'twitch', host: 'Twitch', href: u.href, src: `https://player.twitch.tv/?channel=${parts[0]}&parent=${parent}&autoplay=true&muted=true` };
  }

  // TikTok: recorded videos (/video/ID) can embed; live streams (/@user/live) open directly on TikTok
  if (host === 'tiktok.com') {
    const videoMatch = /\/video\/(\d+)/.exec(u.pathname);
    if (videoMatch) {
      return { kind: 'tiktok', host: 'TikTok', href: u.href, src: `https://www.tiktok.com/player/v1/${videoMatch[1]}?autoplay=1&muted=1` };
    }
    return { kind: 'external', host: 'TikTok Live', href: u.href, src: null };
  }

  return { kind: 'external', host: host, href: u.href, src: null };
}