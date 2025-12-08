import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CATEGORY_LABELS, TechnologyCategory, TechnologyStatus, STATUS_LABELS } from '@/types/technology';
import { Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface AddTechnologyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (technology: {
    name: string;
    description: string;
    category: TechnologyCategory;
    status: TechnologyStatus;
    maturityLevel: number;
    country: string;
    organization: string;
  }) => void;
}

export function AddTechnologyDialog({ open, onOpenChange, onAdd }: AddTechnologyDialogProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '' as TechnologyCategory | '',
    status: '' as TechnologyStatus | '',
    maturityLevel: 1,
    country: '',
    organization: '',
  });

  const handleAnalyzeWithAI = async () => {
    if (!formData.name || !formData.description) {
      toast.error('Please enter a name and description first');
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate AI analysis (in production, this would call an edge function)
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    // Mock AI classification results
    const aiSuggestions = {
      category: 'ai_ml' as TechnologyCategory,
      status: 'development' as TechnologyStatus,
      maturityLevel: 4,
    };

    setFormData((prev) => ({
      ...prev,
      category: aiSuggestions.category,
      status: aiSuggestions.status,
      maturityLevel: aiSuggestions.maturityLevel,
    }));

    setIsAnalyzing(false);
    toast.success('AI analysis complete! Review the suggested classifications.');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || !formData.category || !formData.status) {
      toast.error('Please fill in all required fields');
      return;
    }

    onAdd({
      name: formData.name,
      description: formData.description,
      category: formData.category as TechnologyCategory,
      status: formData.status as TechnologyStatus,
      maturityLevel: formData.maturityLevel,
      country: formData.country,
      organization: formData.organization,
    });

    // Reset form
    setFormData({
      name: '',
      description: '',
      category: '',
      status: '',
      maturityLevel: 1,
      country: '',
      organization: '',
    });

    onOpenChange(false);
    toast.success('Technology added successfully!');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Add New Technology</DialogTitle>
          <DialogDescription>
            Enter technology details or use AI to auto-classify based on your description.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Technology Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Solid-State Batteries"
              className="bg-card"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the technology, its purpose, and key innovations..."
              className="bg-card min-h-[100px]"
            />
          </div>

          {/* AI Analysis Button */}
          <Button
            type="button"
            variant="outline"
            onClick={handleAnalyzeWithAI}
            disabled={isAnalyzing || !formData.name || !formData.description}
            className="w-full gap-2"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing with AI...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Auto-Classify with AI
              </>
            )}
          </Button>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value as TechnologyCategory })}
              >
                <SelectTrigger className="bg-card">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Development Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as TechnologyStatus })}
              >
                <SelectTrigger className="bg-card">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Technology Readiness Level (TRL): {formData.maturityLevel}</Label>
            <input
              type="range"
              min="1"
              max="9"
              value={formData.maturityLevel}
              onChange={(e) => setFormData({ ...formData, maturityLevel: parseInt(e.target.value) })}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground font-mono">
              <span>1 - Research</span>
              <span>5 - Validated</span>
              <span>9 - Deployed</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="country">Country of Origin</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                placeholder="e.g., USA"
                className="bg-card"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="organization">Organization</Label>
              <Input
                id="organization"
                value={formData.organization}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                placeholder="e.g., MIT"
                className="bg-card"
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gradient">
              Add Technology
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
