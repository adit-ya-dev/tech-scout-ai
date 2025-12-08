import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Plus,
    Search,
    Filter,
    MoreHorizontal,
    Building2,
    Microscope,
    GraduationCap,
    Factory,
    Clock,
    CheckCircle2,
    Loader2,
    AlertTriangle,
    RefreshCw,
    Trash2,
    ExternalLink,
    BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

interface Entity {
    id: string;
    name: string;
    type: 'startup' | 'research_lab' | 'institution' | 'company';
    status: 'pending' | 'analyzing' | 'complete' | 'error';
    website?: string;
    patent_count: number;
    paper_count: number;
    personnel_count: number;
    analysis_progress: number;
    updated_at: string;
}

const typeIcons: Record<Entity['type'], React.ComponentType<{ className?: string }>> = {
    startup: Building2,
    research_lab: Microscope,
    institution: GraduationCap,
    company: Factory,
};

const statusConfig = {
    pending: { label: 'Pending', variant: 'secondary' as const, icon: Clock },
    analyzing: { label: 'Analyzing', variant: 'default' as const, icon: Loader2 },
    complete: { label: 'Complete', variant: 'default' as const, icon: CheckCircle2 },
    error: { label: 'Error', variant: 'destructive' as const, icon: AlertTriangle },
};

const EntitiesListPage: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [entities, setEntities] = useState<Entity[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const { toast } = useToast();

    const fetchEntities = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (typeFilter !== 'all') params.set('type', typeFilter);
            if (statusFilter !== 'all') params.set('status', statusFilter);
            if (searchQuery) params.set('search', searchQuery);

            const res = await fetch(`${API_BASE}/entities?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setEntities(data.items || []);
            }
        } catch (err) {
            console.error('Failed to fetch entities:', err);
            toast({
                title: 'Connection Error',
                description: 'Failed to connect to backend API',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchEntities();
    }, [typeFilter, statusFilter]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (searchQuery !== '') {
                fetchEntities();
            }
        }, 300);
        return () => clearTimeout(timeout);
    }, [searchQuery]);

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`${API_BASE}/entities/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setEntities(prev => prev.filter(e => e.id !== id));
                toast({
                    title: 'Entity Deleted',
                    description: 'Entity has been removed successfully',
                });
            }
        } catch (err) {
            toast({
                title: 'Error',
                description: 'Failed to delete entity',
                variant: 'destructive',
            });
        }
    };

    const handleReanalyze = async (id: string) => {
        try {
            const res = await fetch(`${API_BASE}/entities/${id}/reanalyze`, { method: 'POST' });
            if (res.ok) {
                toast({
                    title: 'Re-analysis Started',
                    description: 'Entity analysis has been triggered',
                });
                fetchEntities();
            }
        } catch (err) {
            toast({
                title: 'Error',
                description: 'Failed to trigger re-analysis',
                variant: 'destructive',
            });
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Tracked Entities</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage organizations you are monitoring for technology intelligence
                    </p>
                </div>
                <Button asChild>
                    <Link to="/dashboard/entities/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Entity
                    </Link>
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search entities..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-[180px]">
                                <Filter className="mr-2 h-4 w-4" />
                                <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="startup">Startup</SelectItem>
                                <SelectItem value="research_lab">Research Lab</SelectItem>
                                <SelectItem value="institution">Institution</SelectItem>
                                <SelectItem value="company">Company</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="analyzing">Analyzing</SelectItem>
                                <SelectItem value="complete">Complete</SelectItem>
                                <SelectItem value="error">Error</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" onClick={fetchEntities} disabled={isLoading}>
                            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Entities Table */}
            <Card>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="p-6 space-y-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-4 w-48" />
                                        <Skeleton className="h-3 w-24" />
                                    </div>
                                    <Skeleton className="h-6 w-20" />
                                </div>
                            ))}
                        </div>
                    ) : entities.length === 0 ? (
                        <div className="p-12 text-center">
                            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium mb-2">No Entities Found</h3>
                            <p className="text-muted-foreground mb-4">
                                {searchQuery || typeFilter !== 'all' || statusFilter !== 'all'
                                    ? 'Try adjusting your filters'
                                    : 'Start by adding an organization to track'}
                            </p>
                            <Button asChild>
                                <Link to="/dashboard/entities/new">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Entity
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Entity</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-center">Patents</TableHead>
                                    <TableHead className="text-center">Papers</TableHead>
                                    <TableHead className="text-center">Personnel</TableHead>
                                    <TableHead>Updated</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {entities.map((entity) => {
                                    const TypeIcon = typeIcons[entity.type];
                                    const status = statusConfig[entity.status];
                                    const StatusIcon = status.icon;

                                    return (
                                        <TableRow key={entity.id}>
                                            <TableCell>
                                                <Link
                                                    to={`/dashboard/entities/${entity.id}`}
                                                    className="flex items-center gap-3 hover:underline"
                                                >
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                                        <TypeIcon className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">{entity.name}</div>
                                                        {entity.website && (
                                                            <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                                                                {entity.website}
                                                            </div>
                                                        )}
                                                    </div>
                                                </Link>
                                            </TableCell>
                                            <TableCell>
                                                <span className="capitalize text-sm">
                                                    {entity.type.replace('_', ' ')}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    <Badge variant={status.variant} className="gap-1 w-fit">
                                                        <StatusIcon className={`h-3 w-3 ${entity.status === 'analyzing' ? 'animate-spin' : ''}`} />
                                                        {status.label}
                                                    </Badge>
                                                    {entity.status === 'analyzing' && (
                                                        <Progress value={entity.analysis_progress} className="h-1 w-20" />
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center font-medium">
                                                {entity.patent_count > 0 ? entity.patent_count : '-'}
                                            </TableCell>
                                            <TableCell className="text-center font-medium">
                                                {entity.paper_count > 0 ? entity.paper_count : '-'}
                                            </TableCell>
                                            <TableCell className="text-center font-medium">
                                                {entity.personnel_count > 0 ? entity.personnel_count : '-'}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {new Date(entity.updated_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem asChild>
                                                            <Link to={`/dashboard/entities/${entity.id}`}>
                                                                <BarChart3 className="mr-2 h-4 w-4" />
                                                                View Analysis
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        {entity.website && (
                                                            <DropdownMenuItem asChild>
                                                                <a href={entity.website} target="_blank" rel="noopener noreferrer">
                                                                    <ExternalLink className="mr-2 h-4 w-4" />
                                                                    Visit Website
                                                                </a>
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuItem onClick={() => handleReanalyze(entity.id)}>
                                                            <RefreshCw className="mr-2 h-4 w-4" />
                                                            Re-analyze
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <DropdownMenuItem
                                                                    onSelect={(e) => e.preventDefault()}
                                                                    className="text-destructive"
                                                                >
                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                    Delete
                                                                </DropdownMenuItem>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Delete Entity</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        Are you sure you want to delete "{entity.name}"? This will remove all
                                                                        associated data. This action cannot be undone.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        onClick={() => handleDelete(entity.id)}
                                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                    >
                                                                        Delete
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default EntitiesListPage;
