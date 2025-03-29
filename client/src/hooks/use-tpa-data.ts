import { useQuery, useMutation } from "@tanstack/react-query";
import { TpaComputationParams, TpaData } from "@/types/tpa";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

// Hook to get TPA data
export const useTpaData = (params: TpaComputationParams) => {
  return useQuery({
    queryKey: ["/api/compute-tpa", params],
    queryFn: async () => {
      const res = await apiRequest("POST", "/api/compute-tpa", params);
      return res.json() as Promise<TpaData>;
    },
    staleTime: 0, // Always refetch when parameters change
  });
};

// Hook to compute TPA with new parameters
export const useComputeTpa = () => {
  return useMutation({
    mutationFn: async (params: TpaComputationParams) => {
      const res = await apiRequest("POST", "/api/compute-tpa", params);
      return res.json() as Promise<TpaData>;
    },
    onSuccess: (data, variables) => {
      // Update the cached data with the new results
      queryClient.setQueryData(["/api/compute-tpa", variables], data);
    },
  });
};

// Hook to get all projects
export const useProjects = (userId?: number) => {
  return useQuery({
    queryKey: ["/api/projects", userId],
    queryFn: async () => {
      const url = userId ? `/api/projects?userId=${userId}` : "/api/projects";
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error('Failed to fetch projects');
      return res.json();
    },
  });
};

// Hook to get FRF datasets for a project
export const useFrfDatasets = (projectId?: number) => {
  return useQuery({
    queryKey: ["/api/frf-datasets", projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const res = await fetch(`/api/frf-datasets?projectId=${projectId}`, { credentials: "include" });
      if (!res.ok) throw new Error('Failed to fetch FRF datasets');
      return res.json();
    },
    enabled: !!projectId,
  });
};

// Hook to get operational measurements for a project
export const useOperationalMeasurements = (projectId?: number) => {
  return useQuery({
    queryKey: ["/api/operational-measurements", projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const res = await fetch(`/api/operational-measurements?projectId=${projectId}`, { credentials: "include" });
      if (!res.ok) throw new Error('Failed to fetch operational measurements');
      return res.json();
    },
    enabled: !!projectId,
  });
};

// Hook to get TPA results for a project
export const useTpaResults = (projectId?: number) => {
  return useQuery({
    queryKey: ["/api/tpa-results", projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const res = await fetch(`/api/tpa-results?projectId=${projectId}`, { credentials: "include" });
      if (!res.ok) throw new Error('Failed to fetch TPA results');
      return res.json();
    },
    enabled: !!projectId,
  });
};

// Hook to save TPA result
export const useSaveTpaResult = () => {
  return useMutation({
    mutationFn: async (resultData: any) => {
      const res = await apiRequest("POST", "/api/tpa-results", resultData);
      return res.json();
    },
    onSuccess: () => {
      // Invalidate TPA results query
      queryClient.invalidateQueries({ queryKey: ["/api/tpa-results"] });
    },
  });
};
