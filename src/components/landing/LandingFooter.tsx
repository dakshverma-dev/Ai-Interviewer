export default function LandingFooter() {
  return (
    <footer className="relative" style={{ borderTop: '1px solid var(--color-dove)' }}>
      <div className="max-w-[1200px] mx-auto px-6 lg:px-12 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <span className="font-display text-xl">AI Interviewer</span>
        <div className="flex items-center gap-2 text-sm text-[var(--color-fog)]">
          <span className="w-2 h-2 rounded-full" style={{ background: 'var(--color-sprout)' }} />
          Built for a hackathon. No accounts, no tracking, all in your session.
        </div>
      </div>
    </footer>
  );
}
