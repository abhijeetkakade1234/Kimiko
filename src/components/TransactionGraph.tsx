'use client';

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { GraphData, GraphNode, GraphLink } from '@/lib/graph/builder';

interface TransactionGraphProps {
    data: GraphData;
}

// Extend D3 types to include our custom node properties
interface D3Node extends GraphNode, d3.SimulationNodeDatum { }
interface D3Link extends d3.SimulationLinkDatum<D3Node> {
    weight: number;
}

const TransactionGraph: React.FC<TransactionGraphProps> = ({ data }) => {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!svgRef.current || !data.nodes.length) return;

        const container = svgRef.current.parentElement;
        const width = container?.clientWidth || 800;
        const height = container?.clientHeight || 600;

        // Clear previous SVG content
        d3.select(svgRef.current).selectAll('*').remove();

        const svg = d3.select(svgRef.current)
            .attr('width', width)
            .attr('height', height)
            .attr('viewBox', [0, 0, width, height])
            .attr('style', 'max-width: 100%; height: auto;');

        const g = svg.append('g');

        // Setup Zoom
        const zoom = d3.zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.1, 4])
            .on('zoom', (event) => {
                g.attr('transform', event.transform);
            });

        svg.call(zoom as any);

        const nodes: D3Node[] = data.nodes.map(d => ({
            ...d,
            x: width / 2 + (Math.random() - 0.5) * 100,
            y: height / 2 + (Math.random() - 0.5) * 100
        }));
        const links: D3Link[] = data.links.map(d => ({
            source: d.source,
            target: d.target,
            weight: d.weight
        }));

        // Simulation setup
        const simulation = d3.forceSimulation<D3Node>(nodes)
            .force('link', d3.forceLink<D3Node, D3Link>(links).id(d => d.id).distance(100))
            .force('charge', d3.forceManyBody().strength(-300))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('x', d3.forceX(width / 2).strength(0.07))
            .force('y', d3.forceY(height / 2).strength(0.07));

        // Links
        const link = g.append('g')
            .attr('stroke', 'rgba(255, 255, 255, 0.1)')
            .attr('stroke-opacity', 0.6)
            .selectAll('line')
            .data(links)
            .join('line')
            .attr('stroke-width', d => Math.sqrt(d.weight));

        // Nodes
        const node = g.append('g')
            .attr('stroke', '#fff')
            .attr('stroke-width', 1.5)
            .selectAll('circle')
            .data(nodes)
            .join('circle')
            .attr('r', d => d.size)
            .attr('fill', d => {
                if (d.type === 'central') return '#6366f1';
                if (d.type === 'exchange') return '#f59e0b';
                if (d.type === 'bridge') return '#10b981';
                return '#94a3b8';
            })
            .call(d3.drag<SVGCircleElement, D3Node>()
                .on('start', dragstarted)
                .on('drag', dragged)
                .on('end', dragended) as any);

        // Node labels
        const labels = g.append('g')
            .selectAll('text')
            .data(nodes)
            .join('text')
            .attr('font-size', '10px')
            .attr('fill', 'rgba(255, 255, 255, 0.6)')
            .attr('text-anchor', 'middle')
            .attr('dy', d => -d.size - 5)
            .text(d => d.label);

        node.append('title')
            .text(d => `${d.id}\nType: ${d.type}`);

        simulation.on('tick', () => {
            link
                .attr('x1', d => (d.source as any).x)
                .attr('y1', d => (d.source as any).y)
                .attr('x2', d => (d.target as any).x)
                .attr('y2', d => (d.target as any).y);

            node
                .attr('cx', d => d.x!)
                .attr('cy', d => d.y!);

            labels
                .attr('x', d => d.x!)
                .attr('y', d => d.y!);
        });

        function dragstarted(event: any) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }

        function dragged(event: any) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }

        function dragended(event: any) {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        }

        return () => {
            simulation.stop();
        };
    }, [data]);

    return (
        <div className="w-full h-[500px] glass rounded-2xl overflow-hidden relative bg-black/40">
            <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
            <div className="absolute top-4 left-4 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs text-white/60">
                    <div className="w-3 h-3 rounded-full bg-[#6366f1]" />
                    <span>Your Wallet</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-white/60">
                    <div className="w-3 h-3 rounded-full bg-[#f59e0b]" />
                    <span>Exchanges</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-white/60">
                    <div className="w-3 h-3 rounded-full bg-[#10b981]" />
                    <span>Bridges</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-white/60">
                    <div className="w-3 h-3 rounded-full bg-[#94a3b8]" />
                    <span>Other Wallets</span>
                </div>
            </div>
            <div className="absolute bottom-4 right-4 text-[10px] text-white/20">
                Pinch/Scroll to zoom • Drag to move
            </div>
        </div>
    );
};


export default TransactionGraph;
