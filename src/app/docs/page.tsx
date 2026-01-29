import { motion } from 'framer-motion';
import { Shield, BookOpen, Lock, EyeOff, Search, ChevronRight, Sparkles, Scroll, Zap, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function DocumentationPage() {
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
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] select-none overflow-hidden bg-katakana-floor">
                    <div className="text-[14vw] font-black leading-none break-all whitespace-pre-wrap text-center uppercase">
                        DOCS DOCS DOCS DOCS DOCS DOCS DOCS DOCS DOCS
                    </div>
                </div>
            </div>
            {/* Navbar */}
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
                        <Link href="/docs" className="text-white hover:text-primary transition-colors underline decoration-primary underline-offset-4">Documentation</Link>
                    </div>
                </div>
            </nav>

            <div className="w-full pt-40 pb-20 px-6 max-w-4xl">
                <header className="mb-16">
                    <div className="flex items-center gap-2 text-primary font-mono text-[10px] tracking-[0.3em] font-black mb-4 uppercase">
                        <Scroll className="w-4 h-4" />
                        <span>Technical Attestations v1.0</span>
                    </div>
                    <h1 className="text-5xl font-black mb-6">Technical Documentation</h1>
                    <p className="text-white/40 text-lg leading-relaxed">
                        Understanding the architecture behind Kimiko's privacy analysis and the Inco Shield attestation system.
                    </p>
                </header>

                <div className="space-y-12">
                    <section className="glass p-8 border-l-4 border-primary">
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-primary" />
                            1. Analysis Engine: Heuristics
                        </h2>
                        <div className="space-y-4 text-white/60 leading-relaxed">
                            <p>
                                Kimiko utilizes a multi-layered heuristic engine called <span className="text-white font-bold italic">"Seishin"</span> to profile wallet behavior without compromising identity.
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-sm">
                                <li><span className="text-white font-medium">Correlation Attack Detection:</span> Analyzing timestamp patterns to identify recurring links between disparate addresses.</li>
                                <li><span className="text-white font-medium">CEX Behavioral Fingerprinting:</span> Identifying deposit/withdraw patterns associated with major exchanges like Binance and Coinbase.</li>
                                <li><span className="text-white font-medium">Protocol Leakage:</span> Identifying "naked" interactions with DeFi protocols that expose net worth and risk profile.</li>
                            </ul>
                        </div>
                    </section>

                    <section className="glass p-8 border-l-4 border-secondary">
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-secondary" />
                            2. Selective Visibility Architecture
                        </h2>
                        <p className="text-white/60 leading-relaxed mb-6">
                            Our core philosophy leverages <span className="text-white font-bold italic">Confidential Computing</span> (TEE) and <span className="text-white font-bold italic">FHE</span> (Fully Homomorphic Encryption) via Inco Lightning.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                <h4 className="font-bold text-sm mb-2 text-white">Trustless Scoring</h4>
                                <p className="text-xs text-white/40 line-clamp-3">Scores are generated on the Solana client and encrypted before being sent to the Inco network for confidential storage.</p>
                            </div>
                            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                <h4 className="font-bold text-sm mb-2 text-white">Privacy Proofs</h4>
                                <p className="text-xs text-white/40 line-clamp-3">Encrypted reputation scores can be verified by 3rd party dApps using Inco's view-key system without revealing the wallet's contents.</p>
                            </div>
                        </div>
                    </section>

                    <section className="glass p-8 bg-blue-500/5 border-primary/20">
                        <h2 className="text-2xl font-bold mb-4">3. API Reference</h2>
                        <p className="text-sm text-white/40 mb-6">Integrate Kimiko's privacy engine into your own dApp.</p>
                        <pre className="p-4 rounded-xl bg-black border border-white/10 font-mono text-xs overflow-x-auto">
                            {`// POST /api/analyze
{
  "wallet": "Solana_Address_Here",
  "options": {
    "depth": 50,
    "includeIdentity": true
  }
}`}
                        </pre>
                    </section>
                </div>
            </div>
        </main>
    );
}
