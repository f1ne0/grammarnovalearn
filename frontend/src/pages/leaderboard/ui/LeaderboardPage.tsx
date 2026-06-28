import { Box, Flex, Text } from "@chakra-ui/react";
import { Trophy, Users } from "lucide-react";
import { AppShell } from "../../../widgets/app-shell";
import { Badge, Card, EmptyState, PageHeader, Skeleton } from "../../../shared/ui";
import { useLeaderboard } from "../../../entities/leaderboard";

const medal = (rank: number) =>
  rank === 1 ? "#F0B429" : rank === 2 ? "#A8B0BD" : rank === 3 ? "#CD7F32" : null;

export default function LeaderboardPage() {
  const { data, isLoading } = useLeaderboard();

  return (
    <AppShell>
      <PageHeader title="Leaderboard" />
      <Box px={{ base: "16px", md: "32px" }} py="24px">
        {isLoading && <Skeleton height="300px" />}

        {data && !data.hasGroup && (
          <Card noPadding>
            <EmptyState
              icon={Users}
              title="You're not in a group yet"
              description="Once your teacher adds you to a study group, you'll see how you rank against your classmates here."
            />
          </Card>
        )}

        {data && data.hasGroup && (
          <>
            <Text fontSize="14px" color="textMuted" mb="16px">
              Ranked by accuracy, then exercises completed
              {data.groupName ? ` · ${data.groupName}` : ""}.
            </Text>
            <Card noPadding>
              {data.entries.length === 0 ? (
                <EmptyState icon={Trophy} title="No activity in your group yet" />
              ) : (
                data.entries.map((e) => (
                  <Flex
                    key={e.userId}
                    px="20px"
                    py="14px"
                    align="center"
                    gap="14px"
                    borderBottom="1px solid"
                    borderColor="border"
                    _last={{ borderBottom: "none" }}
                    bg={e.isMe ? "accentSubtle" : undefined}
                  >
                    <Flex
                      w="28px"
                      h="28px"
                      borderRadius="full"
                      align="center"
                      justify="center"
                      flexShrink={0}
                      bg={medal(e.rank) ? "transparent" : "surface2"}
                    >
                      {medal(e.rank) ? (
                        <Trophy size={18} strokeWidth={1.5} color={medal(e.rank)!} />
                      ) : (
                        <Text fontSize="13px" fontWeight="600" color="textMuted">
                          {e.rank}
                        </Text>
                      )}
                    </Flex>
                    <Box flex="1" minW={0}>
                      <Flex align="center" gap="8px">
                        <Text fontSize="14px" fontWeight="500" color="text" lineClamp={1}>
                          {e.name}
                        </Text>
                        {e.isMe && <Badge tone="accent">You</Badge>}
                      </Flex>
                      <Text fontSize="12px" color="textFaint">
                        {e.exercises} exercise{e.exercises === 1 ? "" : "s"}
                      </Text>
                    </Box>
                    <Text fontSize="16px" fontWeight="600" color="text" flexShrink={0}>
                      {e.accuracy}%
                    </Text>
                  </Flex>
                ))
              )}
            </Card>
          </>
        )}
      </Box>
    </AppShell>
  );
}
