import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Patent {
    id: string;
    title: string;
    filingDate: string;
    status: 'pending' | 'granted' | 'expired';
    technologies: string[];
}

interface PatentTimelineProps {
    patents: Patent[];
    entityName: string;
}

const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500',
    granted: 'bg-green-500',
    expired: 'bg-gray-500',
};

export const PatentTimeline: React.FC<PatentTimelineProps> = ({ patents, entityName }) => {
    const sortedPatents = [...patents].sort(
        (a, b) => new Date(a.filingDate).getTime() - new Date(b.filingDate).getTime()
    );

    const getYear = (dateStr: string) => new Date(dateStr).getFullYear();

    // Group by year
    const patentsByYear = sortedPatents.reduce((acc, patent) => {
        const year = getYear(patent.filingDate);
        if (!acc[year]) acc[year] = [];
        acc[year].push(patent);
        return acc;
    }, {} as Record<number, Patent[]>);

    const years = Object.keys(patentsByYear).map(Number).sort();

    return (
        <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                    <span className="text-2xl">📜</span>
                    Patent Timeline - {entityName}
                </CardTitle>
                <div className="flex gap-4 mt-2 text-sm text-slate-400">
                    <span className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full bg-green-500"></span> Granted
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full bg-yellow-500"></span> Pending
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full bg-gray-500"></span> Expired
                    </span>
                </div>
            </CardHeader>
            <CardContent>
                <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-600"></div>

                    {years.map((year) => (
                        <div key={year} className="mb-8">
                            {/* Year marker */}
                            <div className="flex items-center mb-4">
                                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm z-10">
                                    {year.toString().slice(-2)}
                                </div>
                                <span className="ml-4 text-xl font-semibold text-white">{year}</span>
                            </div>

                            {/* Patents for this year */}
                            <div className="ml-12 space-y-3">
                                {patentsByYear[year].map((patent) => (
                                    <div
                                        key={patent.id}
                                        className="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:border-blue-500 transition-colors cursor-pointer"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="text-white font-medium">{patent.title}</h4>
                                                <p className="text-slate-400 text-sm mt-1">ID: {patent.id}</p>
                                                <p className="text-slate-400 text-sm">
                                                    Filed: {new Date(patent.filingDate).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <Badge
                                                className={`${statusColors[patent.status]} text-white capitalize`}
                                            >
                                                {patent.status}
                                            </Badge>
                                        </div>
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {patent.technologies.map((tech) => (
                                                <Badge key={tech} variant="outline" className="text-blue-400 border-blue-400">
                                                    {tech}
                                                </Badge>
                                            ))}
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

export default PatentTimeline;
