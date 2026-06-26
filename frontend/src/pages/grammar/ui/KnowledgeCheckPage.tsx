import { Box, Flex, Stack, Text } from "@chakra-ui/react";
import {
  Award,
  CheckCircle2,
  ClipboardCheck,
  Send,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import { AppShell } from "../../../widgets/app-shell";
import {
  Badge,
  Button,
  ConfirmDialog,
  ErrorBanner,
  PageHeader,
  Progress,
  Skeleton,
  StatCard,
  Surface,
} from "../../../shared/ui";
import { apiErrorMessage } from "../../../shared/api";
import {
  fetchKnowledgeCheck,
  submitKnowledgeCheck,
} from "../../../entities/grammar";
import type { CheckQuestion, CheckResult } from "../../../entities/grammar";
import { EXERCISE_TYPE_LABELS } from "../../../entities/exercise";
import {
  CategorizeInput,
  FillInBlankInput,
  MultipleChoiceInput,
  TextAnswerInput,
  TrueFalseInput,
} from "../../../features/submit-answer";

type AnswerMap = Record<string, Record<string, unknown>>;

function QuestionBlock({
  q,
  index,
  answer,
  onAnswer,
  resultFlag,
}: {
  q: CheckQuestion;
  index: number;
  answer: Record<string, unknown> | undefined;
  onAnswer: (a: Record<string, unknown>) => void;
  resultFlag?: boolean;
}) {
  const isText =
    q.type === "FILL_IN_BLANK" ||
    q.type === "OPEN_CLOZE" ||
    q.type === "WORD_FORMATION" ||
    q.type === "KEY_WORD_TRANSFORMATION" ||
    q.type === "ERROR_CORRECTION";
  return (
    <Surface p="20px">
      <Flex align="center" gap="10px" mb="12px">
        <Text fontFamily="mono" fontSize="13px" color="textFaint">
          {String(index + 1).padStart(2, "0")}
        </Text>
        <Badge>{EXERCISE_TYPE_LABELS[q.type]}</Badge>
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
          disabled={resultFlag !== undefined}
        />
      )}
      {q.type === "TRUE_FALSE" && (
        <TrueFalseInput
          value={(answer?.answer as boolean) ?? null}
          onChange={(v) => onAnswer({ answer: v })}
          disabled={resultFlag !== undefined}
        />
      )}
      {isText && q.type !== "FILL_IN_BLANK" && (
        <TextAnswerInput
          payload={q.payload}
          type={q.type}
          value={(answer?.text as string) ?? ""}
          onChange={(v) => onAnswer({ text: v })}
          disabled={resultFlag !== undefined}
        />
      )}
      {q.type === "FILL_IN_BLANK" && (
        <FillInBlankInput
          value={(answer?.text as string) ?? ""}
          onChange={(v) => onAnswer({ text: v })}
          disabled={resultFlag !== undefined}
        />
      )}
      {q.type === "CATEGORIZE" && (
        <CategorizeInput
          payload={q.payload}
          value={(answer?.assignments as Record<string, string>) ?? {}}
          onChange={(v) => onAnswer({ assignments: v })}
          disabled={resultFlag !== undefined}
        />
      )}
    </Surface>
  );
}

