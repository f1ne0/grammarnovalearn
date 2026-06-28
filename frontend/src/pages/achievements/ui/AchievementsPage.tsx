import { Box, Flex, Grid, Text } from "@chakra-ui/react";
import {
  Award,
  BookOpen,
  CheckCircle2,
  Flame,
  Layers,
  Lock,
  Sparkles,
  Star,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AppShell } from "../../../widgets/app-shell";
import { Card, PageHeader, Progress, Skeleton, StatCard } from "../../../shared/ui";
import { useMastery, useMyActivity, useMyProgress, useReviewStats } from "../../../entities/mastery";
import { useTests } from "../../../entities/tests";

const MASTERY_THRESHOLD = 75;

type Badge = {
  id: string;
  title: string;
  desc: string;
  icon: LucideIcon;
  current: number;
  target: number;
};

export default function AchievementsPage() {
  const { data: activity } = useMyActivity();
  const { data: mastery } = useMastery();
  const { data: progress } = useMyProgress();
  const { data: reviewStats } = useReviewStats();
  const { data: tests } = useTests();

  const loading = !activity || !mastery || !progress || !tests;

  if (loading) {
    return (
      <AppShell>
        <PageHeader title="Achievements" />
        <Box px={{ base: "16px", md: "32px" }} py="24px">
          <Skeleton height="300px" />
        </Box>
      </AppShell>
    );
  }

  const totalAttempts = activity.days.reduce((s, d) => s + d.attempts, 0);
  const streak = activity.streak.current;
  const bestStreak = activity.streak.best;
  const masteredCount = mastery.filter((m) => m.masteryPct >= MASTERY_THRESHOLD).length;
  const accuracy = Math.round(activity.accuracy.value ?? 0);
  const takenTests = tests.filter((t) => t.attempt).length;
  const perfectTests = tests.filter((t) => (t.attempt?.score ?? 0) >= 100).length;
  const sk = progress.skills;
  const skillsUsed = [
    (sk.reading.sessions ?? 0) > 0,
    (sk.listening.sessions ?? 0) > 0,
    (sk.writing.count ?? 0) > 0,
    (sk.speaking.count ?? 0) > 0,
  ].filter(Boolean).length;
  const tracked = reviewStats?.totalTracked ?? 0;

  const badges: Badge[] = [
    { id: "first", title: "First steps", desc: "Answer your first exercise", icon: Sparkles, current: totalAttempts, target: 1 },
    { id: "fifty", title: "Warming up", desc: "Answer 50 exercises", icon: Zap, current: totalAttempts, target: 50 },
    { id: "century", title: "Century", desc: "Answer 100 exercises", icon: BookOpen, current: totalAttempts, target: 100 },
    { id: "streak3", title: "On a roll", desc: "Reach a 3-day streak", icon: Flame, current: bestStreak, target: 3 },
    { id: "streak7", title: "Consistent", desc: "Reach a 7-day streak", icon: Flame, current: bestStreak, target: 7 },
    { id: "streak14", title: "Unstoppable", desc: "Reach a 14-day streak", icon: Flame, current: bestStreak, target: 14 },
    { id: "master1", title: "First mastery", desc: "Master your first topic", icon: Star, current: masteredCount, target: 1 },
    { id: "master5", title: "Scholar", desc: "Master 5 topics", icon: Star, current: masteredCount, target: 5 },
    { id: "master10", title: "Expert", desc: "Master 10 topics", icon: Trophy, current: masteredCount, target: 10 },
    { id: "accuracy", title: "Sharp shooter", desc: "Reach 80% overall accuracy", icon: Target, current: accuracy, target: 80 },
    { id: "test1", title: "Test taker", desc: "Complete your first test", icon: CheckCircle2, current: takenTests, target: 1 },
    { id: "perfect", title: "Perfectionist", desc: "Score 100% on a test", icon: Award, current: perfectTests, target: 1 },
    { id: "allround", title: "All-rounder", desc: "Practise all four skills", icon: Layers, current: skillsUsed, target: 4 },
    { id: "reviewer", title: "In rotation", desc: "Track 5 topics for review", icon: Layers, current: tracked, target: 5 },
  ];

  const unlocked = badges.filter((b) => b.current >= b.target);

  return (
    <AppShell>
      <PageHeader title="Achievements" />
      <Box px={{ base: "16px", md: "32px" }} py="24px">
        <Grid templateColumns="repeat(auto-fit, minmax(160px, 1fr))" gap="16px" mb="24px">
          <StatCard label="Unlocked" value={`${unlocked.length}/${badges.length}`} icon={Trophy} />
          <StatCard label="Current streak" value={`${streak} day${streak === 1 ? "" : "s"}`} icon={Flame} />
          <StatCard label="Topics mastered" value={String(masteredCount)} icon={Star} />
        </Grid>

        <Grid templateColumns="repeat(auto-fit, minmax(260px, 1fr))" gap="16px">
          {badges.map((b) => {
            const done = b.current >= b.target;
            const pct = Math.min(100, (b.current / b.target) * 100);
            return (
              <Card key={b.id} noPadding>
                <Flex p="18px" gap="14px" align="flex-start" opacity={done ? 1 : 0.85}>
                  <Flex
                    w="44px"
                    h="44px"
                    borderRadius="lg"
                    flexShrink={0}
                    align="center"
                    justify="center"
                    bg={done ? "accentSubtle" : "surface2"}
                  >
                    {done ? (
                      <b.icon size={22} strokeWidth={1.5} color="#6B91FF" />
                    ) : (
                      <Lock size={18} strokeWidth={1.5} color="var(--chakra-colors-text-faint)" />
                    )}
                  </Flex>
                  <Box flex="1" minW={0}>
                    <Flex align="center" gap="8px" mb="2px">
                      <Text fontSize="15px" fontWeight="600" color="text">
                        {b.title}
                      </Text>
                    </Flex>
                    <Text fontSize="13px" color="textMuted" mb="10px" lineHeight="1.5">
                      {b.desc}
                    </Text>
                    {done ? (
                      <Text fontSize="12px" fontWeight="500" color="#3FB950">
                        ✓ Unlocked
                      </Text>
                    ) : (
                      <Box>
                        <Progress value={pct} />
                        <Text fontSize="11px" color="textFaint" mt="4px">
                          {Math.min(b.current, b.target)} / {b.target}
                        </Text>
                      </Box>
                    )}
                  </Box>
                </Flex>
              </Card>
            );
          })}
        </Grid>
      </Box>
    </AppShell>
  );
}
