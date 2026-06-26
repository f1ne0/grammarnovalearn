import { Box, Flex, Grid, Stack, Text } from "@chakra-ui/react";
import {
  BookOpen,
  ChevronRight,
  Headphones,
  Mic,
  PenLine,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { AppShell } from "../../../widgets/app-shell";
import {
  Card,
  EmptyState,
  PageHeader,
  Skeleton,
  StatCard,
} from "../../../shared/ui";
import { useTopics } from "../../../entities/topic";
import { useMyProgress } from "../../../entities/mastery";
import type { SkillsProgress } from "../../../entities/mastery";

type SkillKey = "reading" | "listening" | "writing" | "speaking";

const fmt = (n: number | null | undefined, suffix = "") =>
  n === null || n === undefined ? "—" : `${Math.round(n)}${suffix}`;

const SKILLS: Record<
  SkillKey,
  {
    label: string;
    icon: LucideIcon;
    blurb: string;
    stats: (s: SkillsProgress["skills"]) => {
      label: string;
      value: string;
      sub?: string;
    }[];
  }
> = {
  reading: {
    label: "Reading",
    icon: BookOpen,
    blurb:
      "Read each topic's text under a timer — we measure your speed and check comprehension with a short quiz.",
    stats: (s) => [
      { label: "Avg speed", value: fmt(s.reading.avgWpm, " wpm") },
      { label: "Comprehension", value: fmt(s.reading.avgComprehension, "%") },
      { label: "Sessions", value: String(s.reading.sessions) },
    ],
  },
  listening: {
    label: "Listening",
    icon: Headphones,
    blurb:
      "Listen to each topic's audio, then answer comprehension questions about what you heard.",
    stats: (s) => [
      {
        label: "Comprehension",
        value: fmt(s.listening.avgComprehension, "%"),
      },
      { label: "Sessions", value: String(s.listening.sessions) },
    ],
  },
  writing: {
    label: "Writing",
    icon: PenLine,
    blurb:
      "Respond to writing prompts in each topic. AI gives feedback on grammar, vocabulary and structure.",
    stats: (s) => [
      { label: "Avg score", value: fmt(s.writing.avgScore, "/100") },
      { label: "Submissions", value: String(s.writing.count) },
    ],
  },
  speaking: {
    label: "Speaking",
    icon: Mic,
    blurb:
      "Record spoken answers to each topic's prompts. AI scores fluency, pronunciation and accuracy.",
    stats: (s) => [
      { label: "Avg score", value: fmt(s.speaking.avgScore, "/5") },
      { label: "Attempts", value: String(s.speaking.count) },
    ],
  },
};

export default function PracticeHubPage() {
  const { skill = "" } = useParams();
  const navigate = useNavigate();
  const { data: topics, isLoading } = useTopics();
  const { data: progress } = useMyProgress();

  if (!(skill in SKILLS)) {
    return <Navigate to="/" replace />;
  }
  const cfg = SKILLS[skill as SkillKey];
  const Icon = cfg.icon;
  const stats = progress ? cfg.stats(progress.skills) : [];

  const ordered = [...(topics ?? [])].sort(
    (a, b) => a.unit - b.unit || a.order - b.order,
  );

  return (
    <AppShell>
      <PageHeader title={`${cfg.label} practice`} breadcrumb="Practice" />
      <Box px={{ base: "16px", md: "32px" }} py="24px">
        <Flex align="flex-start" gap="14px" mb="24px">
          <Flex
            w="44px"
            h="44px"
            borderRadius="lg"
            bg="accentSubtle"
            align="center"
            justify="center"
            flexShrink={0}
          >
            <Icon size={22} strokeWidth={1.5} color="#6B91FF" />
          </Flex>
          <Text fontSize="14px" color="textMuted" lineHeight="1.6" pt="2px">
            {cfg.blurb}
          </Text>
        </Flex>

        {stats.length > 0 && (
          <Grid
            templateColumns="repeat(auto-fit, minmax(160px, 1fr))"
            gap="16px"
            mb="24px"
          >
            {stats.map((st) => (
              <StatCard
                key={st.label}
                label={st.label}
                value={st.value}
                sub={st.sub}
                icon={Icon}
              />
            ))}
          </Grid>
        )}

        <Card title="Practice by topic" noPadding>
          {isLoading && (
            <Box p="20px">
              <Skeleton height="160px" />
            </Box>
          )}
          {topics && ordered.length === 0 && (
            <EmptyState
              icon={Icon}
              title="No topics yet"
              description="Once your teacher adds topics, you can practice here."
            />
          )}
          {ordered.length > 0 && (
            <Stack gap={0}>
              {ordered.map((t) => (
                <Flex
                  key={t.id}
                  align="center"
                  gap="14px"
                  px="20px"
                  py="14px"
                  borderBottom="1px solid"
                  borderColor="border"
                  _last={{ borderBottom: "none" }}
                  cursor="pointer"
                  transition="background 120ms ease"
                  _hover={{ bg: "surface2" }}
                  onClick={() => navigate(`/topics/${t.slug}?skill=${skill}`)}
                >
                  <Icon size={16} strokeWidth={1.5} color="var(--chakra-colors-text-faint)" />
                  <Box flex="1" minW={0}>
                    <Text
                      fontSize="14px"
                      fontWeight="500"
                      color="text"
                      lineClamp={1}
                    >
                      {t.title}
                    </Text>
                    <Text fontSize="12px" color="textFaint">
                      Unit {t.unit}
                    </Text>
                  </Box>
                  <ChevronRight size={16} strokeWidth={1.5} color="var(--chakra-colors-text-faint)" />
                </Flex>
              ))}
            </Stack>
          )}
        </Card>
      </Box>
    </AppShell>
  );
}
