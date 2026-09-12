import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | Repo Roaster",
  description: "Privacy Policy and Data Protection Notice for Repo Roaster",
};

export default function PrivacyPage() {
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
          <span className="text-accent text-xs font-bold uppercase tracking-widest">// LEGAL DISCLOSURE & DATA PROTECTION</span>
          <h1 className="font-display font-black text-3xl md:text-4xl text-primary tracking-tight uppercase mt-2">
            PRIVACY POLICY
          </h1>
          <p className="text-dim text-xs mt-2">LAST REVISED: SEPTEMBER 12, 2026 · EFFECTIVE IMMEDIATELY</p>
        </div>

        <section className="bg-surface border border-border p-6 flex flex-col gap-4 leading-relaxed text-muted">
          <h2 className="font-display font-bold text-lg text-primary uppercase tracking-tight">1. OVERVIEW & DISCLAIMER</h2>
          <p>
            Repo Roaster (&quot;System&quot;, &quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is an automated static code analysis and satire generation platform.
            By interacting with this service, submitting GitHub repository URLs, or utilizing our APIs, you acknowledge and agree to the practices outlined in this Privacy Policy.
          </p>
          <p className="border-l-2 border-accent pl-4 text-primary">
            DISCLAIMER: All generated roasts, ratings, and code reviews are produced by automated AI models for satirical, educational, and analytical purposes only. No malice or professional defamation is intended.
          </p>
        </section>

        <section className="bg-surface border border-border p-6 flex flex-col gap-4 leading-relaxed text-muted">
          <h2 className="font-display font-bold text-lg text-primary uppercase tracking-tight">2. DATA WE COLLECT</h2>
          <ul className="space-y-2 list-disc list-inside">
            <li><strong className="text-primary">Public Repository Identifiers:</strong> Repository names, owner names, public commit logs, and file structures fetched via public APIs.</li>
            <li><strong className="text-primary">User-Provided Inputs:</strong> Custom roast personas, comparative repository links, and user interface configuration choices.</li>
            <li><strong className="text-primary">Local Storage Data:</strong> Roast receipts, user preferences, and cookie consent flags stored strictly client-side on your device.</li>
            <li><strong className="text-primary">Technical Telemetry:</strong> Anonymized IP addresses, user-agent strings, and request timestamps logged for security and rate-limiting enforcement.</li>
          </ul>
        </section>

        <section className="bg-surface border border-border p-6 flex flex-col gap-4 leading-relaxed text-muted">
          <h2 className="font-display font-bold text-lg text-primary uppercase tracking-tight">3. HOW WE USE YOUR DATA</h2>
          <p>We process collected data exclusively to:</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>Generate real-time AI code reviews and comparative roast reports.</li>
            <li>Maintain service security, prevent API abuse, and enforce rate limits.</li>
            <li>Store local user audit receipts in your browser session.</li>
          </ul>
          <p>We <span className="text-primary font-bold">DO NOT</span> sell, monetize, or lease your data to third-party ad brokers.</p>
        </section>

        <section className="bg-surface border border-border p-6 flex flex-col gap-4 leading-relaxed text-muted">
          <h2 className="font-display font-bold text-lg text-primary uppercase tracking-tight">4. THIRD-PARTY SERVICES & AI PROVIDERS</h2>
          <p>
            When you submit a repository, relevant code metadata may be transmitted to third-party AI LLM infrastructure providers (e.g., OpenRouter, NVIDIA NIM, or Google AI) to process text completion prompts under standard strict data protection agreements.
          </p>
        </section>

        <section className="bg-surface border border-border p-6 flex flex-col gap-4 leading-relaxed text-muted">
          <h2 className="font-display font-bold text-lg text-primary uppercase tracking-tight">5. YOUR RIGHTS & DATA PURGING</h2>
          <p>
            You have the right to request deletion of cached records or local receipt data at any time using the &quot;PURGE ALL RECORDS&quot; button within the Receipts panel. For copyright or privacy concerns regarding public repository indexing, contact our support team.
          </p>
        </section>

        <section className="bg-surface border border-border p-6 flex flex-col gap-4 leading-relaxed text-muted">
          <h2 className="font-display font-bold text-lg text-primary uppercase tracking-tight">6. LIMITATION OF LIABILITY</h2>
          <p className="text-danger font-mono">
            IN NO EVENT SHALL REPO ROASTER OR ITS OPERATORS BE LIABLE FOR ANY CLAIM, DAMAGES, EMOTIONAL DISTRESS, OR LOSS OF EMPLOYMENT RESULTING FROM SATIRICAL CODE ROASTS OR AUTOMATED INFRASTRUCTURE DIAGNOSTICS.
          </p>
        </section>
      </main>

      <footer className="w-full bg-[#111114] border-t border-border py-6 text-center text-dim font-mono">
        <p>© 2026 REPO ROASTER SYSTEM · ALL RIGHTS RESERVED</p>
      </footer>
    </div>
  );
}
