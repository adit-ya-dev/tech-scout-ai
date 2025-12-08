import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getEntities,
    getEntity,
    createEntity,
    updateEntity,
    deleteEntity,
    reanalyzeEntity,
    getDashboardStats,
    type Entity,
    type CreateEntityRequest,
    type EntityListResponse,
    type DashboardStats,
} from '@/lib/api';

// Query keys
export const entityKeys = {
    all: ['entities'] as const,
    lists: () => [...entityKeys.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...entityKeys.lists(), filters] as const,
    details: () => [...entityKeys.all, 'detail'] as const,
    detail: (id: string) => [...entityKeys.details(), id] as const,
    stats: () => ['dashboard', 'stats'] as const,
};

// Get all entities
export function useEntities(params?: {
    page?: number;
    per_page?: number;
    type?: string;
    status?: string;
    search?: string;
}) {
    return useQuery({
        queryKey: entityKeys.list(params || {}),
        queryFn: () => getEntities(params),
        staleTime: 30000, // 30 seconds
    });
}

// Get single entity
export function useEntity(id: string) {
    return useQuery({
        queryKey: entityKeys.detail(id),
        queryFn: () => getEntity(id),
        enabled: !!id,
    });
}

// Get dashboard stats
export function useDashboardStats() {
    return useQuery({
        queryKey: entityKeys.stats(),
        queryFn: getDashboardStats,
        staleTime: 60000, // 1 minute
    });
}

// Create entity mutation
export function useCreateEntity() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateEntityRequest) => createEntity(data),
        onSuccess: () => {
            // Invalidate entities list
            queryClient.invalidateQueries({ queryKey: entityKeys.lists() });
            queryClient.invalidateQueries({ queryKey: entityKeys.stats() });
        },
    });
}

// Update entity mutation
export function useUpdateEntity() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<CreateEntityRequest> }) =>
            updateEntity(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: entityKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: entityKeys.lists() });
        },
    });
}

// Delete entity mutation
export function useDeleteEntity() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => deleteEntity(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: entityKeys.lists() });
            queryClient.invalidateQueries({ queryKey: entityKeys.stats() });
        },
    });
}

// Reanalyze entity mutation
export function useReanalyzeEntity() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => reanalyzeEntity(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: entityKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: entityKeys.lists() });
        },
    });
}
