import { Technology } from '@/types/technology';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TRL_DESCRIPTIONS } from '@/types/technology';

interface TRLDistributionProps {
  technologies: Technology[];
}

export function TRLDistribution({ technologies }: TRLDistributionProps) {
  const distribution = Array.from({ length: 9 }, (_, i) => {
    const trl = i + 1;
    const count = technologies.filter((t) => t.maturityLevel === trl).length;
    return { trl, count };
  });

  const maxCount = Math.max(...distribution.map((d) => d.count), 1);

  return (
    <Card variant="glass">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">TRL Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {distribution.map(({ trl, count }) => (
            <div key={trl} className="flex items-center gap-3">
              <div className={`trl-indicator trl-${trl} flex-shrink-0`}>
                {trl}
              </div>
              <div className="flex-1 h-4 bg-muted/50 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(count / maxCount) * 100}%`,
                    backgroundColor: `hsl(var(--trl-${trl}))`,
                    minWidth: count > 0 ? '8px' : '0',
                  }}
                />
              </div>
              <span className="text-xs font-mono text-muted-foreground w-6 text-right">
                {count}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-3 border-t border-border/50">
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            <span className="font-semibold text-foreground">TRL 1-3:</span> Research &amp; Concept{' '}
            <span className="font-semibold text-foreground">TRL 4-6:</span> Development{' '}
            <span className="font-semibold text-foreground">TRL 7-9:</span> Deployment
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
