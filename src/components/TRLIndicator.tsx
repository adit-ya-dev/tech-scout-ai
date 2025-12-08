import { cn } from '@/lib/utils';
import { TRL_DESCRIPTIONS } from '@/types/technology';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface TRLIndicatorProps {
  level: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function TRLIndicator({ level, size = 'md', showLabel = false }: TRLIndicatorProps) {
  const sizeClasses = {
    sm: 'w-6 h-6 text-[10px]',
    md: 'w-8 h-8 text-xs',
    lg: 'w-10 h-10 text-sm',
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'trl-indicator font-mono font-bold',
              `trl-${level}`,
              sizeClasses[size]
            )}
          >
            {level}
          </div>
          {showLabel && (
            <span className="text-sm text-muted-foreground font-mono">
              TRL {level}
            </span>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[250px]">
        <div className="space-y-1">
          <p className="font-semibold">Technology Readiness Level {level}</p>
          <p className="text-xs text-muted-foreground">
            {TRL_DESCRIPTIONS[level]}
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

interface TRLProgressProps {
  level: number;
}

export function TRLProgress({ level }: TRLProgressProps) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 9 }, (_, i) => i + 1).map((trl) => (
        <div
          key={trl}
          className={cn(
            'h-1.5 flex-1 rounded-full transition-all duration-300',
            trl <= level
              ? `trl-${trl} bg-current opacity-100`
              : 'bg-muted opacity-40'
          )}
          style={{
            backgroundColor: trl <= level ? `hsl(var(--trl-${level}))` : undefined,
          }}
        />
      ))}
    </div>
  );
}
