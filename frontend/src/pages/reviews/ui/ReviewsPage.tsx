import { Box, Flex, Grid, Text } from "@chakra-ui/react";
import {
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Clock,
  Layers,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../../../widgets/app-shell";
import {
  Badge,
  Card,
  EmptyState,
  ErrorBanner,
  PageHeader,
  Progress,
  Skeleton,
  StatCard,
} from "../../../shared/ui";
import { useReviews } from "../../../entities/reviews";
import type { MasteryState, ReviewTopic } from "../../../entities/reviews";
import { useReviewStats } from "../../../entities/mastery";

const STATE_TONE: Record<
  MasteryState,
  "neutral" | "accent" | "warning" | "success"
> = {
  NEW: "neutral",
  LEARNING: "warning",
  PRACTICED: "accent",
  MASTERED: "success",
};

const fmtDate = (d: string | null) =>
  d
    ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long" })
    : null;

const relDays = (d: string | null) => {
  if (!d) return "";
  const days = Math.ceil(
    (new Date(d).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );
  if (days <= 0) return "today";
  if (days === 1) return "tomorrow";
  return `in ${days} days`;
};

function DueRow({ topic }: { topic: ReviewTopic }) {
  const navigate = useNavigate();
  return (
    <Flex
      align="center"
      gap="14px"
      px="16px"
      py="14px"
      borderBottom="1px solid"
      borderColor="border"
      _last={{ borderBottom: "none" }}
      cursor="pointer"
      transition="background 120ms ease"
      _hover={{ bg: "surface2" }}
      onClick={() => navigate(`/topics/${topic.slug}/drill`)}
    >
      <RefreshCw size={16} strokeWidth={1.5} color="#D29922" />
      <Box flex="1" minW={0}>
        <Text fontSize="14px" fontWeight="500" color="text" lineClamp={1}>
          {topic.title}
        </Text>
        <Text fontSize="12px" color="textFaint">
          Unit {topic.unit} · reviewed {topic.reviewCount}×
        </Text>
      </Box>
      <Box w="90px" display={{ base: "none", sm: "block" }}>
        <Progress value={topic.masteryPct} />
      </Box>
      <Badge tone={STATE_TONE[topic.state]}>{topic.state.toLowerCase()}</Badge>
      <ChevronRight size={16} strokeWidth={1.5} color="var(--chakra-colors-text-faint)" />
    </Flex>
  );
}

function UpcomingRow({ topic }: { topic: ReviewTopic }) {
  const navigate = useNavigate();
  return (
    <Flex
      align="center"
      gap="14px"
      px="16px"
      py="14px"
      borderBottom="1px solid"
      borderColor="border"
      _last={{ borderBottom: "none" }}
      cursor="pointer"
      transition="background 120ms ease"
      _hover={{ bg: "surface2" }}
      onClick={() => navigate(`/topics/${topic.slug}`)}
    >
      <Clock size={16} strokeWidth={1.5} color="var(--chakra-colors-text-faint)" />
      <Box flex="1" minW={0}>
        <Text fontSize="14px" fontWeight="500" color="text" lineClamp={1}>
          {topic.title}
        </Text>
        <Text fontSize="12px" color="textFaint">
          Unit {topic.unit} · {fmtDate(topic.nextReviewAt)}
        </Text>
      </Box>
      <Badge>{relDays(topic.nextReviewAt)}</Badge>
      <ChevronRight size={16} strokeWidth={1.5} color="var(--chakra-colors-text-faint)" />
    </Flex>
  );
}

export default function ReviewsPage() {
  const { data, isError, isFetching, refetch } = useReviews();
  const { data: stats } = useReviewStats();

  const nextLabel = fmtDate(data?.nextReviewAt ?? null);

  return (
    <AppShell>
      <PageHeader title="Reviews" />
      <Box px={{ base: "16px", md: "32px" }} py="24px">
        {!data && (
          <>
            {isError && (
              <ErrorBanner onRetry={() => void refetch()} loading={isFetching} />
            )}
            <Skeleton height="240px" />
          </>
        )}

        {data && (
          <>
            <Grid
              templateColumns="repeat(auto-fit, minmax(160px, 1fr))"
              gap="16px"
              mb="24px"
            >
              <StatCard
                label="Due now"
                value={String(data.dueNow.length)}
                icon={RefreshCw}
              />
              <StatCard
                label="Tracked topics"
                value={String(stats?.totalTracked ?? 0)}
                icon={Layers}
                sub="in review rotation"
              />
              <StatCard
                label="Next review"
                value={nextLabel ?? "—"}
                icon={CalendarClock}
                sub={data.nextReviewAt ? relDays(data.nextReviewAt) : undefined}
              />
            </Grid>

            <Card title={`Due now · ${data.dueNow.length}`} noPadding>
              {data.dueNow.length === 0 ? (
                <EmptyState
                  icon={CheckCircle2}
                  title="Nothing to review right now"
                  description={
                    nextLabel
                      ? `Your next review is scheduled for ${nextLabel}. Spaced repetition brings mastered topics back at growing intervals (1 / 3 / 7 / 16 / 35 days).`
                      : "Master some topics first — they'll come back here for review at growing intervals."
                  }
                />
              ) : (
                data.dueNow.map((t) => <DueRow key={t.slug} topic={t} />)
              )}
            </Card>

            {data.upcoming.length > 0 && (
              <Box mt="24px">
                <Card title="Coming up" noPadding>
                  {data.upcoming.map((t) => (
                    <UpcomingRow key={t.slug} topic={t} />
                  ))}
                </Card>
              </Box>
            )}
          </>
        )}

        <Text fontSize="12px" color="textFaint" mt="12px">
          Topics return for review at intervals of 1, 3, 7, 16, and 35 days. A
          wrong answer on a mastered topic resets its schedule.
        </Text>
      </Box>
    </AppShell>
  );
}
