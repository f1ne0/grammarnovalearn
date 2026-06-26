import { Box, Flex, Stack, Text } from "@chakra-ui/react";
import { CheckCircle2, ChevronRight, ClipboardList, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../../../widgets/app-shell";
import {
  Badge,
  Card,
  EmptyState,
  ErrorBanner,
  PageHeader,
  Skeleton,
} from "../../../shared/ui";
import { useTests } from "../../../entities/tests";
import type { TestType } from "../../../entities/tests";

const TYPE_TONES: Record<TestType, "accent" | "warning" | "neutral" | "success"> = {
  PRE_TEST: "accent",
  POST_TEST: "warning",
  DELAYED_POST: "neutral",
  QUIZ: "success",
};

const scoreTone = (s: number): "success" | "warning" | "error" =>
  s >= 80 ? "success" : s >= 50 ? "warning" : "error";

export default function TestsPage() {
  const navigate = useNavigate();
  const { data: tests, isError, isFetching, refetch } = useTests();

  return (
    <AppShell>
      <PageHeader title="Tests" />
      <Box px={{ base: "16px", md: "32px" }} py="24px">
        <Card title="Available tests" noPadding>
          {!tests && (
            <Box p="20px">
              {isError && (
                <ErrorBanner
                  onRetry={() => void refetch()}
                  loading={isFetching}
                />
              )}
              <Skeleton height="160px" />
            </Box>
          )}
          {tests && tests.length === 0 && (
            <EmptyState
              icon={ClipboardList}
              title="No tests yet"
              description="Your teacher hasn't created any tests."
            />
          )}
          {tests && tests.length > 0 && (
            <Stack gap={0}>
              {tests.map((t) => {
                const taken = !!t.attempt;
                // Once-only tests can't be retaken; block navigation if done.
                const locked = taken && t.type !== "QUIZ";
                return (
                  <Flex
                    key={t.id}
                    px="20px"
                    py="16px"
                    align="center"
                    gap="14px"
                    borderBottom="1px solid"
                    borderColor="border"
                    cursor={locked ? "default" : "pointer"}
                    opacity={locked ? 0.7 : 1}
                    transition="background 120ms ease"
                    _hover={locked ? undefined : { bg: "surface2" }}
                    _last={{ borderBottom: "none" }}
                    onClick={() => !locked && navigate(`/tests/${t.id}`)}
                  >
                    <ClipboardList size={18} strokeWidth={1.5} color="var(--chakra-colors-text-faint)" />
                    <Box flex="1" minW={0}>
                      <Text fontSize="14px" fontWeight="500" color="text">
                        {t.title}
                      </Text>
                      <Flex align="center" gap="10px" mt="2px">
                        <Text fontSize="12px" color="textFaint">
                          {t.questionCount} question
                          {t.questionCount === 1 ? "" : "s"}
                        </Text>
                        {t.durationMin && (
                          <Flex align="center" gap="4px">
                            <Clock size={12} strokeWidth={1.5} color="var(--chakra-colors-text-faint)" />
                            <Text fontSize="12px" color="textFaint">
                              {t.durationMin} min
                            </Text>
                          </Flex>
                        )}
                      </Flex>
                    </Box>

                    {taken && (
                      <Flex align="center" gap="6px">
                        <CheckCircle2
                          size={14}
                          strokeWidth={1.5}
                          color="#3FB950"
                        />
                        <Badge tone={scoreTone(t.attempt!.score)}>
                          {Math.round(t.attempt!.score)}%
                        </Badge>
                      </Flex>
                    )}

                    <Badge tone={TYPE_TONES[t.type]}>
                      {t.type.replace(/_/g, " ")}
                    </Badge>
                    {!locked && (
                      <ChevronRight
                        size={16}
                        strokeWidth={1.5}
                        color="var(--chakra-colors-text-faint)"
                      />
                    )}
                  </Flex>
                );
              })}
            </Stack>
          )}
        </Card>
        <Text fontSize="12px" color="textFaint" mt="12px">
          Pre/post tests can be taken only once. Quizzes can be repeated — your
          best score is shown.
        </Text>
      </Box>
    </AppShell>
  );
}
