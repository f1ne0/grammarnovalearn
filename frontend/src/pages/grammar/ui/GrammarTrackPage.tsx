import { Box, Flex, Grid, Text } from "@chakra-ui/react";
import {
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  Lock,
  PlayCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../../../widgets/app-shell";
import {
  Button,
  Card,
  EmptyState,
  ListToolbar,
  PageHeader,
  Progress,
  Skeleton,
  StatCard,
  ToolbarSelect,
} from "../../../shared/ui";
import { useGrammarLibrary } from "../../../entities/grammar";
import type { GrammarTopic, TopicState } from "../../../entities/grammar";

const UNIT_TITLES: Record<number, string> = {
  1: "Working in IT",
  2: "Your Workplace",
  3: "Job Responsibilities",
  4: "Hardware",
  5: "Software",
  6: "Networks",
  7: "Databases",
  8: "Web Development",
  9: "Mobile Technologies",
  10: "Cybersecurity",
  11: "Cloud Computing",
  12: "AI & Machine Learning",
  13: "Project Management",
  14: "Agile & Teamwork",
  15: "Testing & QA",
  16: "DevOps",
  17: "Tech Interviews",
  18: "Career Development",
};

const STATE_META: Record<
  TopicState,
  { icon: LucideIcon; color: string; label: string }
> = {
  mastered: { icon: CheckCircle2, color: "#3FB950", label: "Mastered" },
  current: { icon: PlayCircle, color: "#4F7CFF", label: "In progress" },
  available: { icon: GraduationCap, color: "var(--chakra-colors-text-faint)", label: "Available" },
  locked: { icon: Lock, color: "#3A3A40", label: "Locked" },
};

const FILTERS = [
  { value: "all", label: "All topics" },
  { value: "current", label: "In progress" },
  { value: "available", label: "Available" },
  { value: "mastered", label: "Mastered" },
  { value: "locked", label: "Locked" },
];

function TopicRow({ topic }: { topic: GrammarTopic }) {
  const navigate = useNavigate();
  const meta = STATE_META[topic.state];
  const locked = topic.state === "locked";
  return (
    <Flex
      align="center"
      gap="14px"
      px="16px"
      py="14px"
      borderBottom="1px solid"
      borderColor="border"
      _last={{ borderBottom: "none" }}
      cursor={locked ? "not-allowed" : "pointer"}
      opacity={locked ? 0.5 : 1}
      transition="background 120ms ease"
      _hover={locked ? {} : { bg: "surface2" }}
      onClick={() => !locked && navigate(`/topics/${topic.slug}`)}
    >
      <meta.icon size={18} strokeWidth={1.5} color={meta.color} />
      <Box flex="1" minW={0}>
        <Text fontSize="14px" fontWeight="500" color="text" lineClamp={1}>
          {topic.title}
        </Text>
        <Text fontSize="12px" color="textFaint">
          {topic.exerciseCount} drills
          {topic.hasPresentation ? " · multi-mode lesson" : ""}
        </Text>
      </Box>
      <Box w="90px" display={{ base: "none", sm: "block" }}>
        <Progress value={topic.masteryPct} />
      </Box>
      {!locked && <ChevronRight size={16} strokeWidth={1.5} color="var(--chakra-colors-text-faint)" />}
    </Flex>
  );
}

function LegendItem({ state }: { state: TopicState }) {
  const m = STATE_META[state];
  return (
    <Flex align="center" gap="6px">
      <m.icon size={13} strokeWidth={1.5} color={m.color} />
      <Text fontSize="12px" color="textFaint">
        {m.label}
      </Text>
    </Flex>
  );
}

/** Structural placeholder that mirrors the real layout (used while loading
 *  and when the request fails, so the page keeps its shape). */
function GrammarSkeleton() {
  return (
    <>
      <Grid
        templateColumns="repeat(auto-fit, minmax(160px, 1fr))"
        gap="16px"
        mb="20px"
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} height="92px" borderRadius="lg" />
        ))}
      </Grid>
      <Box mb="24px">
        <Skeleton height="8px" borderRadius="999px" />
      </Box>
      <Flex gap="10px" mb="16px">
        <Skeleton height="36px" w="280px" borderRadius="md" />
        <Skeleton height="36px" w="160px" borderRadius="md" />
      </Flex>
      <Flex direction="column" gap="16px">
        {Array.from({ length: 2 }).map((_, i) => (
          <Box
            key={i}
            border="1px solid"
            borderColor="border"
            borderRadius="lg"
            overflow="hidden"
          >
            <Box p="16px" borderBottom="1px solid" borderColor="border">
              <Skeleton height="16px" w="180px" />
            </Box>
            {Array.from({ length: 3 }).map((_, j) => (
              <Flex
                key={j}
                align="center"
                gap="14px"
                px="16px"
                py="14px"
                borderBottom="1px solid"
                borderColor="border"
                _last={{ borderBottom: "none" }}
              >
                <Skeleton height="18px" w="18px" borderRadius="full" />
                <Box flex="1">
                  <Skeleton height="14px" w="55%" />
                </Box>
                <Skeleton height="6px" w="90px" borderRadius="999px" />
              </Flex>
            ))}
          </Box>
        ))}
      </Flex>
    </>
  );
}

