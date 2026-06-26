import { Box, Flex, Input, Text } from "@chakra-ui/react";
import { BookOpen, ClipboardList, Search, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTopics } from "../../../entities/topic";
import { useTests } from "../../../entities/tests";
import { useTeacherStudents } from "../../../entities/teacher";
import { useSessionStore } from "../../../entities/session";

interface Result {
  id: string;
  title: string;
  meta: string;
  url: string;
  icon: LucideIcon;
}

export function CommandPalette({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const user = useSessionStore((s) => s.user);
  const isTeacher = user?.role === "TEACHER";
  // (hooks below depend on isTeacher)

  const { data: topics } = useTopics();
  const { data: tests } = useTests();
  // Only teachers may query the students list (403 otherwise)
  const { data: students } = useTeacherStudents(isTeacher);

  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQ("");
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  const results = useMemo<Result[]>(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return [];
    const out: Result[] = [];

    for (const t of topics ?? []) {
      if (t.title.toLowerCase().includes(needle)) {
        out.push({
          id: `topic-${t.id}`,
          title: t.title,
          meta: `Unit ${t.unit} · topic`,
          url: `/topics/${t.slug}`,
          icon: BookOpen,
        });
      }
    }
    for (const t of tests ?? []) {
      if (t.title.toLowerCase().includes(needle)) {
        out.push({
          id: `test-${t.id}`,
          title: t.title,
          meta: "test",
          url: `/tests/${t.id}`,
          icon: ClipboardList,
        });
      }
    }
    if (isTeacher) {
      for (const s of students ?? []) {
        if (s.email.toLowerCase().includes(needle)) {
          out.push({
            id: `student-${s.id}`,
            title: s.email,
            meta: "student",
            url: `/teacher/students/${s.id}`,
            icon: Users,
          });
        }
      }
    }
    return out.slice(0, 10);
  }, [q, topics, tests, students, isTeacher]);

  const go = (r: Result) => {
    navigate(r.url);
    onClose();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && results[active]) {
      go(results[active]);
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  if (!open) return null;

  return (
    <Flex
      position="fixed"
      inset={0}
      zIndex={95}
      justify="center"
      align="flex-start"
      pt="120px"
      bg="rgba(0,0,0,.6)"
      backdropFilter="blur(2px)"
      onClick={onClose}
    >
      <Box
        w="full"
        maxW="540px"
        mx="16px"
        bg="surface"
        border="1px solid"
        borderColor="border"
        borderRadius="lg"
        overflow="hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <Flex
          align="center"
          gap="10px"
          px="16px"
          h="52px"
          borderBottom="1px solid"
          borderColor="border"
        >
          <Search size={17} strokeWidth={1.5} color="var(--chakra-colors-text-faint)" />
          <Input
            ref={inputRef}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            placeholder={
              isTeacher
                ? "Search topics, tests, students..."
                : "Search topics, tests..."
            }
            border="none"
            bg="transparent"
            color="text"
            fontSize="15px"
            _placeholder={{ color: "textFaint" }}
            _focusVisible={{ outline: "none", boxShadow: "none" }}
          />
          <Text
            fontFamily="mono"
            fontSize="11px"
            color="textFaint"
            border="1px solid"
            borderColor="border"
            borderRadius="4px"
            px="5px"
            py="1px"
          >
            ESC
          </Text>
        </Flex>
        <Box maxH="320px" overflowY="auto" py="6px">
          {q && results.length === 0 && (
            <Text px="16px" py="12px" fontSize="14px" color="textFaint">
              No results for “{q}”
            </Text>
          )}
          {!q && (
            <Text px="16px" py="12px" fontSize="13px" color="textFaint">
              Type to search...
            </Text>
          )}
          {results.map((r, i) => (
            <Flex
              key={r.id}
              align="center"
              gap="10px"
              px="16px"
              py="10px"
              cursor="pointer"
              bg={i === active ? "surface2" : "transparent"}
              onMouseEnter={() => setActive(i)}
              onClick={() => go(r)}
            >
              <r.icon size={16} strokeWidth={1.5} color="#A1A1AA" />
              <Text fontSize="14px" color="text" lineClamp={1}>
                {r.title}
              </Text>
              <Text fontSize="12px" color="textFaint" ml="auto" flexShrink={0}>
                {r.meta}
              </Text>
            </Flex>
          ))}
        </Box>
      </Box>
    </Flex>
  );
}
