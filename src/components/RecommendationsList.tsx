'use client';

import { motion } from 'framer-motion';
import { Recommendation } from '@/lib/types';
import { Lightbulb, ArrowUpCircle, CheckCircle2 } from 'lucide-react';

interface RecommendationsListProps {
    recommendations: Recommendation[];
}

export default function RecommendationsList({ recommendations }: RecommendationsListProps) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="glass p-8 h-full"
        >
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-accent/20 text-accent flex items-center justify-center">
                    <Lightbulb className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold">Recommendations</h3>
            </div>

            <div className="space-y-4">
                {recommendations.map((rec, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + (i * 0.1) }}
                        className="group p-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/[0.08] transition-all"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${rec.priority === 'HIGH' ? 'bg-primary/20 text-primary' :
                                    rec.priority === 'MEDIUM' ? 'bg-secondary/20 text-secondary' :
                                        'bg-white/10 text-white/40'
                                }`}>
                                {rec.priority} Priority
                            </span>
                            <div className="flex items-center gap-1 text-secondary text-xs font-bold">
                                <ArrowUpCircle className="w-3 h-3" />
                                <span>+{rec.estimatedImprovement} pts</span>
                            </div>
                        </div>

                        <h4 className="font-bold mb-2 group-hover:text-secondary transition-colors">{rec.title}</h4>
                        <p className="text-sm text-white/40 leading-relaxed">
                            {rec.description}
                        </p>

                        <button className="mt-6 w-full py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold flex items-center justify-center gap-2 transition-all">
                            Mark as Resolved <CheckCircle2 className="w-4 h-4" />
                        </button>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}
