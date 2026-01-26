'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Eye, EyeOff, Shield, Share2, Globe, Lock, Cpu } from 'lucide-react';

interface ProtocolAccess {
    id: string;
    name: string;
    type: 'DEX' | 'DAO' | 'Lending' | 'Social';
    status: 'shielded' | 'attested' | 'blocked';
    lastAccess: string;
}

const INITIAL_PROTOCOLS: ProtocolAccess[] = [
    { id: '1', name: 'Jupiter Aggregator', type: 'DEX', status: 'attested', lastAccess: '2h ago' },
    { id: '2', name: 'Realms Governance', type: 'DAO', status: 'shielded', lastAccess: '1d ago' },
    { id: '3', name: 'Drift Protocol', type: 'Lending', status: 'blocked', lastAccess: 'Never' },
];

export default function SelectiveVisibility() {
    const [protocols, setProtocols] = useState(INITIAL_PROTOCOLS);

    const toggleStatus = (id: string) => {
        setProtocols(prev => prev.map(p => {
            if (p.id !== id) return p;
            const nextStatus: Record<ProtocolAccess['status'], ProtocolAccess['status']> = {
                'shielded': 'attested',
                'attested': 'blocked',
                'blocked': 'shielded'
            };
            return { ...p, status: nextStatus[p.status] };
        }));
    };

    return (
        <div className="glass p-8 relative flex flex-col h-full border-primary/20">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[60px] rounded-full pointer-events-none"></div>

            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center border border-primary/10">
                        <Settings className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold">Selective Visibility</h3>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest font-mono">Confidential Identity Management</p>
                    </div>
                </div>
                <div className="px-3 py-1 rounded-full bg-black/40 border border-white/10 text-[9px] font-black text-secondary tracking-tighter animate-pulse">
                    TEE ENCLAVE ACTIVE
                </div>
            </div>

            <div className="space-y-4 flex-grow">
                {protocols.map((protocol, i) => (
                    <motion.div
                        key={protocol.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-all group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-black/40 flex items-center justify-center text-white/20 group-hover:text-primary transition-colors">
                                {protocol.type === 'DEX' ? <Globe className="w-5 h-5" /> :
                                    protocol.type === 'DAO' ? <Share2 className="w-5 h-5" /> :
                                        <Cpu className="w-5 h-5" />}
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-white/90">{protocol.name}</h4>
                                <p className="text-[10px] text-white/30 uppercase tracking-widest">{protocol.type} • {protocol.lastAccess}</p>
                            </div>
                        </div>

                        <button
                            onClick={() => toggleStatus(protocol.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${protocol.status === 'shielded' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                                    protocol.status === 'attested' ? 'bg-primary/10 text-primary border border-primary/20' :
                                        'bg-red-500/10 text-red-500 border border-red-500/20'
                                }`}
                        >
                            {protocol.status === 'shielded' ? <Lock className="w-3 h-3" /> :
                                protocol.status === 'attested' ? <Eye className="w-3 h-3" /> :
                                    <EyeOff className="w-3 h-3" />}
                            {protocol.status}
                        </button>
                    </motion.div>
                ))}
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                    <span className="text-[9px] text-white/20 uppercase font-black tracking-widest leading-none">Global Stealth</span>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: '85%' }}
                            className="h-full bg-secondary shadow-[0_0_10px_rgba(20,241,149,0.5)]"
                        />
                    </div>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-[9px] text-white/20 uppercase font-black tracking-widest leading-none">Attestation Reliability</span>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: '99%' }}
                            className="h-full bg-primary shadow-[0_0_10px_rgba(153,69,255,0.5)]"
                        />
                    </div>
                </div>
            </div>

            <p className="mt-6 text-[10px] text-white/20 italic leading-relaxed">
                * Kimiko's "Zen" layer automatically rotates your confidential metadata every 24 hours to prevent cross-dApp correlation.
            </p>
        </div>
    );
}