export default function KnowledgeCheckPage() {
  const { slug = "" } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState<CheckQuestion[] | null>(null);
  const [title, setTitle] = useState("");
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [result, setResult] = useState<CheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const load = useCallback(() => {
    setError(null);
    fetchKnowledgeCheck(slug)
      .then((d) => {
        setQuestions(d.questions);
        setTitle(d.topic.title);
      })
      .catch((e) => setError(apiErrorMessage(e)));
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  const answeredCount = questions
    ? questions.filter((q) => answers[q.id]).length
    : 0;

  const finish = () => {
    if (!questions) return;
    setConfirmOpen(false);
    setError(null);
    setSubmitting(true);
    submitKnowledgeCheck(
      slug,
      questions.map((q) => ({ exerciseId: q.id, answer: answers[q.id] ?? {} })),
    )
      .then(setResult)
      .catch((e) => setError(apiErrorMessage(e)))
      .finally(() => setSubmitting(false));
  };

  const resultById = new Map(
    (result?.detailed ?? []).map((d) => [d.exerciseId, d.isCorrect]),
  );

  return (
    <AppShell>
      <PageHeader
        title={`Knowledge check — ${title || "topic"}`}
        breadcrumb={
          <RouterLink to={`/topics/${slug}`}>
            <Text as="span" color="textFaint" _hover={{ color: "textMuted" }}>
              Back to topic
            </Text>
          </RouterLink>
        }
      />
      <Box px={{ base: "16px", md: "32px" }} py="24px">
        {!questions && !error && <Skeleton height="300px" />}
        {error && (
          <ErrorBanner
            message={error}
            onRetry={!questions ? load : undefined}
          />
        )}

        {result && (
          <Surface p="28px" mb="20px">
            <Flex direction="column" align="center" gap="16px">
              <Award
                size={40}
                strokeWidth={1.5}
                color={result.passed ? "#3FB950" : "#D29922"}
              />
              <Text fontSize="20px" fontWeight="600">
                {result.passed ? "Topic mastered!" : "Needs more practice"}
              </Text>
              <Flex gap="16px">
                <StatCard label="Score" value={`${result.score}%`} />
                <StatCard
                  label="Correct"
                  value={`${result.correct}/${result.total}`}
                />
              </Flex>
              {result.verdict && (
                <Text
                  fontSize="14px"
                  color="textMuted"
                  textAlign="center"
                  maxW="460px"
                  lineHeight="1.6"
                >
                  {result.verdict}
                </Text>
              )}
              {result.passed && result.nextReviewAt && (
                <Badge tone="success">
                  Next review:{" "}
                  {new Date(result.nextReviewAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                  })}
                </Badge>
              )}
              <Flex gap="12px">
                <Button
                  variant="outline"
                  onClick={() => navigate(`/topics/${slug}`)}
                >
                  Back to topic
                </Button>
                {!result.passed && (
                  <Button onClick={() => navigate(`/topics/${slug}/drill`)}>
                    Practice more
                  </Button>
                )}
              </Flex>
            </Flex>
          </Surface>
        )}

        {questions && questions.length === 0 && !result && (
          <Surface p="28px">
            <Flex direction="column" align="center" gap="10px" py="24px">
              <ClipboardCheck size={28} strokeWidth={1.5} color="var(--chakra-colors-text-faint)" />
              <Text fontSize="15px" fontWeight="500">
                No check available for this topic yet
              </Text>
            </Flex>
          </Surface>
        )}

        {questions && questions.length > 0 && (
          <Stack gap="16px">
            {!result && (
              <Box>
                <Text fontSize="13px" color="textFaint" mb="10px">
                  Answer all {questions.length} questions. No feedback until you
                  submit. Score ≥ 75% marks the topic as mastered.
                </Text>
                <Flex justify="space-between" align="center" mb="6px">
                  <Text fontSize="12px" color="textFaint">
                    Answered {answeredCount} / {questions.length}
                  </Text>
                </Flex>
                <Progress
                  value={(answeredCount / questions.length) * 100}
                />
              </Box>
            )}
            {questions.map((q, i) => (
              <QuestionBlock
                key={q.id}
                q={q}
                index={i}
                answer={answers[q.id]}
                onAnswer={(a) => setAnswers({ ...answers, [q.id]: a })}
                resultFlag={result ? resultById.get(q.id) : undefined}
              />
            ))}
            {!result && (
              <Button
                size="lg"
                loading={submitting}
                disabled={answeredCount < questions.length}
                onClick={() => setConfirmOpen(true)}
              >
                <Send size={16} strokeWidth={1.5} />
                Submit check ({answeredCount}/{questions.length})
              </Button>
            )}
          </Stack>
        )}
      </Box>

      <ConfirmDialog
        open={confirmOpen}
        title="Submit knowledge check?"
        body="Once you submit you can't change your answers. A score of 75% or higher marks this topic as mastered and schedules it for spaced review."
        confirmLabel="Submit"
        loading={submitting}
        onConfirm={finish}
        onClose={() => setConfirmOpen(false)}
      />
    </AppShell>
  );
}
