import { Box, Flex, Text, Textarea } from "@chakra-ui/react";
import { RefreshCw, SpellCheck, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge, Button } from "../../../shared/ui";
import { apiErrorMessage } from "../../../shared/api";
import type { WritingError, WritingTask } from "../../../entities/skills";
import {
  useAnalysisJob,
  useEnqueueWriting,
} from "../../../entities/analysis";
import type { RichWritingAnalysis } from "../../../entities/analysis";

/** A labelled 0-100 rubric bar. */
function RubricBar({ label, value }: { label: string; value: number }) {
  const tone = value >= 70 ? "#3FB950" : value >= 45 ? "#D29922" : "#F85149";
  return (
    <Box>
      <Flex justify="space-between" mb="4px">
        <Text fontSize="12px" color="textMuted">
          {label}
        </Text>
        <Text fontFamily="mono" fontSize="12px" color="text">
          {value}
        </Text>
      </Flex>
      <Box h="6px" bg="surface" borderRadius="999px" overflow="hidden">
        <Box h="full" w={`${value}%`} bg={tone} transition="width 300ms ease" />
      </Box>
    </Box>
  );
}

/** Text with error spans highlighted by char indices; hover shows correction. */
function Highlighted({
  text,
  errors,
}: {
  text: string;
  errors: WritingError[];
}) {
  const [active, setActive] = useState<number | null>(null);

  const segments = useMemo(() => {
    const sorted = [...errors].sort((a, b) => a.startIndex - b.startIndex);
    const out: { text: string; err?: WritingError; errIdx?: number }[] = [];
    let cursor = 0;
    sorted.forEach((e, idx) => {
      if (e.startIndex < cursor) return; // skip overlaps
      if (e.startIndex > cursor)
        out.push({ text: text.slice(cursor, e.startIndex) });
      out.push({
        text: text.slice(e.startIndex, e.endIndex),
        err: e,
        errIdx: idx,
      });
      cursor = e.endIndex;
    });
    if (cursor < text.length) out.push({ text: text.slice(cursor) });
    return out;
  }, [text, errors]);

  return (
    <Box
      p="16px"
      bg="surface"
      border="1px solid"
      borderColor="border"
      borderRadius="md"
      fontSize="15px"
      lineHeight="1.9"
      whiteSpace="pre-wrap"
      color="text"
    >
      {segments.map((s, i) =>
        s.err ? (
          <Box
            key={i}
            as="span"
            position="relative"
            borderBottom="2px solid"
            borderColor="error"
            bg="rgba(248,81,73,.08)"
            cursor="help"
            onMouseEnter={() => setActive(s.errIdx ?? null)}
            onMouseLeave={() => setActive(null)}
          >
            {s.text}
            {active === s.errIdx && (
              <Box
                position="absolute"
                bottom="calc(100% + 8px)"
                left="0"
                zIndex={20}
                minW="240px"
                maxW="320px"
                bg="surface2"
                border="1px solid"
                borderColor="borderStrong"
                borderRadius="md"
                p="10px 12px"
                boxShadow="0 4px 12px rgba(0,0,0,.4)"
                whiteSpace="normal"
              >
                <Text
                  fontSize="11px"
                  color="textFaint"
                  textTransform="uppercase"
                  letterSpacing="0.03em"
                  mb="4px"
                >
                  {s.err.type}
                </Text>
                <Text fontSize="13px" lineHeight="1.5">
                  <Text as="s" color="error">
                    {s.err.original}
                  </Text>{" "}
                  →{" "}
                  <Text as="span" color="success">
                    {s.err.correction}
                  </Text>
                </Text>
                <Text fontSize="12px" color="textMuted" mt="4px">
                  {s.err.explanation}
                </Text>
              </Box>
            )}
          </Box>
        ) : (
          <span key={i}>{s.text}</span>
        ),
      )}
    </Box>
  );
}

