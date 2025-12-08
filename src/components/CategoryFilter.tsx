import { TechnologyCategory, CATEGORY_LABELS } from '@/types/technology';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  Brain, 
  Dna, 
  Leaf, 
  Atom, 
  Bot, 
  Gem, 
  Zap, 
  Rocket, 
  Wallet, 
  Heart,
  LayoutGrid
} from 'lucide-react';

const CATEGORY_ICONS: Record<TechnologyCategory | 'all', React.ReactNode> = {
  all: <LayoutGrid className="w-4 h-4" />,
  ai_ml: <Brain className="w-4 h-4" />,
  biotech: <Dna className="w-4 h-4" />,
  cleantech: <Leaf className="w-4 h-4" />,
  quantum: <Atom className="w-4 h-4" />,
  robotics: <Bot className="w-4 h-4" />,
  materials: <Gem className="w-4 h-4" />,
  energy: <Zap className="w-4 h-4" />,
  space: <Rocket className="w-4 h-4" />,
  fintech: <Wallet className="w-4 h-4" />,
  health: <Heart className="w-4 h-4" />,
  other: <LayoutGrid className="w-4 h-4" />,
};

interface CategoryFilterProps {
  selected: TechnologyCategory | 'all';
  onChange: (category: TechnologyCategory | 'all') => void;
  counts?: Record<TechnologyCategory | 'all', number>;
}

export function CategoryFilter({ selected, onChange, counts }: CategoryFilterProps) {
  const categories: (TechnologyCategory | 'all')[] = [
    'all',
    'ai_ml',
    'biotech',
    'cleantech',
    'quantum',
    'robotics',
    'materials',
    'energy',
    'space',
    'fintech',
    'health',
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <Button
          key={category}
          variant={selected === category ? 'default' : 'outline'}
          size="sm"
          onClick={() => onChange(category)}
          className={cn(
            'gap-1.5 transition-all',
            selected === category && 'shadow-glow'
          )}
        >
          {CATEGORY_ICONS[category]}
          <span className="hidden sm:inline">
            {category === 'all' ? 'All' : CATEGORY_LABELS[category]}
          </span>
          {counts && counts[category] > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-[10px] font-mono rounded-full bg-background/20">
              {counts[category]}
            </span>
          )}
        </Button>
      ))}
    </div>
  );
}
