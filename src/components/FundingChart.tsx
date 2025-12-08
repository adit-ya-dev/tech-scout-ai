import { Technology } from '@/types/technology';
import { getTotalFunding, formatCurrency } from '@/data/mockTechnologies';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';

interface FundingChartProps {
  technologies: Technology[];
}

export function FundingChart({ technologies }: FundingChartProps) {
  const data = technologies
    .map((tech) => ({
      name: tech.name.length > 15 ? tech.name.substring(0, 15) + '...' : tech.name,
      fullName: tech.name,
      funding: getTotalFunding(tech),
      trl: tech.maturityLevel,
    }))
    .sort((a, b) => b.funding - a.funding)
    .slice(0, 6);

  const getTRLColor = (trl: number) => {
    const colors = [
      '#ef4444', '#f97316', '#eab308', '#facc15',
      '#84cc16', '#22c55e', '#14b8a6', '#0ea5e9', '#8b5cf6'
    ];
    return colors[trl - 1] || colors[0];
  };

  return (
    <Card variant="glass" className="col-span-full lg:col-span-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">
          Top Funded Technologies
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
            >
              <XAxis
                type="number"
                tickFormatter={(value) => formatCurrency(value)}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis
                type="category"
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }}
                width={100}
              />
              <Tooltip
                cursor={{ fill: 'hsl(var(--muted) / 0.3)' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-lg">
                        <p className="text-sm font-medium">{data.fullName}</p>
                        <p className="text-xs text-muted-foreground">
                          Funding: <span className="font-mono text-primary">{formatCurrency(data.funding)}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          TRL: <span className="font-mono">{data.trl}</span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="funding" radius={[0, 4, 4, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getTRLColor(entry.trl)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
