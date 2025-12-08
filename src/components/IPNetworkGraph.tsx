import React, { useCallback, useRef, useMemo } from 'react';
import ForceGraph2D, { ForceGraphMethods, NodeObject, LinkObject } from 'react-force-graph-2d';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface GraphNode extends NodeObject {
    id: string;
    name: string;
    type: 'patent' | 'paper' | 'entity' | 'person' | 'technology';
    color?: string;
    val?: number;
}

interface GraphLink extends LinkObject {
    source: string;
    target: string;
    type: 'cites' | 'authored' | 'filed' | 'focuses_on';
}

interface IPNetworkGraphProps {
    nodes: GraphNode[];
    links: GraphLink[];
    width?: number;
    height?: number;
    onNodeClick?: (node: GraphNode) => void;
}

const nodeColors: Record<string, string> = {
    patent: '#f97316', // Orange
    paper: '#3b82f6', // Blue
    entity: '#10b981', // Green
    person: '#8b5cf6', // Purple
    technology: '#ec4899', // Pink
};

export const IPNetworkGraph: React.FC<IPNetworkGraphProps> = ({
    nodes,
    links,
    width = 800,
    height = 600,
    onNodeClick,
}) => {
    const fgRef = useRef<ForceGraphMethods>();

    const processedNodes = useMemo(() => {
        return nodes.map(node => ({
            ...node,
            color: nodeColors[node.type] || '#6b7280',
            val: node.type === 'entity' ? 20 : node.type === 'patent' ? 10 : 8,
        }));
    }, [nodes]);

    const handleNodeClick = useCallback((node: NodeObject) => {
        if (onNodeClick && node) {
            onNodeClick(node as GraphNode);
        }
        // Center on node
        if (fgRef.current) {
            fgRef.current.centerAt(node.x, node.y, 1000);
            fgRef.current.zoom(2, 1000);
        }
    }, [onNodeClick]);

    const nodeLabel = useCallback((node: NodeObject) => {
        const n = node as GraphNode;
        return `${n.name} (${n.type})`;
    }, []);

    return (
        <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                    <span className="text-2xl">🔗</span>
                    IP Lineage Network
                </CardTitle>
                <div className="flex gap-4 mt-2 text-sm">
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-orange-500"></span> Patent</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-500"></span> Paper</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500"></span> Entity</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-purple-500"></span> Person</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-pink-500"></span> Technology</span>
                </div>
            </CardHeader>
            <CardContent>
                <ForceGraph2D
                    ref={fgRef}
                    graphData={{ nodes: processedNodes, links }}
                    width={width}
                    height={height}
                    nodeLabel={nodeLabel}
                    nodeColor="color"
                    nodeVal="val"
                    linkColor={() => 'rgba(255,255,255,0.3)'}
                    linkDirectionalArrowLength={4}
                    linkDirectionalArrowRelPos={1}
                    onNodeClick={handleNodeClick}
                    backgroundColor="transparent"
                    nodeCanvasObject={(node, ctx, globalScale) => {
                        const n = node as GraphNode;
                        const label = n.name;
                        const fontSize = 12 / globalScale;
                        ctx.font = `${fontSize}px Sans-Serif`;
                        const textWidth = ctx.measureText(label).width;
                        const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2);

                        // Draw node circle
                        ctx.beginPath();
                        ctx.arc(node.x!, node.y!, n.val || 8, 0, 2 * Math.PI, false);
                        ctx.fillStyle = n.color || '#6b7280';
                        ctx.fill();

                        // Draw label
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillStyle = '#fff';
                        ctx.fillText(label, node.x!, (node.y || 0) + (n.val || 8) + fontSize);
                    }}
                />
            </CardContent>
        </Card>
    );
};

export default IPNetworkGraph;
