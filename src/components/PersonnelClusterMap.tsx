import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Researcher {
    id: string;
    name: string;
    role: string;
    expertise: string[];
    publicationCount: number;
    patentCount: number;
    hIndex?: number;
}

interface PersonnelClusterMapProps {
    researchers: Researcher[];
    entityName: string;
}

const getInitials = (name: string): string => {
    return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
};

const roleColors: Record<string, string> = {
    'Principal Scientist': 'bg-purple-600',
    'Senior Researcher': 'bg-blue-600',
    'Research Lead': 'bg-green-600',
    'Scientist': 'bg-orange-600',
    'Postdoc': 'bg-pink-600',
};

export const PersonnelClusterMap: React.FC<PersonnelClusterMapProps> = ({
    researchers,
    entityName,
}) => {
    // Group researchers by primary expertise
    const clustersByExpertise = researchers.reduce((acc, researcher) => {
        const primaryExpertise = researcher.expertise[0] || 'General';
        if (!acc[primaryExpertise]) acc[primaryExpertise] = [];
        acc[primaryExpertise].push(researcher);
        return acc;
    }, {} as Record<string, Researcher[]>);

    return (
        <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                    <span className="text-2xl">👥</span>
                    Key Personnel - {entityName}
                </CardTitle>
                <p className="text-slate-400 text-sm mt-1">
                    {researchers.length} key researchers identified across {Object.keys(clustersByExpertise).length} domains
                </p>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {Object.entries(clustersByExpertise).map(([expertise, people]) => (
                        <div key={expertise} className="border border-slate-700 rounded-lg p-4">
                            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></span>
                                {expertise}
                                <Badge variant="outline" className="ml-2 text-slate-400">
                                    {people.length} researchers
                                </Badge>
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {people.map((researcher) => (
                                    <div
                                        key={researcher.id}
                                        className="bg-slate-800 rounded-lg p-4 hover:bg-slate-750 transition-colors cursor-pointer border border-slate-700 hover:border-blue-500"
                                    >
                                        <div className="flex items-start gap-3">
                                            <Avatar className="h-12 w-12">
                                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                                                    {getInitials(researcher.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-white font-medium truncate">{researcher.name}</h4>
                                                <Badge
                                                    className={`${roleColors[researcher.role] || 'bg-slate-600'} text-white text-xs mt-1`}
                                                >
                                                    {researcher.role}
                                                </Badge>
                                            </div>
                                        </div>

                                        <div className="mt-3 flex gap-4 text-sm">
                                            <div className="text-slate-400">
                                                <span className="text-white font-medium">{researcher.publicationCount}</span> papers
                                            </div>
                                            <div className="text-slate-400">
                                                <span className="text-white font-medium">{researcher.patentCount}</span> patents
                                            </div>
                                            {researcher.hIndex && (
                                                <div className="text-slate-400">
                                                    h-index: <span className="text-white font-medium">{researcher.hIndex}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-3 flex flex-wrap gap-1">
                                            {researcher.expertise.map((exp) => (
                                                <Badge
                                                    key={exp}
                                                    variant="outline"
                                                    className="text-xs text-blue-400 border-blue-400/50"
                                                >
                                                    {exp}
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

export default PersonnelClusterMap;
