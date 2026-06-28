import { Box, Flex, Grid, Text } from "@chakra-ui/react";
import { BookOpen, ChevronRight, Headphones, Mic, PenLine } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../../../widgets/app-shell";
import { Card, PageHeader, StatCard } from "../../../shared/ui";
import { useMyProgress } from "../../../entities/mastery";

const fmt = (n: number | null | undefined, suffix = "") =>
  n === null || n === undefined ? "—" : `${Math.round(n)}${suffix}`;

const SKILLS: {
  key: string;
  label: string;
  icon: LucideIcon;
  blurb: string;
}[] = [
  {
    key: "reading",
    label: "Reading",
    icon: BookOpen,
    blurb: "Read topic texts under a timer and answer comprehension questions.",
  },
  {
    key: "listening",
    label: "Listening",
    icon: Headphones,
    blurb: "Listen to topic audio, then answer questions about what you heard.",
  },
  {
    key: "writing",
    label: "Writing",
    icon: PenLine,
    blurb: "Respond to writing prompts; AI gives feedback on your text.",
  },
  {
    key: "speaking",
    label: "Speaking",
    icon: Mic,
    blurb: "Record spoken answers; AI scores fluency and pronunciation.",
  },
];

export default function PracticeIndexPage() {
  const navigate = useNavigate();
  const { data: progress } = useMyProgress();
  const s = progress?.skills;

  const stat: Record<string, { label: string; value: string }> = {
    reading: { label: "Avg comprehension", value: fmt(s?.reading.avgComprehension, "%") },
    listening: { label: "Sessions", value: String(s?.listening.sessions ?? 0) },
    writing: { label: "Avg score", value: fmt(s?.writing.avgScore, "/100") },
    speaking: { label: "Avg score", value: fmt(s?.speaking.avgScore, "/5") },
  };

  return (
    <AppShell>
      <PageHeader title="Practice" />
      <Box px={{ base: "16px", md: "32px" }} py="24px">
        <Text fontSize="14px" color="textMuted" mb="20px" lineHeight="1.6">
          Train each language skill on its own. Pick a skill, then choose a topic
          to practise.
        </Text>
        <Grid templateColumns="repeat(auto-fit, minmax(240px, 1fr))" gap="16px">
          {SKILLS.map((sk) => (
            <Card key={sk.key} noPadding>
              <Box
                as="button"
                w="full"
                textAlign="left"
                p="20px"
                cursor="pointer"
                transition="background 120ms ease"
                _hover={{ bg: "surface2" }}
                onClick={() => navigate(`/practice/${sk.key}`)}
              >
                <Flex align="center" gap="12px" mb="10px">
                  <Flex
                    w="40px"
                    h="40px"
                    borderRadius="lg"
                    bg="accentSubtle"
                    align="center"
                    justify="center"
                    flexShrink={0}
                  >
                    <sk.icon size={20} strokeWidth={1.5} color="#6B91FF" />
                  </Flex>
                  <Text fontSize="16px" fontWeight="600" color="text" flex="1">
                    {sk.label}
                  </Text>
                  <ChevronRight size={18} strokeWidth={1.5} color="var(--chakra-colors-text-faint)" />
                </Flex>
                <Text fontSize="13px" color="textMuted" lineHeight="1.6" mb="14px">
                  {sk.blurb}
                </Text>
                <StatCard label={stat[sk.key].label} value={stat[sk.key].value} />
              </Box>
            </Card>
          ))}
        </Grid>
      </Box>
    </AppShell>
  );
}
