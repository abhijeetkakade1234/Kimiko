'use client';

import { motion } from 'framer-motion';

interface PrivacyScoreProps {
    score: number;
}

export default function PrivacyScore({ score }: PrivacyScoreProps) {
    const getScoreColor = () => {
        if (score >= 70) return 'text-secondary';
        if (score >= 40) return 'text-yellow-500';
        return 'text-red-500';
    };

    const circumference = 2 * Math.PI * 90;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass p-8 relative overflow-hidden group"
        >
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold">Privacy Health</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-bold bg-white/5 ${getScoreColor()}`}>
                    {score >= 70 ? 'Optimal' : score >= 40 ? 'Moderate' : 'Critical'}
                </span>
            </div>

            <div className="flex items-center justify-center py-6">
                <div className="relative w-48 h-48">
                    {/* Background Ring */}
                    <svg className="w-full h-full transform -rotate-90">
                        <circle
                            cx="96"
                            cy="96"
                            r="90"
                            stroke="currentColor"
                            strokeWidth="12"
                            fill="transparent"
                            className="text-white/5"
                        />
                        {/* Progress Ring */}
                        <motion.circle
                            initial={{ strokeDashoffset: circumference }}
                            animate={{ strokeDashoffset }}
                            transition={{ duration: 1.5, ease: 'easeOut' }}
                            cx="96"
                            cy="96"
                            r="90"
                            stroke="currentColor"
                            strokeWidth="12"
                            strokeDasharray={circumference}
                            fill="transparent"
                            strokeLinecap="round"
                            className={getScoreColor()}
                        />
                    </svg>

                    {/* Center Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <motion.span
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 }}
                            className={`text-6xl font-black ${getScoreColor()}`}
                        >
                            {score}
                        </motion.span>
                        <span className="text-sm font-bold text-white/20 uppercase tracking-widest mt-[-4px]">Score</span>
                    </div>
                </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-xl p-4">
                    <span className="text-xs text-white/40 block mb-1">Max Score</span>
                    <span className="text-lg font-bold">100</span>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                    <span className="text-xs text-white/40 block mb-1">Risk Offset</span>
                    <span className="text-lg font-bold text-red-400">-{100 - score}</span>
                </div>
            </div>
        </motion.div>
    );
}
