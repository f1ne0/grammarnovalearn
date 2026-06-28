import {
  Box,
  Flex,
  Grid,
  Stack,
  Text,
  useBreakpointValue,
} from "@chakra-ui/react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  Users,
} from "lucide-react";
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { AppShell } from "../../../widgets/app-shell";
import {
  Badge,
  Button,
  Card,
  DataTable,
  DateRangePicker,
  EmptyState,
  ErrorBanner,
  PageHeader,
  Progress,
  Skeleton,
  TrendStat,
} from "../../../shared/ui";
import { useDateRange } from "../../../shared/lib/dateRange";
import {
  useClassTimeline,
  useGroupsCompare,
  useOverview,
} from "../../../entities/analytics";
import type { GroupCompareRow } from "../../../entities/analytics";
import { downloadCsvExport, useErrorHeatmap, useTeacherStudents } from "../../../entities/teacher";

const DAY = 86_400_000;
const fmtDay = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });

const tooltipStyle = {
  background: "var(--chakra-colors-surface2)",
  border: "1px solid var(--chakra-colors-border)",
  borderRadius: "8px",
  fontSize: "12px",
  fontFamily: '"Geist Mono", monospace',
  color: "var(--chakra-colors-text)",
};

const shortLabel = (s: string) => (s.length > 14 ? `${s.slice(0, 13)}…` : s);

/** A simple "label → count" ranked list. */
function RankList({
  rows,
  empty,
}: {
  rows: [string, number][];
  empty: string;
}) {
  if (rows.length === 0) return <EmptyState icon={Activity} title={empty} />;
  return (
    <Stack gap="8px">
      {rows.map(([label, count]) => (
        <Flex
          key={label}
          justify="space-between"
          align="center"
          bg="surface2"
          border="1px solid"
          borderColor="border"
          borderRadius="md"
          px="14px"
          py="10px"
        >
          <Text fontSize="14px" color="text" textTransform="capitalize" lineClamp={1}>
            {label}
          </Text>
          <Badge tone="warning">{count}×</Badge>
        </Flex>
      ))}
    </Stack>
  );
}

const groupLabel = (v: string) => {
  const s = String(v).replace(/^Group\s*/i, "");
  return s.length > 20 ? s.slice(0, 19) + "…" : s;
};

