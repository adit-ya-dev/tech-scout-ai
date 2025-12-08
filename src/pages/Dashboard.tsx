import React, { useState, useEffect } from 'react';
import {
    Building2,
    FileText,
    Users,
    TrendingUp,
    Plus,
    ArrowRight,
    Info,
    Loader2,
    RefreshCw,
    AlertTriangle,
    CheckCircle2,
    Clock,
    Network,
    BarChart3,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from '@/components/ui/alert';
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from '@/components/ui/hover-card';

// API configuration
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// Types
interface TrackedEntity {
    id: string;
    name: string;
    type: 'startup' | 'research_lab' | 'institution' | 'company';
    status: 'pending' | 'analyzing' | 'complete' | 'error';
    patent_count: number;
    paper_count: number;
    personnel_count: number;
    analysis_progress: number;
    updated_at: string;
    focus_areas?: string[];
}

interface DashboardStats {
    total_entities: number;
    total_patents: number;
    total_papers: number;
    total_personnel: number;
    critical_alerts: number;
    entities_analyzing: number;
}

// Stat Card Component
const StatCard: React.FC<{
    title: string;
    value: number;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
    loading?: boolean;
}> = ({ title, value, icon: Icon, description, loading }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
                {title}
            </CardTitle>
            <HoverCard>
                <HoverCardTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Info className="h-4 w-4 text-muted-foreground" />
                    </Button>
                </HoverCardTrigger>
                <HoverCardContent className="w-80">
                    <p className="text-sm">{description}</p>
                </HoverCardContent>
            </HoverCard>
        </CardHeader>
        <CardContent>
            {loading ? (
                <Skeleton className="h-8 w-20" />
            ) : (
                <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-primary" />
                    <span className="text-3xl font-bold">{value.toLocaleString()}</span>
                </div>
            )}
        </CardContent>
    </Card>
);

// Entity Status Badge
const EntityStatusBadge: React.FC<{ status: TrackedEntity['status'] }> = ({ status }) => {
    const config = {
        pending: { label: 'Pending', variant: 'secondary' as const, icon: Clock },
        analyzing: { label: 'Analyzing', variant: 'default' as const, icon: Loader2 },
        complete: { label: 'Complete', variant: 'default' as const, icon: CheckCircle2 },
        error: { label: 'Error', variant: 'destructive' as const, icon: AlertTriangle },
    };

    const { label, variant, icon: StatusIcon } = config[status];

    return (
        <Badge variant={variant} className="gap-1">
            <StatusIcon className={`h-3 w-3 ${status === 'analyzing' ? 'animate-spin' : ''}`} />
            {label}
        </Badge>
    );
};

// Entity Card
const EntityCard: React.FC<{ entity: TrackedEntity }> = ({ entity }) => (
    <Card className="hover:border-primary/50 transition-colors">
        <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
                <div>
                    <CardTitle className="text-lg">{entity.name}</CardTitle>
                    <CardDescription className="capitalize">{entity.type.replace('_', ' ')}</CardDescription>
                </div>
                <EntityStatusBadge status={entity.status} />
            </div>
        </CardHeader>
        <CardContent>
            {entity.status === 'analyzing' && (
                <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Analysis Progress</span>
                        <span>{entity.analysis_progress}%</span>
                    </div>
                    <Progress value={entity.analysis_progress} className="h-2" />
                </div>
            )}

            {entity.status === 'complete' && (
                <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="text-center p-2 bg-muted rounded-lg">
                        <div className="text-xl font-bold text-primary">{entity.patent_count}</div>
                        <div className="text-xs text-muted-foreground">Patents</div>
                    </div>
                    <div className="text-center p-2 bg-muted rounded-lg">
                        <div className="text-xl font-bold text-primary">{entity.paper_count}</div>
                        <div className="text-xs text-muted-foreground">Papers</div>
                    </div>
                    <div className="text-center p-2 bg-muted rounded-lg">
                        <div className="text-xl font-bold text-primary">{entity.personnel_count}</div>
                        <div className="text-xs text-muted-foreground">People</div>
                    </div>
                </div>
            )}

            {entity.status === 'pending' && (
                <p className="text-sm text-muted-foreground mb-4">
                    Waiting for analysis to begin...
                </p>
            )}

            {entity.focus_areas && entity.focus_areas.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                    {entity.focus_areas.slice(0, 3).map((area, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                            {area}
                        </Badge>
                    ))}
                </div>
            )}

            <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                    {new Date(entity.updated_at).toLocaleDateString()}
                </span>
                <Button variant="outline" size="sm" asChild>
                    <Link to={`/dashboard/entities/${entity.id}`}>
                        View <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                </Button>
            </div>
        </CardContent>
    </Card>
);

