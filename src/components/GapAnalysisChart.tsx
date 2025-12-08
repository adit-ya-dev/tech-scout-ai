import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    Legend,
    ResponsiveContainer,
    Tooltip,
} from 'recharts';

interface GapAnalysisData {
    domain: string;
    entityScore: number; // 0-100
    drdoScore: number; // 0-100
}

interface GapAnalysisChartProps {
    data: GapAnalysisData[];
    entityName: string;
}

export const GapAnalysisChart: React.FC<GapAnalysisChartProps> = ({
    data,
    entityName,
}) => {
    // Calculate gaps and overlaps
    const gaps = data.filter(d => d.entityScore > d.drdoScore + 20);
    const overlaps = data.filter(d => Math.abs(d.entityScore - d.drdoScore) <= 20);
    const advantages = data.filter(d => d.drdoScore > d.entityScore + 20);

    return (
        <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                    <span className="text-2xl">📊</span>
                    Gap & Overlap Analysis: {entityName} vs DRDO
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Radar Chart */}
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart data={data}>
                                <PolarGrid stroke="#475569" />
                                <PolarAngleAxis dataKey="domain" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8' }} />
                                <Radar
                                    name={entityName}
                                    dataKey="entityScore"
                                    stroke="#f97316"
                                    fill="#f97316"
                                    fillOpacity={0.4}
                                />
                                <Radar
                                    name="DRDO"
                                    dataKey="drdoScore"
                                    stroke="#3b82f6"
                                    fill="#3b82f6"
                                    fillOpacity={0.4}
                                />
                                <Legend />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                                    labelStyle={{ color: '#fff' }}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Analysis Summary */}
                    <div className="space-y-4">
                        {/* Strategic Gaps */}
                        <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
                            <h4 className="text-red-400 font-semibold mb-2 flex items-center gap-2">
                                <span>⚠️</span> Strategic Gaps (Entity Leads)
                            </h4>
                            {gaps.length > 0 ? (
                                <ul className="space-y-1">
                                    {gaps.map(g => (
                                        <li key={g.domain} className="text-slate-300 text-sm">
                                            <span className="font-medium">{g.domain}</span>: Entity {g.entityScore}% vs DRDO {g.drdoScore}%
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-slate-400 text-sm">No significant gaps identified.</p>
                            )}
                        </div>

                        {/* Collaboration Opportunities */}
                        <div className="bg-green-900/30 border border-green-700 rounded-lg p-4">
                            <h4 className="text-green-400 font-semibold mb-2 flex items-center gap-2">
                                <span>🤝</span> Collaboration Opportunities (Overlap)
                            </h4>
                            {overlaps.length > 0 ? (
                                <ul className="space-y-1">
                                    {overlaps.map(o => (
                                        <li key={o.domain} className="text-slate-300 text-sm">
                                            <span className="font-medium">{o.domain}</span>: Similar capabilities
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-slate-400 text-sm">No significant overlaps identified.</p>
                            )}
                        </div>

                        {/* DRDO Advantages */}
                        <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
                            <h4 className="text-blue-400 font-semibold mb-2 flex items-center gap-2">
                                <span>💪</span> DRDO Advantages
                            </h4>
                            {advantages.length > 0 ? (
                                <ul className="space-y-1">
                                    {advantages.map(a => (
                                        <li key={a.domain} className="text-slate-300 text-sm">
                                            <span className="font-medium">{a.domain}</span>: DRDO {a.drdoScore}% vs Entity {a.entityScore}%
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-slate-400 text-sm">No significant advantages identified.</p>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default GapAnalysisChart;
