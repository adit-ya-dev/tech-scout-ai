import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TechnologyData {
    domain: string;
    subdomains: {
        name: string;
        intensity: number; // 0-100
        count: number;
    }[];
}

interface TechnologyHeatmapProps {
    data: TechnologyData[];
    title?: string;
}

const getIntensityColor = (intensity: number): string => {
    if (intensity >= 80) return 'bg-red-600';
    if (intensity >= 60) return 'bg-orange-500';
    if (intensity >= 40) return 'bg-yellow-500';
    if (intensity >= 20) return 'bg-green-500';
    return 'bg-blue-500';
};

const getIntensityOpacity = (intensity: number): string => {
    const opacityValue = 0.3 + (intensity / 100) * 0.7;
    return `opacity: ${opacityValue}`;
};

export const TechnologyHeatmap: React.FC<TechnologyHeatmapProps> = ({
    data,
    title = 'Technology Domain Heatmap',
}) => {
    const maxSubdomains = useMemo(() => {
        return Math.max(...data.map(d => d.subdomains.length));
    }, [data]);

    return (
        <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                    <span className="text-2xl">🔥</span>
                    {title}
                </CardTitle>
                <div className="flex items-center gap-2 mt-2 text-sm text-slate-400">
                    <span>Intensity:</span>
                    <div className="flex items-center gap-1">
                        <div className="w-4 h-4 bg-blue-500 rounded"></div>
                        <span>Low</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-4 h-4 bg-green-500 rounded"></div>
                        <span>Medium</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                        <span>High</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-4 h-4 bg-orange-500 rounded"></div>
                        <span>Very High</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-4 h-4 bg-red-600 rounded"></div>
                        <span>Critical</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {data.map((domain) => (
                        <div key={domain.domain} className="border border-slate-700 rounded-lg p-4">
                            <h3 className="text-white font-semibold mb-3">{domain.domain}</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                {domain.subdomains.map((subdomain) => (
                                    <div
                                        key={subdomain.name}
                                        className={`${getIntensityColor(subdomain.intensity)} rounded-lg p-3 cursor-pointer hover:scale-105 transition-transform`}
                                        style={{ opacity: 0.3 + (subdomain.intensity / 100) * 0.7 }}
                                        title={`${subdomain.name}: ${subdomain.count} items, ${subdomain.intensity}% intensity`}
                                    >
                                        <div className="text-white text-sm font-medium truncate">
                                            {subdomain.name}
                                        </div>
                                        <div className="text-white/80 text-xs mt-1">
                                            {subdomain.count} items
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default TechnologyHeatmap;
