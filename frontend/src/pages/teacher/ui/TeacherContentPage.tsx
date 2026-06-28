import { Box, Flex, Grid, Input, Stack, Text, Textarea } from "@chakra-ui/react";
import {
  AlertTriangle,
  BookOpen,
  ChevronDown,
  GripVertical,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../../../widgets/app-shell";
import {
  Badge,
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorBanner,
  FormField,
  ListToolbar,
  PageHeader,
  Skeleton,
  StatCard,
  notify,
} from "../../../shared/ui";
import { api, apiErrorMessage } from "../../../shared/api";
import {
  useCreateTopic,
  useDeleteTopic,
  useGenerateReadingText,
  useTopics,
  useUpdateTopic,
} from "../../../entities/topic";
import type { TopicListItem } from "../../../entities/topic";

const TRANSLIT: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", ғ: "g", д: "d", е: "e", ё: "yo", ж: "zh",
  з: "z", и: "i", і: "i", й: "y", к: "k", қ: "q", л: "l", м: "m", н: "n",
  ң: "ng", о: "o", ө: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ұ: "u",
  ү: "u", ф: "f", х: "kh", һ: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sch",
  ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya", ә: "a",
};

const slugify = (s: string) =>
  s
    .toLowerCase()
    .split("")
    .map((c) => TRANSLIT[c] ?? c)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const inputStyle = {
  h: "38px",
  bg: "surface",
  color: "text",
  fontSize: "14px",
  border: "1px solid",
  borderColor: "border",
  borderRadius: "md",
  _hover: { borderColor: "borderStrong" },
  _focusVisible: {
    borderColor: "accent",
    boxShadow: "0 0 0 1px #4F7CFF",
    outline: "none",
  },
} as const;

