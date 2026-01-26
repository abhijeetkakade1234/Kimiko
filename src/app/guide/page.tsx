import { motion } from 'framer-motion';
import { Shield, Lock, EyeOff, Search, ChevronRight, Sparkles, Sun, Moon, Eye, User, Share2 } from 'lucide-react';
import Link from 'next/link';

export default function GuidePage() {
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
                        ZEN ZEN ZEN ZEN ZEN ZEN ZEN ZEN ZEN ZEN
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
                        <Link href="/guide" className="text-white hover:text-primary transition-colors underline decoration-primary underline-offset-4">Privacy Guide</Link>
                        <Link href="/docs" className="hover:text-primary transition-colors">Documentation</Link>
                    </div>
                </div>
            </nav>

            <div className="w-full pt-40 pb-20 px-6 max-w-4xl">
                <header className="mb-20 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-secondary/20 bg-secondary/5 mb-8 text-[10px] font-bold uppercase tracking-[0.2em] text-secondary">
                        Privacy Without Jargon
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black mb-8 leading-tight">
                        The Philosophy of <br />
                        <span className="text-gradient">Selective Visibility.</span>
                    </h1>
                    <p className="text-xl text-white/40 max-w-2xl mx-auto leading-relaxed font-light">
                        In crypto, "Privacy" is often misunderstood as hiding from the law.
                        At Kimiko, we believe it's about <span className="text-white italic">Consensual Disclosure</span>.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
                    <div className="glass p-10 border-t-2 border-primary">
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-6">
                            <Eye className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4 italic uppercase">The Public Book</h3>
                        <p className="text-white/40 leading-relaxed">
                            Blockchains are not anonymous; they are pseudonymous. By default, every transaction you make is like writing a sentence in a public book that everyone can read.
                            Institutional scrapers use this to profile you into "Whales", "Degen Traders", or "KYV targets".
                        </p>
                    </div>

                    <div className="glass p-10 border-t-2 border-secondary">
                        <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center mb-6">
                            <Shield className="w-6 h-6 text-secondary" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4 italic uppercase">Selective Zen</h3>
                        <p className="text-white/40 leading-relaxed">
                            Kimiko allows you to close specific pages of that book. You choose what to reveal
                            (e.g., your credit worthiness) without showing what you bought for lunch.
                            This is the "Zen" of modern crypto privacy.
                        </p>
                    </div>
                </div>

                <section className="mb-20">
                    <h2 className="text-3xl font-bold mb-10 text-center uppercase tracking-widest italic">Common Privacy Leaks</h2>
                    <div className="space-y-4">
                        {[
                            { icon: <User />, name: "Identity Linking", desc: "Using the same wallet for your ENS domain and your degen trading." },
                            { icon: <Share2 />, name: "Timing Correlations", desc: "Cashing out at the exact same hour every week, creating a fingerprint." },
                            { icon: <Moon />, name: "CEX Dusting", desc: "Direct transfers from major exchanges that permanently link your real ID to your on-chain keys." }
                        ].map((leak, i) => (
                            <div key={i} className="flex items-center gap-6 p-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group">
                                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/20 group-hover:text-primary transition-all">
                                    {leak.icon}
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg">{leak.name}</h4>
                                    <p className="text-white/40 text-sm">{leak.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <div className="text-center">
                    <Link href="/" className="shimmer-btn bg-white text-black px-12 py-5 rounded-full font-black text-sm uppercase tracking-widest hover:scale-105 transition-all inline-block">
                        Start Your Journey
                    </Link>
                </div>
            </div>
        </main>
    );
}
