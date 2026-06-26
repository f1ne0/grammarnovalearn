import { Box, Flex, Grid, Stack, Text } from "@chakra-ui/react";
import {
  BarChart3,
  Check,
  Pencil,
  Plus,
  Settings2,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../../../widgets/app-shell";
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  ErrorBanner,
  FormField,
  PageHeader,
  Progress,
  ScrollArea,
  Skeleton,
  StatCard,
  notify,
} from "../../../shared/ui";
import { apiErrorMessage } from "../../../shared/api";
import {
  useAssignStudents,
  useCreateGroup,
  useDeleteGroup,
  useGroups,
  useRemoveStudent,
  useRenameGroup,
  useUpdateGroupSettings,
} from "../../../entities/groups";
import type { StudyGroup } from "../../../entities/groups";
import { useTeacherStudents } from "../../../entities/teacher";
import type { TeacherStudent } from "../../../entities/teacher";

const UNITS = Array.from({ length: 18 }, (_, i) => i + 1);

function GroupSettingsPanel({ group }: { group: StudyGroup }) {
  const update = useUpdateGroupSettings();
  const [units, setUnits] = useState<number[]>(
    group.settings?.unlockedUnits ?? [],
  );
  const [weak, setWeak] = useState(String(group.settings?.weakThreshold ?? 50));
  const [atRisk, setAtRisk] = useState(
    String(group.settings?.atRiskThreshold ?? 40),
  );

  const toggleUnit = (u: number) =>
    setUnits((prev) =>
      prev.includes(u) ? prev.filter((x) => x !== u) : [...prev, u],
    );

  const save = () =>
    update.mutate(
      {
        id: group.id,
        settings: {
          unlockedUnits: units,
          weakThreshold: Math.max(0, Math.min(100, Number(weak) || 0)),
          atRiskThreshold: Math.max(0, Math.min(100, Number(atRisk) || 0)),
        },
      },
      {
        onSuccess: () => notify.success("Settings saved"),
        onError: (e) => notify.error(apiErrorMessage(e)),
      },
    );

  return (
    <Stack gap="16px">
      <Box>
        <Text fontSize="13px" color="textMuted" mb="8px">
          Unlocked units (empty = all open)
        </Text>
        <Flex gap="6px" wrap="wrap">
          {UNITS.map((u) => (
            <Button
              key={u}
              h="28px"
              px="10px"
              fontSize="12px"
              variant={units.includes(u) ? "subtle" : "outline"}
              onClick={() => toggleUnit(u)}
            >
              {u}
            </Button>
          ))}
        </Flex>
      </Box>
      <Flex gap="16px" wrap="wrap">
        <Box flex="1" minW="160px">
          <FormField
            label={`Weak topic threshold: ${weak || 0}%`}
            type="number"
            value={weak}
            onChange={(e) => setWeak(e.target.value.replace(/[^0-9]/g, ""))}
          />
        </Box>
        <Box flex="1" minW="160px">
          <FormField
            label={`At-risk threshold: ${atRisk || 0}%`}
            type="number"
            value={atRisk}
            onChange={(e) => setAtRisk(e.target.value.replace(/[^0-9]/g, ""))}
          />
        </Box>
      </Flex>
      <Button alignSelf="flex-start" loading={update.isPending} onClick={save}>
        Save settings
      </Button>
    </Stack>
  );
}

