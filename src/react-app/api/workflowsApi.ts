import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "./api";

const fetchWorkflows = async () => {
  const res = await api("/api/workflows");
  return res.data;
};

const useWorkflows = () => {
  return useQuery({
    queryKey: ["workflows"],
    queryFn: fetchWorkflows,
  });
};

const useSubmitApproval = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      workflowId: string;
      notes?: string;
      additionalData?: Record<string, any>;
    }) => {
      const res = await api.post("/api/workflow-approved", data);
      return res.data;
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
    },
  });
};

export { useWorkflows, useSubmitApproval };
