import Link from "next/link";

export const metadata = {
  title: "Cookie Policy | Repo Roaster",
  description: "Cookie Policy and Storage Notice for Repo Roaster",
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-background text-primary flex flex-col font-mono text-xs">
      <header className="w-full bg-[#111114] border-b border-border h-14 flex items-center px-6 sticky top-0 z-40">
        <div className="max-w-[1440px] w-full mx-auto flex items-center justify-between">
          <Link href="/" className="font-display font-black text-base tracking-tight hover:opacity-80 transition-opacity">
            <span className="text-primary">REPO</span><span className="text-accent">ROASTER</span>
          </Link>
          <Link href="/" className="text-muted hover:text-accent font-mono text-xs flex items-center gap-1">
            <span>← BACK TO TERMINAL</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-[900px] w-full mx-auto px-6 py-12 flex flex-col gap-8">
        <div className="border-b border-border pb-6">
          <span className="text-accent text-xs font-bold uppercase tracking-widest">// COOKIE & LOCAL STORAGE DISCLOSURE</span>
          <h1 className="font-display font-black text-3xl md:text-4xl text-primary tracking-tight uppercase mt-2">
            COOKIE POLICY
          </h1>
          <p className="text-dim text-xs mt-2">LAST REVISED: SEPTEMBER 12, 2026 · COMPLIANCE VERIFIED</p>
        </div>

        <section className="bg-surface border border-border p-6 flex flex-col gap-4 leading-relaxed text-muted">
          <h2 className="font-display font-bold text-lg text-primary uppercase tracking-tight">1. WHAT ARE COOKIES & LOCAL STORAGE?</h2>
          <p>
            Cookies and browser LocalStorage are small data files stored on your computer or mobile device when you visit websites. They help remember your preferences and maintain session states across page reloads.
          </p>
        </section>

        <section className="bg-surface border border-border p-6 flex flex-col gap-4 leading-relaxed text-muted">
          <h2 className="font-display font-bold text-lg text-primary uppercase tracking-tight">2. HOW REPO ROASTER USES STORAGE</h2>
          <p>Repo Roaster uses local browser storage for strictly functional purposes:</p>

          <div className="space-y-3 border-l-2 border-accent pl-4">
            <div>
              <span className="text-primary font-bold">• Strict Essential Storage (localStorage)</span>
              <p className="text-xs text-dim">Stores your consent choices and UI tab navigation state.</p>
            </div>
            <div>
              <span className="text-primary font-bold">• Roast Receipts Archive (localStorage: `roast-receipts`)</span>
              <p className="text-xs text-dim">Stores your audit history and generated code roasts locally on your browser so you can view past results.</p>
            </div>
            <div>
              <span className="text-primary font-bold">• Zero Third-Party Tracking Cookies</span>
              <p className="text-xs text-dim">We do NOT place third-party advertising cookies, cross-site trackers, or marketing beacons on your machine.</p>
            </div>
          </div>
        </section>

        <section className="bg-surface border border-border p-6 flex flex-col gap-4 leading-relaxed text-muted">
          <h2 className="font-display font-bold text-lg text-primary uppercase tracking-tight">3. MANAGING & CLEARING COOKIES</h2>
          <p>
            You can clear your stored receipts and preferences at any time by clicking &quot;PURGE ALL RECORDS&quot; in the Receipts tab, or by clearing your browser site data via browser developer settings.
          </p>
        </section>
      </main>

      <footer className="w-full bg-[#111114] border-t border-border py-6 text-center text-dim font-mono">
        <p>© 2026 REPO ROASTER SYSTEM · ALL RIGHTS RESERVED</p>
      </footer>
    </div>
  );
}