export default function TeacherContentPage() {
  const navigate = useNavigate();
  const { data: topics, isError, isFetching, refetch } = useTopics();
  const create = useCreateTopic();
  const update = useUpdateTopic();
  const remove = useDeleteTopic();
  const genReading = useGenerateReadingText();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [unit, setUnit] = useState("1");
  const [order, setOrder] = useState("1");
  const [readingText, setReadingText] = useState("");
  const [delId, setDelId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Set<number>>(new Set()); // all closed initially

  // ===== summary =====
  const stats = useMemo(() => {
    const list = topics ?? [];
    const units = new Set(list.map((t) => t.unit)).size;
    const exercises = list.reduce((s, t) => s + t.exerciseCount, 0);
    const empty = list.filter((t) => t.exerciseCount === 0).length;
    return { total: list.length, units, exercises, empty };
  }, [topics]);

  const needle = search.trim().toLowerCase();
  const searching = needle.length > 0;

  const grouped = useMemo(() => {
    const map = new Map<number, TopicListItem[]>();
    for (const t of topics ?? []) {
      if (
        needle &&
        !t.title.toLowerCase().includes(needle) &&
        !t.slug.toLowerCase().includes(needle)
      )
        continue;
      const list = map.get(t.unit) ?? [];
      list.push(t);
      map.set(t.unit, list);
    }
    return [...map.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([u, list]) => ({
        unit: u,
        topics: list.sort((a, b) => a.order - b.order),
      }));
  }, [topics, needle]);

  const isOpen = (u: number) => searching || expanded.has(u);
  const toggleUnit = (u: number) =>
    setExpanded((prev) => {
      const n = new Set(prev);
      if (n.has(u)) n.delete(u);
      else n.add(u);
      return n;
    });
  const allExpanded =
    grouped.length > 0 && grouped.every((g) => expanded.has(g.unit));

  const resetForm = () => {
    setEditingId(null);
    setShowEditor(false);
    setTitle("");
    setSlug("");
    setUnit("1");
    setOrder("1");
    setReadingText("");
  };

  const newTopic = () => {
    resetForm();
    setShowEditor(true);
  };

  // ===== drag-and-drop reordering within a unit =====
  const [moving, setMoving] = useState(false);
  const dragRef = useRef<{ unit: number; index: number } | null>(null);
  const [overKey, setOverKey] = useState<string | null>(null);

  const persistOrder = async (arr: TopicListItem[]) => {
    setMoving(true);
    try {
      for (let i = 0; i < arr.length; i++) {
        if (arr[i].order !== i + 1) {
          await update.mutateAsync({ id: arr[i].id, order: i + 1 });
        }
      }
    } catch (e) {
      notify.error(apiErrorMessage(e));
    } finally {
      setMoving(false);
    }
  };

  const onDrop = (unit: number, list: TopicListItem[], to: number) => {
    const d = dragRef.current;
    dragRef.current = null;
    setOverKey(null);
    if (!d || d.unit !== unit || d.index === to) return;
    const arr = [...list];
    const [moved] = arr.splice(d.index, 1);
    arr.splice(to, 0, moved);
    void persistOrder(arr);
  };

  const startEdit = async (slugToLoad: string) => {
    try {
      const { data } = await api.get(`/topics/${slugToLoad}`);
      setEditingId(data.id);
      setTitle(data.title);
      setSlug(data.slug);
      setUnit(String(data.unit));
      setOrder(String(data.order));
      setReadingText(data.readingText ?? "");
      setShowEditor(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      notify.error(apiErrorMessage(e));
    }
  };

  const generateReading = () => {
    if (!title.trim()) {
      notify.error("Enter a title first");
      return;
    }
    genReading.mutate(title, {
      onSuccess: (d) => setReadingText(d.readingText),
      onError: (e) => notify.error(apiErrorMessage(e)),
    });
  };

  const submit = () => {
    const slugFinal =
      (editingId ? slug : "") ||
      slugify(title) ||
      `topic-${Date.now().toString(36)}`;
    const unitNum = Math.max(1, Number(unit) || 1);
    let orderNum: number;
    if (editingId) {
      orderNum = Math.max(1, Number(order) || 1);
    } else {
      const inUnit = (topics ?? []).filter((t) => t.unit === unitNum);
      orderNum = inUnit.length
        ? Math.max(...inUnit.map((t) => t.order)) + 1
        : 1;
    }
    const body = { title, slug: slugFinal, unit: unitNum, order: orderNum, readingText };
    if (editingId) {
      update.mutate(
        { id: editingId, ...body },
        {
          onSuccess: () => {
            notify.success("Topic updated");
            resetForm();
          },
          onError: (e) => notify.error(apiErrorMessage(e)),
        },
      );
    } else {
      create.mutate(body, {
        onSuccess: (data) => {
          resetForm();
          const newSlug = (data as { slug?: string })?.slug;
          if (newSlug) {
            // Auto-generate the Learn presentation in the background.
            notify.success("Topic created — generating Learn…");
            api
              .post(`/topics/${newSlug}/presentations/generate`)
              .then(() => notify.success("Learn ready"))
              .catch(() =>
                notify.error(
                  "Topic created, but Learn generation failed — use “Generate Learn” on the topic.",
                ),
              );
          } else {
            notify.success("Topic created");
          }
        },
        onError: (e) => notify.error(apiErrorMessage(e)),
      });
    }
  };

  const saving = create.isPending || update.isPending;
  const canSave = title.trim().length > 0 && readingText.trim().length > 0;

  return (
    <AppShell>
      <PageHeader title="Content" breadcrumb="Teacher" />
      <Box px={{ base: "16px", md: "32px" }} py="24px">
        <Grid templateColumns="repeat(auto-fit, minmax(180px, 1fr))" gap="16px" mb="24px">
          <StatCard label="Topics" value={String(stats.total)} icon={BookOpen} />
          <StatCard label="Units" value={String(stats.units)} />
          <StatCard label="Exercises" value={String(stats.exercises)} icon={Sparkles} />
          <StatCard
            label="Without exercises"
            value={String(stats.empty)}
            icon={AlertTriangle}
          />
        </Grid>

        {/* Editor modal */}
        {showEditor && (
          <Box
            position="fixed"
            inset={0}
            zIndex={40}
            bg="rgba(0,0,0,0.6)"
            display="flex"
            alignItems="flex-start"
            justifyContent="center"
            p="24px"
            overflowY="auto"
            onClick={resetForm}
          >
            <Box
              onClick={(e) => e.stopPropagation()}
              w="100%"
              maxW="560px"
              my="32px"
              bg="surface"
              border="1px solid"
              borderColor="border"
              borderRadius="lg"
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
                  {editingId ? "Edit topic" : "Create topic"}
                </Text>
                <Box
                  as="button"
                  color="textMuted"
                  lineHeight="0"
                  _hover={{ color: "text" }}
                  onClick={resetForm}
                >
                  <X size={18} strokeWidth={1.5} />
                </Box>
              </Flex>
              <Box p="20px">
                <Stack gap="14px">
              <FormField
                label="Title"
                placeholder="e.g. Present Perfect Continuous"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <Box w="110px">
                <Text fontSize="13px" color="textMuted" mb="6px">
                  Unit
                </Text>
                <Input
                  {...inputStyle}
                  type="number"
                  min={1}
                  value={unit}
                  onChange={(e) => setUnit(e.target.value.replace(/[^0-9]/g, ""))}
                />
              </Box>
              <Box>
                <Flex align="center" justify="space-between" mb="6px" gap="10px">
                  <Text fontSize="13px" color="textMuted">
                    Reading text (used for Reading, Listening audio & comprehension)
                  </Text>
                  <Button
                    variant="subtle"
                    h="28px"
                    px="10px"
                    fontSize="12px"
                    loading={genReading.isPending}
                    disabled={!title.trim() || genReading.isPending}
                    onClick={generateReading}
                  >
                    <Sparkles size={13} strokeWidth={1.5} />
                    Generate with AI
                  </Button>
                </Flex>
                <Textarea
                  value={readingText}
                  onChange={(e) => setReadingText(e.target.value)}
                  minH="120px"
                  bg="surface"
                  color="text"
                  fontSize="14px"
                  border="1px solid"
                  borderColor="border"
                  borderRadius="md"
                  placeholder="A few sentences in English that demonstrate this grammar point…"
                  _placeholder={{ color: "textFaint" }}
                  _hover={{ borderColor: "borderStrong" }}
                  _focusVisible={{
                    borderColor: "accent",
                    boxShadow: "0 0 0 1px #4F7CFF",
                    outline: "none",
                  }}
                />
              </Box>
              <Flex gap="10px">
                <Button loading={saving} disabled={!canSave || saving} onClick={submit}>
                  <Plus size={15} strokeWidth={1.5} />
                  {editingId ? "Save changes" : "Create topic"}
                </Button>
                <Button variant="ghost" onClick={resetForm}>
                  Cancel
                </Button>
              </Flex>
                </Stack>
              </Box>
            </Box>
          </Box>
        )}

        {/* Toolbar */}
        <Box>
          <ListToolbar search={search} onSearch={setSearch} placeholder="Search topics...">
            {grouped.length > 0 && (
              <Button
                variant="outline"
                h="36px"
                px="12px"
                fontSize="13px"
                onClick={() =>
                  setExpanded(
                    allExpanded
                      ? new Set()
                      : new Set((topics ?? []).map((t) => t.unit)),
                  )
                }
              >
                {allExpanded ? "Collapse all" : "Expand all"}
              </Button>
            )}
            {!showEditor && (
              <Button onClick={newTopic}>
                <Plus size={15} strokeWidth={1.5} />
                New topic
              </Button>
            )}
          </ListToolbar>
        </Box>

        {/* List */}
        {!topics && (
          <>
            {isError && (
              <ErrorBanner
                message="We couldn't load your topics right now. Please check your internet connection and try again."
                onRetry={() => void refetch()}
                loading={isFetching}
              />
            )}
            <Skeleton height="240px" />
          </>
        )}
        {topics && grouped.length === 0 && (
          <EmptyState
            icon={BookOpen}
            title={searching ? "No matches" : "No topics yet"}
            description={
              searching ? "Try a different search." : "Create your first topic above."
            }
          />
        )}

        <Stack gap="12px">
          {grouped.map((g) => {
            const open = isOpen(g.unit);
            const exTotal = g.topics.reduce((s, t) => s + t.exerciseCount, 0);
            return (
              <Box
                key={g.unit}
                bg="surface"
                border="1px solid"
                borderColor={open ? "borderStrong" : "border"}
                borderRadius="lg"
                overflow="hidden"
              >
                <Flex
                  as="button"
                  w="full"
                  align="center"
                  gap="12px"
                  px="20px"
                  py="14px"
                  textAlign="left"
                  _hover={{ bg: "surface2" }}
                  onClick={() => toggleUnit(g.unit)}
                >
                  <Box
                    color="var(--chakra-colors-text-faint)"
                    transform={open ? "rotate(180deg)" : undefined}
                    transition="transform 200ms ease"
                  >
                    <ChevronDown size={16} strokeWidth={1.5} />
                  </Box>
                  <Text fontSize="15px" fontWeight="600" color="text" flex="1">
                    Unit {g.unit}
                  </Text>
                  <Text fontSize="12px" color="textFaint">
                    {g.topics.length} topics · {exTotal} exercises
                  </Text>
                </Flex>

                {open && (
                  <Stack gap={0} borderTop="1px solid" borderColor="border">
                    {g.topics.map((t, idx) => {
                      const key = `${g.unit}-${idx}`;
                      const noEx = t.exerciseCount === 0;
                      return (
                        <Flex
                          key={t.id}
                          px="20px"
                          py="12px"
                          align="center"
                          gap="12px"
                          flexWrap={{ base: "wrap", md: "nowrap" }}
                          borderBottom="1px solid"
                          borderColor="border"
                          _last={{ borderBottom: "none" }}
                          bg={overKey === key ? "surface2" : undefined}
                          opacity={moving ? 0.6 : 1}
                          draggable={!moving && !searching}
                          onDragStart={() => {
                            dragRef.current = { unit: g.unit, index: idx };
                          }}
                          onDragOver={(e) => {
                            if (searching) return;
                            e.preventDefault();
                            setOverKey(key);
                          }}
                          onDragLeave={() =>
                            setOverKey((k) => (k === key ? null : k))
                          }
                          onDrop={() => !searching && onDrop(g.unit, g.topics, idx)}
                          onDragEnd={() => {
                            dragRef.current = null;
                            setOverKey(null);
                          }}
                        >
                          {!searching && (
                            <Box color="var(--chakra-colors-text-faint)" cursor="grab" lineHeight="0">
                              <GripVertical size={16} strokeWidth={1.5} />
                            </Box>
                          )}
                          <BookOpen size={16} strokeWidth={1.5} color="var(--chakra-colors-text-faint)" />
                          <Box flex="1" minW="120px">
                            <Text fontSize="14px" color="text" lineClamp={1}>
                              {t.title}
                            </Text>
                            <Text
                              fontFamily="mono"
                              fontSize="12px"
                              color="textFaint"
                              lineClamp={1}
                              wordBreak="break-all"
                            >
                              {t.slug} · {t.exerciseCount} exercises
                            </Text>
                          </Box>
                          <Flex
                            align="center"
                            gap="8px"
                            flexShrink={0}
                            flexWrap="wrap"
                            ml={{ base: 0, md: "auto" }}
                          >
                            {noEx ? (
                              <Badge tone="warning">no exercises</Badge>
                            ) : (
                              <Badge>order {t.order}</Badge>
                            )}
                            {noEx && (
                              <Button
                                variant="subtle"
                                h="30px"
                                px="10px"
                                fontSize="13px"
                                onClick={() =>
                                  navigate(`/teacher/generate?topicId=${t.id}`)
                                }
                              >
                                <Sparkles size={13} strokeWidth={1.5} />
                                Generate
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              h="30px"
                              px="10px"
                              fontSize="13px"
                              onClick={() => navigate(`/topics/${t.slug}`)}
                            >
                              Open
                            </Button>
                            <Button
                              variant="outline"
                              h="30px"
                              px="10px"
                              fontSize="13px"
                              onClick={() => void startEdit(t.slug)}
                            >
                              <Pencil size={13} strokeWidth={1.5} />
                              Edit
                            </Button>
                            <Box
                              as="button"
                              color="var(--chakra-colors-text-faint)"
                              lineHeight="0"
                              _hover={{ color: "#F85149" }}
                              onClick={() => setDelId(t.id)}
                            >
                              <Trash2 size={15} strokeWidth={1.5} />
                            </Box>
                          </Flex>
                        </Flex>
                      );
                    })}
                  </Stack>
                )}
              </Box>
            );
          })}
        </Stack>
      </Box>

      <ConfirmDialog
        open={delId !== null}
        title="Delete topic?"
        body="The topic and all its exercises, presentations, audio and student mastery for it will be permanently deleted. This cannot be undone."
        confirmLabel="Delete"
        danger
        loading={remove.isPending}
        onConfirm={() =>
          delId &&
          remove.mutate(delId, {
            onSuccess: () => {
              notify.success("Topic deleted");
              setDelId(null);
              if (editingId === delId) resetForm();
            },
            onError: (e) => notify.error(apiErrorMessage(e)),
          })
        }
        onClose={() => setDelId(null)}
      />
    </AppShell>
  );
}
