import { Box, Flex, Grid, SimpleGrid, Text } from "@chakra-ui/react";
import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  ClipboardList,
  Clock,
  Flame,
  Headphones,
  Mic,
  PenLine,
  PlayCircle,
  RefreshCw,
  SpellCheck,
  Target,
  TrendingUp,
} from "lucide-react";
import { useMemo } from "react";
import type { ReactNode } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell } from "../../../widgets/app-shell";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorBanner,
  PageHeader,
  Progress,
  Skeleton,
  StatCard,
  TrendStat,
} from "../../../shared/ui";
import { useTopics } from "../../../entities/topic";
import type { TopicListItem } from "../../../entities/topic";
import {
  useMastery,
  useMyActivity,
  useMyProgress,
  useReviewStats,
} from "../../../entities/mastery";
import { useReviews } from "../../../entities/reviews";
import { useTests } from "../../../entities/tests";

const tooltipStyle = {
  background: "var(--chakra-colors-surface2)",
  border: "1px solid var(--chakra-colors-border)",
  borderRadius: "8px",
  fontSize: "12px",
  color: "#E4E4E7",
} as const;

const fmt = (n: number | null | undefined, suffix = "") =>
  n === null || n === undefined ? "—" : `${Math.round(n)}${suffix}`;

// ===== Continue / focus / review rows =====
function TopicLink({
  slug,
  title,
  sub,
  icon: Icon,
  iconColor,
  to,
  right,
}: {
  slug: string;
  title: string;
  sub: string;
  icon: typeof BookOpen;
  iconColor: string;
  to: string;
  right?: ReactNode;
}) {
  const navigate = useNavigate();
  return (
    <Flex
      align="center"
      gap="14px"
      px="16px"
      py="13px"
      borderBottom="1px solid"
      borderColor="border"
      _last={{ borderBottom: "none" }}
      cursor="pointer"
      transition="background 120ms ease"
      _hover={{ bg: "surface2" }}
      onClick={() => navigate(to)}
      data-slug={slug}
    >
      <Icon size={16} strokeWidth={1.5} color={iconColor} />
      <Box flex="1" minW={0}>
        <Text fontSize="14px" fontWeight="500" color="text" lineClamp={1}>
          {title}
        </Text>
        <Text fontSize="12px" color="textFaint">
          {sub}
        </Text>
      </Box>
      {right}
      <ChevronRight size={16} strokeWidth={1.5} color="var(--chakra-colors-text-faint)" />
    </Flex>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data: topics, isError, isFetching, refetch } = useTopics();
  const { data: mastery } = useMastery();
  const { data: reviewStats } = useReviewStats();
  const { data: reviews } = useReviews();
  const { data: progress } = useMyProgress();
  const { data: activity } = useMyActivity();
  const { data: tests } = useTests();

  // ---- KPIs ----
  const avgMastery =
    topics && topics.length > 0
      ? Math.round(
          topics.reduce((s, t) => s + t.masteryPct, 0) / topics.length,
        )
      : 0;
  const totalAttempts = (mastery ?? []).reduce((s, m) => s + m.attempts, 0);
  const totalCorrect = (mastery ?? []).reduce((s, m) => s + m.correct, 0);
  const accuracy =
    totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
  const MASTERY_THRESHOLD = 75; // matches the knowledge-check pass mark
  const masteredCount = (topics ?? []).filter(
    (t) => t.masteryPct >= MASTERY_THRESHOLD,
  ).length;
  const dueNow = reviewStats?.dueNow ?? reviews?.dueNow.length ?? 0;

  // ---- Continue target ----
  const continueTopic = useMemo<TopicListItem | undefined>(() => {
    if (!topics || topics.length === 0) return undefined;
    const masteryBySlug = new Map(
      (mastery ?? []).map((m) => [m.topic.slug, m]),
    );
    const ordered = [...topics].sort(
      (a, b) => a.unit - b.unit || a.order - b.order,
    );
    // in-progress: attempted but not yet mastered, closest to mastery first
    const inProgress = ordered
      .filter((t) => {
        const m = masteryBySlug.get(t.slug);
        return m && m.attempts > 0 && t.masteryPct < 80;
      })
      .sort((a, b) => b.masteryPct - a.masteryPct);
    if (inProgress.length) return inProgress[0];
    // otherwise the first not-yet-mastered topic in the curriculum
    return ordered.find((t) => t.masteryPct < 80) ?? ordered[0];
  }, [topics, mastery]);

  // ---- Focus areas (weakest attempted topics) ----
  const focus = useMemo(() => {
    const attempted = (mastery ?? []).filter((m) => m.attempts >= 2);
    const base = attempted.length
      ? attempted
      : (mastery ?? []).filter((m) => m.attempts >= 1);
    return [...base].sort((a, b) => a.masteryPct - b.masteryPct).slice(0, 4);
  }, [mastery]);

  // ---- Mastery by unit (chart) ----
  const byUnit = useMemo(() => {
    const map = new Map<number, { sum: number; n: number }>();
    for (const t of topics ?? []) {
      const cur = map.get(t.unit) ?? { sum: 0, n: 0 };
      cur.sum += t.masteryPct;
      cur.n += 1;
      map.set(t.unit, cur);
    }
    return [...map.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([unit, { sum, n }]) => ({
        unit: `U${unit}`,
        avg: Math.round(sum / n),
      }));
  }, [topics]);

  const fresh = totalAttempts === 0;
  const s = progress?.skills;

  // ---- Activity / streak ----
  const streak = activity?.streak.current ?? 0;
  const bestStreak = activity?.streak.best ?? 0;
  const activityData = (activity?.days ?? []).map((d) => ({
    d: d.day.slice(8),
    attempts: d.attempts,
  }));
  const hasActivity = activityData.some((d) => d.attempts > 0);

  // ---- Tests still to take (no completed attempt) ----
  const untakenTests = (tests ?? []).filter((t) => !t.attempt);

  return (
    <AppShell>
      <PageHeader
        title="Dashboard"
        actions={
          <RouterLink to="/grammar">
            <Flex
              align="center"
              gap="6px"
              fontSize="13px"
              color="textMuted"
              _hover={{ color: "text" }}
            >
              Browse all topics
              <ArrowRight size={14} strokeWidth={1.5} />
            </Flex>
          </RouterLink>
        }
      />
      <Box px={{ base: "16px", md: "32px" }} py="24px">
        {!topics && (
          <>
            {isError && (
              <ErrorBanner
                onRetry={() => void refetch()}
                loading={isFetching}
              />
            )}
            <Flex direction="column" gap="16px">
              <Skeleton height="96px" borderRadius="12px" />
              <Skeleton height="88px" borderRadius="12px" />
              <Skeleton height="240px" borderRadius="12px" />
            </Flex>
          </>
        )}

        {topics && (
          <>
            {/* Continue / Welcome */}
            {continueTopic && (
              <Flex
                align="center"
                justify="space-between"
                gap="12px"
                bg="accentSubtle"
                border="1px solid"
                borderColor="rgba(79,124,255,.3)"
                borderRadius="lg"
                p="18px 22px"
                mb="24px"
                cursor="pointer"
                _hover={{ borderColor: "accent" }}
                onClick={() => navigate(`/topics/${continueTopic.slug}`)}
              >
                <Flex align="center" gap="14px">
                  <PlayCircle size={22} strokeWidth={1.5} color="#6B91FF" />
                  <Box>
                    <Text fontSize="13px" color="textMuted">
                      {fresh
                        ? "Start learning — Unit 1"
                        : "Continue where you left off"}
                    </Text>
                    <Text fontSize="16px" fontWeight="600" color="text">
                      {continueTopic.title}
                    </Text>
                  </Box>
                </Flex>
                <ArrowRight size={18} strokeWidth={1.5} color="#6B91FF" />
              </Flex>
            )}

            {/* KPIs */}
            <Grid
              templateColumns="repeat(auto-fit, minmax(200px, 1fr))"
              gap="16px"
              mb="24px"
            >
              <StatCard
                label="Average mastery"
                value={`${avgMastery}%`}
                icon={SpellCheck}
                sub={`${masteredCount}/${topics.length} mastered`}
              />
              {fresh ? (
                <StatCard
                  label="Accuracy"
                  value="—"
                  icon={Target}
                  sub="0 attempts"
                />
              ) : (
                <TrendStat
                  label="Accuracy"
                  value={`${accuracy}%`}
                  icon={Target}
                  trendPct={activity?.accuracy.trendPct ?? null}
                />
              )}
              <StatCard
                label="Due for review"
                value={String(dueNow)}
                icon={Clock}
                sub={`${reviewStats?.totalTracked ?? 0} tracked`}
              />
              <StatCard
                label="Day streak"
                value={streak > 0 ? `${streak}d` : "0"}
                icon={Flame}
                sub={bestStreak > 0 ? `best ${bestStreak} days` : "start today"}
              />
            </Grid>

            {/* Due for review + Focus areas */}
            <SimpleGrid columns={{ base: 1, lg: 2 }} gap="16px" mb="24px">
              <Card
                title={`Due for review · ${reviews?.dueNow.length ?? 0}`}
                action={
                  reviews && reviews.dueNow.length > 0 ? (
                    <Button
                      variant="subtle"
                      h="30px"
                      px="12px"
                      fontSize="13px"
                      onClick={() => navigate("/reviews")}
                    >
                      <RefreshCw size={14} strokeWidth={1.5} />
                      Start review
                    </Button>
                  ) : undefined
                }
                noPadding
              >
                {!reviews || reviews.dueNow.length === 0 ? (
                  <EmptyState
                    icon={RefreshCw}
                    title="Nothing due right now"
                    description="Mastered topics return here at growing intervals (1 / 3 / 7 / 16 / 35 days)."
                  />
                ) : (
                  reviews.dueNow
                    .slice(0, 5)
                    .map((t) => (
                      <TopicLink
                        key={t.slug}
                        slug={t.slug}
                        title={t.title}
                        sub={`Unit ${t.unit} · reviewed ${t.reviewCount}×`}
                        icon={RefreshCw}
                        iconColor="#D29922"
                        to={`/topics/${t.slug}/drill`}
                      />
                    ))
                )}
              </Card>

              <Card title="Focus areas" noPadding>
                {focus.length === 0 ? (
                  <EmptyState
                    icon={Target}
                    title="No weak spots yet"
                    description="Once you answer a few exercises, your lowest-scoring topics show up here."
                  />
                ) : (
                  focus.map((m) => (
                    <TopicLink
                      key={m.topic.slug}
                      slug={m.topic.slug}
                      title={m.topic.title}
                      sub={`Unit ${m.topic.unit} · ${m.correct}/${m.attempts} correct`}
                      icon={Target}
                      iconColor="#F85149"
                      to={`/topics/${m.topic.slug}`}
                      right={
                        <Box w="70px" display={{ base: "none", sm: "block" }}>
                          <Progress value={m.masteryPct} />
                        </Box>
                      }
                    />
                  ))
                )}
              </Card>
            </SimpleGrid>

            {/* Tests to take + Activity */}
            <SimpleGrid columns={{ base: 1, lg: 2 }} gap="16px" mb="24px">
              <Card title={`Tests to take · ${untakenTests.length}`} noPadding>
                {untakenTests.length === 0 ? (
                  <EmptyState
                    icon={ClipboardList}
                    title="No tests waiting"
                    description="Tests your teacher assigns will appear here until you complete them."
                  />
                ) : (
                  untakenTests.slice(0, 5).map((t) => (
                    <TopicLink
                      key={t.id}
                      slug={t.id}
                      title={t.title}
                      sub={`${t.questionCount} question${t.questionCount === 1 ? "" : "s"}${t.durationMin ? ` · ${t.durationMin} min` : ""}`}
                      icon={ClipboardList}
                      iconColor="#6B91FF"
                      to={`/tests/${t.id}`}
                      right={
                        <Badge tone={t.type === "QUIZ" ? "success" : "accent"}>
                          {t.type.replace(/_/g, " ")}
                        </Badge>
                      }
                    />
                  ))
                )}
              </Card>

              <Card
                title="Last 14 days"
                action={
                  <Flex align="center" gap="6px">
                    <Flame
                      size={15}
                      strokeWidth={1.5}
                      color={streak > 0 ? "#D29922" : "var(--chakra-colors-text-faint)"}
                    />
                    <Text fontSize="13px" color={streak > 0 ? "text" : "textFaint"}>
                      {streak > 0 ? `${streak}-day streak` : "No streak yet"}
                    </Text>
                  </Flex>
                }
              >
                {hasActivity ? (
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={activityData} barSize={10}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--chakra-colors-border)"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="d"
                        tick={{ fill: "var(--chakra-colors-text-faint)", fontSize: 11 }}
                        axisLine={{ stroke: "var(--chakra-colors-border)" }}
                        tickLine={false}
                        interval={1}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fill: "var(--chakra-colors-text-faint)", fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                        width={24}
                      />
                      <Tooltip
                        contentStyle={tooltipStyle}
                        cursor={{ fill: "rgba(255,255,255,0.03)" }}
                        formatter={(v) => [`${v}`, "attempts"]}
                      />
                      <Bar
                        dataKey="attempts"
                        fill="#4F7CFF"
                        radius={[3, 3, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState
                    icon={Flame}
                    title="No activity yet"
                    description="Answer a few exercises and your daily activity will show up here."
                  />
                )}
              </Card>
            </SimpleGrid>

            {/* Skills snapshot */}
            <Text
              fontSize="13px"
              fontWeight="600"
              color="textMuted"
              letterSpacing="0.04em"
              mb="12px"
            >
              SKILLS
            </Text>
            <SimpleGrid columns={{ base: 2, md: 4 }} gap="16px" mb="28px">
              <RouterLink to="/practice/reading" style={{ display: "block" }}>
                <StatCard
                  label="Reading"
                  value={s ? fmt(s.reading.avgWpm, " wpm") : "—"}
                  icon={BookOpen}
                  sub={
                    s
                      ? `${fmt(s.reading.avgComprehension, "%")} comp · ${s.reading.sessions} sessions`
                      : "no data"
                  }
                />
              </RouterLink>
              <RouterLink to="/practice/listening" style={{ display: "block" }}>
                <StatCard
                  label="Listening"
                  value={s ? fmt(s.listening.avgComprehension, "%") : "—"}
                  icon={Headphones}
                  sub={s ? `${s.listening.sessions} sessions` : "no data"}
                />
              </RouterLink>
              <RouterLink to="/practice/writing" style={{ display: "block" }}>
                <StatCard
                  label="Writing"
                  value={s ? fmt(s.writing.avgScore, "/100") : "—"}
                  icon={PenLine}
                  sub={s ? `${s.writing.count} submissions` : "no data"}
                />
              </RouterLink>
              <RouterLink to="/practice/speaking" style={{ display: "block" }}>
                <StatCard
                  label="Speaking"
                  value={s ? fmt(s.speaking.avgScore, "/5") : "—"}
                  icon={Mic}
                  sub={s ? `${s.speaking.count} attempts` : "no data"}
                />
              </RouterLink>
            </SimpleGrid>

            {/* Mastery by unit */}
            <Card
              title="Mastery by unit"
              action={<TrendingUp size={16} strokeWidth={1.5} color="var(--chakra-colors-text-faint)" />}
            >
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={byUnit} barSize={18}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--chakra-colors-border)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="unit"
                    tick={{ fill: "var(--chakra-colors-text-faint)", fontSize: 11 }}
                    axisLine={{ stroke: "var(--chakra-colors-border)" }}
                    tickLine={false}
                    interval={0}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: "var(--chakra-colors-text-faint)", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    cursor={{ fill: "rgba(255,255,255,0.03)" }}
                  />
                  <Bar dataKey="avg" fill="#4F7CFF" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {fresh && (
              <Flex
                align="center"
                gap="12px"
                mt="24px"
                bg="surface"
                border="1px solid"
                borderColor="border"
                borderRadius="lg"
                p="16px 20px"
              >
                <BookOpen size={18} strokeWidth={1.5} color="#6B91FF" />
                <Box flex="1">
                  <Text fontSize="14px" fontWeight="500" color="text">
                    Welcome! Your stats will fill in as you practice.
                  </Text>
                  <Text fontSize="13px" color="textMuted">
                    Open a topic, read the text, listen, then try the exercises —
                    AI gives feedback on every answer.
                  </Text>
                </Box>
                <Button onClick={() => navigate("/grammar")}>Browse topics</Button>
              </Flex>
            )}
          </>
        )}
      </Box>
    </AppShell>
  );
}
