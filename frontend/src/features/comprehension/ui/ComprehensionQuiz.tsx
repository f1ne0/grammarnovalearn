import { Box, Flex, Stack, Text } from "@chakra-ui/react";
import { CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";
import { Badge, Button } from "../../../shared/ui";
import {
  MultipleChoiceInput,
  TrueFalseInput,
} from "../../../features/submit-answer";
import type { ExercisePayload } from "../../../entities/exercise";
import type {
  CompAnswer,
  CompGraded,
  CompQuestion,
} from "../../../entities/skills";

/**
 * Approach 6 — comprehension check shown after reading/listening.
 * Collects answers, hands them to the parent (which grades them via the
 * session-complete call), then renders per-question correctness.
 */
export function ComprehensionQuiz({
  questions,
  graded,
  submitting,
  onSubmit,
}: {
  questions: CompQuestion[];
  graded: CompGraded | null;
  submitting: boolean;
  onSubmit: (answers: CompAnswer[]) => void;
}) {
  const [answers, setAnswers] = useState<Record<string, string | boolean>>({});
  const done = graded !== null;
  const resultById = new Map((graded?.detailed ?? []).map((d) => [d.questionId, d]));

  const answeredCount = questions.filter(
    (q) => answers[q.id] !== undefined,
  ).length;

  const submit = () =>
    onSubmit(
      questions.map((q) => ({ questionId: q.id, value: answers[q.id] })),
    );

  return (
    <Stack gap="16px" mt="20px">
      <Flex align="center" justify="space-between">
        <Text fontSize="13px" fontWeight="600" color="textMuted" letterSpacing="0.04em">
          COMPREHENSION CHECK
        </Text>
        {done && (
          <Badge tone={graded.score >= 60 ? "success" : "warning"}>
            {graded.correct}/{graded.total} · {graded.score}%
          </Badge>
        )}
      </Flex>

      {questions.map((q, i) => {
        const r = resultById.get(q.id);
        return (
          <Box
            key={q.id}
            border="1px solid"
            borderColor="border"
            borderRadius="md"
            p="16px"
          >
            <Flex align="center" gap="10px" mb="12px">
              <Text fontFamily="mono" fontSize="12px" color="textFaint">
                {String(i + 1).padStart(2, "0")}
              </Text>
              {r &&
                (r.isCorrect ? (
                  <CheckCircle2 size={15} strokeWidth={1.5} color="#3FB950" />
                ) : (
                  <XCircle size={15} strokeWidth={1.5} color="#F85149" />
                ))}
            </Flex>
            <Text fontSize="14px" fontWeight="500" color="text" mb="12px">
              {q.prompt}
            </Text>

            {q.type === "MULTIPLE_CHOICE" && (
              <MultipleChoiceInput
                payload={{ options: q.options } as ExercisePayload}
                value={(answers[q.id] as string) ?? null}
                onChange={(v) => setAnswers((a) => ({ ...a, [q.id]: v }))}
                disabled={done}
              />
            )}
            {q.type === "TRUE_FALSE" && (
              <TrueFalseInput
                value={(answers[q.id] as boolean) ?? null}
                onChange={(v) => setAnswers((a) => ({ ...a, [q.id]: v }))}
                disabled={done}
              />
            )}

            {r && !r.isCorrect && r.explanation && (
              <Text fontSize="13px" color="textMuted" mt="10px">
                {r.explanation}
              </Text>
            )}
          </Box>
        );
      })}

      {!done && (
        <Button
          onClick={submit}
          loading={submitting}
          disabled={answeredCount < questions.length}
        >
          Submit answers ({answeredCount}/{questions.length})
        </Button>
      )}
    </Stack>
  );
}
