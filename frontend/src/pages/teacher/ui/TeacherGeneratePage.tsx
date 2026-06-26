import { Box, Flex, Input, Stack, Text } from "@chakra-ui/react";
import { Check, ChevronDown, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AppShell } from "../../../widgets/app-shell";
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  PageHeader,
  Select,
  Skeleton,
  notify,
} from "../../../shared/ui";
import { apiErrorMessage } from "../../../shared/api";
import { useTopics } from "../../../entities/topic";
import {
  useGenerateExercises,
  usePendingExercises,
  useValidateExercise,
  type PendingExercise,
} from "../../../entities/teacher";

const TYPES = ["MULTIPLE_CHOICE", "FILL_IN_BLANK", "TRUE_FALSE"] as const;

const DIFFICULTY = [
  { value: "1", label: "1 — Easiest" },
  { value: "2", label: "2 — Easy" },
  { value: "3", label: "3 — Medium" },
  { value: "4", label: "4 — Hard" },
  { value: "5", label: "5 — Hardest" },
];

const DIFF_TONE: Record<number, "success" | "warning" | "error" | "neutral"> = {
  1: "success",
  2: "success",
  3: "neutral",
  4: "warning",
  5: "error",
};

/** Renders the correct answer + explanation for a pending exercise. */
function AnswerPreview({ ex }: { ex: PendingExercise }) {
  const p = ex.payload ?? {};
  return (
    <Box
      mt="10px"
      p="12px"
      bg="surface2"
      borderRadius="md"
      border="1px solid"
      borderColor="border"
    >
      {ex.type === "MULTIPLE_CHOICE" && p.options && (
        <Stack gap="6px">
          {p.options.map((o) => {
            const correct = o.id === p.correctAnswerId;
            return (
              <Flex key={o.id} align="center" gap="8px">
                {correct ? (
                  <Check size={14} strokeWidth={2} color="#3FB950" />
                ) : (
                  <Box w="14px" h="14px" flexShrink={0} />
                )}
                <Text
                  fontSize="13px"
                  color={correct ? "success" : "textMuted"}
                  fontWeight={correct ? "600" : "400"}
                >
                  {o.text}
                </Text>
              </Flex>
            );
          })}
        </Stack>
      )}

      {ex.type === "FILL_IN_BLANK" && (
        <Text fontSize="13px" color="text">
          Answer:{" "}
          <Text as="span" color="success" fontWeight="600">
            {(p.correctAnswers ?? []).join(" / ") || "—"}
          </Text>
        </Text>
      )}

      {ex.type === "TRUE_FALSE" && (
        <Text fontSize="13px" color="text">
          Answer:{" "}
          <Text as="span" color="success" fontWeight="600">
            {p.correctAnswer ? "True" : "False"}
          </Text>
        </Text>
      )}

      {p.explanation && (
        <Text fontSize="12px" color="textFaint" mt="10px" lineHeight="1.5">
          {p.explanation}
        </Text>
      )}
    </Box>
  );
}

