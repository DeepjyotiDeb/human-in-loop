import { useQuery } from "@tanstack/react-query";
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

export { useWorkflows };
