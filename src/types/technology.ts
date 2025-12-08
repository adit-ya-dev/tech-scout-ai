export interface TechnologyOrigin {
  institution?: string;
  country?: string;
  organization?: string;
  lab?: string;
}

export interface FundingRound {
  date: string;
  amount: number;
  currency: string;
  type: 'seed' | 'series_a' | 'series_b' | 'series_c' | 'grant' | 'corporate' | 'other';
  investors?: string[];
}

export interface Technology {
  id: string;
  name: string;
  description: string;
  category: TechnologyCategory;
  origin: TechnologyOrigin;
  funding: FundingRound[];
  status: TechnologyStatus;
  maturityLevel: number; // TRL 1-9
  marketAdoption: MarketAdoption;
  lastUpdated: string;
  createdAt: string;
  tags: string[];
  imageUrl?: string;
}

export type TechnologyCategory = 
  | 'ai_ml'
  | 'biotech'
  | 'cleantech'
  | 'quantum'
  | 'robotics'
  | 'materials'
  | 'energy'
  | 'space'
  | 'fintech'
  | 'health'
  | 'other';

export type TechnologyStatus = 
  | 'research'
  | 'development'
  | 'prototype'
  | 'pilot'
  | 'commercial'
  | 'scaled';

export type MarketAdoption = 'low' | 'medium' | 'high';

export const CATEGORY_LABELS: Record<TechnologyCategory, string> = {
  ai_ml: 'AI & Machine Learning',
  biotech: 'Biotechnology',
  cleantech: 'Clean Technology',
  quantum: 'Quantum Computing',
  robotics: 'Robotics & Automation',
  materials: 'Advanced Materials',
  energy: 'Energy & Storage',
  space: 'Space Technology',
  fintech: 'Financial Technology',
  health: 'Healthcare & Medical',
  other: 'Other',
};

export const STATUS_LABELS: Record<TechnologyStatus, string> = {
  research: 'Basic Research',
  development: 'Active Development',
  prototype: 'Prototype Stage',
  pilot: 'Pilot Programs',
  commercial: 'Commercial',
  scaled: 'Scaled Production',
};

export const TRL_DESCRIPTIONS: Record<number, string> = {
  1: 'Basic principles observed',
  2: 'Technology concept formulated',
  3: 'Experimental proof of concept',
  4: 'Technology validated in lab',
  5: 'Technology validated in environment',
  6: 'Technology demonstrated in environment',
  7: 'System prototype demonstration',
  8: 'System complete and qualified',
  9: 'Actual system proven in operation',
};