export default function TeacherGeneratePage() {
  const { data: topics } = useTopics();
  const generate = useGenerateExercises();
  const { data: pending, isLoading: pendingLoading } = usePendingExercises();
  const validate = useValidateExercise();

  const [params] = useSearchParams();
  const [topicId, setTopicId] = useState(() => params.get("topicId") ?? "");
  const [type, setType] = useState<string>("MULTIPLE_CHOICE");
  const [difficulty, setDifficulty] = useState("3");
  const [count, setCount] = useState("3");
  const [discardId, setDiscardId] = useState<string | null>(null);
  const [discardAll, setDiscardAll] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const approve = (id: string) =>
    validate.mutate(
      { id, approve: true },
      {
        onSuccess: () => notify.success("Exercise approved"),
        onError: (e) => notify.error(apiErrorMessage(e)),
      },
    );

  const discard = () => {
    if (!discardId) return;
    validate.mutate(
      { id: discardId, approve: false },
      {
        onSuccess: () => {
          notify.success("Exercise discarded");
          setDiscardId(null);
        },
        onError: (e) => notify.error(apiErrorMessage(e)),
      },
    );
  };

  const runBulk = async (approveAll: boolean) => {
    if (!pending?.length) return;
    setBulkBusy(true);
    const ids = pending.map((e) => e.id);
    let ok = 0;
    for (const id of ids) {
      try {
        await validate.mutateAsync({ id, approve: approveAll });
        ok++;
      } catch {
        /* keep going */
      }
    }
    setBulkBusy(false);
    setDiscardAll(false);
    if (ok)
      notify.success(
        `${ok} exercise${ok > 1 ? "s" : ""} ${approveAll ? "approved" : "discarded"}`,
      );
    if (ok < ids.length) notify.error(`${ids.length - ok} failed`);
  };

  const busy = validate.isPending || bulkBusy;

  return (
    <AppShell>
      <PageHeader title="AI Exercise Generator" breadcrumb="Teacher" />
      <Box px={{ base: "16px", md: "32px" }} py="24px">
        <Stack gap="24px">
          <Card
            title="Generate exercises"
            action={
              <Button
                loading={generate.isPending}
                disabled={!topicId || generate.isPending}
                onClick={() =>
                  generate.mutate({
                    topicId,
                    type,
                    count: Math.min(50, Math.max(1, Number(count) || 1)),
                    difficulty: Number(difficulty),
                  })
                }
              >
                <Sparkles size={15} strokeWidth={1.5} />
                {generate.isPending ? "Generating..." : "Generate"}
              </Button>
            }
          >
            <Flex gap="12px" wrap="wrap">
              <Box flex="2" minW="220px">
                <Text fontSize="13px" color="textMuted" mb="6px">
                  Topic
                </Text>
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
              <Box flex="1" minW="160px">
                <Text fontSize="13px" color="textMuted" mb="6px">
                  Type
                </Text>
                <Select
                  value={type}
                  onChange={setType}
                  options={TYPES.map((t) => ({
                    value: t,
                    label: t.replace(/_/g, " "),
                  }))}
                />
              </Box>
              <Box flex="1" minW="150px">
                <Text fontSize="13px" color="textMuted" mb="6px">
                  Difficulty
                </Text>
                <Select
                  value={difficulty}
                  onChange={setDifficulty}
                  options={DIFFICULTY}
                />
              </Box>
              <Box w="100px">
                <Text fontSize="13px" color="textMuted" mb="6px">
                  Count
                </Text>
                <Input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={50}
                  value={count}
                  onChange={(e) =>
                    setCount(e.target.value.replace(/[^0-9]/g, ""))
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
            </Flex>
            {generate.isError && (
              <Text fontSize="13px" color="error" mt="12px">
                {apiErrorMessage(generate.error)}
              </Text>
            )}
            {generate.isSuccess && (
              <Text fontSize="13px" color="success" mt="12px">
                Generated {generate.data.generated} exercises — review them
                below.
              </Text>
            )}
          </Card>

          <Card
            title={`Pending validation${pending ? ` · ${pending.length}` : ""}`}
            action={
              pending && pending.length > 0 ? (
                <Flex gap="8px">
                  <Button
                    variant="subtle"
                    h="30px"
                    px="12px"
                    fontSize="13px"
                    loading={bulkBusy}
                    disabled={busy}
                    onClick={() => void runBulk(true)}
                  >
                    <Check size={14} strokeWidth={1.5} />
                    Approve all
                  </Button>
                  <Button
                    variant="ghost"
                    h="30px"
                    px="12px"
                    fontSize="13px"
                    disabled={busy}
                    onClick={() => setDiscardAll(true)}
                  >
                    <X size={14} strokeWidth={1.5} />
                    Discard all
                  </Button>
                </Flex>
              ) : undefined
            }
            noPadding
          >
            {pendingLoading && (
              <Box p="20px">
                <Skeleton height="120px" />
              </Box>
            )}
            {pending && pending.length === 0 && (
              <EmptyState
                icon={Sparkles}
                title="Queue is empty"
                description="Generated exercises will appear here for review before students see them."
              />
            )}
            {pending && pending.length > 0 && (
              <Stack gap={0}>
                {pending.map((ex) => {
                  const open = expanded.has(ex.id);
                  return (
                    <Box
                      key={ex.id}
                      px="20px"
                      py="14px"
                      borderBottom="1px solid"
                      borderColor="border"
                      _last={{ borderBottom: "none" }}
                    >
                      <Flex gap="14px" align="center">
                        <Box flex="1" minW={0}>
                          <Text fontSize="14px" color="text" mb="4px">
                            {ex.prompt}
                          </Text>
                          <Flex gap="8px" align="center" wrap="wrap">
                            <Badge>{ex.type.replace(/_/g, " ")}</Badge>
                            <Badge tone={DIFF_TONE[ex.difficulty] ?? "neutral"}>
                              Difficulty {ex.difficulty}
                            </Badge>
                            <Text fontSize="12px" color="textFaint">
                              {ex.topic.title}
                            </Text>
                          </Flex>
                        </Box>
                        <Button
                          variant="ghost"
                          h="30px"
                          px="10px"
                          fontSize="13px"
                          onClick={() => toggle(ex.id)}
                        >
                          <Box
                            as="span"
                            display="inline-flex"
                            transform={open ? "rotate(180deg)" : undefined}
                            transition="transform 0.15s"
                          >
                            <ChevronDown size={14} strokeWidth={1.5} />
                          </Box>
                          {open ? "Hide" : "Answer"}
                        </Button>
                        <Button
                          variant="subtle"
                          h="30px"
                          px="12px"
                          fontSize="13px"
                          disabled={busy}
                          onClick={() => approve(ex.id)}
                        >
                          <Check size={14} strokeWidth={1.5} />
                          Approve
                        </Button>
                        <Button
                          variant="ghost"
                          h="30px"
                          px="12px"
                          fontSize="13px"
                          disabled={busy}
                          onClick={() => setDiscardId(ex.id)}
                        >
                          <X size={14} strokeWidth={1.5} />
                          Discard
                        </Button>
                      </Flex>
                      {open && <AnswerPreview ex={ex} />}
                    </Box>
                  );
                })}
              </Stack>
            )}
          </Card>
        </Stack>
      </Box>

      <ConfirmDialog
        open={discardId !== null}
        title="Discard exercise?"
        body="The generated exercise will be permanently deleted. This cannot be undone."
        confirmLabel="Discard"
        danger
        loading={validate.isPending}
        onConfirm={discard}
        onClose={() => setDiscardId(null)}
      />

      <ConfirmDialog
        open={discardAll}
        title="Discard all pending?"
        body={`All ${pending?.length ?? 0} pending exercises will be permanently deleted. This cannot be undone.`}
        confirmLabel="Discard all"
        danger
        loading={bulkBusy}
        onConfirm={() => void runBulk(false)}
        onClose={() => setDiscardAll(false)}
      />
    </AppShell>
  );
}
