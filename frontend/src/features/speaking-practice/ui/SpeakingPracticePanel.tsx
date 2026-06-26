import { Box, Flex, Stack, Text } from "@chakra-ui/react";
import { Lightbulb, Mic, RefreshCw } from "lucide-react";
import { useState } from "react";
import { Badge, Button } from "../../../shared/ui";
import { apiErrorMessage } from "../../../shared/api";
import { SpeakingRecorder } from "../../../features/submit-answer";
import {
  useAnalysisJob,
  useEnqueueSpeaking,
} from "../../../entities/analysis";
import type { RichSpeakingEvaluation } from "../../../entities/analysis";

/** 0-5 criterion shown as five segments. */
function ScoreRow({ label, value }: { label: string; value: number }) {
  return (
    <Flex align="center" justify="space-between" gap="12px">
      <Text fontSize="13px" color="textMuted" flexShrink={0} minW="110px">
        {label}
      </Text>
      <Flex gap="4px" flex="1" justify="flex-end">
        {[1, 2, 3, 4, 5].map((i) => (
          <Box
            key={i}
            w="22px"
            h="6px"
            borderRadius="999px"
            bg={i <= value ? "accent" : "surface"}
          />
        ))}
      </Flex>
      <Text fontFamily="mono" fontSize="12px" color="text" w="28px" textAlign="right">
        {value}/5
      </Text>
    </Flex>
  );
}

export function SpeakingPracticePanel({
  prompt,
  example,
}: {
  prompt: string;
  example?: string;
}) {
  const [recording, setRecording] = useState<{
    blob: Blob;
    mimeType: string;
  } | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);

  const enqueue = useEnqueueSpeaking();
  const job = useAnalysisJob<RichSpeakingEvaluation>(jobId);

  const status = job.data?.status;
  const result = status === "DONE" ? job.data?.result ?? null : null;
  const failed = status === "FAILED" || enqueue.isError;
  const working =
    enqueue.isPending || (!!jobId && status !== "DONE" && status !== "FAILED");

  const getFeedback = () => {
    if (!recording) return;
    enqueue.mutate(
      {
        blob: recording.blob,
        mimeType: recording.mimeType,
        prompt,
        example,
      },
      { onSuccess: (d) => setJobId(d.jobId) },
    );
  };

  const reset = () => {
    setRecording(null);
    setJobId(null);
    enqueue.reset();
  };

  return (
    <Stack gap="16px">
      <Text fontSize="14px" color="textMuted" lineHeight="1.6">
        {prompt}
      </Text>

      {!result && (
        <>
          <SpeakingRecorder
            onRecorded={(blob, mimeType) => {
              setRecording({ blob, mimeType });
              setJobId(null);
            }}
            disabled={working}
          />
          <Flex align="center" gap="12px">
            <Button
              onClick={getFeedback}
              loading={working}
              disabled={!recording || working}
            >
              <Mic size={16} strokeWidth={1.5} />
              {working ? "Analyzing…" : "Get feedback"}
            </Button>
            {working && (
              <Text fontSize="12px" color="textFaint">
                Listening to your audio — usually 15–25&nbsp;seconds.
              </Text>
            )}
          </Flex>
          {failed && (
            <Text fontSize="13px" color="error">
              {job.data?.error ||
                apiErrorMessage(enqueue.error) ||
                "Analysis failed. Please try again."}
            </Text>
          )}
        </>
      )}

      {result && (
        <>
          <Box
            bg="surface2"
            border="1px solid"
            borderColor="border"
            borderRadius="md"
            p="16px"
          >
            <Stack gap="10px" mb="14px">
              <ScoreRow label="Fluency" value={result.fluency} />
              <ScoreRow label="Grammar" value={result.grammar} />
              <ScoreRow label="Vocabulary" value={result.vocabulary} />
              <ScoreRow label="Pronunciation" value={result.pronunciation} />
              <ScoreRow label="Relevance" value={result.relevance} />
            </Stack>
            <Text fontSize="14px" color="text" lineHeight="1.6">
              {result.feedback}
            </Text>
            {result.tips.length > 0 && (
              <Stack gap="6px" mt="12px">
                {result.tips.map((t, i) => (
                  <Flex key={i} align="flex-start" gap="8px">
                    <Box pt="2px">
                      <Lightbulb size={14} strokeWidth={1.5} color="#D29922" />
                    </Box>
                    <Text fontSize="13px" color="textMuted" lineHeight="1.5">
                      {t}
                    </Text>
                  </Flex>
                ))}
              </Stack>
            )}
          </Box>

          <Box
            bg="surface"
            border="1px solid"
            borderColor="border"
            borderRadius="md"
            p="14px"
          >
            <Flex align="center" gap="8px" mb="6px">
              <Badge>Transcript</Badge>
            </Flex>
            <Text fontSize="14px" color="text" lineHeight="1.7">
              {result.transcript}
            </Text>
          </Box>

          <Button variant="outline" alignSelf="flex-start" onClick={reset}>
            <RefreshCw size={15} strokeWidth={1.5} />
            Try again
          </Button>
        </>
      )}
    </Stack>
  );
}
