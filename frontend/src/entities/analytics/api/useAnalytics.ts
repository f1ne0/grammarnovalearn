import { useQuery } from "@tanstack/react-query";
import { api } from "../../../shared/api";
import { rangeParams } from "../../../shared/lib/dateRange";
import type { RangePreset } from "../../../shared/lib/dateRange";

export interface Trend {
  value: number;
  prevValue: number;
  trendPct: number | null;
}

export interface Overview {
  activeStudents: Trend;
  submissions: Trend;
  accuracy: Trend;
  avgLatencyMs: Trend;
}

export interface TimelinePoint {
  day: string;
  accuracy: number;
  submissions: number;
}

export function useClassTimeline(preset: RangePreset) {
  return useQuery({
    queryKey: ["analytics-timeline", preset],
    queryFn: async () =>
      (
        await api.get<TimelinePoint[]>("/analytics/timeline", {
          params: rangeParams(preset),
        })
      ).data,
  });
}

export interface GroupCompareRow {
  groupId: string;
  name: string;
  students: number;
  avgMastery: number;
  submissions: number;
  accuracy: Trend;
}

export interface GroupDetail {
  weakThreshold: number;
  atRiskThreshold: number;
  weakTopics: { title: string; slug: string; avg: number }[];
  allTopics: { title: string; slug: string; avg: number }[];
  distribution: { range: string; count: number }[];
  atRisk: { id: string; email: string; avg: number }[];
  students: { id: string; email: string; avg: number }[];
  activity: { day: string; accuracy: number; attempts: number }[];
}

export interface StudentInsight {
  student: {
    id: string;
    email: string;
    fullName: string | null;
    studyGroupId: string | null;
  };
  curve: { day: string; accuracy: number; attempts: number }[];
  vsGroup: { title: string; student: number; group: number }[];
  errors: { category: string; count: number }[];
  latency: { day: string; ms: number }[];
}

export interface ExperimentRow {
  arm: string;
  students: number;
  accuracy: number | null;
  latency: number | null;
  submissions: number;
  correct: number;
  mastery: number;
}

export interface TestGain {
  type: "PRE_TEST" | "POST_TEST" | "DELAYED_POST";
  control: number | null;
  experimental: number | null;
}

export interface ExperimentResult {
  arms: ExperimentRow[];
  tests: TestGain[];
}

export function useOverview(preset: RangePreset) {
  return useQuery({
    queryKey: ["analytics-overview", preset],
    queryFn: async () =>
      (await api.get<Overview>("/analytics/overview", { params: rangeParams(preset) }))
        .data,
  });
}

export function useGroupsCompare(preset: RangePreset) {
  return useQuery({
    queryKey: ["analytics-groups-compare", preset],
    queryFn: async () =>
      (
        await api.get<GroupCompareRow[]>("/analytics/groups/compare", {
          params: rangeParams(preset),
        })
      ).data,
  });
}

export function useGroupDetail(groupId: string, preset: RangePreset) {
  return useQuery({
    queryKey: ["analytics-group", groupId, preset],
    queryFn: async () =>
      (
        await api.get<GroupDetail>(`/analytics/groups/${groupId}`, {
          params: rangeParams(preset),
        })
      ).data,
    enabled: !!groupId,
  });
}

export function useStudentInsight(studentId: string, preset: RangePreset) {
  return useQuery({
    queryKey: ["analytics-student", studentId, preset],
    queryFn: async () =>
      (
        await api.get<StudentInsight>(`/analytics/students/${studentId}/insight`, {
          params: rangeParams(preset),
        })
      ).data,
    enabled: !!studentId,
  });
}

export function useExperiment(preset: RangePreset) {
  return useQuery({
    queryKey: ["analytics-experiment", preset],
    queryFn: async () =>
      (
        await api.get<ExperimentResult>("/analytics/experiment", {
          params: rangeParams(preset),
        })
      ).data,
  });
}
