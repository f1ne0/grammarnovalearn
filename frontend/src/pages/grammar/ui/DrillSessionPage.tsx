import { Box, Flex, Stack, Text } from "@chakra-ui/react";
import { CheckCircle2, Dumbbell, RotateCcw, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import { AppShell } from "../../../widgets/app-shell";
import {
  Badge,
  Button,
  PageHeader,
  Progress,
  Skeleton,
  StatCard,
  Surface,
} from "../../../shared/ui";
import { apiErrorMessage } from "../../../shared/api";
import { fetchDrills } from "../../../entities/grammar";
import type { DrillExercise } from "../../../entities/grammar";
import {
  EXERCISE_TYPE_LABELS,
  COGNITIVE_MODE,
} from "../../../entities/exercise";
import {
  CategorizeInput,
  FillInBlankInput,
  MatchingInput,
  MultipleChoiceInput,
  ReorderInput,
  TextAnswerInput,
  TrueFalseInput,
  useSubmitAnswer,
} from "../../../features/submit-answer";

export default function DrillSessionPage() {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const submit = useSubmitAnswer();

  const [drills, setDrills] = useState<DrillExercise[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [idx, setIdx] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [done, setDone] = useState(false);
  const [lastResult, setLastResult] = useState<boolean | null>(null);

  // answer state
  const [mc, setMc] = useState<string | null>(null);
  const [fib, setFib] = useState("");
  const [tf, setTf] = useState<boolean | null>(null);
  const [match, setMatch] = useState<Record<string, string>>({});
  const [reorder, setReorder] = useState<string[]>([]);
  const [textAns, setTextAns] = useState("");
  const [cat, setCat] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchDrills(slug, 8)
      .then(setDrills)
      .catch((e) => setError(apiErrorMessage(e)));
  }, [slug]);

  const ex = drills?.[idx];

  const reset = () => {
    setMc(null);
    setFib("");
    setTf(null);
    setMatch({});
    setReorder([]);
    setTextAns("");
    setCat({});
    setLastResult(null);
    submit.reset();
  };

  const buildAnswer = (): Record<string, unknown> | null => {
    if (!ex) return null;
    switch (ex.type) {
      case "MULTIPLE_CHOICE":
        return mc ? { selectedOptionId: mc } : null;
      case "TRUE_FALSE":
        return tf !== null ? { answer: tf } : null;
      case "MATCHING": {
        const left = ex.payload.left ?? [];
        return left.length > 0 && left.every((l) => match[l.id])
          ? { pairs: Object.entries(match).map(([l, r]) => [l, r]) }
          : null;
      }
      case "REORDER": {
        const words = ex.payload.words ?? ex.payload.correctOrder ?? [];
        return words.length > 0 && reorder.length === words.length
          ? { order: reorder }
          : null;
      }
      case "FILL_IN_BLANK":
      case "OPEN_CLOZE":
      case "WORD_FORMATION":
      case "KEY_WORD_TRANSFORMATION":
      case "ERROR_CORRECTION":
        return textAns.trim() ? { text: textAns } : null;
      case "CATEGORIZE": {
        const items = ex.payload.items ?? [];
        return items.length > 0 && items.every((i) => cat[i.id])
          ? { assignments: cat }
          : null;
      }
      default:
        return null;
    }
  };

  const check = () => {
    if (!ex) return;
    const answer = buildAnswer();
    if (!answer) return;
    submit.mutate(
      { exerciseId: ex.id, answer },
      {
        onSuccess: (r) => {
          setLastResult(r.isCorrect);
          if (r.isCorrect) setCorrectCount((c) => c + 1);
        },
      },
    );
  };

  const next = () => {
    if (!drills) return;
    if (idx < drills.length - 1) {
      setIdx(idx + 1);
      reset();
    } else {
      setDone(true);
    }
  };

  const restart = () => {
    setIdx(0);
    setCorrectCount(0);
    setDone(false);
    reset();
  };

  // Keyboard: 1-4 pick MC options, Enter checks / advances (matches the player)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName)) return;
      if (!ex || done) return;
      if (
        lastResult === null &&
        ex.type === "MULTIPLE_CHOICE" &&
        ["1", "2", "3", "4"].includes(e.key)
      ) {
        const opt = (ex.payload.options ?? [])[Number(e.key) - 1];
        if (opt) setMc(opt.id);
      }
      if (e.key === "Enter") {
        if (lastResult !== null) next();
        else if (buildAnswer() && !submit.isPending) check();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <AppShell>
      <PageHeader
        title="Drill session"
        breadcrumb={
          <RouterLink to={`/topics/${slug}`}>
            <Text as="span" color="textFaint" _hover={{ color: "textMuted" }}>
              Back to topic
            </Text>
          </RouterLink>
        }
        actions={
          drills && !done ? (
            <Badge tone="accent">
              {idx + 1} / {drills.length}
            </Badge>
          ) : undefined
        }
      />
      <Box px={{ base: "16px", md: "32px" }} py="24px">
        {!drills && !error && <Skeleton height="280px" />}
        {error && (
          <Text color="error" fontSize="14px">
            {error}
          </Text>
        )}

        {drills && drills.length === 0 && (
          <Surface p="28px">
            <Flex direction="column" align="center" gap="10px" py="24px">
              <Dumbbell size={28} strokeWidth={1.5} color="var(--chakra-colors-text-faint)" />
              <Text fontSize="15px" fontWeight="500" color="text">
                No drills for this topic yet
              </Text>
            </Flex>
          </Surface>
        )}

        {done && drills && (
          <Surface p="28px">
            <Flex direction="column" align="center" gap="16px">
              <CheckCircle2 size={40} strokeWidth={1.5} color="#3FB950" />
              <Text fontSize="20px" fontWeight="600">
                Session complete
              </Text>
              <Flex gap="16px">
                <StatCard
                  label="Score"
                  value={`${Math.round((correctCount / drills.length) * 100)}%`}
                />
                <StatCard
                  label="Correct"
                  value={`${correctCount}/${drills.length}`}
                />
              </Flex>
              <Flex gap="12px">
                <Button variant="outline" onClick={restart}>
                  <RotateCcw size={15} strokeWidth={1.5} />
                  Again
                </Button>
                <Button onClick={() => navigate(`/topics/${slug}`)}>
                  Back to topic
                </Button>
              </Flex>
            </Flex>
          </Surface>
        )}

        {!done && ex && (
          <>
            <Flex justify="space-between" align="center" mb="8px">
              <Text fontSize="12px" color="textFaint">
                Question {idx + 1} of {drills?.length ?? 0}
              </Text>
              <Flex align="center" gap="5px">
                <CheckCircle2 size={13} strokeWidth={1.5} color="#3FB950" />
                <Text fontSize="12px" color="textFaint">
                  {correctCount} correct
                </Text>
              </Flex>
            </Flex>
            <Box mb="16px">
              <Progress value={(idx / (drills?.length ?? 1)) * 100} />
            </Box>
            <Surface p="28px">
              <Flex gap="10px" mb="14px" align="center">
                <Badge>{EXERCISE_TYPE_LABELS[ex.type]}</Badge>
                {COGNITIVE_MODE[ex.type] && (
                  <Badge tone="accent">{COGNITIVE_MODE[ex.type]}</Badge>
                )}
              </Flex>
              <Text fontSize="18px" fontWeight="600" mb="24px" lineHeight="1.5">
                {ex.prompt}
              </Text>

              {lastResult === null ? (
                <>
                  <Box mb="24px">
                    {ex.type === "MULTIPLE_CHOICE" && (
                      <MultipleChoiceInput payload={ex.payload} value={mc} onChange={setMc} disabled={submit.isPending} />
                    )}
                    {ex.type === "TRUE_FALSE" && (
                      <TrueFalseInput value={tf} onChange={setTf} disabled={submit.isPending} />
                    )}
                    {ex.type === "FILL_IN_BLANK" && (
                      <FillInBlankInput value={fib} onChange={setFib} disabled={submit.isPending} />
                    )}
                    {ex.type === "MATCHING" && (
                      <MatchingInput payload={ex.payload} value={match} onChange={setMatch} disabled={submit.isPending} />
                    )}
                    {ex.type === "REORDER" && (
                      <ReorderInput payload={ex.payload} value={reorder} onChange={setReorder} disabled={submit.isPending} />
                    )}
                    {(ex.type === "OPEN_CLOZE" ||
                      ex.type === "WORD_FORMATION" ||
                      ex.type === "KEY_WORD_TRANSFORMATION" ||
                      ex.type === "ERROR_CORRECTION") && (
                      <TextAnswerInput payload={ex.payload} type={ex.type} value={textAns} onChange={setTextAns} disabled={submit.isPending} />
                    )}
                    {ex.type === "CATEGORIZE" && (
                      <CategorizeInput payload={ex.payload} value={cat} onChange={setCat} disabled={submit.isPending} />
                    )}
                  </Box>
                  <Button w="full" loading={submit.isPending} disabled={!buildAnswer()} onClick={check}>
                    Check
                  </Button>
                  <Text mt="10px" fontSize="12px" color="textFaint" textAlign="center">
                    {ex.type === "MULTIPLE_CHOICE"
                      ? "Tip: press 1–4 to choose, Enter to check"
                      : "Tip: press Enter to check"}
                  </Text>
                </>
              ) : (
                <Stack gap="16px">
                  <Flex
                    align="center"
                    gap="10px"
                    bg={lastResult ? "rgba(63,185,80,.08)" : "rgba(248,81,73,.08)"}
                    border="1px solid"
                    borderColor={lastResult ? "rgba(63,185,80,.25)" : "rgba(248,81,73,.25)"}
                    borderRadius="md"
                    p="14px 16px"
                  >
                    {lastResult ? (
                      <CheckCircle2 size={18} strokeWidth={1.5} color="#3FB950" />
                    ) : (
                      <XCircle size={18} strokeWidth={1.5} color="#F85149" />
                    )}
                    <Text fontWeight="600" color={lastResult ? "success" : "error"}>
                      {lastResult ? "Correct" : "Not quite"}
                    </Text>
                  </Flex>
                  {ex.payload.explanation && (
                    <Text fontSize="14px" color="textMuted" lineHeight="1.6">
                      {ex.payload.explanation}
                    </Text>
                  )}
                  <Button w="full" onClick={next}>
                    {idx < (drills?.length ?? 0) - 1 ? "Next" : "Finish"}
                  </Button>
                </Stack>
              )}
            </Surface>
          </>
        )}
      </Box>
    </AppShell>
  );
}
