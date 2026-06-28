import { Box, Flex, Stack, Text } from "@chakra-ui/react";
import {
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Dumbbell,
  GraduationCap,
  Headphones,
  Mic,
  PenLine,
  SpellCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Link as RouterLink,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { AppShell } from "../../../widgets/app-shell";
import {
  AudioPlayer,
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorBanner,
  PageHeader,
  Progress,
  Skeleton,
} from "../../../shared/ui";
import { API_URL } from "../../../shared/api";
import { useTopic, useTopics } from "../../../entities/topic";
import { EXERCISE_TYPE_LABELS } from "../../../entities/exercise";
import {
  fetchComprehension,
  useListeningSession,
  useReadingSession,
  useWritingTasks,
} from "../../../entities/skills";
import type { CompGraded } from "../../../entities/skills";
import { WritingEditor } from "../../../features/writing-check";
import { PresentationViewer } from "../../../features/learn-topic";
import { ComprehensionQuiz } from "../../../features/comprehension";
import { SpeakingPracticePanel } from "../../../features/speaking-practice";

type Skill =
  | "learn"
  | "reading"
  | "listening"
  | "exercises"
  | "writing"
  | "speaking";

const TABS: { key: Skill; label: string; icon: LucideIcon }[] = [
  { key: "learn", label: "Learn", icon: GraduationCap },
  { key: "reading", label: "Reading", icon: BookOpen },
  { key: "listening", label: "Listening", icon: Headphones },
  { key: "exercises", label: "Exercises", icon: SpellCheck },
  { key: "writing", label: "Writing", icon: PenLine },
  { key: "speaking", label: "Speaking", icon: Mic },
];

function SkillTabs({
  active,
  onChange,
}: {
  active: Skill;
  onChange: (s: Skill) => void;
}) {
  return (
    <Flex
      borderBottom="1px solid"
      borderColor="border"
      gap="4px"
      mb="24px"
      overflowX="auto"
      css={{
        scrollbarWidth: "none",
        "&::-webkit-scrollbar": { display: "none" },
      }}
    >
      {TABS.map((t) => {
        const isActive = active === t.key;
        return (
          <Flex
            key={t.key}
            as="button"
            align="center"
            gap="8px"
            px="14px"
            h="38px"
            mb="-1px"
            flexShrink={0}
            whiteSpace="nowrap"
            fontSize="14px"
            fontWeight={isActive ? "500" : "400"}
            color={isActive ? "text" : "textMuted"}
            borderBottom="2px solid"
            borderColor={isActive ? "accent" : "transparent"}
            transition="all 160ms ease"
            _hover={{ color: "text" }}
            onClick={() => onChange(t.key)}
          >
            <t.icon size={15} strokeWidth={1.5} />
            {t.label}
          </Flex>
        );
      })}
    </Flex>
  );
}

// ===== READING TAB =====
function ReadingTab({ slug, text }: { slug: string; text: string }) {
  const { start, complete } = useReadingSession();
  const { data: questions } = useQuery({
    queryKey: ["comprehension", "reading", slug],
    queryFn: () => fetchComprehension(slug, "reading"),
    enabled: !!slug,
  });
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState(0);
  const [readingMs, setReadingMs] = useState<number | null>(null);
  const [phase, setPhase] = useState<"reading" | "quiz">("reading");
  const [done, setDone] = useState<{ wpm: number | null } | null>(null);
  const [graded, setGraded] = useState<CompGraded | null>(null);

  const hasQuestions = (questions?.length ?? 0) > 0;

  const begin = () =>
    start.mutate(slug, {
      onSuccess: (s) => {
        setSessionId(s.id);
        setStartedAt(Date.now());
      },
    });

  const completeNow = (
    ms: number,
    answers?: { questionId: string; value: string | boolean }[],
  ) => {
    if (!sessionId) return;
    complete.mutate(
      { sessionId, readingTimeMs: ms, answers },
      {
        onSuccess: (r) => {
          setDone({ wpm: r.wpm });
          setGraded(r.comprehension);
        },
      },
    );
  };

  const finishReading = () => {
    const ms = Date.now() - startedAt;
    setReadingMs(ms);
    if (hasQuestions) setPhase("quiz");
    else completeNow(ms);
  };

  return (
    <Card title="Reading">
      {!sessionId ? (
        <EmptyState
          icon={BookOpen}
          title="Timed reading"
          description="We measure your reading speed (WPM), then a few questions check what you understood. Press start, read carefully, then continue."
          action={
            <Button onClick={begin} loading={start.isPending}>
              Start reading
            </Button>
          }
        />
      ) : (
        <>
          {text.split("\n").map((line, i) => (
            <Text key={i} fontSize="15px" lineHeight="1.8" color="text">
              {line}
            </Text>
          ))}

          {phase === "reading" && !done && (
            <Flex mt="20px" align="center" gap="14px">
              <Button onClick={finishReading} loading={complete.isPending}>
                <CheckCircle2 size={16} strokeWidth={1.5} />
                {hasQuestions ? "I finished — check understanding" : "I finished reading"}
              </Button>
            </Flex>
          )}

          {phase === "quiz" && hasQuestions && questions && (
            <ComprehensionQuiz
              questions={questions}
              graded={graded}
              submitting={complete.isPending}
              onSubmit={(answers) => completeNow(readingMs ?? 0, answers)}
            />
          )}

          {done && (
            <Flex mt="20px" align="center" gap="12px">
              <Badge tone="success">
                {done.wpm ? `${Math.round(done.wpm)} WPM` : "recorded"}
              </Badge>
            </Flex>
          )}
        </>
      )}
    </Card>
  );
}

// ===== LISTENING TAB =====
function ListeningTab({ slug }: { slug: string }) {
  const { start, complete } = useListeningSession();
  const { data: questions } = useQuery({
    queryKey: ["comprehension", "listening", slug],
    queryFn: () => fetchComprehension(slug, "listening"),
    enabled: !!slug,
  });
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [stats, setStats] = useState({ playCount: 0, speed: 1 });
  const [phase, setPhase] = useState<"listen" | "quiz">("listen");
  const [done, setDone] = useState(false);
  const [graded, setGraded] = useState<CompGraded | null>(null);

  const hasQuestions = (questions?.length ?? 0) > 0;

  const begin = () =>
    start.mutate(slug, { onSuccess: (s) => setSessionId(s.id) });

  const completeNow = (
    answers?: { questionId: string; value: string | boolean }[],
  ) => {
    if (!sessionId) return;
    complete.mutate(
      {
        sessionId,
        playCount: stats.playCount,
        playbackSpeed: stats.speed,
        answers,
      },
      {
        onSuccess: (r) => {
          setDone(true);
          setGraded(r.comprehension);
        },
      },
    );
  };

  const proceed = () => {
    if (hasQuestions) setPhase("quiz");
    else completeNow();
  };

  return (
    <Card title="Listening">
      {!sessionId ? (
        <EmptyState
          icon={Headphones}
          title="Listen to the text"
          description="AI-generated audio of this topic's text. Listen, then answer a few questions about what you heard."
          action={
            <Button onClick={begin} loading={start.isPending}>
              Start listening
            </Button>
          }
        />
      ) : (
        <Stack gap="16px">
          <AudioPlayer
            src={`${API_URL}/topics/${slug}/audio`}
            withSpeed
            onPlay={(playCount, speed) => setStats({ playCount, speed })}
          />
          <Flex align="center" gap="14px">
            {phase === "listen" && !done && (
              <Button
                variant="outline"
                onClick={proceed}
                loading={complete.isPending}
                disabled={stats.playCount === 0}
              >
                <CheckCircle2 size={16} strokeWidth={1.5} />
                {hasQuestions ? "Answer questions" : "Mark as completed"}
              </Button>
            )}
            {done && <Badge tone="success">Completed</Badge>}
            <Text fontFamily="mono" fontSize="12px" color="textFaint">
              plays: {stats.playCount} · speed: {stats.speed}×
            </Text>
          </Flex>

          {phase === "quiz" && hasQuestions && questions && (
            <ComprehensionQuiz
              questions={questions}
              graded={graded}
              submitting={complete.isPending}
              onSubmit={(answers) => completeNow(answers)}
            />
          )}
        </Stack>
      )}
    </Card>
  );
}

// ===== WRITING TAB =====
function WritingTab({ slug }: { slug: string }) {
  const { data: tasks, isLoading } = useWritingTasks(slug);
  const [taskIdx, setTaskIdx] = useState(0);

  if (isLoading) return <Skeleton height="200px" />;
  if (!tasks || tasks.length === 0) {
    return (
      <Card title="Writing">
        <EmptyState
          icon={PenLine}
          title="No writing tasks yet"
          description="Writing tasks for this topic haven't been added."
        />
      </Card>
    );
  }

  const task = tasks[Math.min(taskIdx, tasks.length - 1)];
  return (
    <Card
      title="Writing"
      action={
        tasks.length > 1 ? (
          <Button
            variant="ghost"
            h="30px"
            px="10px"
            fontSize="13px"
            onClick={() => setTaskIdx((taskIdx + 1) % tasks.length)}
          >
            Another task
          </Button>
        ) : undefined
      }
    >
      <WritingEditor key={task.id} task={task} />
    </Card>
  );
}

// ===== SPEAKING TAB =====
function SpeakingTab({ title }: { title: string }) {
  return (
    <Card title="Speaking">
      <SpeakingPracticePanel
        prompt={`Speak for 30–60 seconds about "${title}". Try to use the grammar from this topic naturally. The AI will give you feedback on fluency, grammar, vocabulary, pronunciation, and relevance.`}
      />
    </Card>
  );
}

// ===== EXERCISES TAB =====
function ExercisesTab({
  slug,
  exercises,
}: {
  slug: string;
  exercises: {
    id: string;
    type: keyof typeof EXERCISE_TYPE_LABELS;
    prompt: string;
    difficulty: number;
  }[];
}) {
  const navigate = useNavigate();
  return (
    <>
      <Card title="Exercises" noPadding>
        {exercises.length === 0 ? (
          <EmptyState icon={SpellCheck} title="No exercises yet" />
        ) : (
          <Stack gap={0}>
            {exercises.map((ex, i) => {
              const Icon = ex.type === "SPEAKING" ? Mic : SpellCheck;
              return (
                <Flex
                  key={ex.id}
                  px="20px"
                  py="14px"
                  align="center"
                  gap="14px"
                  borderBottom="1px solid"
                  borderColor="border"
                  cursor="pointer"
                  transition="background 120ms ease"
                  _hover={{ bg: "surface2" }}
                  _last={{ borderBottom: "none" }}
                  onClick={() => navigate(`/topics/${slug}/exercises/${ex.id}`)}
                >
                  <Text fontFamily="mono" fontSize="13px" color="textFaint" w="20px">
                    {String(i + 1).padStart(2, "0")}
                  </Text>
                  <Icon size={16} strokeWidth={1.5} color="var(--chakra-colors-text-faint)" />
                  <Box flex="1" minW={0}>
                    <Text fontSize="14px" color="text" lineClamp={1}>
                      {ex.prompt}
                    </Text>
                    <Text fontSize="12px" color="textFaint">
                      {EXERCISE_TYPE_LABELS[ex.type]} · difficulty {ex.difficulty}/5
                    </Text>
                  </Box>
                  <ChevronRight size={16} strokeWidth={1.5} color="var(--chakra-colors-text-faint)" />
                </Flex>
              );
            })}
          </Stack>
        )}
      </Card>
      {exercises.length > 0 && (
        <Button
          mt="20px"
          onClick={() => navigate(`/topics/${slug}/exercises/${exercises[0].id}`)}
        >
          Start exercises
          <ChevronRight size={16} strokeWidth={1.5} />
        </Button>
      )}
    </>
  );
}

export default function TopicDetailPage() {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const { data: topic, isError, isFetching, refetch } = useTopic(slug);
  const { data: allTopics } = useTopics();
  const [params, setParams] = useSearchParams();
  // Allow deep-linking into a specific skill tab, e.g. /topics/x?skill=reading
  const [skill, setSkill] = useState<Skill>(() => {
    const q = params.get("skill");
    const valid: Skill[] = [
      "learn",
      "reading",
      "listening",
      "exercises",
      "writing",
      "speaking",
    ];
    return valid.includes(q as Skill) ? (q as Skill) : "learn";
  });

  // Keep the active tab in the URL so it survives refresh / back and is shareable.
  const changeSkill = (sk: Skill) => {
    setSkill(sk);
    const next = new URLSearchParams(params);
    if (sk === "learn") next.delete("skill");
    else next.set("skill", sk);
    setParams(next, { replace: true });
  };

  // Previous / next topic in curriculum order, for sequential learning.
  const { prev, next } = useMemo(() => {
    const ordered = [...(allTopics ?? [])].sort(
      (a, b) => a.unit - b.unit || a.order - b.order,
    );
    const i = ordered.findIndex((t) => t.slug === slug);
    return {
      prev: i > 0 ? ordered[i - 1] : null,
      next: i >= 0 && i < ordered.length - 1 ? ordered[i + 1] : null,
    };
  }, [allTopics, slug]);

  return (
    <AppShell>
      <PageHeader
        title={topic?.title ?? "Topic"}
        breadcrumb={
          <RouterLink to="/grammar">
            <Text as="span" color="textFaint" _hover={{ color: "textMuted" }}>
              Grammar
            </Text>
          </RouterLink>
        }
        actions={topic && <Badge tone="accent">Unit {topic.unit}</Badge>}
      />
      <Box px={{ base: "16px", md: "32px" }} py="24px">
        {!topic && (
          <>
            {isError && (
              <ErrorBanner
                message="We couldn't load this topic right now. Please check your internet connection and try again."
                onRetry={() => void refetch()}
                loading={isFetching}
              />
            )}
            <Skeleton height="300px" />
          </>
        )}

        {topic && (
          <>
            <Box mb="20px" maxW="320px">
              <Progress value={topic.masteryPct} showLabel />
            </Box>

            <SkillTabs active={skill} onChange={changeSkill} />

            {skill === "learn" && (
              <Stack gap="24px">
                <PresentationViewer slug={slug} />
                <Flex gap="12px" wrap="wrap">
                  <Button onClick={() => navigate(`/topics/${slug}/drill`)}>
                    <Dumbbell size={16} strokeWidth={1.5} />
                    Drill session
                  </Button>
                  <Button
                    variant="subtle"
                    onClick={() => navigate(`/topics/${slug}/check`)}
                  >
                    <ClipboardCheck size={16} strokeWidth={1.5} />
                    Knowledge check
                  </Button>
                </Flex>
              </Stack>
            )}
            {skill === "reading" && (
              <ReadingTab slug={slug} text={topic.readingText} />
            )}
            {skill === "listening" && <ListeningTab slug={slug} />}
            {skill === "exercises" && (
              <ExercisesTab slug={slug} exercises={topic.exercises} />
            )}
            {skill === "writing" && <WritingTab slug={slug} />}
            {skill === "speaking" && <SpeakingTab title={topic.title} />}

            {(prev || next) && (
              <Flex
                justify="space-between"
                gap="12px"
                mt="32px"
                pt="20px"
                borderTop="1px solid"
                borderColor="border"
              >
                {prev ? (
                  <Flex
                    align="center"
                    gap="10px"
                    px="14px"
                    py="10px"
                    borderRadius="md"
                    border="1px solid"
                    borderColor="border"
                    cursor="pointer"
                    maxW="46%"
                    transition="background 120ms ease"
                    _hover={{ bg: "surface2" }}
                    onClick={() => navigate(`/topics/${prev.slug}`)}
                  >
                    <ChevronLeft
                      size={16}
                      strokeWidth={1.5}
                      color="var(--chakra-colors-text-faint)"
                    />
                    <Box minW={0}>
                      <Text fontSize="11px" color="textFaint">
                        Previous
                      </Text>
                      <Text fontSize="13px" color="text" lineClamp={1}>
                        {prev.title}
                      </Text>
                    </Box>
                  </Flex>
                ) : (
                  <Box />
                )}
                {next ? (
                  <Flex
                    align="center"
                    gap="10px"
                    px="14px"
                    py="10px"
                    borderRadius="md"
                    border="1px solid"
                    borderColor="border"
                    cursor="pointer"
                    maxW="46%"
                    textAlign="right"
                    transition="background 120ms ease"
                    _hover={{ bg: "surface2" }}
                    onClick={() => navigate(`/topics/${next.slug}`)}
                  >
                    <Box minW={0}>
                      <Text fontSize="11px" color="textFaint">
                        Next
                      </Text>
                      <Text fontSize="13px" color="text" lineClamp={1}>
                        {next.title}
                      </Text>
                    </Box>
                    <ChevronRight
                      size={16}
                      strokeWidth={1.5}
                      color="var(--chakra-colors-text-faint)"
                    />
                  </Flex>
                ) : (
                  <Box />
                )}
              </Flex>
            )}
          </>
        )}
      </Box>
    </AppShell>
  );
}
