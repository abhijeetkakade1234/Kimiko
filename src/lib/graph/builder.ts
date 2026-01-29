import { TransactionNode } from '../types';
import knownAddresses from '../data/known-addresses.json';

export interface GraphData {
    nodes: GraphNode[];
    links: GraphLink[];
}

export interface GraphNode {
    id: string;
    label: string;
    type: 'central' | 'exchange' | 'bridge' | 'other';
    size: number;
}

export interface GraphLink {
    source: string;
    target: string;
    weight: number;
}

export const buildGraphData = (
    centralWallet: string,
    transactions: TransactionNode[]
): GraphData => {
    const nodesMap = new Map<string, GraphNode>();
    const linksMap = new Map<string, GraphLink>();

    // Add central node
    nodesMap.set(centralWallet, {
        id: centralWallet,
        label: 'Me',
        type: 'central',
        size: 20
    });

    const cexAddresses = new Set(knownAddresses.categories.exchanges.map((e: any) => e.address));
    const bridgeAddresses = new Set(knownAddresses.categories.bridges.map((e: any) => e.address));
    const defiAddresses = new Set(knownAddresses.categories.defi_protocols.map((e: any) => e.address));

    transactions.forEach(tx => {
        tx.counterparties.forEach(addr => {
            if (!nodesMap.has(addr)) {
                let type: GraphNode['type'] = 'other';
                if (cexAddresses.has(addr)) type = 'exchange';
                else if (bridgeAddresses.has(addr)) type = 'bridge';
                else if (defiAddresses.has(addr)) type = 'exchange'; // Treat protocols as hub nodes too

                nodesMap.set(addr, {
                    id: addr,
                    label: addr.slice(0, 4) + '...' + addr.slice(-4),
                    type,
                    size: 8
                });
            }

            // Increment node size
            const node = nodesMap.get(addr)!;
            if (node.id !== centralWallet) {
                node.size = Math.min(30, node.size + 2);
            }

            // Add link
            const linkKey = [centralWallet, addr].sort().join('-');
            if (!linksMap.has(linkKey)) {
                linksMap.set(linkKey, {
                    source: centralWallet,
                    target: addr,
                    weight: 1
                });
            } else {
                linksMap.get(linkKey)!.weight += 1;
            }
        });
    });

    return {
        nodes: Array.from(nodesMap.values()),
        links: Array.from(linksMap.values())
    };
};