export function WritingEditor({ task }: { task: WritingTask }) {
  const [text, setText] = useState("");
  const [submittedText, setSubmittedText] = useState("");
  const [jobId, setJobId] = useState<string | null>(null);
  const [startedAt] = useState(() => Date.now());

  const enqueue = useEnqueueWriting();
  const job = useAnalysisJob<RichWritingAnalysis>(jobId);

  const status = job.data?.status;
  const analysis = status === "DONE" ? job.data?.result ?? null : null;
  const failed = status === "FAILED" || enqueue.isError;
  const working =
    enqueue.isPending ||
    (!!jobId && status !== "DONE" && status !== "FAILED");

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  const check = () => {
    setSubmittedText(text);
    enqueue.mutate(
      { writingTaskId: task.id, text, responseTimeMs: Date.now() - startedAt },
      { onSuccess: (d) => setJobId(d.jobId) },
    );
  };

  const reset = () => {
    setJobId(null);
    enqueue.reset();
  };

  return (
    <Flex direction="column" gap="14px">
      <Text fontSize="14px" color="textMuted" lineHeight="1.6">
        {task.prompt}
      </Text>

      {!analysis ? (
        <>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            minH="180px"
            bg="surface"
            color="text"
            fontSize="14px"
            border="1px solid"
            borderColor="border"
            borderRadius="md"
            placeholder="Write your answer in English..."
            _placeholder={{ color: "textFaint" }}
            _hover={{ borderColor: "borderStrong" }}
            _focusVisible={{
              borderColor: "accent",
              boxShadow: "0 0 0 1px #4F7CFF",
              outline: "none",
            }}
            disabled={working}
          />
          <Flex justify="space-between" align="center">
            <Text fontFamily="mono" fontSize="12px" color="textFaint">
              {wordCount} words · target {task.minWords}–{task.maxWords}
            </Text>
            <Button
              loading={working}
              disabled={wordCount < 5 || working}
              onClick={check}
            >
              <SpellCheck size={16} strokeWidth={1.5} />
              {working ? "Analyzing…" : "Check writing"}
            </Button>
          </Flex>
          {working && (
            <Text fontSize="12px" color="textFaint">
              The AI examiner is reading your text — this usually takes
              15–25&nbsp;seconds. You can keep this tab open.
            </Text>
          )}
          {failed && (
            <Text fontSize="13px" color="error">
              {job.data?.error ||
                apiErrorMessage(enqueue.error) ||
                "Analysis failed. Please try again."}
            </Text>
          )}
        </>
      ) : (
        <>
          <Highlighted text={submittedText} errors={analysis.errors} />

          <Box
            bg="surface2"
            border="1px solid"
            borderColor="border"
            borderRadius="md"
            p="16px"
          >
            <Flex justify="space-between" align="center" mb="14px">
              <Flex align="center" gap="10px">
                <Text fontSize="13px" color="textMuted">
                  Estimated level
                </Text>
                <Badge tone="accent">{analysis.cefr}</Badge>
              </Flex>
              <Text
                fontFamily="mono"
                fontSize="16px"
                fontWeight="600"
                color={analysis.grammarScore >= 70 ? "success" : "warning"}
              >
                {analysis.grammarScore}/100
              </Text>
            </Flex>

            <Flex direction="column" gap="10px" mb="14px">
              <RubricBar label="Grammar" value={analysis.grammarScore} />
              <RubricBar label="Vocabulary" value={analysis.vocabularyScore} />
              <RubricBar label="Coherence" value={analysis.coherenceScore} />
              <RubricBar
                label="Task achievement"
                value={analysis.taskAchievement}
              />
            </Flex>

            <Text fontSize="14px" color="text" lineHeight="1.6">
              {analysis.overallFeedback}
            </Text>

            {analysis.strengths.length > 0 && (
              <Flex gap="6px" wrap="wrap" mt="10px">
                {analysis.strengths.map((s, i) => (
                  <Badge key={i} tone="success">
                    {s}
                  </Badge>
                ))}
              </Flex>
            )}

            {analysis.errors.length > 0 && (
              <Text fontSize="12px" color="textFaint" mt="10px">
                {analysis.errors.length} error
                {analysis.errors.length === 1 ? "" : "s"} found — hover the
                underlined text to see corrections.
              </Text>
            )}
          </Box>

          {analysis.rewrite && (
            <Box
              bg="surface"
              border="1px solid"
              borderColor="border"
              borderRadius="md"
              p="16px"
            >
              <Flex align="center" gap="8px" mb="8px">
                <Sparkles size={15} strokeWidth={1.5} color="#4F7CFF" />
                <Text fontSize="13px" fontWeight="600" color="textMuted">
                  Model rewrite
                </Text>
              </Flex>
              <Text
                fontSize="14px"
                color="text"
                lineHeight="1.7"
                whiteSpace="pre-wrap"
              >
                {analysis.rewrite}
              </Text>
            </Box>
          )}

          <Button variant="outline" alignSelf="flex-start" onClick={reset}>
            <RefreshCw size={15} strokeWidth={1.5} />
            Write another
          </Button>
        </>
      )}
    </Flex>
  );
}
