import { Box, Flex, Grid, Text } from "@chakra-ui/react";
import { AlertTriangle, BarChart3 } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import { AppShell } from "../../../widgets/app-shell";
import {
  Badge,
  Card,
  DateRangePicker,
  EmptyState,
  ErrorBanner,
  PageHeader,
  Progress,
  Skeleton,
} from "../../../shared/ui";
import { useDateRange } from "../../../shared/lib/dateRange";
import { useGroupDetail } from "../../../entities/analytics";

const tooltipStyle = {
  background: "var(--chakra-colors-surface2)",
  border: "1px solid var(--chakra-colors-border)",
  borderRadius: "8px",
  fontSize: "12px",
  fontFamily: '"Geist Mono", monospace',
  color: "var(--chakra-colors-text)",
};

export default function GroupDetailPage() {
  const { groupId = "" } = useParams();
  const navigate = useNavigate();
  const { preset } = useDateRange();
  const { data, isError, isFetching, refetch } = useGroupDetail(groupId, preset);

  return (
    <AppShell>
      <PageHeader
        title="Group analytics"
        breadcrumb={
          <RouterLink to="/teacher/analytics">
            <Text as="span" color="textFaint" _hover={{ color: "textMuted" }}>
              Analytics
            </Text>
          </RouterLink>
        }
        actions={<DateRangePicker />}
      />
      <Box px={{ base: "16px", md: "32px" }} py="24px">
        {!data && (
          <>
            {isError && (
              <ErrorBanner onRetry={() => void refetch()} loading={isFetching} />
            )}
            <Skeleton height="300px" />
          </>
        )}

        {data && (
          <>
            {/* Weak topics + distribution */}
            <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap="16px" mb="16px">
              <Card title={`Weak topics (< ${data.weakThreshold}%)`}>
                {data.weakTopics.length === 0 ? (
                  <EmptyState icon={BarChart3} title="No weak topics" description="Every topic is above the threshold." />
                ) : (
                  <ResponsiveContainer width="100%" height={Math.max(160, data.weakTopics.length * 36)}>
                    <BarChart data={data.weakTopics.slice(0, 8)} layout="vertical" barSize={16}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--chakra-colors-border)" horizontal={false} />
                      <XAxis type="number" domain={[0, 100]} tick={{ fill: "var(--chakra-colors-text-faint)", fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="title" width={130} tick={{ fill: "#A1A1AA", fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                      <Bar dataKey="avg" fill="#F85149" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Card>

              <Card title="Mastery distribution">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={data.distribution} barSize={48} margin={{ left: 0, right: 8, top: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--chakra-colors-border)" vertical={false} />
                    <XAxis dataKey="range" tick={{ fill: "var(--chakra-colors-text-faint)", fontSize: 12 }} axisLine={{ stroke: "var(--chakra-colors-border)" }} tickLine={false} interval={0} />
                    <YAxis allowDecimals={false} tick={{ fill: "var(--chakra-colors-text-faint)", fontSize: 12 }} axisLine={false} tickLine={false} width={32} />
                    <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                    <Bar dataKey="count" fill="#4F7CFF" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Grid>

            {/* At-risk */}
            <Box mb="16px">
              <Card title={`At-risk students (< ${data.atRiskThreshold}%)`}>
                {data.atRisk.length === 0 ? (
                  <EmptyState icon={AlertTriangle} title="No students at risk" />
                ) : (
                  <Flex direction="column" gap="8px">
                    {data.atRisk.map((s) => (
                      <Flex
                        key={s.id}
                        align="center"
                        justify="space-between"
                        bg="surface2"
                        border="1px solid"
                        borderColor="border"
                        borderRadius="md"
                        px="14px"
                        py="10px"
                        cursor="pointer"
                        _hover={{ borderColor: "borderStrong" }}
                        onClick={() => navigate(`/teacher/students/${s.id}`)}
                      >
                        <Text fontSize="14px" color="text">{s.email}</Text>
                        <Badge tone="error">{Math.round(s.avg)}% mastery</Badge>
                      </Flex>
                    ))}
                  </Flex>
                )}
              </Card>
            </Box>

            {/* All students */}
            <Card title={`Students · ${data.students.length}`}>
              <Flex direction="column" gap="6px">
                {data.students.map((s) => (
                  <Flex
                    key={s.id}
                    align="center"
                    gap="14px"
                    py="8px"
                    cursor="pointer"
                    _hover={{ bg: "surface2" }}
                    borderRadius="md"
                    px="8px"
                    onClick={() => navigate(`/teacher/students/${s.id}`)}
                  >
                    <Text fontSize="14px" color="text" flex="2" lineClamp={1}>{s.email}</Text>
                    <Box flex="2"><Progress value={s.avg} /></Box>
                    <Text fontFamily="mono" fontSize="13px" color="textMuted" w="44px" textAlign="right">
                      {Math.round(s.avg)}%
                    </Text>
                  </Flex>
                ))}
              </Flex>
            </Card>
          </>
        )}
      </Box>
    </AppShell>
  );
}
