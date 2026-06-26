import { Box, Flex, Stack, Text } from "@chakra-ui/react";
import {
  CheckCircle2,
  ClipboardList,
  Clock,
  Send,
  XCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import { AppShell } from "../../../widgets/app-shell";
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  ErrorBanner,
  PageHeader,
  Skeleton,
  StatCard,
  Surface,
} from "../../../shared/ui";
import { apiErrorMessage } from "../../../shared/api";
import {
  useStartAttempt,
  useSubmitAttempt,
  useTest,
} from "../../../entities/tests";
import { useSessionStore } from "../../../entities/session";
import type {
  TestQuestion,
  TestResult,
  TestSolution,
} from "../../../entities/tests";
import {
  FillInBlankInput,
  MultipleChoiceInput,
  TrueFalseInput,
} from "../../../features/submit-answer";

type AnswerMap = Record<string, Record<string, unknown>>;

function SolutionNote({
  q,
  solution,
}: {
  q: TestQuestion;
  solution: TestSolution;
}) {
  let answer = "";
  if (q.type === "MULTIPLE_CHOICE") {
    const opt = q.payload.options?.find(
      (o) => o.id === solution.correctAnswerId,
    );
    answer = opt?.text ?? "—";
  } else if (q.type === "FILL_IN_BLANK") {
    answer = (solution.correctAnswers ?? []).join(" / ") || "—";
  } else if (q.type === "TRUE_FALSE") {
    answer = solution.correctAnswer ? "True" : "False";
  }
  return (
    <Box
      mt="14px"
      pt="12px"
      borderTop="1px solid"
      borderColor="border"
    >
      <Text fontSize="13px" color="text">
        Correct answer:{" "}
        <Text as="span" color="success" fontWeight="600">
          {answer}
        </Text>
      </Text>
      {solution.explanation && (
        <Text fontSize="12px" color="textFaint" mt="6px" lineHeight="1.5">
          {solution.explanation}
        </Text>
      )}
    </Box>
  );
}

function QuestionBlock({
  q,
  index,
  answer,
  onAnswer,
  resultFlag,
  solution,
  disabled,
}: {
  q: TestQuestion;
  index: number;
  answer: Record<string, unknown> | undefined;
  onAnswer: (a: Record<string, unknown>) => void;
  resultFlag?: boolean;
  solution?: TestSolution;
  disabled?: boolean;
}) {
  const locked = disabled || resultFlag !== undefined;
  return (
    <Surface p="20px">
      <Flex align="center" gap="10px" mb="12px">
        <Text fontFamily="mono" fontSize="13px" color="textFaint">
          {String(index + 1).padStart(2, "0")}
        </Text>
        {resultFlag !== undefined &&
          (resultFlag ? (
            <CheckCircle2 size={16} strokeWidth={1.5} color="#3FB950" />
          ) : (
            <XCircle size={16} strokeWidth={1.5} color="#F85149" />
          ))}
      </Flex>
      <Text fontSize="15px" fontWeight="500" color="text" mb="16px">
        {q.prompt}
      </Text>
      {q.type === "MULTIPLE_CHOICE" && (
        <MultipleChoiceInput
          payload={q.payload}
          value={(answer?.selectedOptionId as string) ?? null}
          onChange={(v) => onAnswer({ selectedOptionId: v })}
          disabled={locked}
        />
      )}
      {q.type === "FILL_IN_BLANK" && (
        <FillInBlankInput
          value={(answer?.text as string) ?? ""}
          onChange={(v) => onAnswer({ text: v })}
          disabled={locked}
        />
      )}
      {q.type === "TRUE_FALSE" && (
        <TrueFalseInput
          value={(answer?.answer as boolean) ?? null}
          onChange={(v) => onAnswer({ answer: v })}
          disabled={locked}
        />
      )}
      {solution && <SolutionNote q={q} solution={solution} />}
    </Surface>
  );
}