export default function GrammarTrackPage() {
  const { data, isError, isFetching, refetch } = useGrammarLibrary();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const allTopics = useMemo(
    () => (data?.units ?? []).flatMap((u) => u.topics),
    [data],
  );

  // ---- Overall progress summary ----
  const summary = useMemo(() => {
    const total = allTopics.length;
    const count = (s: TopicState) =>
      allTopics.filter((t) => t.state === s).length;
    const avg =
      total > 0
        ? Math.round(allTopics.reduce((a, t) => a + t.masteryPct, 0) / total)
        : 0;
    return {
      total,
      avg,
      mastered: count("mastered"),
      current: count("current"),
      locked: count("locked"),
    };
  }, [allTopics]);

  // ---- Continue target ----
  const continueTopic = useMemo(() => {
    for (const u of data?.units ?? []) {
      const cur = u.topics.find((t) => t.state === "current");
      if (cur) return cur;
    }
    for (const u of data?.units ?? []) {
      const av = u.topics.find((t) => t.state === "available");
      if (av) return av;
    }
    return null;
  }, [data]);

  // ---- Search + state filter ----
  const q = search.trim().toLowerCase();
  const filteredUnits = (data?.units ?? [])
    .map((u) => ({
      ...u,
      topics: u.topics.filter(
        (t) =>
          (filter === "all" || t.state === filter) &&
          (!q || t.title.toLowerCase().includes(q)),
      ),
    }))
    .filter((u) => u.topics.length > 0);

  const filtering = filter !== "all" || q.length > 0;

  return (
    <AppShell>
      <PageHeader title="Grammar — learn from scratch" />
      <Box px={{ base: "16px", md: "32px" }} py="24px">
        {!data && (
          <>
            {isError && (
              <Flex
                align="center"
                justify="space-between"
                gap="12px"
                wrap="wrap"
                bg="rgba(248,81,73,.08)"
                border="1px solid"
                borderColor="rgba(248,81,73,.25)"
                borderRadius="md"
                p="12px 16px"
                mb="20px"
              >
                <Text fontSize="13px" color="text">
                  We couldn't load your grammar track right now. Please check
                  your internet connection and try again.
                </Text>
                <Button
                  variant="outline"
                  h="32px"
                  px="12px"
                  fontSize="13px"
                  loading={isFetching}
                  onClick={() => void refetch()}
                >
                  Try again
                </Button>
              </Flex>
            )}
            <GrammarSkeleton />
          </>
        )}

        {data && (
          <>
            {/* Overall progress */}
            <Grid
              templateColumns="repeat(auto-fit, minmax(160px, 1fr))"
              gap="16px"
              mb="20px"
            >
              <StatCard
                label="Overall mastery"
                value={`${summary.avg}%`}
                icon={GraduationCap}
                sub={`${summary.total} topics`}
              />
              <StatCard
                label="Mastered"
                value={String(summary.mastered)}
                icon={CheckCircle2}
                sub={`of ${summary.total}`}
              />
              <StatCard
                label="In progress"
                value={String(summary.current)}
                icon={PlayCircle}
              />
              <StatCard
                label="Locked"
                value={String(summary.locked)}
                icon={Lock}
              />
            </Grid>

            <Box mb="24px">
              <Progress value={summary.avg} />
            </Box>

            {/* Continue */}
            {continueTopic && !filtering && (
              <Flex
                align="center"
                justify="space-between"
                gap="12px"
                bg="accentSubtle"
                border="1px solid"
                borderColor="rgba(79,124,255,.3)"
                borderRadius="lg"
                p="16px 20px"
                mb="24px"
                cursor="pointer"
                _hover={{ borderColor: "accent" }}
                onClick={() => navigate(`/topics/${continueTopic.slug}`)}
              >
                <Flex align="center" gap="12px">
                  <PlayCircle size={20} strokeWidth={1.5} color="#6B91FF" />
                  <Box>
                    <Text fontSize="13px" color="textMuted">
                      Continue where you left off
                    </Text>
                    <Text fontSize="15px" fontWeight="600" color="text">
                      {continueTopic.title}
                    </Text>
                  </Box>
                </Flex>
                <ChevronRight size={18} strokeWidth={1.5} color="#6B91FF" />
              </Flex>
            )}

            {/* Toolbar + legend */}
            <ListToolbar
              search={search}
              onSearch={setSearch}
              placeholder="Search topics…"
            >
              <ToolbarSelect
                value={filter}
                onChange={setFilter}
                options={FILTERS}
                width="160px"
              />
            </ListToolbar>

            <Flex gap="16px" wrap="wrap" mb="16px">
              {(Object.keys(STATE_META) as TopicState[]).map((s) => (
                <LegendItem key={s} state={s} />
              ))}
            </Flex>

            {/* Units */}
            {filteredUnits.length === 0 ? (
              <EmptyState
                icon={GraduationCap}
                title="No topics match"
                description="Try a different search or filter."
              />
            ) : (
              <Flex direction="column" gap="16px">
                {filteredUnits.map((u) => (
                  <Card
                    key={u.unit}
                    title={`Unit ${u.unit} — ${UNIT_TITLES[u.unit] ?? ""}`}
                    noPadding
                    action={
                      <Text fontFamily="mono" fontSize="13px" color="textMuted">
                        {u.avgMastery}%
                      </Text>
                    }
                  >
                    {u.topics.map((t) => (
                      <TopicRow key={t.id} topic={t} />
                    ))}
                  </Card>
                ))}
              </Flex>
            )}
          </>
        )}
      </Box>
    </AppShell>
  );
}
