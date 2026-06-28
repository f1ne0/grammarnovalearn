import { Box, Flex, Grid, Text } from "@chakra-ui/react";
import {
  Activity,
  BookOpen,
  CheckCircle2,
  Flame,
  Headphones,
  Layers,
  Mic,
  PenLine,
  Star,
  Target,
} from "lucide-react";
import { useState } from "react";
import { AppShell } from "../../../widgets/app-shell";
import { Button, Card, PageHeader, Progress, Skeleton, StatCard } from "../../../shared/ui";
import {
  useMastery,
  useMyActivity,
  useMyProgress,
  useReviewStats,
} from "../../../entities/mastery";

const MASTERY_THRESHOLD = 75;
const GOAL_KEY = "weeklyGoal";
const GOAL_OPTIONS = [10, 20, 30, 50];

const fmt = (n: number | null | undefined, suffix = "") =>
  n === null || n === undefined ? "—" : `${Math.round(n)}${suffix}`;

export default function GoalsPage() {
  const { data: activity } = useMyActivity();
  const { data: mastery } = useMastery();
  const { data: progress } = useMyProgress();
  const { data: reviewStats } = useReviewStats();

  const [goal, setGoal] = useState<number>(() => {
    const raw = Number(localStorage.getItem(GOAL_KEY));
    return raw && raw > 0 ? raw : 20;
  });
  const saveGoal = (g: number) => {
    setGoal(g);
    localStorage.setItem(GOAL_KEY, String(g));
  };

  const loading = !activity || !mastery || !progress;
  if (loading) {
    return (
      <AppShell>
        <PageHeader title="Goals & progress" />
        <Box px={{ base: "16px", md: "32px" }} py="24px">
          <Skeleton height="300px" />
        </Box>
      </AppShell>
    );
  }

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 6);
  const weekAttempts = activity.days
    .filter((d) => new Date(d.day) >= new Date(weekAgo.toDateString()))
    .reduce((s, d) => s + d.attempts, 0);
  const goalPct = Math.min(100, (weekAttempts / goal) * 100);
  const goalDone = weekAttempts >= goal;

  const totalAttempts = activity.days.reduce((s, d) => s + d.attempts, 0);
  const masteredCount = mastery.filter((m) => m.masteryPct >= MASTERY_THRESHOLD).length;
  const sk = progress.skills;

  const skillRows = [
    { label: "Reading", icon: BookOpen, value: fmt(sk.reading.avgComprehension, "%"), sub: `${sk.reading.sessions} sessions` },
    { label: "Listening", icon: Headphones, value: fmt(sk.listening.avgComprehension, "%"), sub: `${sk.listening.sessions} sessions` },
    { label: "Writing", icon: PenLine, value: fmt(sk.writing.avgScore, "/100"), sub: `${sk.writing.count} submissions` },
    { label: "Speaking", icon: Mic, value: fmt(sk.speaking.avgScore, "/5"), sub: `${sk.speaking.count} attempts` },
  ];

  return (
    <AppShell>
      <PageHeader title="Goals & progress" />
      <Box px={{ base: "16px", md: "32px" }} py="24px">
        {/* Weekly goal */}
        <Card title="Weekly goal">
          <Flex justify="space-between" align="baseline" mb="10px" wrap="wrap" gap="8px">
            <Text fontSize="14px" color="textMuted">
              Exercises this week
            </Text>
            <Text fontSize="20px" fontWeight="600" color={goalDone ? "#3FB950" : "text"}>
              {weekAttempts} / {goal}
            </Text>
          </Flex>
          <Progress value={goalPct} />
          <Text fontSize="12px" color="textFaint" mt="8px">
            {goalDone
              ? "Goal reached — great work this week!"
              : `${goal - weekAttempts} more to hit your weekly goal.`}
          </Text>
          <Flex gap="8px" mt="16px" wrap="wrap">
            <Text fontSize="13px" color="textMuted" alignSelf="center" mr="4px">
              Set goal:
            </Text>
            {GOAL_OPTIONS.map((g) => (
              <Button
                key={g}
                h="30px"
                px="12px"
                fontSize="13px"
                variant={goal === g ? "subtle" : "outline"}
                onClick={() => saveGoal(g)}
              >
                {g}/week
              </Button>
            ))}
          </Flex>
        </Card>

        {/* Overall stats */}
        <Box mt="24px">
          <Grid templateColumns="repeat(auto-fit, minmax(160px, 1fr))" gap="16px">
            <StatCard label="Total exercises" value={String(totalAttempts)} icon={Activity} />
            <StatCard label="Overall accuracy" value={fmt(activity.accuracy.value, "%")} icon={CheckCircle2} />
            <StatCard label="Current streak" value={`${activity.streak.current}d`} icon={Flame} sub={`best ${activity.streak.best}d`} />
            <StatCard label="Topics mastered" value={String(masteredCount)} icon={Star} />
            <StatCard label="In review" value={String(reviewStats?.totalTracked ?? 0)} icon={Layers} sub="topics tracked" />
          </Grid>
        </Box>

        {/* Skills breakdown */}
        <Box mt="24px">
          <Card title="Skill breakdown" noPadding>
            {skillRows.map((r, i) => (
              <Flex
                key={r.label}
                px="20px"
                py="14px"
                align="center"
                gap="14px"
                borderBottom={i < skillRows.length - 1 ? "1px solid" : undefined}
                borderColor="border"
              >
                <Flex
                  w="36px"
                  h="36px"
                  borderRadius="lg"
                  bg="accentSubtle"
                  align="center"
                  justify="center"
                  flexShrink={0}
                >
                  <r.icon size={18} strokeWidth={1.5} color="#6B91FF" />
                </Flex>
                <Box flex="1" minW={0}>
                  <Text fontSize="14px" fontWeight="500" color="text">
                    {r.label}
                  </Text>
                  <Text fontSize="12px" color="textFaint">
                    {r.sub}
                  </Text>
                </Box>
                <Text fontSize="15px" fontWeight="600" color="text" flexShrink={0}>
                  {r.value}
                </Text>
              </Flex>
            ))}
          </Card>
        </Box>
        <Flex align="center" gap="8px" mt="12px" color="textFaint">
          <Target size={13} strokeWidth={1.5} />
          <Text fontSize="12px">
            Your weekly goal is saved on this device.
          </Text>
        </Flex>
      </Box>
    </AppShell>
  );
}