const fmtTime = (s: number) =>
  `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export default function TestTakePage() {
  const { testId = "" } = useParams();
  const navigate = useNavigate();
  const { data: test, isError, isFetching, refetch } = useTest(testId);
  const isTeacher = useSessionStore((s) => s.user?.role === "TEACHER");
  const start = useStartAttempt();
  const submit = useSubmitAttempt();

  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [result, setResult] = useState<TestResult | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deadline, setDeadline] = useState<number | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);

  const begin = () =>
    start.mutate(testId, { onSuccess: (a) => setAttemptId(a.id) });

  const submittedRef = useRef(false);
  const finish = () => {
    if (!attemptId || !test || submit.isPending || result || submittedRef.current)
      return;
    submittedRef.current = true; // synchronous guard against double-submit
    setConfirmOpen(false);
    submit.mutate(
      {
        attemptId,
        answers: test.questions.map((q) => ({
          exerciseId: q.id,
          answer: answers[q.id] ?? {},
        })),
      },
      {
        onSuccess: (r) => setResult(r),
        onError: () => {
          submittedRef.current = false; // allow retry on failure
        },
      },
    );
  };

  // Keep a ref to the latest finish() so the timer can auto-submit
  // without recreating the interval on every answer change.
  const finishRef = useRef(finish);
  finishRef.current = finish;

  // Arm the countdown once the attempt starts (timed tests only).
  useEffect(() => {
    if (attemptId && test?.durationMin && !result && deadline === null) {
      setDeadline(Date.now() + test.durationMin * 60 * 1000);
    }
  }, [attemptId, test?.durationMin, result, deadline]);

  // Tick the countdown; auto-submit at zero.
  useEffect(() => {
    if (deadline === null || result) return;
    let iv: ReturnType<typeof setInterval>;
    const tick = () => {
      const rem = Math.max(0, Math.round((deadline - Date.now()) / 1000));
      setRemaining(rem);
      if (rem <= 0) {
        clearInterval(iv); // stop ticking before auto-submitting
        finishRef.current();
      }
    };
    tick();
    iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [deadline, result]);

  const answeredCount = test
    ? test.questions.filter((q) => answers[q.id]).length
    : 0;
  const unanswered = test ? test.questions.length - answeredCount : 0;

  const resultById = new Map(
    (result?.detailed ?? []).map((d) => [d.exerciseId, d]),
  );

  const lowTime = remaining !== null && remaining <= 60;

  return (
    <AppShell>
      <PageHeader
        title={test?.title ?? "Test"}
        breadcrumb={
          <RouterLink to="/tests">
            <Text as="span" color="textFaint" _hover={{ color: "textMuted" }}>
              Tests
            </Text>
          </RouterLink>
        }
        actions={
          <Flex align="center" gap="12px">
            {remaining !== null && !result && (
              <Flex
                align="center"
                gap="6px"
                px="10px"
                h="30px"
                borderRadius="md"
                bg={lowTime ? "rgba(248,81,73,.12)" : "surface2"}
              >
                <Clock
                  size={14}
                  strokeWidth={1.5}
                  color={lowTime ? "#F85149" : "var(--chakra-colors-text-faint)"}
                />
                <Text
                  fontFamily="mono"
                  fontSize="13px"
                  color={lowTime ? "error" : "textMuted"}
                >
                  {fmtTime(remaining)}
                </Text>
              </Flex>
            )}
            {test && (
              <Badge tone="accent">{test.type.replace(/_/g, " ")}</Badge>
            )}
          </Flex>
        }
      />
      <Box px={{ base: "16px", md: "32px" }} py="24px">
        {!test && (
          <>
            {isError && (
              <ErrorBanner onRetry={() => void refetch()} loading={isFetching} />
            )}
            <Skeleton height="300px" />
          </>
        )}

        {/* Teacher: read-only preview of all questions */}
        {test && isTeacher && (
          <Stack gap="16px">
            <Card title={`Preview · ${test.questions.length} questions`}>
              {test.questions.length === 0 ? (
                <Flex direction="column" align="flex-start" gap="12px">
                  <Text fontSize="13px" color="textMuted">
                    This test has no questions yet, so there's nothing to preview
                    and students can't take it. Add questions in the editor.
                  </Text>
                  <Button onClick={() => navigate(`/teacher/tests/${testId}`)}>
                    Add questions
                  </Button>
                </Flex>
              ) : (
                <Text fontSize="13px" color="textMuted">
                  Teacher preview — this is exactly what students see. Only
                  students can take the test, so inputs are disabled here.
                </Text>
              )}
            </Card>
            {test.questions.map((q, i) => (
              <QuestionBlock
                key={q.id}
                q={q}
                index={i}
                answer={undefined}
                onAnswer={() => {}}
                disabled
              />
            ))}
          </Stack>
        )}

        {test && !isTeacher && !attemptId && !result && (
          <Card title="Ready?">
            {test.questions.length === 0 ? (
              <EmptyState
                icon={ClipboardList}
                title="This test isn't ready yet"
                description="It has no questions. Please check back later — your teacher is still setting it up."
              />
            ) : (
              <EmptyState
                icon={ClipboardList}
                title={`${test.questions.length} questions`}
                description={
                  (test.type === "QUIZ"
                    ? "You can retake this quiz as many times as you like."
                    : "This test can be taken only once. No feedback until you submit.") +
                  (test.durationMin
                    ? ` Time limit: ${test.durationMin} min — it auto-submits when time runs out.`
                    : "")
                }
                action={
                  <Box>
                    <Button onClick={begin} loading={start.isPending}>
                      Start test
                    </Button>
                    {start.isError && (
                      <Text fontSize="13px" color="error" mt="10px">
                        {apiErrorMessage(start.error)}
                      </Text>
                    )}
                  </Box>
                }
              />
            )}
          </Card>
        )}

        {test && !isTeacher && (attemptId || result) && (
          <Stack gap="16px">
            {result && (
              <Flex gap="16px" wrap="wrap">
                <StatCard
                  label="Score"
                  value={`${Math.round(result.score)}%`}
                />
                <StatCard
                  label="Correct"
                  value={`${result.correct}/${result.total}`}
                />
              </Flex>
            )}

            {test.questions.map((q, i) => {
              const d = result ? resultById.get(q.id) : undefined;
              return (
                <QuestionBlock
                  key={q.id}
                  q={q}
                  index={i}
                  answer={answers[q.id]}
                  onAnswer={(a) => setAnswers({ ...answers, [q.id]: a })}
                  resultFlag={d?.isCorrect}
                  solution={d?.solution}
                />
              );
            })}

            {!result && (
              <>
                {submit.isError && (
                  <Text fontSize="13px" color="error">
                    {apiErrorMessage(submit.error)}
                  </Text>
                )}
                <Button
                  size="lg"
                  loading={submit.isPending}
                  onClick={() => setConfirmOpen(true)}
                >
                  <Send size={16} strokeWidth={1.5} />
                  Submit ({answeredCount}/{test.questions.length} answered)
                </Button>
              </>
            )}

            {result && (
              <Button variant="outline" onClick={() => navigate("/tests")}>
                Back to tests
              </Button>
            )}
          </Stack>
        )}
      </Box>

      <ConfirmDialog
        open={confirmOpen}
        title="Submit test?"
        body={
          unanswered > 0
            ? `You have ${unanswered} unanswered question${unanswered === 1 ? "" : "s"}. They'll be marked incorrect. Submit anyway?`
            : "Once submitted, you can't change your answers."
        }
        confirmLabel="Submit"
        danger={unanswered > 0}
        loading={submit.isPending}
        onConfirm={finish}
        onClose={() => setConfirmOpen(false)}
      />
    </AppShell>
  );
}
