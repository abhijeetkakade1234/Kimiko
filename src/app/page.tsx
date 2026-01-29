'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, EyeOff, Search, Loader2, ChevronRight, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LandingPage() {
  const [wallet, setWallet] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet) return;
    setLoading(true);
    // Navigation to analysis view
    router.push(`/analyze/${wallet}`);
  };

  return (
    <main className="min-h-screen bg-[#020204] text-white flex flex-col items-center relative overflow-hidden">
      {/* Tactical HUD Background System */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-grid opacity-20"></div>
        <div className="absolute inset-0 bg-seigaiha"></div>
        <div className="absolute inset-0 bg-grain mix-blend-soft-light opacity-30"></div>
        <div className="absolute inset-0 bg-scanlines opacity-[0.03]"></div>

        {/* HUD Corners */}
        <div className="hud-corner hud-corner-tl"></div>
        <div className="hud-corner hud-corner-tr"></div>
        <div className="hud-corner hud-corner-bl"></div>
        <div className="hud-corner hud-corner-br"></div>

        {/* Katakana Texture Floor */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] select-none overflow-hidden bg-katakana-floor">
          <div className="text-[14vw] font-black leading-none break-all whitespace-pre-wrap text-center">
            キミコ プライバシー セキュリティ ゼン キミコ プライバシー セキュリティ ゼン キミコ プライバシー セキュリティ ゼン
          </div>
        </div>

        {/* Sharp Ambient Light (Non-organic) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-screen bg-gradient-to-b from-primary/20 via-transparent to-transparent"></div>
        <div className="absolute top-1/2 left-0 w-screen h-px bg-gradient-to-r from-transparent via-secondary/10 to-transparent"></div>
      </div>

      {/* Navbar Container */}
      <nav className="fixed top-0 inset-x-0 z-50 h-20 bg-[#020204]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary p-[1px]">
              <div className="w-full h-full rounded-xl bg-black flex items-center justify-center overflow-hidden">
                <img src="/logo.svg" alt="K" className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="flex flex-col items-start -space-y-1">
              <span className="text-2xl font-black tracking-tighter uppercase italic">Kimiko</span>
              <span className="text-[10px] text-primary font-mono tracking-[0.4em] font-bold">キミコ</span>
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
            <Link href="/" className="hover:text-primary transition-colors">Analyzer</Link>
            <Link href="/guide" className="hover:text-primary transition-colors">Privacy Guide</Link>
            <Link href="/docs" className="hover:text-primary transition-colors">Documentation</Link>
          </div>
        </div>
      </nav>

      <div className="w-full pt-32 pb-20 px-6 flex flex-col items-center max-w-4xl z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 mb-8 text-[11px] font-bold uppercase tracking-widest text-secondary">
          <Sparkles className="w-3 h-3" />
          <span>Compliant Privacy for Solana</span>
        </div>

        {/* Title */}
        <div className="relative mb-8 text-center">
          <div className="absolute -left-16 top-1/2 -translate-y-1/2 hidden xl:block">
            <span className="text-[10px] text-white/20 vertical-text font-bold tracking-[1em] uppercase">プライバシー</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-[0.9] text-center">
            The Digital <br />
            <span className="text-gradient">Zen of Privacy.</span>
          </h1>
        </div>

        <p className="text-xl text-white/40 mb-12 max-w-2xl text-center leading-relaxed font-light">
          Master your on-chain visibility. Measure leakage and obtain
          Zen-grade risk assessment through the lens of <span className="text-primary italic">Selective Visibility</span>.
        </p>

        {/* Input Form */}
        <form onSubmit={handleAnalyze} className="relative w-full max-w-2xl mx-auto mb-16">
          <div className="glass p-2 flex items-center gap-2 focus-within:ring-2 ring-primary/50 transition-all duration-300 rounded-2xl overflow-hidden">
            <div className="pl-4 text-white/40">
              <Search className="w-6 h-6" />
            </div>
            <input
              type="text"
              placeholder="Enter Solana Wallet Address..."
              className="w-full bg-transparent border-none focus:ring-0 text-lg py-4 px-2 outline-none text-white placeholder:text-white/20"
              value={wallet}
              onChange={(e) => setWallet(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !wallet}
              className="shimmer-btn bg-primary hover:bg-primary/80 disabled:opacity-50 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95 whitespace-nowrap"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Analyze Now'}
              {!loading && <ChevronRight className="w-5 h-5" />}
            </button>
          </div>

          <div className="mt-8 flex flex-col items-center gap-6">
            <div className="flex flex-wrap justify-center gap-6 text-[10px] text-white/30 font-bold uppercase tracking-widest">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-secondary" />
                <span>Zero KYC</span>
              </div>
              <div className="flex items-center gap-2">
                <EyeOff className="w-4 h-4 text-primary" />
                <span>Private Engine</span>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3">
              <span className="text-[10px] text-white/20 uppercase tracking-[0.3em] font-bold underline decoration-primary/30">Test the System</span>
              <div className="flex flex-wrap justify-center gap-3">
                {[
                  { label: '🟢', addr: 'Gv6H5r6X7Hn9pQx7R9mK2z1vA8n3L9pQx7R9mK2z1vA8' },
                  { label: '🟡', addr: '3z9vKArfBvUpNcAsrE2HjS2mQ2z1vA8n3L9pQx7R9mK2' },
                  { label: '🔴', addr: 'Hv4KArfBvUpNcAsrE2HjS2mQ2z1vA8n3L9pQx7R9mK2z1vA8n3L9pQx7R9mK2z' }
                ].map((sample) => (
                  <button
                    key={sample.addr}
                    type="button"
                    onClick={() => setWallet(sample.addr)}
                    className="glass px-4 py-2 hover:bg-white/10 transition-all text-[11px] font-mono text-white/40 hover:text-white flex items-center gap-2 rounded-lg"
                  >
                    <span>{sample.label}</span>
                    {sample.addr.slice(0, 4)}...{sample.addr.slice(-4)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </form>

        {/* Track 2 Section */}
        <div className="w-full max-w-2xl mx-auto glass p-8 border-primary/20 bg-primary/5 text-center mb-32 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-5 italic text-[10px]">SELECTIVE PRIVACY</div>
          <h3 className="text-xl font-bold mb-4">Privacy is not about <span className="text-secondary italic">hiding</span>.</h3>
          <p className="text-white/50 leading-relaxed mb-8 text-sm">
            It's about <span className="text-white font-bold">Selective Visibility</span>. In a world of total surveillance,
            Kimiko gives you the power to choose what the world sees and what stays yours.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <div className="px-4 py-2 rounded-lg bg-black/40 border border-white/5 text-[9px] font-bold uppercase tracking-widest text-primary">
              Encryption Enabled
            </div>
            <div className="px-4 py-2 rounded-lg bg-black/40 border border-white/5 text-[9px] font-bold uppercase tracking-widest text-secondary">
              Zero-Knowledge Proofs
            </div>
          </div>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left w-full">
          {[
            {
              icon: <EyeOff className="text-primary" />,
              title: "Leakage Maps",
              description: "Visualize exactly how your transactional behavior links to your identity."
            },
            {
              icon: <Shield className="text-secondary" />,
              title: "Compliance Tiers",
              description: "Institutional-grade risk assessment based on behavior, not identity."
            },
            {
              icon: <Search className="text-accent" />,
              title: "Actionable Intel",
              description: "Step-by-step recommendations to reduce your public footprint."
            }
          ].map((feature, i) => (
            <FeatureCard key={i} {...feature} />
          ))}
        </div>
      </div>
    </main >
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="glass p-8 hover:bg-white/5 transition-all duration-300 group cursor-default h-full hover:-translate-y-1">
      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-white/10 transition-all">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-white/40 leading-relaxed text-sm">{description}</p>
    </div>
  );
}
