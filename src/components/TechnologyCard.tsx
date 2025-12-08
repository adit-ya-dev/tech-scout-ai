import { Technology, CATEGORY_LABELS, STATUS_LABELS } from '@/types/technology';
import { getTotalFunding, formatCurrency } from '@/data/mockTechnologies';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TRLIndicator, TRLProgress } from '@/components/TRLIndicator';
import { MapPin, Building2, Calendar, TrendingUp, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TechnologyCardProps {
  technology: Technology;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export function TechnologyCard({ technology, onClick, className, style }: TechnologyCardProps) {
  const totalFunding = getTotalFunding(technology);
  const latestFunding = technology.funding[0];

  const adoptionColors = {
    low: 'warning',
    medium: 'info',
    high: 'success',
  } as const;

  return (
    <Card
      variant="interactive"
      className={cn('group overflow-hidden', className)}
      onClick={onClick}
      style={style}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="category">{CATEGORY_LABELS[technology.category]}</Badge>
              <Badge variant={adoptionColors[technology.marketAdoption]}>
                {technology.marketAdoption} adoption
              </Badge>
            </div>
            <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {technology.name}
            </h3>
          </div>
          <TRLIndicator level={technology.maturityLevel} size="lg" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {technology.description}
        </p>

        {/* TRL Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-mono">Maturity Progress</span>
            <span className="font-mono text-primary">{technology.maturityLevel}/9</span>
          </div>
          <TRLProgress level={technology.maturityLevel} />
        </div>

        {/* Origin Info */}
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          {technology.origin.country && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span>{technology.origin.country}</span>
            </div>
          )}
          {technology.origin.organization && (
            <div className="flex items-center gap-1">
              <Building2 className="w-3 h-3" />
              <span className="truncate max-w-[120px]">{technology.origin.organization}</span>
            </div>
          )}
        </div>

        {/* Funding Stats */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/50">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <DollarSign className="w-3 h-3" />
              <span>Total Funding</span>
            </div>
            <p className="font-mono font-semibold text-foreground">
              {formatCurrency(totalFunding)}
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="w-3 h-3" />
              <span>Status</span>
            </div>
            <p className="font-medium text-foreground text-sm">
              {STATUS_LABELS[technology.status]}
            </p>
          </div>
        </div>

        {/* Latest Funding */}
        {latestFunding && (
          <div className="flex items-center justify-between text-xs pt-2 border-t border-border/50">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span>Latest round</span>
            </div>
            <span className="font-mono text-primary">
              {formatCurrency(latestFunding.amount)} ({latestFunding.type.replace('_', ' ')})
            </span>
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 pt-2">
          {technology.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wide rounded-full bg-muted text-muted-foreground"
            >
              {tag}
            </span>
          ))}
          {technology.tags.length > 4 && (
            <span className="px-2 py-0.5 text-[10px] font-mono rounded-full bg-muted text-muted-foreground">
              +{technology.tags.length - 4}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
