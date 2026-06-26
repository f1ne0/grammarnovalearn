import { Box, Flex, Grid, Text } from "@chakra-ui/react";
import {
  BarChart3,
  CheckCircle2,
  Clock,
  SpellCheck,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { AppShell } from "../../../widgets/app-shell";
import {
  Badge,
  Card,
  DataTable,
  EmptyState,
  ErrorBanner,
  ListToolbar,
  PageHeader,
  Pagination,
  Progress,
  Skeleton,
  StatCard,
  ToolbarSelect,
} from "../../../shared/ui";
import { useMastery, useReviewStats } from "../../../entities/mastery";
import type { MasteryItem } from "../../../entities/mastery";
import { useSessionStore } from "../../../entities/session";

const SORTS = [
  { value: "unit", label: "By unit" },
  { value: "weak", label: "Weakest first" },
  { value: "strong", label: "Strongest first" },
];

const initialsOf = (name: string) =>
  name
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

export default function ProfilePage() {
  const user = useSessionStore((s) => s.user);
  const navigate = useNavigate();
  const { data: mastery, isError, isFetching, refetch } = useMastery();
  const { data: review } = useReviewStats();

  const avgMastery =
    mastery && mastery.length > 0
      ? Math.round(
          mastery.reduce((s, m) => s + m.masteryPct, 0) / mastery.length,
        )
      : 0;
  const totalAttempts = mastery
    ? mastery.reduce((s, m) => s + m.attempts, 0)
    : 0;
  const totalCorrect = mastery
    ? mastery.reduce((s, m) => s + m.correct, 0)
    : 0;
  const accuracy =
    totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("unit");
  const [offset, setOffset] = useState(0);
  const PAGE = 10;

  const sorted = useMemo(() => {
    const q = search.trim().toLowerCase();
    const rows = (mastery ?? []).filter(
      (m) => !q || m.topic.title.toLowerCase().includes(q),
    );
    return rows.sort((a, b) => {
      if (sortBy === "weak") return a.masteryPct - b.masteryPct;
      if (sortBy === "strong") return b.masteryPct - a.masteryPct;
      return a.topic.unit - b.topic.unit;
    });
  }, [mastery, search, sortBy]);

  const paged = sorted.slice(offset, offset + PAGE);

  const displayName = user?.fullName || user?.email || "Student";

  return (
    <AppShell>
      <PageHeader
        title="My Progress"
        breadcrumb={
          <RouterLink to="/">
            <Text as="span" color="textFaint" _hover={{ color: "textMuted" }}>
              Dashboard
            </Text>
          </RouterLink>
        }
      />
      <Box px={{ base: "16px", md: "32px" }} py="24px">
        <Flex
          align="center"
          gap="16px"
          bg="surface"
          border="1px solid"
          borderColor="border"
          borderRadius="lg"
          p="18px 20px"
          mb="24px"
        >
          <Flex
            w="52px"
            h="52px"
            borderRadius="full"
            bg="accentSubtle"
            align="center"
            justify="center"
            flexShrink={0}
          >
            <Text fontSize="18px" fontWeight="600" color="accentHover">
              {initialsOf(displayName)}
            </Text>
          </Flex>
          <Box flex="1" minW={0}>
            <Text fontSize="17px" fontWeight="600" color="text" lineClamp={1}>
              {displayName}
            </Text>
            {user?.fullName && (
              <Text fontSize="13px" color="textFaint" lineClamp={1}>
                {user.email}
              </Text>
            )}
          </Box>
          {user?.role && (
            <Badge tone={user.role === "TEACHER" ? "accent" : "neutral"}>
              {user.role.toLowerCase()}
            </Badge>
          )}
        </Flex>

        <Grid
          templateColumns="repeat(auto-fit, minmax(220px, 1fr))"
          gap="16px"
          mb="32px"
        >
          <StatCard
            label="Average mastery"
            value={`${avgMastery}%`}
            icon={SpellCheck}
          />
          <StatCard
            label="Attempts"
            value={String(totalAttempts)}
            icon={BarChart3}
          />
          <StatCard
            label="Accuracy"
            value={totalAttempts > 0 ? `${accuracy}%` : "—"}
            icon={CheckCircle2}
          />
          <StatCard
            label="Due for review"
            value={review ? String(review.dueNow) : "—"}
            icon={Clock}
          />
        </Grid>

        {mastery && mastery.length > 0 && (
          <ListToolbar
            search={search}
            onSearch={(v) => {
              setSearch(v);
              setOffset(0);
            }}
            placeholder="Search topics…"
          >
            <ToolbarSelect
              value={sortBy}
              onChange={(v) => {
                setSortBy(v);
                setOffset(0);
              }}
              options={SORTS}
              width="170px"
            />
          </ListToolbar>
        )}

        <Card title="Mastery by topic" noPadding>
          {!mastery && (
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
          {mastery && mastery.length === 0 && (
            <EmptyState
              icon={BarChart3}
              title="No progress yet"
              description="Complete some exercises to see your mastery here."
            />
          )}
          {mastery && mastery.length > 0 && sorted.length === 0 && (
            <EmptyState
              icon={BarChart3}
              title="No topics match"
              description="Try a different search."
            />
          )}
          {sorted.length > 0 && (
            <DataTable<MasteryItem>
              columns={[
                { key: "topic", label: "Topic", w: 3 },
                { key: "unit", label: "Unit", w: 1 },
                { key: "result", label: "Correct", w: 1 },
                { key: "mastery", label: "Mastery", w: 2 },
              ]}
              rows={paged}
              onRowClick={(m) => navigate(`/topics/${m.topic.slug}`)}
              renderCell={(m, key) => {
                switch (key) {
                  case "topic":
                    return (
                      <Text fontSize="14px" color="text" lineClamp={1}>
                        {m.topic.title}
                      </Text>
                    );
                  case "unit":
                    return (
                      <Text fontFamily="mono" fontSize="13px" color="textMuted">
                        {m.topic.unit}
                      </Text>
                    );
                  case "result":
                    return (
                      <Text fontFamily="mono" fontSize="13px" color="textMuted">
                        {m.correct}/{m.attempts}
                      </Text>
                    );
                  case "mastery":
                    return <Progress value={m.masteryPct} />;
                  default:
                    return null;
                }
              }}
            />
          )}
          {sorted.length > PAGE && (
            <Pagination
              total={sorted.length}
              limit={PAGE}
              offset={offset}
              onChange={setOffset}
            />
          )}
        </Card>
      </Box>
    </AppShell>
  );
}
