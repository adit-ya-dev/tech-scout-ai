/**
 * API Client for Tech Scout AI Backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// Types
export interface Entity {
    id: string;
    name: string;
    type: 'startup' | 'research_lab' | 'institution' | 'company';
    status: 'pending' | 'analyzing' | 'complete' | 'error';
    website?: string;
    description?: string;
    focus_areas?: string[];
    analysis_progress: number;
    patent_count: number;
    paper_count: number;
    personnel_count: number;
    created_at: string;
    updated_at: string;
}

export interface EntityListResponse {
    items: Entity[];
    total: number;
    page: number;
    per_page: number;
}

export interface CreateEntityRequest {
    name: string;
    type: 'startup' | 'research_lab' | 'institution' | 'company';
    website?: string;
    description?: string;
    focus_areas?: string[];
}

export interface DashboardStats {
    total_entities: number;
    total_patents: number;
    total_papers: number;
    total_personnel: number;
    critical_alerts: number;
    entities_analyzing: number;
}

export interface Patent {
    id: string;
    patent_number: string;
    title: string;
    abstract?: string;
    filing_date?: string;
    status?: string;
    inventors?: string[];
    technologies?: string[];
}

export interface Paper {
    id: string;
    title: string;
    abstract?: string;
    authors?: string[];
    publication_date?: string;
    venue?: string;
    citation_count: number;
}

export interface Personnel {
    id: string;
    name: string;
    role?: string;
    expertise?: string[];
    publication_count: number;
    patent_count: number;
    h_index?: number;
}

// API Error class
export class APIError extends Error {
    constructor(public status: number, message: string) {
        super(message);
        this.name = 'APIError';
    }
}

// Helper function for API requests
async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new APIError(response.status, error.detail || 'Request failed');
    }

    return response.json();
}

// ============== Entity APIs ==============

export async function getEntities(params?: {
    page?: number;
    per_page?: number;
    type?: string;
    status?: string;
    search?: string;
}): Promise<EntityListResponse> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.per_page) searchParams.set('per_page', String(params.per_page));
    if (params?.type) searchParams.set('type', params.type);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.search) searchParams.set('search', params.search);

    const query = searchParams.toString();
    return apiRequest<EntityListResponse>(`/entities${query ? `?${query}` : ''}`);
}

export async function getEntity(id: string): Promise<Entity> {
    return apiRequest<Entity>(`/entities/${id}`);
}

export async function createEntity(data: CreateEntityRequest): Promise<Entity> {
    return apiRequest<Entity>('/entities', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function updateEntity(
    id: string,
    data: Partial<CreateEntityRequest>
): Promise<Entity> {
    return apiRequest<Entity>(`/entities/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
}

export async function deleteEntity(id: string): Promise<void> {
    await apiRequest(`/entities/${id}`, { method: 'DELETE' });
}

export async function reanalyzeEntity(id: string): Promise<void> {
    await apiRequest(`/entities/${id}/reanalyze`, { method: 'POST' });
}

// ============== Dashboard APIs ==============

export async function getDashboardStats(): Promise<DashboardStats> {
    return apiRequest<DashboardStats>('/entities/stats');
}

// ============== Patents APIs ==============

export async function getEntityPatents(entityId: string): Promise<Patent[]> {
    return apiRequest<Patent[]>(`/entities/${entityId}/patents`);
}

// ============== Papers APIs ==============

export async function getEntityPapers(entityId: string): Promise<Paper[]> {
    return apiRequest<Paper[]>(`/entities/${entityId}/papers`);
}

// ============== Personnel APIs ==============

export async function getEntityPersonnel(entityId: string): Promise<Personnel[]> {
    return apiRequest<Personnel[]>(`/entities/${entityId}/personnel`);
}
