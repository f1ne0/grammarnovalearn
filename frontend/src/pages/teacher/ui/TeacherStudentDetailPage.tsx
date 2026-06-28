import { Box, Flex, Grid, Stack, Text } from "@chakra-ui/react";
import { CheckCircle2, TrendingUp, Users, XCircle } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Link as RouterLink, useParams } from "react-router-dom";
import { AppShell } from "../../../widgets/app-shell";
import {
  Badge,
  Card,
  DataTable,
  DateRangePicker,
  EmptyState,
  ErrorBanner,
  PageHeader,
  Progress,
  ScrollArea,
  Select,
  Skeleton,
  StatCard,
  notify,
} from "../../../shared/ui";
import { apiErrorMessage } from "../../../shared/api";
import { useStudentDetail } from "../../../entities/teacher";
import { useAssignStudents, useGroups } from "../../../entities/groups";
import { useStudentInsight } from "../../../entities/analytics";
import { useDateRange } from "../../../shared/lib/dateRange";

const STATE_TONE: Record<string, "neutral" | "warning" | "accent" | "success"> = {
  NEW: "neutral",
  LEARNING: "warning",
  PRACTICED: "accent",
  MASTERED: "success",
};

const tooltipStyle = {
  background: "var(--chakra-colors-surface2)",
  border: "1px solid var(--chakra-colors-border)",
  borderRadius: "8px",
  fontSize: "12px",
  fontFamily: '"Geist Mono", monospace',
  color: "var(--chakra-colors-text)",
};

const fmtDay = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });

const shortLabel = (s: string) => (s.length > 16 ? `${s.slice(0, 15)}…` : s);

