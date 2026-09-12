"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { EvervaultBackground } from "@/components/ui/evervault-background";

interface RoastResult {
  repoName: string;
  roast: string;
  roastScore: number;
  codeSmells: string[];
  verdict: string;
}

interface ReceiptEntry extends RoastResult {
  id: string;
  timestamp: string;
  repoUrl: string;
  persona: string;
}

export default function Page() {
  const [activeTab, setActiveTab] = useState<'ingest' | 'battle' | 'profile' | 'receipts' | 'shame' | 'telemetry'>('ingest');
  const [repoUrl, setRepoUrl] = useState('');
  const [repoUrl2, setRepoUrl2] = useState('');
  const [persona, setPersona] = useState('Cynical Senior');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RoastResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [receipts, setReceipts] = useState<ReceiptEntry[]>([]);
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptEntry | null>(null);
  const [loadingDots, setLoadingDots] = useState('');
  
  // Modals
  const [showKanyeModal, setShowKanyeModal] = useState(false);
  const [showCookieBanner, setShowCookieBanner] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [showApologyModal, setShowApologyModal] = useState(false);
  const [showObituaryModal, setShowObituaryModal] = useState(false);
  const [copiedApology, setCopiedApology] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Load receipts & consent on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('roast-receipts');
      if (stored) setReceipts(JSON.parse(stored));
      const consent = localStorage.getItem('cookie-consent');
      if (!consent) setShowCookieBanner(true);
    } catch {}
  }, []);

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleCookieChoice = (choice: 'accept' | 'essential') => {
    try {
      localStorage.setItem('cookie-consent', choice);
    } catch {}
    setShowCookieBanner(false);
  };

  // Animate loading dots
  useEffect(() => {
    if (!loading) { setLoadingDots(''); return; }
    const id = setInterval(() => {
      setLoadingDots(d => d.length >= 3 ? '' : d + '.');
    }, 400);
    return () => clearInterval(id);
  }, [loading]);

  const saveReceipt = useCallback((r: RoastResult, url: string, p: string) => {
    const entry: ReceiptEntry = {
      ...r,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      repoUrl: url,
      persona: p,
    };
    setReceipts(prev => {
      const updated = [entry, ...prev].slice(0, 30);
      localStorage.setItem('roast-receipts', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const triggerAudit = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    try {
      const payload: Record<string, any> = { repoUrl, persona };
      if (activeTab === 'battle' && repoUrl2) {
        payload.repoUrl2 = repoUrl2;
      }
      if (activeTab === 'profile') {
        payload.isProfile = true;
      }
      const res = await fetch('/api/roast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Server error ${res.status}`);
      }
      if (!data.roast) {
        throw new Error('The AI returned an unexpected response format. Try again.');
      }
      setResult(data);
      saveReceipt(data, activeTab === 'profile' ? `@${repoUrl}` : activeTab === 'battle' ? `${repoUrl} vs ${repoUrl2}` : repoUrl, persona);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error occurred.');
    }
    setLoading(false);
  };

  // Web Speech API - Read Aloud
  const toggleSpeech = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in this browser.');
      return;
    }
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 0.85;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  // Export Shame Card PNG
  const downloadShameCardPNG = (r: RoastResult) => {
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 520;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#131315";
    ctx.fillRect(0, 0, 800, 520);

    ctx.strokeStyle = "#d99753";
    ctx.lineWidth = 6;
    ctx.strokeRect(14, 14, 772, 492);

    ctx.fillStyle = "#ffffff";
    ctx.font = "black 26px 'Space Grotesk', sans-serif";
    ctx.fillText("REPO", 40, 58);
    ctx.fillStyle = "#d99753";
    ctx.fillText("ROASTER", 112, 58);

    ctx.fillStyle = "#5a5a65";
    ctx.font = "11px 'JetBrains Mono', monospace";
    ctx.fillText("// OFFICIAL DISASSEMBLY SHAME CARD", 40, 82);

    ctx.fillStyle = "#1c1b1d";
    ctx.fillRect(560, 36, 195, 50);
    ctx.strokeStyle = "#ff4d6d";
    ctx.lineWidth = 2;
    ctx.strokeRect(560, 36, 195, 50);

    ctx.fillStyle = "#ff4d6d";
    ctx.font = "bold 20px 'JetBrains Mono', monospace";
    ctx.fillText(`SCORE: ${r.roastScore}/100`, 580, 68);

    ctx.strokeStyle = "#2a2a2e";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(40, 100);
    ctx.lineTo(760, 100);
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 28px 'Space Grotesk', sans-serif";
    ctx.fillText(r.repoName.toUpperCase(), 40, 145);

    ctx.fillStyle = "#a0a0a8";
    ctx.font = "13px 'JetBrains Mono', monospace";
    const words = r.roast.split(" ");
    let line = "";
    let y = 190;
    for (let i = 0; i < words.length && y < 350; i++) {
      const testLine = line + words[i] + " ";
      if (ctx.measureText(testLine).width > 720) {
        ctx.fillText(line, 40, y);
        line = words[i] + " ";
        y += 22;
      } else {
        line = testLine;
      }
    }
    if (line && y < 350) ctx.fillText(line, 40, y);

    ctx.fillStyle = "#111114";
    ctx.fillRect(40, 375, 720, 55);
    ctx.strokeStyle = "#ff4d6d";
    ctx.strokeRect(40, 375, 720, 55);

    ctx.fillStyle = "#ff4d6d";
    ctx.font = "bold 13px 'JetBrains Mono', monospace";
    ctx.fillText(`VERDICT: ${r.verdict.toUpperCase()}`, 55, 408);

    ctx.fillStyle = "#5a5a65";
    ctx.font = "11px 'JetBrains Mono', monospace";
    ctx.fillText(`VERIFIED BY REPO ROASTER SYSTEM · ${new Date().toLocaleDateString()}`, 40, 478);

    const link = document.createElement("a");
    link.download = `shame-card-${r.repoName.replace(/[^a-z0-9]/gi, "_")}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const clearReceipts = () => {
    setReceipts([]);
    setSelectedReceipt(null);
    localStorage.removeItem('roast-receipts');
  };

  const gradeColor = (score: number) => {
    if (score >= 90) return 'text-danger';
    if (score >= 70) return 'text-accent';
    if (score >= 50) return 'text-accent-light';
    return 'text-muted';
  };

  // Hall of Shame Curated Data + User Receipts
  const shameLeaderboard = [
    { rank: '#1', repoName: 'web3-chad/solana-dex-copy', roastScore: 100, grade: 'JAIL', smell: 'HARDCODED_PRIVKEY · SEC_LEAK_P0', verdict: 'Codebase so toxic it triggered immediate regulatory investigation.' },
    { rank: '#2', repoName: 'alex-dev/portfolio-v12', roastScore: 99, grade: 'F--', smell: '412 ANY TYPES · 0 TESTS', verdict: 'Built microservices with Kafka to render a static resume.' },
    { rank: '#3', repoName: 'saas-founder/ai-wrapper', roastScore: 95, grade: 'D-', smell: 'STATE_LOOP · $1,400 LOG COST', verdict: '8,400 line useEffect recursive chain thrashing browser memory.' },
    ...receipts.map((r, idx) => ({
      rank: `#${idx + 4}`,
      repoName: r.repoName,
      roastScore: r.roastScore,
      grade: r.roastScore >= 90 ? 'CRITICAL' : 'FAILED',
      smell: r.codeSmells?.[0] || 'AST_AUTOPSY_FAIL',
      verdict: r.verdict,
    })),
  ];

  // Dynamic Apology Email Text
  const getApologyText = (r: RoastResult) => {
    return `Subject: Resignation & Formal Apology regarding ${r.repoName}

Dear Tech Lead / Engineering Director,

I am writing to formally apologize for the architectural catastrophe I introduced into ${r.repoName}.

An automated audit by Repo Roaster assigned our codebase a Shame Index of ${r.roastScore}/100 with the following verdict:
"${r.verdict}"

Key structural crimes committed by my hands:
${r.codeSmells?.map(s => `- ${s}`).join('\n')}

I accept full responsibility for the wasted cloud compute budgets and team therapy hours. Effective immediately, I will be stepping down to re-evaluate my life choices.

Sincerely,
Your Formerly Employed Developer`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedApology(true);
    setTimeout(() => setCopiedApology(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-mono relative">
      {/* Evervault Matrix Background Spotlight in Website Accent Color */}
      <EvervaultBackground />

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          header, footer, nav, button:not(.printable-btn) {
            display: none !important;
          }
          body {
            background: white !important;
            color: black !important;
          }
          .certificate-modal {
            position: absolute !important;
            inset: 0 !important;
            background: white !important;
            color: black !important;
            border: 8px solid black !important;
            box-shadow: none !important;
          }
        }
      `}</style>

      {/* Scanline overlay */}
      <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden opacity-[0.03]">
        <div className="absolute inset-0" style={{backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 4px)'}}></div>
      </div>

      <header className="w-full bg-[#111114]/90 backdrop-blur-md border-b border-border text-xs sticky top-0 z-40">
        <div className="max-w-[1440px] mx-auto px-6 h-12 flex items-center relative">

          {/* Left: Logo */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link className="flex items-center gap-2" href="/">
              <span className="font-display font-black text-base tracking-tight">
                <span className="text-primary">REPO</span><span className="text-accent">ROASTER</span>
              </span>
            </Link>
            <div className="h-4 w-px bg-border hidden sm:block"></div>
            <span className="hidden sm:block font-mono text-[10px] text-dim tracking-widest uppercase">sys/pipeline</span>
          </div>

          {/* Center: Nav — centered */}
          <nav className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center border border-border bg-[#0e0e10]/90 backdrop-blur-sm rounded-lg overflow-hidden">
            {(['ingest','battle','profile','receipts','shame','telemetry'] as const).map((tab) => (
              <button
                key={tab}
                className={`px-4 py-2 border-r last:border-r-0 border-border font-mono text-[11px] uppercase tracking-widest flex items-center gap-2 transition-all duration-150 whitespace-nowrap ${activeTab === tab ? 'bg-surface text-accent font-bold' : 'text-dim hover:text-primary hover:bg-surface/50'}`}
                onClick={() => setActiveTab(tab)}
              >
                {activeTab === tab && <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse flex-shrink-0"></span>}
                <span>
                  {tab === 'ingest' ? 'REPO INGEST'
                    : tab === 'battle' ? 'ROAST BATTLE'
                    : tab === 'profile' ? 'SELF-SABOTAGE'
                    : tab === 'receipts' ? `RECEIPTS${receipts.length > 0 ? ` [${receipts.length}]` : ''}`
                    : tab === 'shame' ? 'HALL OF SHAME'
                    : 'TELEMETRY'}
                </span>
              </button>
            ))}
          </nav>

          {/* Right: Status */}
          <div className="ml-auto flex items-center gap-3 flex-shrink-0">
            <div className="hidden sm:flex items-center gap-2 font-mono text-[11px] text-dim">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
              <span className="text-muted">LIVE</span>
            </div>
          </div>

        </div>
      </header>

      <main className="flex-1 max-w-[1000px] w-full mx-auto px-6 py-8 flex flex-col items-center z-10">

        {/* ===== INGEST / BATTLE / PROFILE TAB (SYMMETRIC & CENTRALIZED DASHBOARD) ===== */}
        {(activeTab === 'ingest' || activeTab === 'battle' || activeTab === 'profile') && (
          <div className="w-full flex flex-col gap-8 items-center animate-fade-in">
            
            {/* Main Submission Workbench (Centered & Symmetric) */}
            <section className="w-full bg-surface/90 backdrop-blur-md border border-border rounded-xl p-8 flex flex-col gap-6 relative overflow-hidden shadow-[0_0_50px_rgba(217,151,83,0.06)]">
              <div className="absolute top-0 right-0 w-20 h-20 border-t-2 border-r-2 border-accent/30 rounded-tr-xl"></div>
              <div className="absolute bottom-0 left-0 w-20 h-20 border-b-2 border-l-2 border-accent/20 rounded-bl-xl"></div>

              <div className="flex flex-wrap items-center justify-between border-b border-border pb-4 gap-2">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-accent text-xs font-bold uppercase tracking-wider">
                    // {activeTab === 'profile' ? 'DEVELOPER CAREER SELF-SABOTAGE WORKBENCH' : 'REPO SUBMISSION WORKBENCH'}
                  </span>
                  <span className="text-dim font-mono text-xs bg-[#0e0e10] border border-border px-2 py-0.5 rounded">SYS_REV: 04.29.9</span>
                </div>
                <div className="text-[11px] font-mono text-dim flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px] text-accent">lock_open</span>
                  <span>PUBLIC AUDIT MODE</span>
                </div>
              </div>

              <div className="flex flex-col items-center text-center gap-3 py-2">
                <h1 className="font-display font-bold text-3xl md:text-5xl text-primary tracking-[-0.03em] uppercase leading-none">
                  {activeTab === 'profile' ? (
                    <>ROAST YOUR <span className="text-accent inline-block">WHOLE CAREER.</span></>
                  ) : (
                    <>INSPECT. DISSECT. <span className="text-accent inline-block">HUMILIATE.</span></>
                  )}
                </h1>
                <p className="font-mono text-xs md:text-sm text-muted leading-relaxed max-w-2xl text-center">
                  {activeTab === 'profile'
                    ? 'Enter your GitHub username to receive a ruthless AI autopsy of your entire developer career, over-engineered side projects, and green contribution graph delusions.'
                    : 'Static AST autopsy of public GitHub repositories. Decompiles anti-patterns, cyclic dependencies, type evasions, and architectural delusions without remorse.'}
                </p>
              </div>

              <form className="flex flex-col gap-5 pt-2" onSubmit={(e) => { e.preventDefault(); triggerAudit(); }}>
                <div className="flex flex-col gap-2 text-left">
                  <label className="text-[11px] font-mono uppercase text-dim tracking-wider flex items-center justify-between" htmlFor="repo-input">
                    <span>
                      {activeTab === 'profile' ? 'TARGET GITHUB DEVELOPER USERNAME' : activeTab === 'battle' ? 'TARGET REPO A' : 'TARGET GITHUB REPOSITORY'}
                    </span>
                    <span className="text-accent text-[10px]">{activeTab === 'profile' ? 'FORMAT: USERNAME' : 'FORMAT: OWNER/REPO'}</span>
                  </label>
                  <div className="relative flex items-center bg-[#0e0e10]/90 border border-border focus-within:border-accent rounded-lg transition-colors duration-200 overflow-hidden">
                    <span className="px-4 text-dim font-mono text-xs select-none border-r border-border bg-[#131317] py-3.5">
                      {activeTab === 'profile' ? 'github.com/@' : 'github.com/'}
                    </span>
                    <input
                      autoComplete="off"
                      className="w-full bg-transparent border-0 px-4 py-3.5 font-mono text-sm text-primary placeholder:text-dim focus:ring-0 focus:outline-none"
                      id="repo-input"
                      placeholder={activeTab === 'profile' ? 'torvalds or your-github-user' : 'torvalds/linux'}
                      required
                      spellCheck="false"
                      type="text"
                      value={repoUrl}
                      onChange={(e) => setRepoUrl(e.target.value)}
                    />
                  </div>
                </div>

                {activeTab === 'battle' && (
                  <div className="flex flex-col gap-2 text-left animate-fade-in">
                    <label className="text-[11px] font-mono uppercase text-dim tracking-wider" htmlFor="repo-input-2">
                      TARGET REPO B (THE CHALLENGER)
                    </label>
                    <div className="relative flex items-center bg-[#0e0e10]/90 border border-border focus-within:border-accent rounded-lg transition-colors duration-200 overflow-hidden">
                      <span className="px-4 text-dim font-mono text-xs select-none border-r border-border bg-[#131317] py-3.5">github.com/</span>
                      <input
                        autoComplete="off"
                        className="w-full bg-transparent border-0 px-4 py-3.5 font-mono text-sm text-primary placeholder:text-dim focus:ring-0 focus:outline-none"
                        id="repo-input-2"
                        placeholder="vercel/next.js"
                        required
                        spellCheck="false"
                        type="text"
                        value={repoUrl2}
                        onChange={(e) => setRepoUrl2(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-2 text-left">
                  <label className="text-[11px] font-mono uppercase text-dim tracking-wider" htmlFor="persona-select">ROAST PERSONA</label>
                  <select
                    id="persona-select"
                    className="bg-[#0e0e10]/90 border border-border text-primary font-mono text-xs p-3 rounded-lg focus:ring-0 focus:outline-none focus:border-accent cursor-pointer transition-colors"
                    value={persona}
                    onChange={(e) => setPersona(e.target.value)}
                  >
                    <option value="Cynical Senior">Cynical Senior Dev</option>
                    <option value="Gordon Ramsay of Code">Gordon Ramsay of Code</option>
                    <option value="Disappointed Tech Lead">Disappointed Tech Lead</option>
                  </select>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-border">
                  <div className="flex items-center gap-2 text-[11px] text-dim font-mono">
                    <span className={`w-2.5 h-2.5 rounded-full inline-block ${loading ? 'bg-accent animate-pulse' : 'bg-dim'}`}></span>
                    <span>MODE: {activeTab === 'profile' ? 'CAREER SELF-SABOTAGE AUTOPSY' : activeTab === 'battle' ? 'COMPARATIVE BLOOD BATH' : 'RAW UNEDITED DIAGNOSTIC'}</span>
                  </div>
                  <button
                    disabled={loading}
                    className="w-full sm:w-auto bg-accent hover:bg-accent-light text-black font-mono font-bold text-xs uppercase tracking-wider px-8 py-3.5 rounded-lg border border-accent flex items-center justify-center gap-2 transition-all duration-200 active:translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed hover:shadow-[0_0_25px_rgba(217,151,83,0.4)]"
                    type="submit"
                  >
                    <span>{loading ? `EXECUTING${loadingDots}` : activeTab === 'profile' ? 'INCINERATE CAREER' : 'RUN THERMAL DISASSEMBLY'}</span>
                    <span className="material-symbols-outlined text-[16px]">{loading ? 'pending' : 'terminal'}</span>
                  </button>
                </div>
              </form>
            </section>

            {/* Symmetric 3-Column Quick Targets Bar */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { repo: 'facebook/react', lang: 'JS/TS', grade: 'C+' },
                { repo: 'vercel/next.js', lang: 'TS', grade: 'D' },
                { repo: 'torvalds/linux', lang: 'C', grade: 'S-' },
              ].map(({ repo, lang, grade }) => (
                <button
                  key={repo}
                  onClick={() => setRepoUrl(repo)}
                  className="text-left bg-surface/90 backdrop-blur-md border border-border rounded-xl p-4 hover:border-accent hover:bg-[#16161a] transition-all duration-200 group flex items-center justify-between w-full shadow-lg"
                  type="button"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="font-mono text-xs font-semibold text-primary group-hover:text-accent transition-colors">{repo}</span>
                    <span className="text-[10px] font-mono text-dim">LANG: {lang}</span>
                  </div>
                  <span className="text-xs font-mono text-accent-light font-bold border border-border px-2.5 py-1 rounded bg-[#0e0e10]">{grade}</span>
                </button>
              ))}
            </div>

            {/* Symmetric Cluster Throughput Bar */}
            <div className="w-full bg-surface/90 backdrop-blur-md border border-border rounded-xl p-5 flex flex-col gap-3 shadow-lg">
              <div className="flex items-center justify-between border-b border-border pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
                  <span className="text-[11px] font-mono uppercase text-primary font-semibold tracking-wider">CLUSTER THROUGHPUT TELEMETRY</span>
                </div>
                <span className="text-[10px] font-mono text-dim border border-border px-2 py-0.5 rounded">LIVE</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'INGESTED', value: '2,418/hr' },
                  { label: 'FAIL_RATE', value: '98.4%', accent: true },
                  { label: 'LATENCY', value: '3.24s' },
                ].map(({ label, value, accent }) => (
                  <div key={label} className="border border-border bg-[#0e0e10]/80 p-3 rounded-lg flex flex-col items-center justify-center text-center gap-0.5 hover:border-accent transition-colors">
                    <span className="text-[10px] font-mono text-dim uppercase">{label}</span>
                    <span className={`text-base font-mono font-bold ${accent ? 'text-accent' : 'text-primary'}`}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Loading state */}
            {loading && (
              <div className="w-full bg-surface/90 backdrop-blur-md border border-accent rounded-xl p-8 flex flex-col gap-5 animate-burn-in shadow-[0_0_40px_rgba(217,151,83,0.1)]">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 bg-accent rounded-full animate-pulse inline-block"></span>
                  <span className="font-mono text-accent text-xs font-bold uppercase tracking-wider">DISASSEMBLING TARGET{loadingDots}</span>
                </div>
                <div className="space-y-3">
                  {['FETCHING REPOSITORY METADATA','RUNNING AST ANALYSIS','CALCULATING SHAME INDEX','GENERATING ROAST'].map((step, i) => (
                    <div key={i} className="flex items-center gap-3 font-mono text-xs">
                      <span className="text-accent animate-blink">▶</span>
                      <span className="text-muted">{step}</span>
                      <span className="text-dim animate-blink ml-auto">{loadingDots ? '...' : '   '}</span>
                    </div>
                  ))}
                </div>
                <div className="h-1 bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-accent w-1/3 animate-scan"></div>
                </div>
              </div>
            )}

            {/* Error state */}
            {error && !loading && (
              <div className="w-full bg-surface/90 backdrop-blur-md border border-danger rounded-xl p-8 flex flex-col gap-4 animate-burn-in shadow-[0_0_30px_rgba(255,77,109,0.1)]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-danger text-sm">error</span>
                  <span className="font-mono text-danger text-xs font-bold uppercase tracking-wider">// API ERROR</span>
                </div>
                <p className="font-mono text-sm text-primary">{error}</p>
              </div>
            )}

            {/* Results (Centered & Symmetric) */}
            {result && !loading && (
              <div className="w-full bg-surface/90 backdrop-blur-md border border-accent rounded-xl p-8 flex flex-col gap-6 animate-burn-in relative overflow-hidden shadow-[0_0_40px_rgba(217,151,83,0.1)]">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent to-transparent"></div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
                  <span className="font-mono text-accent text-xs font-bold uppercase tracking-wider">// ROAST RESULTS</span>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleSpeech(`${result.repoName}. ${result.roast}. Verdict: ${result.verdict}`)}
                      className={`font-mono text-xs px-3 py-1.5 rounded border transition-all flex items-center gap-1.5 ${isSpeaking ? 'bg-accent text-black border-accent animate-pulse' : 'bg-[#111114] border-border text-muted hover:text-primary hover:border-accent'}`}
                    >
                      <span className="material-symbols-outlined text-[14px]">{isSpeaking ? 'volume_up' : 'volume_off'}</span>
                      <span>{isSpeaking ? 'STOP AUDIO' : 'READ ALOUD'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => downloadShameCardPNG(result)}
                      className="font-mono text-xs px-3 py-1.5 rounded border border-border bg-[#111114] text-muted hover:text-accent hover:border-accent transition-all flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[14px]">download</span>
                      <span>SHAME CARD (PNG)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowApologyModal(true)}
                      className="font-mono text-xs px-3 py-1.5 rounded border border-border bg-[#111114] text-muted hover:text-accent hover:border-accent transition-all flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[14px]">mail</span>
                      <span>APOLOGY LETTER</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowObituaryModal(true)}
                      className="font-mono text-xs px-3 py-1.5 rounded border border-border bg-[#111114] text-muted hover:text-accent hover:border-accent transition-all flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[14px]">tombstone</span>
                      <span>OBITUARY</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowCertificateModal(true)}
                      className="font-mono text-xs px-3 py-1.5 rounded border border-accent text-accent hover:bg-accent hover:text-black transition-all flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[14px]">workspace_premium</span>
                      <span>DIPLOMA</span>
                    </button>

                    <div className={`text-base font-mono font-black ml-2 ${gradeColor(result.roastScore)}`}>
                      SCORE: {result.roastScore}/100
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-5">
                  <h2 className="font-display font-bold text-2xl md:text-3xl text-primary tracking-[-0.03em] uppercase">{result.repoName}</h2>
                  <p className="font-mono text-sm text-muted leading-relaxed whitespace-pre-wrap animate-fade-in">{result.roast}</p>

                  <div className="border-l-2 border-accent pl-5 animate-slide-in my-2">
                    <h3 className="font-mono text-xs text-accent font-bold uppercase mb-3">DETECTED CODE SMELLS & CRIMES</h3>
                    <ul className="space-y-2.5">
                      {result.codeSmells?.map((smell, i) => (
                        <li key={i} className="flex items-start gap-2.5 font-mono text-xs text-dim">
                          <span className="text-danger mt-0.5">◆</span>
                          <span>{smell}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#0e0e10]/90 border border-border rounded-lg p-4 my-1">
                    <div className="flex flex-col items-center text-center">
                      <span className="text-[10px] text-dim uppercase">AWS DOLLARS WASTED</span>
                      <span className="text-lg font-bold text-danger">${(result.roastScore * 48.2 + 120).toFixed(2)}</span>
                    </div>
                    <div className="flex flex-col items-center text-center">
                      <span className="text-[10px] text-dim uppercase">THERAPY HOURS REQUIRED</span>
                      <span className="text-lg font-bold text-accent">{Math.floor(result.roastScore * 1.5 + 10)} hrs</span>
                    </div>
                    <div className="flex flex-col items-center text-center">
                      <span className="text-[10px] text-dim uppercase">STACKOVERFLOW COPY-PASTE %</span>
                      <span className="text-lg font-bold text-accent-light">{Math.min(99, Math.max(40, result.roastScore + 5))}%</span>
                    </div>
                  </div>

                  <div className="bg-[#111114] border border-danger/30 rounded-lg p-5 animate-fade-in flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="font-mono text-sm text-danger uppercase text-center sm:text-left font-bold tracking-wide">
                      VERDICT: {result.verdict}
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowKanyeModal(true)}
                      className="bg-danger hover:bg-red-600 text-white font-mono text-xs font-bold uppercase px-5 py-2.5 rounded-lg border border-danger transition-all duration-150 flex items-center gap-2 whitespace-nowrap shadow-[0_0_15px_rgba(255,77,109,0.3)] hover:shadow-[0_0_25px_rgba(255,77,109,0.6)] active:scale-95"
                    >
                      <span>FIX CODE</span>
                      <span className="material-symbols-outlined text-[14px]">auto_fix_high</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ===== HALL OF SHAME TAB ===== */}
        {activeTab === 'shame' && (
          <div className="max-w-[1100px] w-full flex flex-col gap-6 animate-fade-in">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <span className="text-accent text-xs font-bold uppercase tracking-widest">// PUBLIC HALL OF SHAME</span>
                <h2 className="font-display font-bold text-3xl text-primary uppercase tracking-tight mt-1">LEADERBOARD OF DISGRACE</h2>
                <p className="font-mono text-xs text-muted mt-1">The most catastrophically incinerated repositories on record.</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('ingest')}
                className="bg-accent hover:bg-accent-light text-black font-mono font-bold text-xs uppercase px-4 py-2 rounded-lg transition-colors"
              >
                + SUBMIT NEW VICTIM
              </button>
            </div>

            <div className="bg-surface/90 backdrop-blur-md border border-border rounded-xl overflow-hidden shadow-2xl">
              <div className="grid grid-cols-12 bg-[#111114] border-b border-border px-6 py-3 font-mono text-xs text-dim font-bold uppercase">
                <div className="col-span-1">RANK</div>
                <div className="col-span-4">REPOSITORY</div>
                <div className="col-span-2 text-center">SCORE</div>
                <div className="col-span-2 text-center">GRADE</div>
                <div className="col-span-3">TOP SMELL / DIAGNOSTIC</div>
              </div>

              <div className="divide-y divide-border font-mono text-xs">
                {shameLeaderboard.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 px-6 py-4 items-center hover:bg-[#16161a] transition-colors">
                    <div className="col-span-1 font-bold text-accent">{item.rank}</div>
                    <div className="col-span-4 text-primary font-semibold truncate">{item.repoName}</div>
                    <div className="col-span-2 text-center text-danger font-bold">{item.roastScore}/100</div>
                    <div className="col-span-2 text-center">
                      <span className="border border-danger/40 text-danger bg-danger/10 px-2 py-0.5 rounded text-[10px] font-bold">
                        {item.grade}
                      </span>
                    </div>
                    <div className="col-span-3 text-muted text-[11px] truncate">{item.smell}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===== RECEIPTS TAB ===== */}
        {activeTab === 'receipts' && (
          <div className="max-w-[1100px] w-full flex flex-col gap-6 animate-fade-in">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h2 className="font-display font-bold text-2xl text-primary uppercase tracking-tight">RECEIPTS ARCHIVE</h2>
                <p className="font-mono text-xs text-muted mt-1">{receipts.length} roast{receipts.length !== 1 ? 's' : ''} on record</p>
              </div>
              {receipts.length > 0 && (
                <button
                  onClick={clearReceipts}
                  className="font-mono text-xs text-dim hover:text-danger border border-border hover:border-danger px-3 py-1.5 rounded transition-colors"
                >
                  PURGE ALL RECORDS
                </button>
              )}
            </div>

            {receipts.length === 0 ? (
              <div className="bg-surface/90 backdrop-blur-md border border-border rounded-xl p-12 text-center flex flex-col items-center justify-center min-h-[350px]">
                <span className="material-symbols-outlined text-5xl text-dim mb-4">receipt_long</span>
                <h3 className="font-display font-bold text-xl uppercase text-primary mb-2">NO RECEIPTS YET</h3>
                <p className="font-mono text-sm text-muted max-w-md">Submit a repository for roasting and its results will be permanently archived here. Evidence never expires.</p>
                <button
                  onClick={() => setActiveTab('ingest')}
                  className="mt-6 bg-accent text-black font-mono font-bold text-xs uppercase px-5 py-2.5 rounded hover:bg-accent-light transition-colors"
                >
                  INGEST FIRST TARGET →
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-5 flex flex-col gap-3">
                  {receipts.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setSelectedReceipt(r)}
                      className={`text-left bg-surface/90 backdrop-blur-md border rounded-lg p-4 flex flex-col gap-2 transition-all duration-150 hover:border-accent ${selectedReceipt?.id === r.id ? 'border-accent shadow-[0_0_16px_rgba(217,151,83,0.2)]' : 'border-border'}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-accent font-bold truncate max-w-[200px]">{r.repoUrl}</span>
                        <span className={`font-mono text-xs font-black ${gradeColor(r.roastScore)}`}>{r.roastScore}/100</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono text-dim">
                        <span>{r.persona}</span>
                        <span>{new Date(r.timestamp).toLocaleDateString()}</span>
                      </div>
                      <p className="font-mono text-[11px] text-muted line-clamp-2">{r.roast}</p>
                    </button>
                  ))}
                </div>

                <div className="lg:col-span-7">
                  {selectedReceipt ? (
                    <div className="bg-surface/90 backdrop-blur-md border border-accent rounded-xl p-6 flex flex-col gap-5 animate-burn-in">
                      <div className="flex items-center justify-between border-b border-border pb-3">
                        <span className="font-mono text-accent text-xs font-bold uppercase">// FULL ROAST REPORT</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => downloadShameCardPNG(selectedReceipt)}
                            className="font-mono text-xs border border-border px-2 py-1 rounded text-dim hover:text-accent hover:border-accent transition-colors"
                          >
                            PNG CARD
                          </button>
                          <span className={`font-mono text-lg font-black ${gradeColor(selectedReceipt.roastScore)}`}>{selectedReceipt.roastScore}/100</span>
                        </div>
                      </div>
                      <h3 className="font-display font-bold text-xl text-primary uppercase">{selectedReceipt.repoName}</h3>
                      <p className="font-mono text-sm text-muted leading-relaxed whitespace-pre-wrap">{selectedReceipt.roast}</p>
                      <div className="border-l-2 border-accent pl-4">
                        <p className="font-mono text-xs text-accent uppercase mb-2">CODE SMELLS</p>
                        <ul className="space-y-1.5">
                          {selectedReceipt.codeSmells?.map((s, i) => (
                            <li key={i} className="flex gap-2 font-mono text-xs text-dim">
                              <span className="text-danger">◆</span>{s}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-[#111114] border border-danger/30 rounded-lg p-4">
                        <p className="font-mono text-sm text-danger uppercase text-center font-bold">VERDICT: {selectedReceipt.verdict}</p>
                      </div>
                      <div className="text-[10px] font-mono text-dim flex justify-between border-t border-border pt-3">
                        <span>PERSONA: {selectedReceipt.persona}</span>
                        <span>{new Date(selectedReceipt.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-surface/90 backdrop-blur-md border border-border rounded-xl p-12 flex flex-col items-center justify-center min-h-[300px]">
                      <span className="material-symbols-outlined text-3xl text-dim mb-3">arrow_back</span>
                      <p className="font-mono text-sm text-muted">Select a receipt to view full report</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== TELEMETRY TAB ===== */}
        {activeTab === 'telemetry' && (
          <div className="max-w-[1100px] w-full grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
            <div className="md:col-span-3 flex items-center justify-between border-b border-border pb-4">
              <div>
                <h2 className="font-display font-bold text-2xl text-primary uppercase tracking-tight">GLOBAL TELEMETRY</h2>
                <p className="font-mono text-xs text-muted mt-1">Live cluster metrics · daemon socket connected</p>
              </div>
              <div className="flex items-center gap-2 font-mono text-xs text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                STREAM LIVE
              </div>
            </div>

            {[
              { label: 'TOTAL REPOS INCINERATED', value: '48,291', delta: '+142 today', accent: false },
              { label: 'AVG ROAST SCORE', value: '87.4', delta: 'Catastrophic range', accent: true },
              { label: 'API CALLS TODAY', value: '9,182', delta: 'Under quota', accent: false },
              { label: 'WORST GRADE ISSUED', value: 'F----', delta: 'npm create react-app', accent: true },
              { label: 'MOST COMMON SMELL', value: 'any[]', delta: '#1 for 412 days', accent: false },
              { label: 'RECEIPTS STORED (YOU)', value: receipts.length.toString(), delta: receipts.length === 0 ? 'Start roasting!' : 'Click RECEIPTS tab', accent: receipts.length > 0 },
            ].map(({ label, value, delta, accent }) => (
              <div key={label} className="bg-surface/90 backdrop-blur-md border border-border rounded-xl p-5 flex flex-col gap-3 hover:border-accent transition-colors shadow-lg">
                <span className="font-mono text-[10px] uppercase text-dim tracking-wider">{label}</span>
                <span className={`font-display font-black text-3xl ${accent ? 'text-accent' : 'text-primary'}`}>{value}</span>
                <span className="font-mono text-xs text-muted">{delta}</span>
              </div>
            ))}

            <div className="md:col-span-3 bg-surface/90 backdrop-blur-md border border-border rounded-xl p-6 shadow-lg">
              <p className="font-mono text-xs text-dim uppercase mb-4">ROAST SCORE DISTRIBUTION (LAST 1000 REPOS)</p>
              <div className="flex items-end gap-1.5 h-28">
                {[3,5,8,12,9,15,18,22,30,38,45,52,48,42,35,28,20,15,10,6].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-accent rounded-t opacity-70 hover:opacity-100 transition-opacity"
                    style={{ height: `${(h / 52) * 100}%` }}
                  ></div>
                ))}
              </div>
              <div className="flex justify-between font-mono text-[10px] text-dim mt-3 border-t border-border pt-2">
                <span>0 (MIRACULOUS)</span>
                <span>50 (MEDIOCRE)</span>
                <span>100 (CONDEMNED)</span>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="w-full bg-[#111114]/90 backdrop-blur-md border-t border-border text-[11px] font-mono mt-auto z-40">
        <div className="max-w-[1440px] mx-auto px-6 h-12 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-dim">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
              <span className="text-muted">NODE: us-east-worker-09</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-dim">
            <Link href="/privacy" className="text-muted hover:text-accent transition-colors">
              PRIVACY POLICY
            </Link>
            <span>·</span>
            <Link href="/cookies" className="text-muted hover:text-accent transition-colors">
              COOKIE POLICY
            </Link>
            <span>·</span>
            <a className="text-muted hover:text-accent transition-colors" href="https://instagram.com/Noelpm14" target="_blank" rel="noopener noreferrer">
              CHIEF ROASTER: @Noelpm14
            </a>
            <span className="text-dim hidden sm:inline">© 2026 REPO ROASTER SYSTEM</span>
          </div>
        </div>
      </footer>

      {/* Apology Letter Modal */}
      {showApologyModal && result && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-surface/95 border-2 border-accent max-w-xl w-full p-6 flex flex-col gap-4 shadow-2xl relative rounded-xl font-mono text-xs">
            <button
              type="button"
              onClick={() => setShowApologyModal(false)}
              className="absolute top-4 right-4 text-muted hover:text-primary border border-border px-2 py-0.5 rounded hover:border-accent transition-colors"
            >
              ✕
            </button>
            <div className="border-b border-border pb-2">
              <span className="text-accent font-bold uppercase tracking-wider">// FORMAL RESIGNATION & APOLOGY GENERATOR</span>
              <h3 className="font-display font-bold text-lg text-primary uppercase mt-1">APOLOGY LETTER TO TECH LEAD</h3>
            </div>

            <textarea
              readOnly
              className="bg-[#0e0e10] border border-border p-4 rounded text-muted font-mono text-xs h-64 resize-none focus:outline-none"
              value={getApologyText(result)}
            />

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => copyToClipboard(getApologyText(result))}
                className="flex-1 bg-accent hover:bg-accent-light text-black font-bold uppercase py-2.5 rounded border border-accent transition-colors text-center"
              >
                {copiedApology ? 'COPIED TO CLIPBOARD!' : 'COPY EMAIL TEXT'}
              </button>
              <button
                type="button"
                onClick={() => setShowApologyModal(false)}
                className="flex-1 bg-[#111114] hover:bg-surface text-muted font-bold uppercase py-2.5 rounded border border-border transition-colors text-center"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Codebase Obituary Modal */}
      {showObituaryModal && result && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#0e0e10] border-4 border-muted max-w-md w-full p-8 flex flex-col items-center gap-5 text-center shadow-2xl relative rounded-2xl font-mono">
            <button
              type="button"
              onClick={() => setShowObituaryModal(false)}
              className="absolute top-4 right-4 text-muted hover:text-primary border border-border px-2 py-0.5 rounded hover:border-accent transition-colors"
            >
              ✕
            </button>

            <span className="text-[11px] font-mono text-dim border border-border px-3 py-1 rounded bg-[#131315]">[ R.I.P. ARCHITECTURE ]</span>
            <div className="border-b-2 border-dim pb-3 w-full">
              <h3 className="font-display font-black text-2xl text-primary uppercase tracking-wider">REST IN PEACE</h3>
              <p className="text-accent text-sm font-bold mt-1 uppercase">{result.repoName}</p>
              <p className="text-[10px] text-dim mt-1">BORN: FIRST COMMIT · DIED: {new Date().toLocaleDateString()}</p>
            </div>

            <p className="text-xs text-muted italic leading-relaxed px-2">
              &quot;Here lies {result.repoName}. Succumbed to {result.codeSmells?.[0] || 'cyclic dependencies'} and unhandled promise rejections. May its useEffect loops finally rest in peace.&quot;
            </p>

            <div className="bg-[#131315] border border-border p-3 rounded w-full text-[11px] text-danger font-bold uppercase">
              VERDICT: {result.verdict}
            </div>

            <button
              type="button"
              onClick={() => setShowObituaryModal(false)}
              className="w-full bg-border hover:bg-surface text-primary font-bold uppercase py-2.5 rounded border border-border transition-colors"
            >
              PAY RESPECTS & CLOSE
            </button>
          </div>
        </div>
      )}

      {/* Printable Diploma Certificate Modal */}
      {showCertificateModal && result && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="certificate-modal bg-surface/95 border-4 border-accent max-w-2xl w-full p-8 flex flex-col gap-6 text-center shadow-[0_0_60px_rgba(217,151,83,0.3)] relative rounded-xl">
            <button
              type="button"
              onClick={() => setShowCertificateModal(false)}
              className="absolute top-4 right-4 text-muted hover:text-primary font-mono text-sm border border-border px-2 py-0.5 rounded hover:border-accent transition-colors"
            >
              ✕
            </button>

            <div className="border-b-2 border-accent pb-4 flex flex-col items-center gap-1">
              <span className="font-mono text-xs text-accent uppercase tracking-widest">+ OFFICIAL SYSTEM DECREE +</span>
              <h2 className="font-display font-black text-2xl md:text-3xl text-primary uppercase tracking-tight">
                CERTIFICATE OF ARCHITECTURAL INCOMPETENCE
              </h2>
              <span className="font-mono text-[10px] text-dim">ISSUED BY REPO ROASTER SYSTEM DISASSEMBLY UNIT</span>
            </div>

            <div className="flex flex-col gap-4 font-mono text-xs text-muted leading-relaxed">
              <p>THIS CERTIFICATE CONFIRMS THAT THE CODEBASE KNOWN AS</p>
              <h3 className="font-display font-bold text-2xl text-accent uppercase tracking-wide border-y border-border py-2">
                {result.repoName}
              </h3>
              <p>HAS BEEN THOROUGHLY DISSECTED AND FOUND TO POSSESS AN OVERALL SHAME INDEX OF</p>
              <div className="text-4xl font-black text-danger font-mono my-1">
                {result.roastScore} / 100
              </div>
              <p className="italic border-l-2 border-danger pl-4 text-left text-dim">
                &quot;{result.verdict}&quot;
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6 border-t border-border pt-6 mt-2 font-mono text-[11px]">
              <div className="flex flex-col items-center">
                <div className="border-b border-muted w-36 pb-1 font-bold text-accent">@Noelpm14</div>
                <span className="text-dim text-[10px] mt-1">CHIEF ROASTER</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="border-b border-muted w-36 pb-1 font-bold text-primary">NVIDIA NIM / AI</div>
                <span className="text-dim text-[10px] mt-1">AUTOMATED DISASSEMBLER</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="printable-btn flex-1 bg-accent hover:bg-accent-light text-black font-mono font-bold text-xs uppercase py-3 rounded-lg border border-accent transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[16px]">print</span>
                <span>PRINT / SAVE AS PDF</span>
              </button>
              <button
                type="button"
                onClick={() => setShowCertificateModal(false)}
                className="printable-btn flex-1 bg-[#111114] hover:bg-surface text-muted font-mono font-bold text-xs uppercase py-3 rounded-lg border border-border transition-colors"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Kanye West Meme Modal */}
      {showKanyeModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
          onClick={() => setShowKanyeModal(false)}
        >
          <div
            className="bg-surface/95 border-2 border-accent max-w-md w-full p-6 flex flex-col items-center gap-5 text-center shadow-[0_0_50px_rgba(217,151,83,0.3)] animate-burn-in relative rounded-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowKanyeModal(false)}
              className="absolute top-3 right-3 text-muted hover:text-primary font-mono text-sm border border-border px-2 py-0.5 rounded hover:border-accent transition-colors"
            >
              ✕
            </button>

            <div className="w-52 h-52 rounded-full overflow-hidden border-4 border-accent shadow-lg bg-[#0e0e10]">
              <img
                src="/kanye-meme.png"
                alt="Kanye West Stare Meme"
                className="w-full h-full object-cover scale-105"
              />
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="font-display font-black text-2xl text-accent uppercase tracking-tight">
                &quot;U REALLY THOUGHT WE WOULD DO THAT?&quot;
              </h3>
              <p className="font-mono text-xs text-muted leading-relaxed">
                This is Repo Roaster, not a charitable refactoring service. Write clean code yourself.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowKanyeModal(false)}
              className="w-full bg-accent hover:bg-accent-light text-black font-mono font-bold text-xs uppercase py-3 rounded-lg border border-accent transition-all duration-150 active:scale-95"
            >
              ACCEPT YOUR FATE
            </button>
          </div>
        </div>
      )}

      {/* Cookie Consent Banner */}
      {showCookieBanner && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 z-50 max-w-lg bg-surface/95 border-2 border-accent rounded-xl p-5 shadow-[0_0_30px_rgba(0,0,0,0.8)] animate-burn-in font-mono text-xs flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <span className="text-accent font-bold uppercase tracking-wider">// COOKIE & PRIVACY CONSENT</span>
            <span className="text-[10px] text-dim">GDPR / CCPA COMPLIANT</span>
          </div>
          <p className="text-muted leading-relaxed">
            We use essential local browser storage to save your audit receipts and session choices. Zero third-party advertising cookies. Read our{" "}
            <Link href="/privacy" className="text-accent underline hover:text-accent-light">Privacy Policy</Link> and{" "}
            <Link href="/cookies" className="text-accent underline hover:text-accent-light">Cookie Policy</Link> for details.
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleCookieChoice('accept')}
              className="flex-1 bg-accent hover:bg-accent-light text-black font-bold uppercase py-2 px-3 rounded border border-accent transition-colors text-center"
            >
              ACCEPT ALL
            </button>
            <button
              type="button"
              onClick={() => handleCookieChoice('essential')}
              className="flex-1 bg-[#111114] hover:bg-surface text-muted hover:text-primary font-bold uppercase py-2 px-3 rounded border border-border transition-colors text-center"
            >
              ESSENTIAL ONLY
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