// Main Dashboard Component
const DashboardHome: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [entities, setEntities] = useState<TrackedEntity[]>([]);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Fetch stats
            const statsRes = await fetch(`${API_BASE}/entities/stats`);
            if (statsRes.ok) {
                const statsData = await statsRes.json();
                setStats(statsData);
            }

            // Fetch recent entities
            const entitiesRes = await fetch(`${API_BASE}/entities?per_page=6`);
            if (entitiesRes.ok) {
                const entitiesData = await entitiesRes.json();
                setEntities(entitiesData.items || []);
            }
        } catch (err) {
            console.error('Failed to fetch data:', err);
            setError('Failed to connect to backend. Make sure the API is running.');
            // Use mock data for demo
            setStats({
                total_entities: 3,
                total_patents: 47,
                total_papers: 128,
                total_personnel: 23,
                critical_alerts: 2,
                entities_analyzing: 1,
            });
            setEntities([
                {
                    id: '1',
                    name: 'QuantumTech Inc',
                    type: 'startup',
                    status: 'complete',
                    patent_count: 47,
                    paper_count: 128,
                    personnel_count: 23,
                    analysis_progress: 100,
                    updated_at: new Date().toISOString(),
                    focus_areas: ['Quantum Computing', 'Machine Learning'],
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();

        // Poll for updates every 10 seconds
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Intelligence Dashboard</h1>
                    <p className="text-muted-foreground mt-1">
                        Monitor technology footprints and IP portfolios of tracked entities
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={fetchData} disabled={isLoading}>
                        <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button asChild>
                        <Link to="/dashboard/entities/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Entity
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Error Alert */}
            {error && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Connection Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* How to Use */}
            <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>How to Use This Platform</AlertTitle>
                <AlertDescription>
                    <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
                        <li><strong>Add Entity:</strong> Click "Add Entity" to track a new organization</li>
                        <li><strong>Automatic Analysis:</strong> Our AI scrapes patents, papers, and identifies key personnel</li>
                        <li><strong>Review Insights:</strong> Explore technology domains, gap analysis, and recommendations</li>
                    </ol>
                </AlertDescription>
            </Alert>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Tracked Entities"
                    value={stats?.total_entities || 0}
                    icon={Building2}
                    description="Organizations being monitored for technology intelligence."
                    loading={isLoading}
                />
                <StatCard
                    title="Patents Analyzed"
                    value={stats?.total_patents || 0}
                    icon={FileText}
                    description="Total patents scraped from Google Patents and other sources."
                    loading={isLoading}
                />
                <StatCard
                    title="Research Papers"
                    value={stats?.total_papers || 0}
                    icon={FileText}
                    description="Papers from arXiv, Semantic Scholar, DBLP, and CrossRef."
                    loading={isLoading}
                />
                <StatCard
                    title="Key Personnel"
                    value={stats?.total_personnel || 0}
                    icon={Users}
                    description="Researchers and scientists identified from publications."
                    loading={isLoading}
                />
            </div>

            {/* Entities Being Analyzed */}
            {stats && stats.entities_analyzing > 0 && (
                <Alert>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <AlertTitle>Analysis in Progress</AlertTitle>
                    <AlertDescription>
                        {stats.entities_analyzing} {stats.entities_analyzing === 1 ? 'entity is' : 'entities are'} currently being analyzed.
                        Results will appear automatically when complete.
                    </AlertDescription>
                </Alert>
            )}

            {/* Tracked Entities */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-xl font-semibold">Tracked Entities</h2>
                        <p className="text-sm text-muted-foreground">
                            Organizations being monitored for technology intelligence
                        </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                        <Link to="/dashboard/entities">View All</Link>
                    </Button>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3].map((i) => (
                            <Card key={i}>
                                <CardHeader>
                                    <Skeleton className="h-6 w-32" />
                                    <Skeleton className="h-4 w-20" />
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className="h-24 w-full" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : entities.length === 0 ? (
                    <Card className="p-8 text-center">
                        <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">No Entities Tracked Yet</h3>
                        <p className="text-muted-foreground mb-4">
                            Start by adding an organization to monitor their technology footprint.
                        </p>
                        <Button asChild>
                            <Link to="/dashboard/entities/new">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Your First Entity
                            </Link>
                        </Button>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {entities.map((entity) => (
                            <EntityCard key={entity.id} entity={entity} />
                        ))}
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link to="/dashboard/ip-analysis">
                    <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Network className="h-5 w-5 text-primary" />
                                IP Network
                            </CardTitle>
                            <CardDescription>
                                View patent citation graphs and technology networks
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </Link>
                <Link to="/dashboard/gap-analysis">
                    <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-primary" />
                                Gap Analysis
                            </CardTitle>
                            <CardDescription>
                                Compare entity capabilities with DRDO research
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </Link>
                <Link to="/dashboard/personnel">
                    <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-primary" />
                                Key Personnel
                            </CardTitle>
                            <CardDescription>
                                Identify researchers and their expertise areas
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </Link>
            </div>
        </div>
    );
};

export default DashboardHome;
