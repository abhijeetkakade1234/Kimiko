'use client';

import { motion } from 'framer-motion';
import { LeakageVector } from '@/lib/types';
import { AlertCircle, AlertTriangle, Info, Zap } from 'lucide-react';

interface LeakageVectorsProps {
    vectors: LeakageVector[];
}

export default function LeakageVectors({ vectors }: LeakageVectorsProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass p-8"
        >
            <div className="flex items-center gap-2 mb-8">
                <h3 className="text-xl font-bold">Leakage Vectors</h3>
                <span className="text-white/40 text-sm font-medium">({vectors.length} Identified)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vectors.map((vector, i) => (
                    <motion.div
                        key={vector.category}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + (i * 0.1) }}
                        className="flex flex-col p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${vector.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-500' :
                                        vector.severity === 'HIGH' ? 'bg-orange-500/20 text-orange-500' :
                                            'bg-yellow-500/20 text-yellow-500'
                                    }`}>
                                    {vector.severity === 'CRITICAL' ? <Zap className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                                </div>
                                <h4 className="font-bold text-white/90">{vector.category.replace('_', ' ')}</h4>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${vector.severity === 'CRITICAL' ? 'bg-red-500 text-white' :
                                    'bg-white/10 text-white/60'
                                }`}>
                                {vector.severity}
                            </span>
                        </div>

                        <p className="text-sm text-white/40 leading-relaxed mb-6">
                            {vector.description}
                        </p>

                        <div className="mt-auto pt-4 border-t border-white/5">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-white/40">Confidence Score</span>
                                <span className="font-mono text-secondary">98%</span>
                            </div>
                        </div>
                    </motion.div>
                ))}

                {vectors.length === 0 && (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center opacity-40">
                        <Info className="w-12 h-12 mb-4" />
                        <p className="font-medium text-lg">No significant leakage vectors detected.</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
