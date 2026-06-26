import { Box, Flex, Stack, Text } from "@chakra-ui/react";
import { Check, Eye, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import { AppShell } from "../../../widgets/app-shell";
import {
  Button,
  Card,
  ConfirmDialog,
  ErrorBanner,
  FormField,
  PageHeader,
  Select,
  Skeleton,
  notify,
} from "../../../shared/ui";
import { apiErrorMessage } from "../../../shared/api";
import { useTopics } from "../../../entities/topic";
import {
  useDeleteTest,
  useTest,
  useTopicExercises,
  useUpdateTest,
} from "../../../entities/tests";
import type { TestType } from "../../../entities/tests";

const TEST_TYPES: TestType[] = ["PRE_TEST", "POST_TEST", "DELAYED_POST", "QUIZ"];

export default function TeacherTestEditPage() {
  const { testId = "" } = useParams();
  const navigate = useNavigate();
  const { data: test, isError, isFetching, refetch } = useTest(testId);
  const { data: topics } = useTopics();
  const update = useUpdateTest();
  const remove = useDeleteTest();

  const [title, setTitle] = useState("");
  const [type, setType] = useState<TestType>("QUIZ");
  const [ids, setIds] = useState<string[]>([]);
  const [prompts, setPrompts] = useState<Record<string, string>>({});
  const [inited, setInited] = useState(false);
  const [topicId, setTopicId] = useState("");
  const [confirmDel, setConfirmDel] = useState(false);

  const { data: exercises } = useTopicExercises(topicId);

  // Initialise the form from the loaded test (once).
  useEffect(() => {
    if (test && !inited) {
      setTitle(test.title);
      setType(test.type);
      setIds(test.questions.map((q) => q.id));
      setPrompts(Object.fromEntries(test.questions.map((q) => [q.id, q.prompt])));
      setInited(true);
    }
  }, [test, inited]);

  const toggle = (id: string, prompt: string) => {
    setIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
    setPrompts((p) => ({ ...p, [id]: prompt }));
  };
  const removeId = (id: string) => setIds((prev) => prev.filter((x) => x !== id));

  const save = () => {
    update.mutate(
      { id: testId, title, type, questionIds: ids },
      {
        onSuccess: () => notify.success("Test saved"),
        onError: (e) => notify.error(apiErrorMessage(e)),
      },
    );
  };

  return (
    <AppShell>
      <PageHeader
        title={test?.title ?? "Edit test"}
        breadcrumb={
          <RouterLink to="/teacher/tests">
            <Text as="span" color="textFaint" _hover={{ color: "textMuted" }}>
              Teacher / Tests
            </Text>
          </RouterLink>
        }
        actions={
          test && (
            <Flex gap="8px">
              <Button
                variant="outline"
                h="32px"
                px="12px"
                fontSize="13px"
                onClick={() => navigate(`/tests/${testId}`)}
              >
                <Eye size={14} strokeWidth={1.5} />
                Preview
              </Button>
              <Button
                variant="ghost"
                h="32px"
                px="12px"
                fontSize="13px"
                onClick={() => setConfirmDel(true)}
              >
                <Trash2 size={14} strokeWidth={1.5} />
                Delete
              </Button>
            </Flex>
          )
        }
      />
      <Box px={{ base: "16px", md: "32px" }} py="24px">
        {!test && (
          <>
            {isError && (
              <ErrorBanner
                message="We couldn't load this test right now. Please check your internet connection and try again."
                onRetry={() => void refetch()}
                loading={isFetching}
              />
            )}
            <Skeleton height="300px" />
          </>
        )}

        {test && (
          <Stack gap="24px">
            <Card title="Details">
              <Stack gap="14px">
                <FormField
                  label="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <Box maxW="220px">
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
              </Stack>
            </Card>

            <Card title={`Questions · ${ids.length}`}>
              <Stack gap="14px">
                {ids.length === 0 ? (
                  <Text fontSize="13px" color="textFaint">
                    No questions yet — add some from a topic below.
                  </Text>
                ) : (
                  <Stack gap="8px">
                    {ids.map((id, i) => (
                      <Flex
                        key={id}
                        align="center"
                        gap="10px"
                        bg="surface2"
                        border="1px solid"
                        borderColor="border"
                        borderRadius="md"
                        px="12px"
                        py="10px"
                      >
                        <Text
                          fontFamily="mono"
                          fontSize="12px"
                          color="textFaint"
                          w="20px"
                        >
                          {String(i + 1).padStart(2, "0")}
                        </Text>
                        <Text flex="1" fontSize="13px" color="text" lineClamp={1}>
                          {prompts[id] ?? id}
                        </Text>
                        <Box
                          as="button"
                          color="var(--chakra-colors-text-faint)"
                          _hover={{ color: "#F85149" }}
                          onClick={() => removeId(id)}
                        >
                          <X size={15} strokeWidth={1.5} />
                        </Box>
                      </Flex>
                    ))}
                  </Stack>
                )}

                <Box>
                  <Text fontSize="13px" color="textMuted" mb="6px">
                    Add questions from a topic
                  </Text>
                  <Box maxW="320px">
                    <Select
                      value={topicId}
                      placeholder="Choose topic…"
                      onChange={setTopicId}
                      options={(topics ?? []).map((t) => ({
                        value: t.id,
                        label: `Unit ${t.unit} — ${t.title}`,
                      }))}
                    />
                  </Box>
                </Box>

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
                        const checked = ids.includes(e.id);
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
                            onClick={() => toggle(e.id, e.prompt)}
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

                <Button
                  alignSelf="flex-start"
                  loading={update.isPending}
                  disabled={!title || ids.length === 0}
                  onClick={save}
                >
                  <Plus size={15} strokeWidth={1.5} />
                  Save test ({ids.length} questions)
                </Button>
              </Stack>
            </Card>
          </Stack>
        )}
      </Box>

      <ConfirmDialog
        open={confirmDel}
        title="Delete test?"
        body="The test and its attempts will be permanently deleted. This cannot be undone."
        confirmLabel="Delete"
        danger
        loading={remove.isPending}
        onConfirm={() =>
          remove.mutate(testId, {
            onSuccess: () => {
              notify.success("Test deleted");
              navigate("/teacher/tests");
            },
            onError: (e) => notify.error(apiErrorMessage(e)),
          })
        }
        onClose={() => setConfirmDel(false)}
      />
    </AppShell>
  );
}
