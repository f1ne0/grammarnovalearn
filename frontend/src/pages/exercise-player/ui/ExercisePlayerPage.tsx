import { Box, Flex, Stack, Text } from "@chakra-ui/react";
import {
  CheckCircle2,
  ChevronRight,
  RefreshCw,
  Sparkles,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import { AppShell } from "../../../widgets/app-shell";
import {
  Badge,
  Button,
  ErrorBanner,
  PageHeader,
  Progress,
  Skeleton,
  Surface,
  notify,
} from "../../../shared/ui";
import { apiErrorMessage } from "../../../shared/api";
import { useTopic } from "../../../entities/topic";
import {
  useExercise,
  EXERCISE_TYPE_LABELS,
  COGNITIVE_MODE,
} from "../../../entities/exercise";
import { fetchAdaptiveNext } from "../../../entities/skills";
import {
  CategorizeInput,
  FillInBlankInput,
  MatchingInput,
  MultipleChoiceInput,
  ReorderInput,
  SpeakingRecorder,
  TextAnswerInput,
  TrueFalseInput,
  useSubmitAnswer,
  useSubmitSpeaking,
} from "../../../features/submit-answer";
import type {
  SpeakingResult,
  SubmissionResult,
} from "../../../features/submit-answer";

type AnyResult = SubmissionResult | SpeakingResult;

function isSpeakingResult(r: AnyResult): r is SpeakingResult {
  return "scores" in r;
}

export default function ExercisePlayerPage() {
  const { slug = "", exerciseId = "" } = useParams();
  const navigate = useNavigate();
  const { data: topic } = useTopic(slug);
  const {
    data: exercise,
    isError,
    isFetching,
    refetch,
  } = useExercise(exerciseId);

  const submit = useSubmitAnswer();
  const submitSpeaking = useSubmitSpeaking();

  const [mcAnswer, setMcAnswer] = useState<string | null>(null);
  const [fibAnswer, setFibAnswer] = useState("");
  const [tfAnswer, setTfAnswer] = useState<boolean | null>(null);
  const [matchAnswer, setMatchAnswer] = useState<Record<string, string>>({});
  const [reorderAnswer, setReorderAnswer] = useState<string[]>([]);
  const [textAnswer, setTextAnswer] = useState("");
  const [categorizeAnswer, setCategorizeAnswer] = useState<
    Record<string, string>
  >({});
  const [recording, setRecording] = useState<{
    blob: Blob;
    mimeType: string;
  } | null>(null);
  const [startedAt] = useState(() => Date.now());

  const [result, setResult] = useState<AnyResult | null>(null);

  const exerciseIndex = useMemo(() => {
    if (!topic) return -1;
    return topic.exercises.findIndex((e) => e.id === exerciseId);
  }, [topic, exerciseId]);

  const nextExercise =
    topic && exerciseIndex >= 0 && exerciseIndex < topic.exercises.length - 1
      ? topic.exercises[exerciseIndex + 1]
      : null;

  const resetState = () => {
    setMcAnswer(null);
    setFibAnswer("");
    setTfAnswer(null);
    setMatchAnswer({});
    setReorderAnswer([]);
    setTextAnswer("");
    setCategorizeAnswer({});
    setRecording(null);
    setResult(null);
    submit.reset();
    submitSpeaking.reset();
  };

  const goNext = () => {
    if (nextExercise) {
      resetState();
      navigate(`/topics/${slug}/exercises/${nextExercise.id}`);
    } else {
      navigate(`/topics/${slug}`);
    }
  };

  const [adaptiveLoading, setAdaptiveLoading] = useState(false);
  const goAdaptive = async () => {
    if (!topic) return;
    setAdaptiveLoading(true);
    try {
      const { exercise: next } = await fetchAdaptiveNext(topic.id);
      if (next) {
        resetState();
        navigate(`/topics/${slug}/exercises/${next.id}`);
      } else {
        navigate(`/topics/${slug}`); // topic exhausted
      }
    } catch (e) {
      notify.error(apiErrorMessage(e));
    } finally {
      setAdaptiveLoading(false);
    }
  };

  const canSubmit = (): boolean => {
    if (!exercise) return false;
    switch (exercise.type) {
      case "MULTIPLE_CHOICE":
        return mcAnswer !== null;
      case "FILL_IN_BLANK":
        return fibAnswer.trim().length > 0;
      case "TRUE_FALSE":
        return tfAnswer !== null;
      case "MATCHING":
        return (
          (exercise.payload.left ?? []).length > 0 &&
          (exercise.payload.left ?? []).every((l) => matchAnswer[l.id])
        );
      case "REORDER":
        return (
          reorderAnswer.length ===
          (exercise.payload.words ?? exercise.payload.correctOrder ?? [])
            .length
        );
      case "SPEAKING":
        return recording !== null;
      case "OPEN_CLOZE":
      case "WORD_FORMATION":
      case "KEY_WORD_TRANSFORMATION":
      case "ERROR_CORRECTION":
        return textAnswer.trim().length > 0;
      case "CATEGORIZE":
        return (
          (exercise.payload.items ?? []).length > 0 &&
          (exercise.payload.items ?? []).every((i) => categorizeAnswer[i.id])
        );
      default:
        return false;
    }
  };

  const handleSubmit = () => {
    if (!exercise) return;
    const responseTimeMs = Date.now() - startedAt;

    if (exercise.type === "SPEAKING") {
      if (!recording) return;
      submitSpeaking.mutate(
        { exerciseId: exercise.id, ...recording },
        { onSuccess: (data) => setResult(data) },
      );
      return;
    }

    let answer: Record<string, unknown>;
    switch (exercise.type) {
      case "MULTIPLE_CHOICE":
        answer = { selectedOptionId: mcAnswer };
        break;
      case "FILL_IN_BLANK":
        answer = { text: fibAnswer };
        break;
      case "TRUE_FALSE":
        answer = { answer: tfAnswer };
        break;
      case "MATCHING":
        answer = {
          pairs: Object.entries(matchAnswer).map(([l, r]) => [l, r]),
        };
        break;
      case "REORDER":
        answer = { order: reorderAnswer };
        break;
      case "OPEN_CLOZE":
      case "WORD_FORMATION":
      case "KEY_WORD_TRANSFORMATION":
      case "ERROR_CORRECTION":
        answer = { text: textAnswer };
        break;
      case "CATEGORIZE":
        answer = { assignments: categorizeAnswer };
        break;
      default:
        return;
    }
    submit.mutate(
      { exerciseId: exercise.id, answer, responseTimeMs },
      { onSuccess: (data) => setResult(data) },
    );
  };

  const isPending = submit.isPending || submitSpeaking.isPending;
  const submitError = submit.error ?? submitSpeaking.error;

  const prevExercise =
    topic && exerciseIndex > 0 ? topic.exercises[exerciseIndex - 1] : null;

  // Reset all answer + feedback state when the exercise changes — covers
  // browser back/forward between exercises, not just the in-page nav buttons.
  useEffect(() => {
    setMcAnswer(null);
    setFibAnswer("");
    setTfAnswer(null);
    setMatchAnswer({});
    setReorderAnswer([]);
    setTextAnswer("");
    setCategorizeAnswer({});
    setRecording(null);
    setResult(null);
    submit.reset();
    submitSpeaking.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exerciseId]);

  // Keyboard: 1-4 select MC options, Enter submits / next
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      if (!exercise) return;

      if (
        !result &&
        exercise.type === "MULTIPLE_CHOICE" &&
        ["1", "2", "3", "4"].includes(e.key)
      ) {
        const opt = (exercise.payload.options ?? [])[Number(e.key) - 1];
        if (opt) setMcAnswer(opt.id);
      }
      if (e.key === "Enter") {
        if (result) goNext();
        else if (canSubmit() && !isPending) handleSubmit();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <AppShell>
      <PageHeader
        title={topic?.title ?? "Exercise"}
        breadcrumb={
          <RouterLink to={`/topics/${slug}`}>
            <Text as="span" color="textFaint" _hover={{ color: "textMuted" }}>
              {topic?.title ?? "Topic"}
            </Text>
          </RouterLink>
        }
        actions={
          topic && exerciseIndex >= 0 ? (
            <Badge tone="accent">
              {exerciseIndex + 1} / {topic.exercises.length}
            </Badge>
          ) : undefined
        }
      />
      <Box px={{ base: "16px", md: "32px" }} py="24px">
        {!exercise && (
          <>
            {isError && (
              <ErrorBanner
                message="We couldn't load this exercise right now. Please check your internet connection and try again."
                onRetry={() => void refetch()}
                loading={isFetching}
              />
            )}
            <Skeleton height="300px" />
          </>
        )}

        {topic && exerciseIndex >= 0 && (
          <Flex align="center" gap="14px" mb="16px">
            <Button
              variant="ghost"
              h="28px"
              px="8px"
              fontSize="13px"
              disabled={!prevExercise}
              onClick={() =>
                prevExercise &&
                (resetState(),
                navigate(`/topics/${slug}/exercises/${prevExercise.id}`))
              }
            >
              ← Prev
            </Button>
            <Box flex="1">
              <Progress
                value={(exerciseIndex / topic.exercises.length) * 100}
              />
            </Box>
            <Button
              variant="ghost"
              h="28px"
              px="8px"
              fontSize="13px"
              disabled={!nextExercise}
              onClick={() =>
                nextExercise &&
                (resetState(),
                navigate(`/topics/${slug}/exercises/${nextExercise.id}`))
              }
            >
              Next →
            </Button>
          </Flex>
        )}

        {exercise && (
          <Surface p="28px">
            <Flex gap="10px" mb="14px" align="center">
              <Badge>{EXERCISE_TYPE_LABELS[exercise.type]}</Badge>
              {COGNITIVE_MODE[exercise.type] && (
                <Badge tone="accent">{COGNITIVE_MODE[exercise.type]}</Badge>
              )}
              <Text fontSize="12px" fontFamily="mono" color="textFaint">
                difficulty {exercise.difficulty}/5
              </Text>
            </Flex>

            <Text
              fontSize="18px"
              fontWeight="600"
              mb="24px"
              lineHeight="1.5"
              color="text"
            >
              {exercise.prompt}
            </Text>

            {exercise.type === "SPEAKING" &&
              exercise.payload.example &&
              !result && (
                <Box
                  bg="surface2"
                  borderRadius="md"
                  border="1px solid"
                  borderColor="border"
                  p="14px"
                  mb="20px"
                >
                  <Text fontSize="12px" fontWeight="500" color="textFaint" mb="4px">
                    EXAMPLE ANSWER
                  </Text>
                  <Text fontSize="13px" color="textMuted" fontStyle="italic">
                    {exercise.payload.example}
                  </Text>
                </Box>
              )}

            {!result ? (
              <>
                <Box mb="24px">
                  {exercise.type === "MULTIPLE_CHOICE" && (
                    <MultipleChoiceInput
                      payload={exercise.payload}
                      value={mcAnswer}
                      onChange={setMcAnswer}
                      disabled={isPending}
                    />
                  )}
                  {exercise.type === "FILL_IN_BLANK" && (
                    <FillInBlankInput
                      value={fibAnswer}
                      onChange={setFibAnswer}
                      disabled={isPending}
                    />
                  )}
                  {exercise.type === "TRUE_FALSE" && (
                    <TrueFalseInput
                      value={tfAnswer}
                      onChange={setTfAnswer}
                      disabled={isPending}
                    />
                  )}
                  {exercise.type === "MATCHING" && (
                    <MatchingInput
                      payload={exercise.payload}
                      value={matchAnswer}
                      onChange={setMatchAnswer}
                      disabled={isPending}
                    />
                  )}
                  {exercise.type === "REORDER" && (
                    <ReorderInput
                      payload={exercise.payload}
                      value={reorderAnswer}
                      onChange={setReorderAnswer}
                      disabled={isPending}
                    />
                  )}
                  {exercise.type === "SPEAKING" && (
                    <SpeakingRecorder
                      onRecorded={(blob, mimeType) =>
                        setRecording({ blob, mimeType })
                      }
                      disabled={isPending}
                    />
                  )}
                  {(exercise.type === "OPEN_CLOZE" ||
                    exercise.type === "WORD_FORMATION" ||
                    exercise.type === "KEY_WORD_TRANSFORMATION" ||
                    exercise.type === "ERROR_CORRECTION") && (
                    <TextAnswerInput
                      payload={exercise.payload}
                      type={exercise.type}
                      value={textAnswer}
                      onChange={setTextAnswer}
                      disabled={isPending}
                    />
                  )}
                  {exercise.type === "CATEGORIZE" && (
                    <CategorizeInput
                      payload={exercise.payload}
                      value={categorizeAnswer}
                      onChange={setCategorizeAnswer}
                      disabled={isPending}
                    />
                  )}
                </Box>

                {submitError != null && (
                  <Text fontSize="13px" color="error" mb="12px">
                    {apiErrorMessage(submitError)}
                  </Text>
                )}

                <Button
                  w="full"
                  disabled={!canSubmit() || isPending}
                  loading={isPending}
                  onClick={handleSubmit}
                >
                  {isPending
                    ? exercise.type === "SPEAKING"
                      ? "Transcribing & evaluating..."
                      : "Checking..."
                    : "Submit answer"}
                </Button>

                {exercise.type !== "SPEAKING" && (
                  <Text
                    mt="10px"
                    fontSize="12px"
                    color="textFaint"
                    textAlign="center"
                  >
                    {exercise.type === "MULTIPLE_CHOICE"
                      ? "Tip: press 1–4 to choose, Enter to submit"
                      : "Tip: press Enter to submit"}
                  </Text>
                )}
              </>
            ) : (
              <FeedbackView
                result={result}
                onTryAgain={resetState}
                onNext={goNext}
                onAdaptive={() => void goAdaptive()}
                adaptiveLoading={adaptiveLoading}
                isLast={!nextExercise}
              />
            )}
          </Surface>
        )}
      </Box>
    </AppShell>
  );
}

function ScorePill({ label, value }: { label: string; value: number }) {
  const color = value >= 4 ? "success" : value >= 3 ? "warning" : "error";
  return (
    <Box
      bg="surface2"
      border="1px solid"
      borderColor="border"
      borderRadius="md"
      p="10px 14px"
      textAlign="center"
      flex="1"
    >
      <Text fontSize="12px" color="textFaint">
        {label}
      </Text>
      <Text fontFamily="mono" fontSize="20px" fontWeight="600" color={color}>
        {value}/5
      </Text>
    </Box>
  );
}

function FeedbackView({
  result,
  onTryAgain,
  onNext,
  onAdaptive,
  adaptiveLoading,
  isLast,
}: {
  result: AnyResult;
  onTryAgain: () => void;
  onNext: () => void;
  onAdaptive: () => void;
  adaptiveLoading: boolean;
  isLast: boolean;
}) {
  return (
    <Box>
      <Flex
        align="center"
        gap="10px"
        bg={result.isCorrect ? "rgba(63,185,80,.08)" : "rgba(248,81,73,.08)"}
        border="1px solid"
        borderColor={
          result.isCorrect ? "rgba(63,185,80,.25)" : "rgba(248,81,73,.25)"
        }
        borderRadius="md"
        p="14px 16px"
        mb="20px"
      >
        {result.isCorrect ? (
          <CheckCircle2 size={18} strokeWidth={1.5} color="#3FB950" />
        ) : (
          <XCircle size={18} strokeWidth={1.5} color="#F85149" />
        )}
        <Text
          fontWeight="600"
          color={result.isCorrect ? "success" : "error"}
        >
          {result.isCorrect ? "Correct" : "Not quite right"}
        </Text>
        {!result.isCorrect &&
          !isSpeakingResult(result) &&
          result.errorCategory &&
          !["none", "unclassified"].includes(result.errorCategory) && (
            <Badge tone="error">{result.errorCategory}</Badge>
          )}
      </Flex>

      {isSpeakingResult(result) && (
        <>
          <Flex gap="10px" mb="16px">
            <ScorePill label="Clarity" value={result.scores.clarity} />
            <ScorePill label="Grammar" value={result.scores.grammar} />
            <ScorePill label="Completeness" value={result.scores.pace} />
          </Flex>
          <Box
            bg="surface2"
            border="1px solid"
            borderColor="border"
            borderRadius="md"
            p="14px"
            mb="16px"
          >
            <Text fontSize="12px" fontWeight="500" color="textFaint" mb="4px">
              WHAT WE HEARD
            </Text>
            <Text fontSize="13px" color="textMuted" fontStyle="italic">
              {result.transcript}
            </Text>
          </Box>
        </>
      )}

      <Box mb="24px">
        <Flex align="center" gap="6px" mb="8px">
          <Sparkles size={14} strokeWidth={1.5} color="var(--chakra-colors-text-faint)" />
          <Text
            fontSize="12px"
            fontWeight="500"
            color="textFaint"
            letterSpacing="0.03em"
          >
            FEEDBACK
          </Text>
        </Flex>
        <Text
          fontSize="14px"
          lineHeight="1.7"
          color="textMuted"
          whiteSpace="pre-wrap"
        >
          {result.feedback}
        </Text>
      </Box>

      <Stack direction={{ base: "column", sm: "row" }} gap="12px">
        {!result.isCorrect && (
          <Button variant="outline" flex="1" onClick={onTryAgain}>
            <RefreshCw size={15} strokeWidth={1.5} />
            Try again
          </Button>
        )}
        <Button
          variant="subtle"
          flex="1"
          loading={adaptiveLoading}
          onClick={onAdaptive}
          title="Picks an unseen exercise matched to your current level"
        >
          <Sparkles size={15} strokeWidth={1.5} />
          Adaptive next
        </Button>
        <Button flex="1" onClick={onNext}>
          {isLast ? "Finish topic" : "Next exercise"}
          <ChevronRight size={16} strokeWidth={1.5} />
        </Button>
      </Stack>
    </Box>
  );
}
