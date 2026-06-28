import { Box, Flex, Input, Stack, Text } from "@chakra-ui/react";
import {
  Check,
  ChevronRight,
  ClipboardList,
  Plus,
  Sparkles,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../../../widgets/app-shell";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  FormField,
  PageHeader,
  Select,
  Skeleton,
  notify,
} from "../../../shared/ui";
import { apiErrorMessage } from "../../../shared/api";
import { useTopics } from "../../../entities/topic";
import {
  useCreateTest,
  useGenerateTest,
  useTests,
  useTopicExercises,
} from "../../../entities/tests";
import type { TestType } from "../../../entities/tests";

const TEST_TYPES: TestType[] = ["PRE_TEST", "POST_TEST", "DELAYED_POST", "QUIZ"];

const DIFFICULTY = [
  { value: "1", label: "1 — Easiest" },
  { value: "2", label: "2 — Easy" },
  { value: "3", label: "3 — Medium" },
  { value: "4", label: "4 — Hard" },
  { value: "5", label: "5 — Hardest" },
];

// Shared styling for the bare number inputs (spinner hidden).
const numberInputProps = {
  h: "38px",
  bg: "surface",
  color: "text",
  fontSize: "14px",
  border: "1px solid",
  borderColor: "border",
  borderRadius: "md",
  _hover: { borderColor: "borderStrong" },
  _focusVisible: {
    borderColor: "accent",
    boxShadow: "0 0 0 1px #4F7CFF",
    outline: "none",
  },
  css: {
    "&::-webkit-outer-spin-button, &::-webkit-inner-spin-button": {
      WebkitAppearance: "none",
      margin: 0,
    },
    "&[type=number]": { MozAppearance: "textfield" },
  },
} as const;

