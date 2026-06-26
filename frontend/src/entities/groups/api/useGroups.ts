import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../shared/api";

export interface GroupSettings {
  id: string;
  groupId: string;
  unlockedUnits: number[];
  weakThreshold: number;
  atRiskThreshold: number;
}

export interface StudyGroup {
  id: string;
  name: string;
  studentCount: number;
  avgMastery: number;
  settings: GroupSettings | null;
  createdAt: string;
}

export function useGroups() {
  return useQuery({
    queryKey: ["groups"],
    queryFn: async () =>
      (await api.get<StudyGroup[]>("/teacher/groups")).data,
  });
}

export function useCreateGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) =>
      (await api.post("/teacher/groups", { name })).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["groups"] }),
  });
}

export function useUpdateGroupSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      settings,
    }: {
      id: string;
      settings: {
        unlockedUnits?: number[];
        weakThreshold?: number;
        atRiskThreshold?: number;
      };
    }) => (await api.patch(`/teacher/groups/${id}/settings`, settings)).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["groups"] }),
  });
}

export function useRenameGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) =>
      (await api.patch(`/teacher/groups/${id}`, { name })).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["groups"] }),
  });
}

export function useDeleteGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) =>
      (await api.delete(`/teacher/groups/${id}`)).data,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["groups"] });
      void qc.invalidateQueries({ queryKey: ["teacher-students"] });
    },
  });
}

export function useRemoveStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      studentId,
    }: {
      id: string;
      studentId: string;
    }) =>
      (await api.delete(`/teacher/groups/${id}/students/${studentId}`)).data,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["groups"] });
      void qc.invalidateQueries({ queryKey: ["teacher-students"] });
    },
  });
}

export function useAssignStudents() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      studentIds,
    }: {
      id: string;
      studentIds: string[];
    }) =>
      (await api.post(`/teacher/groups/${id}/students`, { studentIds })).data,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["groups"] });
      void qc.invalidateQueries({ queryKey: ["teacher-students"] });
    },
  });
}