function GroupCard({
  group,
  students,
}: {
  group: StudyGroup;
  students: TeacherStudent[];
}) {
  const navigate = useNavigate();
  const rename = useRenameGroup();
  const del = useDeleteGroup();
  const removeStudent = useRemoveStudent();
  const assign = useAssignStudents();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(group.name);
  const [showSettings, setShowSettings] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);

  const members = students.filter((s) => s.studyGroupId === group.id);
  const available = students.filter((s) => s.studyGroupId !== group.id);

  const saveName = () => {
    const n = name.trim();
    if (!n || n === group.name) {
      setEditing(false);
      return;
    }
    rename.mutate(
      { id: group.id, name: n },
      {
        onSuccess: () => {
          notify.success("Group renamed");
          setEditing(false);
        },
        onError: (e) => notify.error(apiErrorMessage(e)),
      },
    );
  };

  return (
    <Card
      title={editing ? "Edit group" : group.name}
      action={
        <Flex gap="2px">
          <Button
            variant="ghost"
            h="30px"
            px="8px"
            fontSize="13px"
            title="Group analytics"
            onClick={() => navigate(`/teacher/analytics/groups/${group.id}`)}
          >
            <BarChart3 size={15} strokeWidth={1.5} />
          </Button>
          <Button
            variant="ghost"
            h="30px"
            px="8px"
            fontSize="13px"
            title="Rename"
            onClick={() => {
              setName(group.name);
              setEditing((v) => !v);
            }}
          >
            <Pencil size={14} strokeWidth={1.5} />
          </Button>
          <Button
            variant="ghost"
            h="30px"
            px="8px"
            fontSize="13px"
            title="Settings"
            onClick={() => setShowSettings((v) => !v)}
          >
            <Settings2 size={15} strokeWidth={1.5} />
          </Button>
          <Button
            variant="ghost"
            h="30px"
            px="8px"
            fontSize="13px"
            title="Delete group"
            onClick={() => setConfirmDel(true)}
          >
            <Trash2 size={14} strokeWidth={1.5} color="#F85149" />
          </Button>
        </Flex>
      }
    >
      {editing && (
        <Flex gap="8px" mb="14px">
          <Box flex="1">
            <FormField
              label=""
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Box>
          <Button h="38px" loading={rename.isPending} onClick={saveName}>
            <Check size={15} strokeWidth={1.5} />
            Save
          </Button>
        </Flex>
      )}

      <Flex justify="space-between" align="center" mb="10px">
        <Badge tone="neutral">{group.studentCount} students</Badge>
        <Text fontFamily="mono" fontSize="13px" color="textMuted">
          {Math.round(group.avgMastery)}% avg
        </Text>
      </Flex>
      <Progress value={group.avgMastery} />

      {/* Members */}
      <Box mt="16px">
        <Flex justify="space-between" align="center" mb="8px">
          <Text fontSize="13px" color="textMuted">
            Members ({members.length})
          </Text>
          <Button
            variant="outline"
            h="28px"
            px="10px"
            fontSize="12px"
            onClick={() => setShowAdd((v) => !v)}
          >
            <UserPlus size={13} strokeWidth={1.5} />
            Add students
          </Button>
        </Flex>
        {members.length === 0 ? (
          <Text fontSize="13px" color="textFaint">
            No students yet.
          </Text>
        ) : (
          <ScrollArea maxHeight="180px">
            <Stack gap="6px">
              {members.map((s) => (
                <Flex
                  key={s.id}
                  justify="space-between"
                  align="center"
                  bg="surface2"
                  border="1px solid"
                  borderColor="border"
                  borderRadius="md"
                  px="12px"
                  py="8px"
                >
                  <Text fontSize="13px" color="text" lineClamp={1}>
                    {s.fullName || s.email}
                  </Text>
                  <Box
                    as="button"
                    color="var(--chakra-colors-text-faint)"
                    lineHeight="0"
                    _hover={{ color: "#F85149" }}
                    title="Remove from group"
                    onClick={() =>
                      removeStudent.mutate(
                        { id: group.id, studentId: s.id },
                        {
                          onSuccess: () => notify.success("Removed"),
                          onError: (e) => notify.error(apiErrorMessage(e)),
                        },
                      )
                    }
                  >
                    <X size={15} strokeWidth={1.5} />
                  </Box>
                </Flex>
              ))}
            </Stack>
          </ScrollArea>
        )}
      </Box>

      {showSettings && (
        <Box mt="16px" pt="16px" borderTop="1px solid" borderColor="border">
          <GroupSettingsPanel group={group} />
        </Box>
      )}

      {showAdd && (
        <Box
          position="fixed"
          inset={0}
          zIndex={40}
          bg="rgba(0,0,0,0.6)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          p="20px"
          onClick={() => setShowAdd(false)}
        >
          <Box
            onClick={(e) => e.stopPropagation()}
            w="100%"
            maxW="460px"
            maxH="72vh"
            bg="surface"
            border="1px solid"
            borderColor="border"
            borderRadius="lg"
            display="flex"
            flexDirection="column"
            overflow="hidden"
          >
            <Flex
              justify="space-between"
              align="center"
              px="20px"
              py="16px"
              borderBottom="1px solid"
              borderColor="border"
            >
              <Text fontSize="15px" fontWeight="600" color="text">
                Add students to {group.name}
              </Text>
              <Box
                as="button"
                color="textMuted"
                lineHeight="0"
                _hover={{ color: "text" }}
                onClick={() => setShowAdd(false)}
              >
                <X size={18} strokeWidth={1.5} />
              </Box>
            </Flex>
            <Box p="16px" overflowY="auto">
              {available.length === 0 ? (
                <Text fontSize="13px" color="textFaint">
                  Everyone is already in this group.
                </Text>
              ) : (
                <Stack gap="6px">
                  {available.map((s) => (
                    <Flex
                      key={s.id}
                      justify="space-between"
                      align="center"
                      bg="surface2"
                      border="1px solid"
                      borderColor="border"
                      borderRadius="md"
                      px="12px"
                      py="8px"
                    >
                      <Text fontSize="13px" color="text" lineClamp={1}>
                        {s.fullName || s.email}
                        {s.studyGroupId && (
                          <Text as="span" color="textFaint">
                            {" "}
                            · moving from another group
                          </Text>
                        )}
                      </Text>
                      <Button
                        variant="subtle"
                        h="26px"
                        px="10px"
                        fontSize="12px"
                        loading={assign.isPending}
                        onClick={() =>
                          assign.mutate(
                            { id: group.id, studentIds: [s.id] },
                            {
                              onSuccess: () => notify.success("Student added"),
                              onError: (e) => notify.error(apiErrorMessage(e)),
                            },
                          )
                        }
                      >
                        Add
                      </Button>
                    </Flex>
                  ))}
                </Stack>
              )}
            </Box>
          </Box>
        </Box>
      )}

      <ConfirmDialog
        open={confirmDel}
        title={`Delete "${group.name}"?`}
        body="The group is removed and its students become unassigned (their progress is kept). This cannot be undone."
        confirmLabel="Delete"
        danger
        loading={del.isPending}
        onConfirm={() =>
          del.mutate(group.id, {
            onSuccess: () => {
              notify.success("Group deleted");
              setConfirmDel(false);
            },
            onError: (e) => notify.error(apiErrorMessage(e)),
          })
        }
        onClose={() => setConfirmDel(false)}
      />
    </Card>
  );
}

