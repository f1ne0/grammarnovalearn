import { Box, Flex, Grid, Text } from "@chakra-ui/react";
import {
  Activity,
  AlertTriangle,
  Check,
  Copy,
  Download,
  Target,
  Ticket,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../../../widgets/app-shell";
import {
  Button,
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
  notify,
} from "../../../shared/ui";
import { api, apiErrorMessage } from "../../../shared/api";
import { csvDateTime, downloadXlsx } from "../../../shared/lib/csv";
import { useTeacherStudents } from "../../../entities/teacher";
import type { TeacherStudent } from "../../../entities/teacher";
import { useAssignStudents, useGroups } from "../../../entities/groups";

const AT_RISK = 40;
const INACTIVE_DAYS = 14;
const DAY = 86_400_000;

const isInactive = (s: TeacherStudent) =>
  !s.lastActiveAt || Date.now() - new Date(s.lastActiveAt).getTime() > INACTIVE_DAYS * DAY;

function ago(d?: string | null): string {
  if (!d) return "never";
  const ms = Date.now() - new Date(d).getTime();
  if (ms < 0) return "—";
  if (ms < DAY) return "today";
  const days = Math.floor(ms / DAY);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function InviteButton() {
  const gen = useMutation({
    mutationFn: async () =>
      (await api.post<{ code: string }>("/invites/generate")).data,
    onSuccess: async (data) => {
      await navigator.clipboard.writeText(data.code).catch(() => void 0);
      notify.success(`Invite code ${data.code} copied to clipboard`);
    },
    onError: (e) => notify.error(apiErrorMessage(e)),
  });
  return (
    <Button variant="outline" loading={gen.isPending} onClick={() => gen.mutate()}>
      <Ticket size={15} strokeWidth={1.5} />
      New invite code
      <Copy size={13} strokeWidth={1.5} />
    </Button>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Flex
      as="button"
      align="center"
      gap="6px"
      h="30px"
      px="12px"
      borderRadius="999px"
      fontSize="13px"
      border="1px solid"
      borderColor={active ? "accent" : "border"}
      bg={active ? "accentSubtle" : "transparent"}
      color={active ? "accentHover" : "textMuted"}
      transition="all 160ms ease"
      _hover={{ borderColor: "borderStrong" }}
      onClick={onClick}
    >
      {children}
    </Flex>
  );
}

export default function TeacherStudentsPage() {
  const navigate = useNavigate();
  const { data: students, isError, isFetching, refetch } = useTeacherStudents();
  const { data: groups } = useGroups();
  const assign = useAssignStudents();

  const [search, setSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState("ALL");
  const [sort, setSort] = useState("mastery");
  const [chips, setChips] = useState({ risk: false, inactive: false, unassigned: false });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [offset, setOffset] = useState(0);
  const PAGE = 12;

  const groupName = useMemo(() => {
    const m = new Map<string, string>();
    for (const g of groups ?? []) m.set(g.id, g.name);
    return m;
  }, [groups]);

  const stats = useMemo(() => {
    const list = students ?? [];
    const active = list.filter((s) => s.submissionsThisWeek > 0).length;
    const avg =
      list.length > 0
        ? Math.round(list.reduce((s, x) => s + x.averageMastery, 0) / list.length)
        : 0;
    const atRisk = list.filter((s) => s.averageMastery < AT_RISK).length;
    return { total: list.length, active, avg, atRisk };
  }, [students]);

  const filtered = useMemo(() => {
    let rows = students ?? [];
    const needle = search.trim().toLowerCase();
    if (needle)
      rows = rows.filter(
        (s) =>
          s.email.toLowerCase().includes(needle) ||
          (s.fullName ?? "").toLowerCase().includes(needle),
      );
    if (groupFilter === "NONE") rows = rows.filter((s) => !s.studyGroupId);
    else if (groupFilter !== "ALL")
      rows = rows.filter((s) => s.studyGroupId === groupFilter);
    if (chips.risk) rows = rows.filter((s) => s.averageMastery < AT_RISK);
    if (chips.inactive) rows = rows.filter(isInactive);
    if (chips.unassigned) rows = rows.filter((s) => !s.studyGroupId);
    rows = [...rows].sort((a, b) => {
      switch (sort) {
        case "mastery":
          return b.averageMastery - a.averageMastery;
        case "activity":
          return b.submissionsThisWeek - a.submissionsThisWeek;
        case "date":
          return (
            new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime()
          );
        case "email":
          return (a.fullName ?? a.email).localeCompare(b.fullName ?? b.email);
        default:
          return 0;
      }
    });
    return rows;
  }, [students, search, groupFilter, sort, chips]);

  // Reset to first page whenever the result set changes.
  useEffect(() => {
    setOffset(0);
  }, [search, groupFilter, sort, chips]);

  const paged = filtered.slice(offset, offset + PAGE);

  const toggleSel = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const allSelected = filtered.length > 0 && filtered.every((s) => selected.has(s.id));
  const toggleSelectAll = () =>
    setSelected(allSelected ? new Set() : new Set(filtered.map((s) => s.id)));

  const busy = assign.isPending;

  const bulkAssign = (gid: string) => {
    if (!gid || selected.size === 0) return;
    assign.mutate(
      { id: gid, studentIds: [...selected] },
      {
        onSuccess: () => {
          notify.success(`Assigned ${selected.size} student(s) to group`);
          setSelected(new Set());
        },
        onError: (e) => notify.error(apiErrorMessage(e)),
      },
    );
  };

  const exportCsv = () => {
    downloadXlsx(
      "students.xlsx",
      ["Name", "Email", "Study group", "Avg mastery %", "Submissions", "This week", "Last active"],
      filtered.map((s) => [
        s.fullName ?? "",
        s.email,
        (s.studyGroupId && groupName.get(s.studyGroupId)) || "",
        Math.round(s.averageMastery),
        s.totalSubmissions,
        s.submissionsThisWeek,
        csvDateTime(s.lastActiveAt),
      ]),
    );
  };

  return (
    <AppShell>
      <PageHeader
        title="Students"
        breadcrumb="Teacher"
        actions={
          <Flex gap="8px">
            <Button variant="outline" onClick={exportCsv} disabled={!students?.length}>
              <Download size={15} strokeWidth={1.5} />
              Export
            </Button>
            <InviteButton />
          </Flex>
        }
      />
      <Box px={{ base: "16px", md: "32px" }} py="24px">
        <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap="16px" mb="24px">
          <StatCard label="Students" value={String(stats.total)} icon={Users} />
          <StatCard
            label="Active this week"
            value={String(stats.active)}
            icon={Activity}
            sub={stats.total ? `${Math.round((stats.active / stats.total) * 100)}% of class` : undefined}
          />
          <StatCard label="Avg mastery" value={`${stats.avg}%`} icon={Target} />
          <StatCard label="At risk" value={String(stats.atRisk)} icon={AlertTriangle} sub={`below ${AT_RISK}%`} />
        </Grid>

        <ListToolbar search={search} onSearch={setSearch} placeholder="Search by name or email...">
          <ToolbarSelect
            value={groupFilter}
            onChange={setGroupFilter}
            width="190px"
            options={[
              { value: "ALL", label: "All study groups" },
              ...(groups ?? []).map((g) => ({ value: g.id, label: g.name })),
              { value: "NONE", label: "Unassigned" },
            ]}
          />
          <ToolbarSelect
            value={sort}
            onChange={setSort}
            options={[
              { value: "mastery", label: "Sort: mastery" },
              { value: "activity", label: "Sort: activity" },
              { value: "date", label: "Sort: newest" },
              { value: "email", label: "Sort: A–Z" },
            ]}
          />
        </ListToolbar>

        {/* Quick filters + select-all */}
        <Flex justify="space-between" align="center" gap="12px" wrap="wrap" mb="12px">
          <Flex gap="8px" wrap="wrap">
            <Chip active={chips.risk} onClick={() => setChips((c) => ({ ...c, risk: !c.risk }))}>
              <AlertTriangle size={13} strokeWidth={1.5} /> At risk
            </Chip>
            <Chip active={chips.inactive} onClick={() => setChips((c) => ({ ...c, inactive: !c.inactive }))}>
              Inactive {INACTIVE_DAYS}d+
            </Chip>
            <Chip active={chips.unassigned} onClick={() => setChips((c) => ({ ...c, unassigned: !c.unassigned }))}>
              Unassigned
            </Chip>
          </Flex>
          {filtered.length > 0 && (
            <Button variant="ghost" h="30px" px="10px" fontSize="13px" onClick={toggleSelectAll}>
              {allSelected ? "Clear selection" : "Select all"}
            </Button>
          )}
        </Flex>

        {/* Bulk action bar */}
        {selected.size > 0 && (
          <Flex
            align="center"
            justify="space-between"
            gap="12px"
            wrap="wrap"
            bg="accentSubtle"
            border="1px solid"
            borderColor="rgba(79,124,255,.3)"
            borderRadius="md"
            px="16px"
            py="10px"
            mb="12px"
          >
            <Text fontSize="13px" color="text">
              {selected.size} selected
            </Text>
            <Flex gap="8px" align="center" wrap="wrap" opacity={busy ? 0.6 : 1}>
              <ToolbarSelect
                value=""
                onChange={bulkAssign}
                width="190px"
                options={[
                  { value: "", label: "Assign to group…" },
                  ...(groups ?? []).map((g) => ({ value: g.id, label: g.name })),
                ]}
              />
              <Button variant="ghost" h="32px" px="10px" fontSize="13px" onClick={() => setSelected(new Set())}>
                Clear
              </Button>
            </Flex>
          </Flex>
        )}

        <Card title={`Students · ${filtered.length}`} noPadding>
          {!students && (
            <Box p="20px">
              {isError && (
                <ErrorBanner onRetry={() => void refetch()} loading={isFetching} />
              )}
              <Skeleton height="200px" />
            </Box>
          )}
          {students && filtered.length === 0 && (
            <EmptyState
              icon={Users}
              title={students.length === 0 ? "No students yet" : "No matches"}
              description={
                students.length === 0
                  ? "Generate an invite code (button above) and share it with your students."
                  : "Try a different search or filter."
              }
            />
          )}
          {filtered.length > 0 && (
            <DataTable<TeacherStudent>
              columns={[
                { key: "select", label: "", w: 0.4 },
                { key: "email", label: "Student", w: 2.6 },
                { key: "group", label: "Study group", w: 1.6 },
                { key: "mastery", label: "Avg mastery", w: 2 },
                { key: "week", label: "This week", w: 1 },
                { key: "active", label: "Last active", w: 1.3 },
              ]}
              rows={paged}
              onRowClick={(s) => navigate(`/teacher/students/${s.id}`)}
              renderCell={(s, key) => {
                switch (key) {
                  case "select":
                    return (
                      <Flex
                        as="button"
                        w="16px"
                        h="16px"
                        borderRadius="4px"
                        border="1px solid"
                        borderColor={selected.has(s.id) ? "accent" : "borderStrong"}
                        bg={selected.has(s.id) ? "accent" : "transparent"}
                        align="center"
                        justify="center"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSel(s.id);
                        }}
                      >
                        {selected.has(s.id) && (
                          <Check size={11} strokeWidth={2.5} color="white" />
                        )}
                      </Flex>
                    );
                  case "email":
                    return (
                      <Flex align="center" gap="8px" minW={0}>
                        {s.averageMastery < AT_RISK && (
                          <Box title="At risk" flexShrink={0} lineHeight="0">
                            <AlertTriangle size={14} strokeWidth={1.5} color="#D29922" />
                          </Box>
                        )}
                        <Box minW={0}>
                          <Text fontSize="14px" color="text" lineClamp={1}>
                            {s.fullName || s.email}
                          </Text>
                          {s.fullName && (
                            <Text fontSize="12px" color="textFaint" lineClamp={1}>
                              {s.email}
                            </Text>
                          )}
                        </Box>
                      </Flex>
                    );
                  case "group":
                    return s.studyGroupId && groupName.get(s.studyGroupId) ? (
                      <Text fontSize="13px" color="textMuted" lineClamp={1}>
                        {groupName.get(s.studyGroupId)}
                      </Text>
                    ) : (
                      <Text color="textFaint">—</Text>
                    );
                  case "mastery":
                    return <Progress value={s.averageMastery} />;
                  case "week":
                    return (
                      <Text fontFamily="mono" fontSize="13px" color="textMuted">
                        {s.submissionsThisWeek}
                      </Text>
                    );
                  case "active":
                    return (
                      <Text fontSize="13px" color="textFaint">
                        {ago(s.lastActiveAt)}
                      </Text>
                    );
                  default:
                    return null;
                }
              }}
            />
          )}
          {filtered.length > PAGE && (
            <Pagination
              total={filtered.length}
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