export default function TeacherAnalyticsPage() {
  const navigate = useNavigate();
  // On mobile, render the group bar chart horizontally so long names stay readable.
  const groupsVertical = useBreakpointValue({ base: true, md: false }) ?? false;
  const { preset } = useDateRange();
  const { data: overview, isError, isFetching, refetch } = useOverview(preset);
  const { data: groups } = useGroupsCompare(preset);
  const { data: heatmap } = useErrorHeatmap();
  const { data: timeline } = useClassTimeline(preset);
  const { data: students } = useTeacherStudents();

  const timelineRows = (timeline ?? []).map((p) => ({
    day: fmtDay(p.day),
    accuracy: p.accuracy,
  }));

  const needsAttention = useMemo(() => {
    const list = students ?? [];
    const inactive = (s: (typeof list)[number]) =>
      !s.lastActiveAt || Date.now() - new Date(s.lastActiveAt).getTime() > 14 * DAY;
    return list
      .filter((s) => s.averageMastery < 40 || inactive(s))
      .sort((a, b) => a.averageMastery - b.averageMastery)
      .slice(0, 6)
      .map((s) => ({
        id: s.id,
        name: s.fullName || s.email,
        mastery: Math.round(s.averageMastery),
        reason: s.averageMastery < 40 ? "low mastery" : "inactive 14d+",
      }));
  }, [students]);

  const errors = useMemo(() => {
    const byCat = new Map<string, number>();
    const byTopic = new Map<string, number>();
    for (const r of heatmap ?? []) {
      byCat.set(r.category, (byCat.get(r.category) ?? 0) + r.count);
      byTopic.set(r.topic, (byTopic.get(r.topic) ?? 0) + r.count);
    }
    const top = (m: Map<string, number>): [string, number][] =>
      [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
    return { categories: top(byCat), topics: top(byTopic) };
  }, [heatmap]);

  const groupRows = (groups ?? []).map((g) => ({
    name: shortLabel(g.name),
    accuracy: g.accuracy.value,
  }));

  return (
    <AppShell>
      <PageHeader
        title="Analytics"
        breadcrumb={
          <RouterLink to="/teacher">
            <Text as="span" color="textFaint" _hover={{ color: "textMuted" }}>
              Teacher
            </Text>
          </RouterLink>
        }
        actions={
          <Flex gap="10px" wrap="wrap">
            <DateRangePicker />
            <Button variant="outline" onClick={() => void downloadCsvExport()}>
              <Download size={15} strokeWidth={1.5} />
              Export
            </Button>
          </Flex>
        }
      />
      <Box px={{ base: "16px", md: "32px" }} py="24px">
        {!overview && (
          <>
            {isError && (
              <ErrorBanner onRetry={() => void refetch()} loading={isFetching} />
            )}
            <Skeleton height="100px" mb="24px" />
          </>
        )}

        {overview && (
          <Grid templateColumns="repeat(auto-fit, minmax(220px, 1fr))" gap="16px" mb="24px">
            <TrendStat label="Active students" value={String(overview.activeStudents.value)} icon={Users} trendPct={overview.activeStudents.trendPct} />
            <TrendStat label="Submissions" value={overview.submissions.value.toLocaleString()} icon={Activity} trendPct={overview.submissions.trendPct} />
            <TrendStat label="Avg accuracy" value={`${overview.accuracy.value}%`} icon={CheckCircle2} trendPct={overview.accuracy.trendPct} />
            <TrendStat label="Avg response" value={`${(overview.avgLatencyMs.value / 1000).toFixed(1)}s`} icon={Clock} trendPct={overview.avgLatencyMs.trendPct} lowerIsBetter />
          </Grid>
        )}

        {/* Class accuracy over time */}
        <Card title="Class accuracy over time">
          {timelineRows.length === 0 ? (
            <EmptyState icon={Activity} title="No activity in this period" />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={timelineRows} margin={{ left: 0, right: 12, top: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="accFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4F7CFF" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#4F7CFF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chakra-colors-border)" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: "var(--chakra-colors-text-faint)", fontSize: 12 }} axisLine={{ stroke: "var(--chakra-colors-border)" }} tickLine={false} interval="preserveStartEnd" minTickGap={28} />
                <YAxis domain={[0, 100]} tick={{ fill: "var(--chakra-colors-text-faint)", fontSize: 12 }} axisLine={false} tickLine={false} width={36} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="accuracy" stroke="#4F7CFF" strokeWidth={2} fill="url(#accFill)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Needs attention */}
        <Grid templateColumns={{ base: "1fr", lg: "1.4fr 1fr" }} gap="16px" mt="24px" mb="24px" alignItems="start">
          <Card title="Needs attention" noPadding>
            {needsAttention.length === 0 ? (
              <EmptyState icon={CheckCircle2} title="Everyone is on track" />
            ) : (
              <Stack gap={0}>
                {needsAttention.map((s) => (
                  <Flex
                    key={s.id}
                    align="center"
                    gap="12px"
                    px="16px"
                    py="12px"
                    borderBottom="1px solid"
                    borderColor="border"
                    _last={{ borderBottom: "none" }}
                    cursor="pointer"
                    _hover={{ bg: "surface2" }}
                    onClick={() => navigate(`/teacher/students/${s.id}`)}
                  >
                    <AlertTriangle size={15} strokeWidth={1.5} color="#D29922" />
                    <Text fontSize="14px" color="text" flex="1" lineClamp={1}>
                      {s.name}
                    </Text>
                    <Badge tone="warning">{s.reason}</Badge>
                    <Text fontFamily="mono" fontSize="13px" color="textMuted" w="44px" textAlign="right">
                      {s.mastery}%
                    </Text>
                    <ChevronRight size={16} strokeWidth={1.5} color="var(--chakra-colors-text-faint)" />
                  </Flex>
                ))}
              </Stack>
            )}
          </Card>
        </Grid>

        {/* Class-wide error insights */}
        <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap="16px" mb="24px" alignItems="start">
          <Card title="Top error categories">
            <RankList rows={errors.categories} empty="No recurring errors" />
          </Card>
          <Card title="Hardest topics (most errors)">
            <RankList rows={errors.topics} empty="No error data" />
          </Card>
        </Grid>

        <Card title="Accuracy by group">
          {groupRows.length > 0 ? (
            groupsVertical ? (
              // Mobile: a compact custom bar list — full group names, no clipping,
              // no wasted space (recharts category labels don't fit narrow screens).
              <Stack gap="14px" py="4px">
                {groupRows.map((g) => (
                  <Box key={g.name}>
                    <Flex justify="space-between" align="baseline" gap="8px" mb="6px">
                      <Text fontSize="13px" color="text" lineClamp={1}>
                        {g.name.replace(/^Group\s*/i, "")}
                      </Text>
                      <Text
                        fontSize="12px"
                        fontFamily="mono"
                        color="textMuted"
                        flexShrink={0}
                      >
                        {Math.round(g.accuracy)}%
                      </Text>
                    </Flex>
                    <Box bg="surface2" borderRadius="full" h="8px" overflow="hidden">
                      <Box
                        h="full"
                        w={`${Math.max(0, Math.min(100, g.accuracy))}%`}
                        bg="#4F7CFF"
                        borderRadius="full"
                      />
                    </Box>
                  </Box>
                ))}
              </Stack>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={groupRows} barSize={40} margin={{ bottom: 28, left: 0, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--chakra-colors-border)" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "var(--chakra-colors-text-faint)", fontSize: 11 }}
                    axisLine={{ stroke: "var(--chakra-colors-border)" }}
                    tickLine={false}
                    interval={0}
                    angle={-18}
                    textAnchor="end"
                    height={56}
                    tickFormatter={groupLabel}
                  />
                  <YAxis domain={[0, 100]} tick={{ fill: "var(--chakra-colors-text-faint)", fontSize: 12 }} axisLine={false} tickLine={false} width={36} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                  <Bar dataKey="accuracy" fill="#4F7CFF" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )
          ) : (
            <EmptyState icon={Users} title="No groups yet" />
          )}
        </Card>

        <Box mt="24px">
          <Card title="Groups" noPadding>
            {!groups || groups.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No groups yet"
                description="Create study groups to compare cohorts."
                action={
                  <Button variant="subtle" onClick={() => navigate("/teacher/groups")}>
                    Manage groups
                  </Button>
                }
              />
            ) : (
              <DataTable<GroupCompareRow>
                columns={[
                  { key: "name", label: "Group", w: 2 },
                  { key: "students", label: "Students", w: 1 },
                  { key: "mastery", label: "Avg mastery", w: 2 },
                  { key: "accuracy", label: "Accuracy", w: 1.5 },
                  { key: "trend", label: "Trend", w: 1 },
                ]}
                rows={groups}
                onRowClick={(g) => navigate(`/teacher/analytics/groups/${g.groupId}`)}
                renderCell={(g, key) => {
                  switch (key) {
                    case "name":
                      return <Text fontSize="14px">{g.name}</Text>;
                    case "students":
                      return <Text fontFamily="mono" fontSize="13px" color="textMuted">{g.students}</Text>;
                    case "mastery":
                      return <Progress value={g.avgMastery} />;
                    case "accuracy":
                      return <Text fontFamily="mono" fontSize="13px" color="textMuted">{g.accuracy.value}%</Text>;
                    case "trend":
                      return g.accuracy.trendPct != null ? (
                        <Badge tone={g.accuracy.trendPct >= 0 ? "success" : "error"}>
                          {g.accuracy.trendPct >= 0 ? "+" : ""}
                          {g.accuracy.trendPct}%
                        </Badge>
                      ) : (
                        <Text color="textFaint">—</Text>
                      );
                    default:
                      return null;
                  }
                }}
              />
            )}
          </Card>
        </Box>
      </Box>
    </AppShell>
  );
}