export default function GroupsManagePage() {
  const { data: groups, isError, isFetching, refetch } = useGroups();
  const { data: students } = useTeacherStudents();
  const create = useCreateGroup();
  const [newName, setNewName] = useState("");

  const assigned = (students ?? []).filter((s) => s.studyGroupId).length;
  const unassigned = (students ?? []).length - assigned;

  const createGroup = () => {
    if (!newName.trim()) return;
    create.mutate(newName, {
      onSuccess: () => {
        setNewName("");
        notify.success("Group created");
      },
      onError: (e) => notify.error(apiErrorMessage(e)),
    });
  };

  return (
    <AppShell>
      <PageHeader title="Study Groups" breadcrumb="Teacher" />
      <Box px={{ base: "16px", md: "32px" }} py="24px">
        <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap="16px" mb="24px">
          <StatCard label="Groups" value={String(groups?.length ?? 0)} icon={Users} />
          <StatCard label="Students assigned" value={String(assigned)} icon={UserPlus} />
          <StatCard label="Unassigned" value={String(unassigned)} icon={Users} />
        </Grid>

        <Card title="Create group">
          <Flex gap="10px" align="end" wrap="wrap">
            <Box flex="1" minW="220px">
              <FormField
                label="Group name"
                placeholder="e.g. Group 301 — IT-A"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </Box>
            <Button loading={create.isPending} disabled={!newName.trim()} onClick={createGroup}>
              <Plus size={15} strokeWidth={1.5} />
              Create
            </Button>
          </Flex>
        </Card>

        <Box mt="24px">
          {!groups && (
            <>
              {isError && (
                <ErrorBanner onRetry={() => void refetch()} loading={isFetching} />
              )}
              <Skeleton height="120px" />
            </>
          )}
          {groups && groups.length === 0 && (
            <EmptyState icon={Users} title="No groups yet" description="Create your first study group above." />
          )}
          <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap="16px">
            {(groups ?? []).map((g) => (
              <GroupCard key={g.id} group={g} students={students ?? []} />
            ))}
          </Grid>
        </Box>
      </Box>
    </AppShell>
  );
}
