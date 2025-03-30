import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

// Hook to compute SVD with custom matrix
export const useComputeSvd = () => {
  return useMutation({
    mutationFn: async (matrix: number[][]) => {
      const res = await apiRequest("POST", "/api/python/compute-svd", { matrix });
      return res.json();
    }
  });
};