'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, EyeOff, Search, Loader2, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

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
    <main className="min-h-screen bg-gradient-mesh flex flex-col items-center justify-center p-6 text-center">
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 blur-[120px] rounded-full animate-pulse-slow"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="z-10 max-w-4xl w-full"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-8 text-sm font-medium text-secondary"
        >
          <Shield className="w-4 h-4" />
          <span>Compliant Privacy for Solana</span>
        </motion.div>

        {/* Title */}
        <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-6">
          Unmask Your <br />
          <span className="text-gradient">On-Chain Identity.</span>
        </h1>

        <p className="text-xl md:text-2xl text-white/60 mb-12 max-w-2xl mx-auto leading-relaxed">
          Measure privacy leakage, identify deanonymization risks, and obtain
          compliance tiering without sacrificing your anonymity.
        </p>

        {/* Input Form */}
        <form onSubmit={handleAnalyze} className="relative max-w-2xl mx-auto">
          <div className="glass p-2 flex items-center gap-2 focus-within:ring-2 ring-primary/50 transition-all duration-300">
            <div className="pl-4 text-white/40">
              <Search className="w-6 h-6" />
            </div>
            <input
              type="text"
              placeholder="Enter Solana Wallet Address..."
              className="w-full bg-transparent border-none focus:ring-0 text-lg py-4 px-2 outline-none"
              value={wallet}
              onChange={(e) => setWallet(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !wallet}
              className="bg-primary hover:bg-primary/80 disabled:opacity-50 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95 whitespace-nowrap"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Analyze Now'}
              {!loading && <ChevronRight className="w-5 h-5" />}
            </button>
          </div>

          <div className="mt-4 flex flex-wrap justify-center gap-6 text-sm text-white/40 font-medium">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-secondary" />
              <span>Zero KYC Required</span>
            </div>
            <div className="flex items-center gap-2">
              <EyeOff className="w-4 h-4 text-primary" />
              <span>Privacy-First Analysis</span>
            </div>
          </div>
        </form>

        {/* Features Preview */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <FeatureCard
            icon={<EyeOff className="text-primary" />}
            title="Leakage Maps"
            description="Visualize exactly how your transactional behavior links to your real-world identity."
          />
          <FeatureCard
            icon={<Shield className="text-secondary" />}
            title="Compliance Tiers"
            description="Get institutional-grade risk assessment based on behavioral patterns, not identity."
          />
          <FeatureCard
            icon={<Search className="text-accent" />}
            title="Actionable Intel"
            description="Step-by-step recommendations to improve your privacy score and reduce exposure."
          />
        </div>
      </motion.div>
    </main>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="glass p-8 hover:bg-white/5 transition-colors group">
      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-white/40 leading-relaxed">{description}</p>
    </div>
  );
}
