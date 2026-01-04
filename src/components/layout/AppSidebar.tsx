import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Building2,
    FileText,
    Network,
    Settings,
    HelpCircle,
    Shield,
    TrendingUp,
    Users,
    Search,
    Bell,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';

interface NavItem {
    title: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    description?: string;
    badge?: string;
}

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
        description: 'Overview of all tracked entities',
    },
    {
        title: 'Tracked Entities',
        href: '/dashboard/entities',
        icon: Building2,
        description: 'Manage organizations you are monitoring',
    },
    {
        title: 'IP Analysis',
        href: '/dashboard/ip-analysis',
        icon: FileText,
        description: 'Patents and research paper analysis',
    },
    {
        title: 'Tech Mapping',
        href: '/dashboard/tech-map',
        icon: Network,
        description: 'Technology domain visualization',
    },
    {
        title: 'Gap Analysis',
        href: '/dashboard/gap-analysis',
        icon: TrendingUp,
        description: 'Compare with DRDO capabilities',
    },
    {
        title: 'Key Personnel',
        href: '/dashboard/personnel',
        icon: Users,
        description: 'Researchers and scientists tracking',
    },
];

const secondaryNavItems: NavItem[] = [
    {
        title: 'Settings',
        href: '/dashboard/settings',
        icon: Settings,
        description: 'System configuration',
    },
    {
        title: 'Help & Docs',
        href: '/dashboard/help',
        icon: HelpCircle,
        description: 'User guide and documentation',
    },
];

interface AppSidebarProps {
    isCollapsed?: boolean;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({ isCollapsed = false }) => {
    const location = useLocation();

    const NavLink = ({ item }: { item: NavItem }) => {
        const isActive = location.pathname === item.href;
        const Icon = item.icon;

        const linkContent = (
            <Link
                to={item.href}
                className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    'hover:bg-accent hover:text-accent-foreground',
                    isActive
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground'
                )}
            >
                <Icon className={cn('h-5 w-5 shrink-0', isCollapsed && 'h-6 w-6')} />
                {!isCollapsed && <span>{item.title}</span>}
                {!isCollapsed && item.badge && (
                    <span className="ml-auto rounded-full bg-primary/20 px-2 py-0.5 text-xs">
                        {item.badge}
                    </span>
                )}
            </Link>
        );

        if (isCollapsed) {
            return (
                <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                    <TooltipContent side="right" className="flex flex-col gap-1">
                        <span className="font-medium">{item.title}</span>
                        {item.description && (
                            <span className="text-xs text-muted-foreground">{item.description}</span>
                        )}
                    </TooltipContent>
                </Tooltip>
            );
        }

        return linkContent;
    };

    return (
        <aside
            className={cn(
                'fixed left-0 top-0 z-40 h-screen border-r border-border bg-card transition-all duration-300',
                isCollapsed ? 'w-16' : 'w-64'
            )}
        >
            {/* Header */}
            <div className="flex h-16 items-center gap-3 border-b border-border px-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Shield className="h-5 w-5" />
                </div>
                {!isCollapsed && (
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold">Tech Scout AI</span>
                        <span className="text-xs text-muted-foreground">DRDO Intelligence</span>
                    </div>
                )}
            </div>

            <ScrollArea className="flex-1 px-3 py-4" style={{ height: 'calc(100vh - 64px)' }}>
                {/* Main Navigation */}
                <div className="space-y-1">
                    {!isCollapsed && (
                        <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Analysis
                        </h3>
                    )}
                    {mainNavItems.map((item) => (
                        <NavLink key={item.href} item={item} />
                    ))}
                </div>

                <Separator className="my-4" />

                {/* Secondary Navigation */}
                <div className="space-y-1">
                    {!isCollapsed && (
                        <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            System
                        </h3>
                    )}
                    {secondaryNavItems.map((item) => (
                        <NavLink key={item.href} item={item} />
                    ))}
                </div>

                {/* Quick Tips Section */}
                {!isCollapsed && (
                    <div className="mt-6 rounded-lg bg-primary/5 p-4">
                        <h4 className="text-sm font-medium text-primary">Quick Tip</h4>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Add an entity to start tracking their technology footprint and IP portfolio.
                        </p>
                        <Button size="sm" className="mt-3 w-full" asChild>
                            <Link to="/dashboard/entities">
                                <Building2 className="mr-2 h-4 w-4" />
                                Add Entity
                            </Link>
                        </Button>
                    </div>
                )}
            </ScrollArea>
        </aside>
    );
};

export default AppSidebar;