function ago(d?: string | null): string {
  if (!d) return "—";
  const ms = Date.now() - new Date(d).getTime();
  const day = 86_400_000;
  if (ms < 0) return "—";
  if (ms < 3_600_000) return "just now";
  if (ms < day) return "today";
  const days = Math.floor(ms / day);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

interface MasteryRow {
  id: string;
  masteryPct: number;
  attempts: number;
  correct: number;
  state?: "NEW" | "LEARNING" | "PRACTICED" | "MASTERED";
  topic: { id: string; title: string; slug: string; unit: number };
}

export default function TeacherStudentDetailPage() {
  const { studentId = "" } = useParams();
  const { data, isError, isFetching, refetch } = useStudentDetail(studentId);
  const { data: groups } = useGroups();
  const { preset } = useDateRange();
  const { data: insight } = useStudentInsight(studentId, preset);
  const assign = useAssignStudents();

  const student = data?.student;
  const mastery: MasteryRow[] = data?.mastery ?? [];
  const stats = data?.stats;
  const recent = data?.recentSubmissions ?? [];

  const avgMastery = mastery.length
    ? Math.round(mastery.reduce((s, m) => s + m.masteryPct, 0) / mastery.length)
    : 0;
  const mastered = mastery.filter((m) => m.masteryPct >= 75).length;

  return (
    <AppShell>
      <PageHeader
        title={student?.fullName || student?.email || "Student"}
        breadcrumb={
          <RouterLink to="/teacher">
            <Text as="span" color="textFaint" _hover={{ color: "textMuted" }}>
              ← Students
            </Text>
          </RouterLink>
        }
      />
      <Box px={{ base: "16px", md: "32px" }} py="24px">
        {!data && (
          <>
            {isError && (
              <ErrorBanner onRetry={() => void refetch()} loading={isFetching} />
            )}
            <Skeleton height="300px" />
          </>
        )}

        {student && (
          <Flex align="center" gap="14px" wrap="wrap" mb="20px">
            {student.fullName && (
              <Text fontSize="13px" color="textMuted">
                {student.email}
              </Text>
            )}
            <Text fontSize="13px" color="textFaint">
              Member since{" "}
              {new Date(student.createdAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </Text>
            <Flex align="center" gap="8px" ml="auto">
              <Text fontSize="13px" color="textMuted">
                Study group:
              </Text>
              <Box w="200px">
                <Select
                  value={student.studyGroupId ?? ""}
                  placeholder="Unassigned"
                  onChange={(gid) => {
                    if (!gid) return;
                    assign.mutate(
                      { id: gid, studentIds: [studentId] },
                      {
                        onSuccess: () => notify.success("Group updated"),
                        onError: (e) => notify.error(apiErrorMessage(e)),
                      },
                    );
                  }}
                  options={(groups ?? []).map((g) => ({ value: g.id, label: g.name }))}
                />
              </Box>
            </Flex>
          </Flex>
        )}

        {stats && (
          <Grid templateColumns="repeat(auto-fit, minmax(180px, 1fr))" gap="16px" mb="24px">
            <StatCard label="Submissions" value={String(stats.totalSubmissions)} />
            <StatCard label="Correct" value={String(stats.correctSubmissions)} />
            <StatCard label="Accuracy" value={`${stats.accuracy}%`} />
            <StatCard label="Avg mastery" value={`${avgMastery}%`} />
            <StatCard label="Topics mastered" value={String(mastered)} sub={`of ${mastery.length}`} />
          </Grid>
        )}

        {/* Research insights (period-bound) */}
        {insight && (
          <>
            <Flex align="center" justify="space-between" mt="4px" mb="12px" gap="12px">
              <Text fontSize="13px" fontWeight="600" color="textMuted" letterSpacing="0.04em">
                RESEARCH INSIGHTS
              </Text>
              <DateRangePicker />
            </Flex>
            <Card title="Learning curve (daily accuracy %)">
              {insight.curve.length === 0 ? (
                <EmptyState icon={TrendingUp} title="No activity in this period" />
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={insight.curve.map((c) => ({ ...c, day: fmtDay(c.day) }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--chakra-colors-border)" vertical={false} />
                    <XAxis dataKey="day" tick={{ fill: "var(--chakra-colors-text-faint)", fontSize: 12 }} axisLine={{ stroke: "var(--chakra-colors-border)" }} tickLine={false} interval="preserveStartEnd" minTickGap={28} />
                    <YAxis domain={[0, 100]} tick={{ fill: "var(--chakra-colors-text-faint)", fontSize: 12 }} axisLine={false} tickLine={false} width={36} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Line type="monotone" dataKey="accuracy" stroke="#4F7CFF" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </Card>
            <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap="16px" mt="16px" mb="24px">
              <Card title="Student vs group average (mastery)">
                {insight.vsGroup.length === 0 ? (
                  <EmptyState icon={TrendingUp} title="No topic data" />
                ) : (
                  <ResponsiveContainer
                    width="100%"
                    height={Math.max(180, insight.vsGroup.slice(0, 6).length * 52 + 36)}
                  >
                    <BarChart
                      data={insight.vsGroup.slice(0, 6)}
                      layout="vertical"
                      barSize={9}
                      barGap={2}
                      margin={{ top: 4, right: 16, bottom: 4, left: 8 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--chakra-colors-border)" horizontal={false} />
                      <XAxis type="number" domain={[0, 100]} tick={{ fill: "var(--chakra-colors-text-faint)", fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis
                        type="category"
                        dataKey="title"
                        tickFormatter={shortLabel}
                        tick={{ fill: "#A1A1AA", fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        width={140}
                      />
                      <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                      <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: 12, paddingBottom: 8 }} />
                      <Bar dataKey="student" name="Student" fill="#4F7CFF" radius={[0, 3, 3, 0]} />
                      <Bar dataKey="group" name="Group avg" fill="var(--chakra-colors-text-faint)" radius={[0, 3, 3, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Card>

              <Card title="Top error categories">
                {insight.errors.length === 0 ? (
                  <EmptyState icon={TrendingUp} title="No recurring errors" />
                ) : (
                  <Flex direction="column" gap="8px">
                    {insight.errors.map((e) => (
                      <Flex key={e.category} justify="space-between" align="center" bg="surface2" border="1px solid" borderColor="border" borderRadius="md" px="14px" py="10px">
                        <Text fontSize="14px" color="text" textTransform="capitalize">
                          {e.category}
                        </Text>
                        <Badge tone="warning">{e.count}×</Badge>
                      </Flex>
                    ))}
                  </Flex>
                )}
              </Card>

            </Grid>
          </>
        )}

        <Grid
          templateColumns={{ base: "minmax(0, 1fr)", lg: "minmax(0, 1.4fr) minmax(0, 1fr)" }}
          gap="16px"
          alignItems="start"
        >
          {data && (
            <Card title="Mastery by topic" noPadding>
              {mastery.length === 0 ? (
                <EmptyState icon={Users} title="No activity yet" />
              ) : (
                <DataTable<MasteryRow>
                  columns={[
                    { key: "topic", label: "Topic", w: 3 },
                    { key: "state", label: "State", w: 1.4 },
                    { key: "result", label: "Correct", w: 1 },
                    { key: "mastery", label: "Mastery", w: 2 },
                  ]}
                  rows={mastery}
                  renderCell={(m, key) => {
                    switch (key) {
                      case "topic":
                        return (
                          <Text fontSize="14px" lineClamp={1}>
                            {m.topic.title}
                          </Text>
                        );
                      case "state":
                        return m.state ? (
                          <Badge tone={STATE_TONE[m.state] ?? "neutral"}>
                            {m.state.toLowerCase()}
                          </Badge>
                        ) : (
                          <Text color="textFaint">—</Text>
                        );
                      case "result":
                        return (
                          <Text fontFamily="mono" fontSize="13px" color="textMuted">
                            {m.correct}/{m.attempts}
                          </Text>
                        );
                      case "mastery":
                        return <Progress value={m.masteryPct} />;
                      default:
                        return null;
                    }
                  }}
                />
              )}
            </Card>
          )}

          {data && (
            <Card title="Recent activity" noPadding>
              {recent.length === 0 ? (
                <EmptyState icon={TrendingUp} title="No submissions yet" />
              ) : (
                <ScrollArea maxHeight="460px">
                  <Stack gap={0}>
                    {recent.map((r) => (
                      <Flex
                        key={r.id}
                        px="16px"
                        py="11px"
                        align="center"
                        gap="10px"
                        borderBottom="1px solid"
                        borderColor="border"
                        _last={{ borderBottom: "none" }}
                      >
                        {r.isCorrect ? (
                          <CheckCircle2 size={15} strokeWidth={1.5} color="#3FB950" />
                        ) : (
                          <XCircle size={15} strokeWidth={1.5} color="#F85149" />
                        )}
                        <Text fontSize="13px" color="text" lineClamp={1} flex="1">
                          {r.exercise.prompt}
                        </Text>
                        <Text fontSize="12px" color="textFaint" flexShrink={0}>
                          {ago(r.createdAt)}
                        </Text>
                      </Flex>
                    ))}
                  </Stack>
                </ScrollArea>
              )}
            </Card>
          )}
        </Grid>

      </Box>
    </AppShell>
  );
}
