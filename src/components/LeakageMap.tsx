'use client';

import { motion } from 'framer-motion';
import { Network, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface LeakageMapProps {
    wallet: string;
}

// Simulated network for MVP (Actual implementation could use D3.js or a real graph)
export default function LeakageMap({ wallet }: LeakageMapProps) {
    const [nodes, setNodes] = useState<{ id: number, x: number, y: number, color: string, label: string }[]>([]);

    useEffect(() => {
        // Generate some interesting looking nodes
        const newNodes = Array.from({ length: 12 }).map((_, i) => {
            const angle = (i / 12) * Math.PI * 2;
            const radius = 80 + Math.random() * 80;
            return {
                id: i,
                x: Math.cos(angle) * radius,
                y: Math.sin(angle) * radius,
                color: i % 3 === 0 ? 'var(--primary)' : i % 3 === 1 ? 'var(--secondary)' : 'var(--glass-border)',
                label: i % 4 === 0 ? 'CEX Entry' : i % 3 === 0 ? 'DEX Swap' : 'P2P'
            };
        });
        setNodes(newNodes);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="glass p-8 min-h-[500px] relative flex flex-col"
        >
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
                        <Network className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold">Identity Leakage Map</h3>
                </div>

                <div className="flex items-center gap-2">
                    <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all">
                        <ZoomIn className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all">
                        <ZoomOut className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all">
                        <Maximize2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="flex-grow flex items-center justify-center border border-white/5 rounded-2xl bg-black/20 overflow-hidden relative">
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(var(--foreground) 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>

                {/* Central Node */}
                <motion.div
                    animate={{ boxShadow: ['0 0 0 0 rgba(153, 69, 255, 0)', '0 0 40px 10px rgba(153, 69, 255, 0.2)', '0 0 0 0 rgba(153, 69, 255, 0)'] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                    className="w-16 h-16 rounded-full bg-primary flex items-center justify-center z-10 relative"
                >
                    <div className="absolute inset-0 rounded-full border-4 border-white/20 scale-110"></div>
                    <span className="text-[10px] uppercase font-black tracking-widest text-white">Target</span>
                </motion.div>

                {/* Outer Nodes & Lines */}
                {nodes.map((node) => (
                    <div key={node.id} className="absolute" style={{ transform: `translate(${node.x}px, ${node.y}px)` }}>
                        {/* Connection Line */}
                        <svg className="absolute pointer-events-none" style={{ top: -node.y, left: -node.x, width: Math.abs(node.x), height: Math.abs(node.y), overflow: 'visible' }}>
                            <motion.line
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                x1={node.x} y1={node.y} x2={0} y2={0}
                                stroke={node.color} strokeWidth="1" strokeOpacity="0.2"
                            />
                        </svg>

                        {/* Node */}
                        <motion.div
                            whileHover={{ scale: 1.2 }}
                            className="w-6 h-6 rounded-full flex items-center justify-center relative cursor-help group"
                            style={{ backgroundColor: node.color }}
                        >
                            <div className="absolute top-8 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-1 rounded bg-black/80 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                {node.label}
                            </div>
                        </motion.div>
                    </div>
                ))}

                {/* Legend */}
                <div className="absolute bottom-6 left-6 flex flex-col gap-2">
                    <LegendItem color="var(--primary)" label="High Exposure" />
                    <LegendItem color="var(--secondary)" label="Direct Proxy" />
                    <LegendItem color="var(--glass-border)" label="Observed Link" />
                </div>
            </div>

            <p className="mt-6 text-sm text-white/40 leading-relaxed italic text-center">
                Relationships visualised are directly proportional to transaction frequency and volume.
                Higher density indicates stronger deanonymization risk.
            </p>
        </motion.div>
    );
}

function LegendItem({ color, label }: { color: string, label: string }) {
    return (
        <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">{label}</span>
        </div>
    );
}
