// fixed, non-interactive layer behind the whole website.
// ESPORTS THEME: toned down from the earlier floating-icons version to a quiet charcoal grid with three soft glows
// (cyan, violet and a faint crimson), so match cards and the LIVE button stay the focus. Lighter on phones too.
export default function GameBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-ink-950">
      {/* background picture: replace /public/images/background.svg with your own image (e.g. background.jpg, then change the url below) */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60" style={{ backgroundImage: "url('/images/background.svg')" }} />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(21,24,34,.55)_0%,rgba(11,12,17,.7)_55%,rgba(8,9,12,.85)_100%)]" />
      <div className="absolute -left-40 -top-40 h-[32rem] w-[32rem] animate-orb rounded-full bg-cyan-500/10 blur-[120px]" />
      <div className="absolute -right-40 top-1/3 h-[30rem] w-[30rem] animate-orb rounded-full bg-violet-600/15 blur-[120px]" style={{ animationDelay: '-7s' }} />
      <div className="absolute -bottom-48 left-1/3 h-[26rem] w-[26rem] animate-orb rounded-full bg-live/10 blur-[120px]" style={{ animationDelay: '-12s' }} />
      <div className="bg-grid absolute inset-0 opacity-40" />
      <div className="gb-noise-vignette" />
    </div>
  );
}
