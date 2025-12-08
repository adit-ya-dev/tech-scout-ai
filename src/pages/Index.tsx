import { useState, useMemo } from 'react';
import { Header } from '@/components/Header';
import { StatCard } from '@/components/StatCard';
import { SearchInput } from '@/components/SearchInput';
import { CategoryFilter } from '@/components/CategoryFilter';
import { TechnologyCard } from '@/components/TechnologyCard';
import { FundingChart } from '@/components/FundingChart';
import { TRLDistribution } from '@/components/TRLDistribution';
import { AddTechnologyDialog } from '@/components/AddTechnologyDialog';
import { mockTechnologies, getTotalFunding, formatCurrency } from '@/data/mockTechnologies';
import { Technology, TechnologyCategory } from '@/types/technology';
import { Cpu, DollarSign, TrendingUp, Globe2 } from 'lucide-react';

const Index = () => {
  const [technologies, setTechnologies] = useState<Technology[]>(mockTechnologies);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TechnologyCategory | 'all'>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Filter technologies
  const filteredTechnologies = useMemo(() => {
    return technologies.filter((tech) => {
      const matchesSearch =
        tech.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tech.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tech.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = selectedCategory === 'all' || tech.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [technologies, searchQuery, selectedCategory]);

  // Calculate category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<TechnologyCategory | 'all', number> = {
      all: technologies.length,
      ai_ml: 0,
      biotech: 0,
      cleantech: 0,
      quantum: 0,
      robotics: 0,
      materials: 0,
      energy: 0,
      space: 0,
      fintech: 0,
      health: 0,
      other: 0,
    };

    technologies.forEach((tech) => {
      counts[tech.category]++;
    });

    return counts;
  }, [technologies]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalFunding = technologies.reduce((sum, tech) => sum + getTotalFunding(tech), 0);
    const avgTRL = technologies.reduce((sum, tech) => sum + tech.maturityLevel, 0) / technologies.length;
    const countries = new Set(technologies.map((tech) => tech.origin.country).filter(Boolean));

    return {
      totalTechnologies: technologies.length,
      totalFunding,
      avgTRL: avgTRL.toFixed(1),
      uniqueCountries: countries.size,
    };
  }, [technologies]);

  const handleAddTechnology = (newTech: {
    name: string;
    description: string;
    category: TechnologyCategory;
    status: Technology['status'];
    maturityLevel: number;
    country: string;
    organization: string;
  }) => {
    const technology: Technology = {
      id: Date.now().toString(),
      name: newTech.name,
      description: newTech.description,
      category: newTech.category,
      origin: {
        country: newTech.country,
        organization: newTech.organization,
      },
      funding: [],
      status: newTech.status,
      maturityLevel: newTech.maturityLevel,
      marketAdoption: 'low',
      lastUpdated: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString().split('T')[0],
      tags: [],
    };

    setTechnologies((prev) => [technology, ...prev]);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onAddTechnology={() => setIsAddDialogOpen(true)} />

      <main className="container px-4 sm:px-6 py-8 space-y-8">
        {/* Hero Stats */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Technologies Tracked"
            value={stats.totalTechnologies}
            icon={<Cpu className="w-5 h-5" />}
            trend={{ value: 12, label: 'this month' }}
            className="animate-slide-up"
            style={{ animationDelay: '0ms' }}
          />
          <StatCard
            title="Total Funding"
            value={formatCurrency(stats.totalFunding)}
            icon={<DollarSign className="w-5 h-5" />}
            trend={{ value: 24, label: 'vs last quarter' }}
            className="animate-slide-up"
            style={{ animationDelay: '100ms' }}
          />
          <StatCard
            title="Average TRL"
            value={stats.avgTRL}
            subtitle="Technology Readiness Level"
            icon={<TrendingUp className="w-5 h-5" />}
            className="animate-slide-up"
            style={{ animationDelay: '200ms' }}
          />
          <StatCard
            title="Countries"
            value={stats.uniqueCountries}
            subtitle="Global research presence"
            icon={<Globe2 className="w-5 h-5" />}
            className="animate-slide-up"
            style={{ animationDelay: '300ms' }}
          />
        </section>

        {/* Charts Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <FundingChart technologies={technologies} />
          <TRLDistribution technologies={technologies} />
        </section>

        {/* Search and Filters */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              className="w-full sm:w-80"
            />
            <span className="text-sm text-muted-foreground font-mono">
              {filteredTechnologies.length} technologies
            </span>
          </div>
          <CategoryFilter
            selected={selectedCategory}
            onChange={setSelectedCategory}
            counts={categoryCounts}
          />
        </section>

        {/* Technology Grid */}
        <section className="data-grid">
          {filteredTechnologies.map((tech, index) => (
            <TechnologyCard
              key={tech.id}
              technology={tech}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            />
          ))}
        </section>

        {filteredTechnologies.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground">
              No technologies found matching your criteria.
            </p>
          </div>
        )}
      </main>

      <AddTechnologyDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdd={handleAddTechnology}
      />
    </div>
  );
};

export default Index;
