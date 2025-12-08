import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Building2,
    GraduationCap,
    Microscope,
    Factory,
    ArrowLeft,
    ArrowRight,
    Check,
    Loader2,
    Globe,
    Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

type EntityType = 'startup' | 'research_lab' | 'institution' | 'company';

interface EntityFormData {
    name: string;
    type: EntityType;
    website: string;
    description: string;
    focus_areas: string;
}

const entityTypes = [
    {
        value: 'startup' as EntityType,
        label: 'Startup',
        icon: Building2,
        description: 'Early-stage technology company',
    },
    {
        value: 'research_lab' as EntityType,
        label: 'Research Lab',
        icon: Microscope,
        description: 'Private or government research laboratory',
    },
    {
        value: 'institution' as EntityType,
        label: 'Academic Institution',
        icon: GraduationCap,
        description: 'University or educational institution',
    },
    {
        value: 'company' as EntityType,
        label: 'Corporation',
        icon: Factory,
        description: 'Established technology company',
    },
];

const AddEntityPage: React.FC = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<EntityFormData>({
        name: '',
        type: 'startup',
        website: '',
        description: '',
        focus_areas: '',
    });

    const totalSteps = 3;

    const updateFormData = (field: keyof EntityFormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);

        try {
            const payload = {
                name: formData.name,
                type: formData.type,
                website: formData.website || undefined,
                description: formData.description || undefined,
                focus_areas: formData.focus_areas
                    ? formData.focus_areas.split(',').map(s => s.trim()).filter(Boolean)
                    : undefined,
            };

            const res = await fetch(`${API_BASE}/entities`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                toast({
                    title: 'Entity Created',
                    description: `${formData.name} is now being analyzed`,
                });
                navigate('/dashboard/entities');
            } else {
                const error = await res.json();
                throw new Error(error.detail || 'Failed to create entity');
            }
        } catch (error) {
            console.error('Failed to create entity:', error);
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Failed to create entity',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const canProceed = () => {
        switch (currentStep) {
            case 1:
                return formData.name.trim().length >= 2;
            case 2:
                return formData.type !== undefined;
            case 3:
                return true;
            default:
                return false;
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/dashboard/entities')}
                    className="mb-4"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Entities
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">Add New Entity</h1>
                <p className="text-muted-foreground mt-1">
                    Track a new organization's technology footprint and IP portfolio
                </p>
            </div>

            {/* Progress */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Step {currentStep} of {totalSteps}</span>
                    <span className="text-sm text-muted-foreground">
                        {currentStep === 1 && 'Basic Information'}
                        {currentStep === 2 && 'Entity Type'}
                        {currentStep === 3 && 'Additional Details'}
                    </span>
                </div>
                <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
            </div>

            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                        <CardDescription>
                            Enter the name and website of the organization you want to track
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Organization Name *</Label>
                            <Input
                                id="name"
                                placeholder="e.g., QuantumTech Inc, MIT AI Lab, DeepMind"
                                value={formData.name}
                                onChange={(e) => updateFormData('name', e.target.value)}
                                className="text-lg"
                            />
                            <p className="text-xs text-muted-foreground">
                                Enter the official name of the organization
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="website">Website URL</Label>
                            <div className="relative">
                                <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="website"
                                    placeholder="https://example.com"
                                    value={formData.website}
                                    onChange={(e) => updateFormData('website', e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <Alert>
                            <Info className="h-4 w-4" />
                            <AlertTitle>What happens next?</AlertTitle>
                            <AlertDescription>
                                Once you add an entity, our AI will automatically:
                                <ul className="list-disc list-inside mt-2 space-y-1">
                                    <li>Search patents on Google Patents</li>
                                    <li>Find research papers on arXiv, Semantic Scholar, DBLP, CrossRef</li>
                                    <li>Identify key personnel from publications</li>
                                    <li>Map technology focus areas</li>
                                </ul>
                                <p className="mt-2 font-medium">No API keys required - all data is scraped from public sources.</p>
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>
            )}

            {/* Step 2: Entity Type */}
            {currentStep === 2 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Organization Type</CardTitle>
                        <CardDescription>
                            Select the type of organization to help us tailor the analysis
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <RadioGroup
                            value={formData.type}
                            onValueChange={(value) => updateFormData('type', value)}
                            className="grid grid-cols-2 gap-4"
                        >
                            {entityTypes.map((type) => {
                                const Icon = type.icon;
                                return (
                                    <div key={type.value}>
                                        <RadioGroupItem
                                            value={type.value}
                                            id={type.value}
                                            className="peer sr-only"
                                        />
                                        <Label
                                            htmlFor={type.value}
                                            className={cn(
                                                'flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all',
                                                'peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5'
                                            )}
                                        >
                                            <Icon className="h-8 w-8 mb-2" />
                                            <span className="font-medium">{type.label}</span>
                                            <span className="text-xs text-muted-foreground text-center mt-1">
                                                {type.description}
                                            </span>
                                        </Label>
                                    </div>
                                );
                            })}
                        </RadioGroup>
                    </CardContent>
                </Card>
            )}

            {/* Step 3: Additional Details */}
            {currentStep === 3 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Additional Details (Optional)</CardTitle>
                        <CardDescription>
                            Add context to improve analysis accuracy
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                placeholder="Brief description of the organization..."
                                value={formData.description}
                                onChange={(e) => updateFormData('description', e.target.value)}
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="focus_areas">Known Focus Areas</Label>
                            <Input
                                id="focus_areas"
                                placeholder="e.g., Quantum Computing, AI/ML, Robotics"
                                value={formData.focus_areas}
                                onChange={(e) => updateFormData('focus_areas', e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Comma-separated (optional - we'll detect these automatically)
                            </p>
                        </div>

                        {/* Summary */}
                        <div className="bg-muted rounded-lg p-4">
                            <h4 className="font-medium mb-3">Summary</h4>
                            <dl className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <dt className="text-muted-foreground">Name:</dt>
                                    <dd className="font-medium">{formData.name}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-muted-foreground">Type:</dt>
                                    <dd className="font-medium capitalize">{formData.type.replace('_', ' ')}</dd>
                                </div>
                                {formData.website && (
                                    <div className="flex justify-between">
                                        <dt className="text-muted-foreground">Website:</dt>
                                        <dd className="font-medium truncate max-w-[200px]">{formData.website}</dd>
                                    </div>
                                )}
                            </dl>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6">
                <Button
                    variant="outline"
                    onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
                    disabled={currentStep === 1}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Previous
                </Button>

                {currentStep < totalSteps ? (
                    <Button
                        onClick={() => setCurrentStep((prev) => Math.min(totalSteps, prev + 1))}
                        disabled={!canProceed()}
                    >
                        Next
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                ) : (
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <Check className="mr-2 h-4 w-4" />
                                Start Tracking
                            </>
                        )}
                    </Button>
                )}
            </div>
        </div>
    );
};

export default AddEntityPage;
