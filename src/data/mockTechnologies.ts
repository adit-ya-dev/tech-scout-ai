import { Technology } from '@/types/technology';

export const mockTechnologies: Technology[] = [
  {
    id: '1',
    name: 'Solid-State Batteries',
    description: 'Next-generation battery technology using solid electrolytes instead of liquid, offering higher energy density, faster charging, and improved safety.',
    category: 'energy',
    origin: {
      institution: 'Toyota Research Institute',
      country: 'Japan',
      organization: 'Toyota Motor Corporation',
    },
    funding: [
      { date: '2023-06-15', amount: 13500000000, currency: 'USD', type: 'corporate', investors: ['Toyota'] },
      { date: '2022-03-10', amount: 500000000, currency: 'USD', type: 'series_c', investors: ['Samsung SDI', 'Panasonic'] },
    ],
    status: 'pilot',
    maturityLevel: 6,
    marketAdoption: 'low',
    lastUpdated: '2024-11-20',
    createdAt: '2023-01-15',
    tags: ['EV', 'energy storage', 'automotive', 'sustainability'],
  },
  {
    id: '2',
    name: 'CRISPR Gene Editing 3.0',
    description: 'Advanced gene editing platform with improved precision, reduced off-target effects, and the ability to edit multiple genes simultaneously.',
    category: 'biotech',
    origin: {
      institution: 'Broad Institute',
      country: 'USA',
      organization: 'MIT/Harvard',
      lab: 'Zhang Lab',
    },
    funding: [
      { date: '2024-02-20', amount: 750000000, currency: 'USD', type: 'series_b', investors: ['a16z Bio', 'GV'] },
      { date: '2023-08-05', amount: 50000000, currency: 'USD', type: 'grant', investors: ['NIH', 'DARPA'] },
    ],
    status: 'development',
    maturityLevel: 5,
    marketAdoption: 'medium',
    lastUpdated: '2024-12-01',
    createdAt: '2022-06-10',
    tags: ['gene therapy', 'precision medicine', 'biotechnology'],
  },
  {
    id: '3',
    name: 'Neuromorphic Computing Chips',
    description: 'Brain-inspired computing architecture that mimics neural networks in hardware, enabling efficient AI processing with minimal power consumption.',
    category: 'ai_ml',
    origin: {
      institution: 'Intel Labs',
      country: 'USA',
      organization: 'Intel Corporation',
    },
    funding: [
      { date: '2024-01-10', amount: 2000000000, currency: 'USD', type: 'corporate', investors: ['Intel'] },
    ],
    status: 'prototype',
    maturityLevel: 4,
    marketAdoption: 'low',
    lastUpdated: '2024-10-15',
    createdAt: '2021-09-20',
    tags: ['AI hardware', 'edge computing', 'semiconductors', 'neural networks'],
  },
  {
    id: '4',
    name: 'Room-Temperature Superconductors',
    description: 'Materials exhibiting superconductivity at ambient temperatures, potentially revolutionizing power transmission and magnetic applications.',
    category: 'materials',
    origin: {
      institution: 'University of Rochester',
      country: 'USA',
      lab: 'Dias Lab',
    },
    funding: [
      { date: '2023-12-01', amount: 15000000, currency: 'USD', type: 'grant', investors: ['DOE', 'NSF'] },
    ],
    status: 'research',
    maturityLevel: 2,
    marketAdoption: 'low',
    lastUpdated: '2024-08-22',
    createdAt: '2023-03-08',
    tags: ['superconductivity', 'quantum materials', 'physics'],
  },
  {
    id: '5',
    name: 'Autonomous Surgical Robots',
    description: 'AI-powered robotic systems capable of performing complex surgical procedures with minimal human intervention, improving precision and patient outcomes.',
    category: 'robotics',
    origin: {
      institution: 'Johns Hopkins University',
      country: 'USA',
      organization: 'Applied Physics Laboratory',
    },
    funding: [
      { date: '2024-05-15', amount: 320000000, currency: 'USD', type: 'series_c', investors: ['Lux Capital', 'Khosla Ventures'] },
      { date: '2023-02-28', amount: 80000000, currency: 'USD', type: 'series_b', investors: ['Johnson & Johnson'] },
    ],
    status: 'pilot',
    maturityLevel: 7,
    marketAdoption: 'medium',
    lastUpdated: '2024-11-30',
    createdAt: '2020-11-12',
    tags: ['surgery', 'medical devices', 'AI', 'healthcare'],
  },
  {
    id: '6',
    name: 'Quantum Error Correction',
    description: 'Breakthrough techniques for maintaining quantum coherence and correcting errors in quantum computers, enabling practical quantum advantage.',
    category: 'quantum',
    origin: {
      institution: 'Google Quantum AI',
      country: 'USA',
      organization: 'Alphabet Inc.',
    },
    funding: [
      { date: '2024-03-20', amount: 5000000000, currency: 'USD', type: 'corporate', investors: ['Google'] },
    ],
    status: 'development',
    maturityLevel: 4,
    marketAdoption: 'low',
    lastUpdated: '2024-12-05',
    createdAt: '2022-01-25',
    tags: ['quantum computing', 'error correction', 'algorithms'],
  },
  {
    id: '7',
    name: 'Carbon Capture Direct Air',
    description: 'Industrial-scale technology for capturing CO2 directly from ambient air, with potential for permanent sequestration or conversion to useful products.',
    category: 'cleantech',
    origin: {
      institution: 'Climeworks',
      country: 'Switzerland',
      organization: 'ETH Zürich Spin-off',
    },
    funding: [
      { date: '2024-04-10', amount: 650000000, currency: 'USD', type: 'series_c', investors: ['Baillie Gifford', 'Partners Group'] },
      { date: '2022-09-15', amount: 110000000, currency: 'USD', type: 'grant', investors: ['EU Horizon'] },
    ],
    status: 'commercial',
    maturityLevel: 8,
    marketAdoption: 'medium',
    lastUpdated: '2024-11-28',
    createdAt: '2019-05-30',
    tags: ['climate', 'carbon neutral', 'sustainability', 'environment'],
  },
  {
    id: '8',
    name: 'Reusable Orbital Launch System',
    description: 'Fully reusable rocket technology enabling rapid turnaround and dramatically reduced launch costs for commercial and government missions.',
    category: 'space',
    origin: {
      institution: 'SpaceX',
      country: 'USA',
      organization: 'Space Exploration Technologies',
    },
    funding: [
      { date: '2024-06-01', amount: 8500000000, currency: 'USD', type: 'series_c', investors: ['Sequoia', 'Founders Fund', 'a16z'] },
    ],
    status: 'scaled',
    maturityLevel: 9,
    marketAdoption: 'high',
    lastUpdated: '2024-12-02',
    createdAt: '2018-02-14',
    tags: ['space launch', 'rockets', 'aerospace', 'commercial space'],
  },
];

export const getTotalFunding = (tech: Technology): number => {
  return tech.funding.reduce((sum, round) => sum + round.amount, 0);
};

export const formatCurrency = (amount: number): string => {
  if (amount >= 1_000_000_000) {
    return `$${(amount / 1_000_000_000).toFixed(1)}B`;
  }
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(1)}M`;
  }
  return `$${(amount / 1_000).toFixed(0)}K`;
};