export default function TeacherTestsPage() {
  const navigate = useNavigate();
  const { data: topics } = useTopics();
  const { data: tests, isLoading: testsLoading } = useTests();
  const createTest = useCreateTest();
  const generateTest = useGenerateTest();

  // --- AI generation form ---
  const [genTitle, setGenTitle] = useState("");
  const [genType, setGenType] = useState<TestType>("QUIZ");
  const [genTopic, setGenTopic] = useState("");
  const [genDifficulty, setGenDifficulty] = useState("3");
  const [genCount, setGenCount] = useState("9");
  const [genDuration, setGenDuration] = useState("");

  const generate = () => {
    generateTest.mutate(
      {
        title: genTitle,
        type: genType,
        topicId: genTopic,
        difficulty: Number(genDifficulty),
        count: Math.min(50, Math.max(1, Number(genCount) || 1)),
        ...(genDuration ? { durationMin: Number(genDuration) } : {}),
      },
      {
        onSuccess: (t) => {
          setGenTitle("");
          setGenDuration("");
          notify.success(`Test generated · ${t.questionCount} questions`);
        },
        onError: (e) => notify.error(apiErrorMessage(e)),
      },
    );
  };

  // --- Manual builder form ---
  const [title, setTitle] = useState("");
  const [type, setType] = useState<TestType>("QUIZ");
  const [duration, setDuration] = useState("");
  const [browseTopic, setBrowseTopic] = useState("");
  const { data: exercises } = useTopicExercises(browseTopic);
  // questionId -> topicId it came from (lets us aggregate across topics).
  const [selected, setSelected] = useState<Map<string, string>>(new Map());

  const toggle = (id: string, topicId: string) => {
    const next = new Map(selected);
    if (next.has(id)) next.delete(id);
    else next.set(id, topicId);
    setSelected(next);
  };

  const sourceTopicCount = new Set(selected.values()).size;

  const create = () => {
    createTest.mutate(
      {
        title,
        type,
        topicIds: [...new Set(selected.values())],
        questionIds: [...selected.keys()],
        ...(duration ? { durationMin: Number(duration) } : {}),
      },
      {
        onSuccess: () => {
          setTitle("");
          setDuration("");
          setSelected(new Map());
          notify.success("Test created");
        },
        onError: (e) => notify.error(apiErrorMessage(e)),
      },
    );
  };

  return (
    <AppShell>
      <PageHeader title="Tests" breadcrumb="Teacher" />
      <Box px={{ base: "16px", md: "32px" }} py="24px">
        <Stack gap="24px">
          <Card
            title="Generate test with AI"
            action={
              <Button
                loading={generateTest.isPending}
                disabled={!genTitle || !genTopic || generateTest.isPending}
                onClick={generate}
              >
                <Sparkles size={15} strokeWidth={1.5} />
                {generateTest.isPending ? "Generating..." : "Generate test"}
              </Button>
            }
          >
            <Stack gap="14px">
              <FormField
                label="Title"
                placeholder="e.g. Unit 1 — Quiz"
                value={genTitle}
                onChange={(e) => setGenTitle(e.target.value)}
              />
              <Flex gap="12px" wrap="wrap">
                <Box flex="2" minW="200px">
                  <Text fontSize="13px" color="textMuted" mb="6px">
                    Topic
                  </Text>
                  <Select
                    value={genTopic}
                    placeholder="Choose topic…"
                    onChange={setGenTopic}
                    options={(topics ?? []).map((t) => ({
                      value: t.id,
                      label: `Unit ${t.unit} — ${t.title}`,
                    }))}
                  />
                </Box>
                <Box flex="1" minW="140px">
                  <Text fontSize="13px" color="textMuted" mb="6px">
                    Type
                  </Text>
                  <Select
                    value={genType}
                    onChange={(v) => setGenType(v as TestType)}
                    options={TEST_TYPES.map((t) => ({
                      value: t,
                      label: t.replace(/_/g, " "),
                    }))}
                  />
                </Box>
                <Box flex="1" minW="130px">
                  <Text fontSize="13px" color="textMuted" mb="6px">
                    Difficulty
                  </Text>
                  <Select
                    value={genDifficulty}
                    onChange={setGenDifficulty}
                    options={DIFFICULTY}
                  />
                </Box>
                <Box w="90px">
                  <Text fontSize="13px" color="textMuted" mb="6px">
                    Questions
                  </Text>
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={50}
                    value={genCount}
                    onChange={(e) =>
                      setGenCount(e.target.value.replace(/[^0-9]/g, ""))
                    }
                    {...numberInputProps}
                  />
                </Box>
                <Box w="120px">
                  <Text fontSize="13px" color="textMuted" mb="6px">
                    Duration (min)
                  </Text>
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    placeholder="Optional"
                    value={genDuration}
                    onChange={(e) =>
                      setGenDuration(e.target.value.replace(/[^0-9]/g, ""))
                    }
                    {...numberInputProps}
                  />
                </Box>
              </Flex>
              <Text fontSize="12px" color="textFaint">
                AI writes a balanced mix of multiple-choice, fill-in-the-blank
                and true/false questions. They live only inside this test (not in
                the practice pool). Preview the test before students take it.
              </Text>
              {generateTest.isError && (
                <Text fontSize="13px" color="error">
                  {apiErrorMessage(generateTest.error)}
                </Text>
              )}
            </Stack>
          </Card>

          <Card title="Create test">
            <Stack gap="14px">
              <FormField
                label="Title"
                placeholder="e.g. Placement Test — Unit 1"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <Flex gap="12px" wrap="wrap">
                <Box flex="1" minW="150px">
                  <Text fontSize="13px" color="textMuted" mb="6px">
                    Type
                  </Text>
                  <Select
                    value={type}
                    onChange={(v) => setType(v as TestType)}
                    options={TEST_TYPES.map((t) => ({
                      value: t,
                      label: t.replace(/_/g, " "),
                    }))}
                  />
                </Box>
                <Box w="140px">
                  <Text fontSize="13px" color="textMuted" mb="6px">
                    Duration (min)
                  </Text>
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    placeholder="Optional"
                    value={duration}
                    onChange={(e) =>
                      setDuration(e.target.value.replace(/[^0-9]/g, ""))
                    }
                    h="38px"
                    bg="surface"
                    color="text"
                    fontSize="14px"
                    border="1px solid"
                    borderColor="border"
                    borderRadius="md"
                    _hover={{ borderColor: "borderStrong" }}
                    _focusVisible={{
                      borderColor: "accent",
                      boxShadow: "0 0 0 1px #4F7CFF",
                      outline: "none",
                    }}
                    css={{
                      "&::-webkit-outer-spin-button, &::-webkit-inner-spin-button":
                        { WebkitAppearance: "none", margin: 0 },
                      "&[type=number]": { MozAppearance: "textfield" },
                    }}
                  />
                </Box>
                <Box flex="2" minW="220px">
                  <Text fontSize="13px" color="textMuted" mb="6px">
                    Browse questions from topic
                  </Text>
                  <Select
                    value={browseTopic}
                    placeholder="Choose topic…"
                    onChange={setBrowseTopic}
                    options={(topics ?? []).map((t) => ({
                      value: t.id,
                      label: `Unit ${t.unit} — ${t.title}`,
                    }))}
                  />
                </Box>
              </Flex>

              {browseTopic && exercises && exercises.length === 0 && (
                <Text fontSize="13px" color="textMuted">
                  This topic has no questions yet.
                </Text>
              )}

              {exercises && exercises.length > 0 && (
                <Box
                  border="1px solid"
                  borderColor="border"
                  borderRadius="md"
                  maxH="260px"
                  overflowY="auto"
                >
                  {exercises
                    .filter((e) => e.type !== "SPEAKING")
                    .map((e) => {
                      const checked = selected.has(e.id);
                      return (
                        <Flex
                          key={e.id}
                          as="button"
                          w="full"
                          textAlign="left"
                          px="14px"
                          py="10px"
                          gap="10px"
                          align="center"
                          borderBottom="1px solid"
                          borderColor="border"
                          bg={checked ? "accentSubtle" : "transparent"}
                          transition="background 120ms ease"
                          _hover={{ bg: checked ? "accentSubtle" : "surface2" }}
                          _last={{ borderBottom: "none" }}
                          onClick={() => toggle(e.id, browseTopic)}
                        >
                          <Flex
                            w="16px"
                            h="16px"
                            borderRadius="4px"
                            border="1px solid"
                            borderColor={checked ? "accent" : "borderStrong"}
                            bg={checked ? "accent" : "transparent"}
                            align="center"
                            justify="center"
                            flexShrink={0}
                          >
                            {checked && (
                              <Check size={11} strokeWidth={2.5} color="white" />
                            )}
                          </Flex>
                          <Text fontSize="13px" color="text" lineClamp={1}>
                            {e.prompt}
                          </Text>
                        </Flex>
                      );
                    })}
                </Box>
              )}

              {selected.size > 0 && (
                <Text fontSize="12px" color="textFaint">
                  {selected.size} question{selected.size === 1 ? "" : "s"}{" "}
                  selected from {sourceTopicCount} topic
                  {sourceTopicCount === 1 ? "" : "s"}. Switch topics above to add
                  more — your selection is kept.
                </Text>
              )}

              {createTest.isError && (
                <Text fontSize="13px" color="error">
                  {apiErrorMessage(createTest.error)}
                </Text>
              )}
              {createTest.isSuccess && (
                <Text fontSize="13px" color="success">
                  Test created.
                </Text>
              )}
              <Button
                alignSelf="flex-start"
                loading={createTest.isPending}
                disabled={!title || selected.size === 0}
                onClick={create}
              >
                <Plus size={15} strokeWidth={1.5} />
                Create test ({selected.size} questions)
              </Button>
            </Stack>
          </Card>

          <Card title="Existing tests" noPadding>
            {testsLoading && (
              <Box p="20px">
                <Skeleton height="100px" />
              </Box>
            )}
            {tests && tests.length === 0 && (
              <EmptyState icon={ClipboardList} title="No tests yet" />
            )}
            {tests && tests.length > 0 && (
              <Stack gap={0}>
                {tests.map((t) => (
                  <Flex
                    key={t.id}
                    px="20px"
                    py="14px"
                    align="center"
                    gap="12px"
                    borderBottom="1px solid"
                    borderColor="border"
                    _last={{ borderBottom: "none" }}
                    cursor="pointer"
                    transition="background 120ms ease"
                    _hover={{ bg: "surface2" }}
                    onClick={() => navigate(`/teacher/tests/${t.id}`)}
                  >
                    <ClipboardList size={16} strokeWidth={1.5} color="var(--chakra-colors-text-faint)" />
                    <Box flex="1" minW="140px">
                      <Text fontSize="14px" color="text" lineClamp={1}>
                        {t.title}
                      </Text>
                      <Flex align="center" columnGap="12px" rowGap="2px" mt="2px" wrap="wrap">
                        <Text fontSize="12px" color="textFaint" whiteSpace="nowrap">
                          {t.questionCount} question
                          {t.questionCount === 1 ? "" : "s"}
                        </Text>
                        <Flex align="center" gap="4px">
                          <Users size={12} strokeWidth={1.5} color="var(--chakra-colors-text-faint)" />
                          <Text fontSize="12px" color="textFaint" whiteSpace="nowrap">
                            {t.attempts ?? 0} attempt
                            {(t.attempts ?? 0) === 1 ? "" : "s"}
                          </Text>
                        </Flex>
                        {t.avgScore != null && (
                          <Text fontSize="12px" color="textFaint" whiteSpace="nowrap">
                            avg {Math.round(t.avgScore)}%
                          </Text>
                        )}
                      </Flex>
                    </Box>
                    <Flex align="center" gap="8px" flexShrink={0}>
                      <Badge tone={t.type === "QUIZ" ? "success" : "accent"}>
                        {t.type.replace(/_/g, " ")}
                      </Badge>
                      <ChevronRight size={16} strokeWidth={1.5} color="var(--chakra-colors-text-faint)" />
                    </Flex>
                  </Flex>
                ))}
              </Stack>
            )}
          </Card>
        </Stack>
      </Box>
    </AppShell>
  );
}
