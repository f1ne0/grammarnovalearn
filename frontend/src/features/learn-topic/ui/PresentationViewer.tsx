import { Box, Flex, Text } from "@chakra-ui/react";
import {
  ArrowRight,
  Eye,
  GitCompareArrows,
  Lightbulb,
  MessageSquare,
  Ruler,
  Target,
  TriangleAlert,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";
import { Card, EmptyState, Skeleton } from "../../../shared/ui";
import { usePresentations } from "../../../entities/presentation";
import type {
  PresentationBlock,
  PresentationMode,
} from "../../../entities/presentation";

const MODE_META: Record<
  PresentationMode,
  { label: string; icon: LucideIcon }
> = {
  DISCOVERY: { label: "Discover", icon: Lightbulb },
  FORM: { label: "Form", icon: Ruler },
  MEANING: { label: "Meaning", icon: Target },
  USE: { label: "Use", icon: MessageSquare },
  VISUAL: { label: "Visual", icon: Eye },
  CONTRAST: { label: "Contrast", icon: GitCompareArrows },
  CONTEXT: { label: "Context", icon: MessageSquare },
  ERRORS: { label: "Common errors", icon: TriangleAlert },
};

/** Minimal inline markdown: **bold**, *italic*, line breaks, bullet lists. */
function renderMd(md: string) {
  const lines = md.split("\n");
  return lines.map((line, i) => {
    const bullet = line.trimStart().startsWith("- ");
    const text = bullet ? line.trimStart().slice(2) : line;
    const parts: React.ReactNode[] = [];
    const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = regex.exec(text)) !== null) {
      if (m.index > last) parts.push(text.slice(last, m.index));
      const tok = m[0];
      if (tok.startsWith("**"))
        parts.push(
          <Text as="strong" key={`${i}-${m.index}`} color="text" fontWeight="600">
            {tok.slice(2, -2)}
          </Text>,
        );
      else if (tok.startsWith("`"))
        parts.push(
          <Text
            as="code"
            key={`${i}-${m.index}`}
            fontFamily="mono"
            fontSize="13px"
            bg="surface2"
            px="4px"
            borderRadius="4px"
            color="accentHover"
          >
            {tok.slice(1, -1)}
          </Text>,
        );
      else
        parts.push(
          <Text as="em" key={`${i}-${m.index}`} color="textMuted">
            {tok.slice(1, -1)}
          </Text>,
        );
      last = m.index + tok.length;
    }
    if (last < text.length) parts.push(text.slice(last));

    if (line.trim() === "") return <Box key={i} h="8px" />;
    return (
      <Flex key={i} gap="8px" mb="6px" align="flex-start">
        {bullet && (
          <Box mt="9px" w="4px" h="4px" borderRadius="full" bg="textFaint" flexShrink={0} />
        )}
        <Text fontSize="15px" lineHeight="1.7" color="textMuted">
          {parts}
        </Text>
      </Flex>
    );
  });
}

function Timeline({ block }: { block: PresentationBlock }) {
  const points = block.payload?.points ?? [];
  return (
    <Box mt="16px">
      <Box position="relative" h="2px" bg="border" my="28px">
        {points.map((p, i) => {
          const left = `${((p.at + 3) / 6) * 100}%`;
          return (
            <Box key={i} position="absolute" left={left} top="-4px" transform="translateX(-50%)">
              <Box w="10px" h="10px" borderRadius="full" bg="accent" />
              <Text
                fontSize="11px"
                color="textFaint"
                mt="8px"
                textAlign="center"
                w="120px"
                ml="-55px"
              >
                {p.label}
              </Text>
            </Box>
          );
        })}
      </Box>
      {block.payload?.note && (
        <Text fontSize="13px" color="textFaint" mt="24px">
          {block.payload.note}
        </Text>
      )}
    </Box>
  );
}

function ContrastPairs({ block }: { block: PresentationBlock }) {
  const pairs = block.payload?.pairs ?? [];
  return (
    <Flex direction="column" gap="12px" mt="16px">
      {pairs.map((p, i) => (
        <Flex key={i} gap="12px" direction={{ base: "column", md: "row" }}>
          <Box flex="1" bg="surface2" border="1px solid" borderColor="border" borderRadius="md" p="14px">
            <Text fontSize="15px" color="text" mb="6px">{p.a}</Text>
            <Text fontSize="12px" color="accentHover">{p.whyA}</Text>
          </Box>
          <Flex align="center" justify="center" color="textFaint">
            <GitCompareArrows size={18} strokeWidth={1.5} />
          </Flex>
          <Box flex="1" bg="surface2" border="1px solid" borderColor="border" borderRadius="md" p="14px">
            <Text fontSize="15px" color="text" mb="6px">{p.b}</Text>
            <Text fontSize="12px" color="data5">{p.whyB}</Text>
          </Box>
        </Flex>
      ))}
    </Flex>
  );
}

function ErrorsList({ block }: { block: PresentationBlock }) {
  const items = block.payload?.items ?? [];
  return (
    <Flex direction="column" gap="12px" mt="16px">
      {items.map((it, i) => (
        <Box key={i} bg="surface2" border="1px solid" borderColor="border" borderRadius="md" p="14px">
          <Flex gap="8px" align="center" mb="6px">
            <TriangleAlert size={14} strokeWidth={1.5} color="#F85149" />
            <Text as="s" fontSize="14px" color="error">{it.wrong}</Text>
          </Flex>
          <Flex gap="8px" align="center" mb="8px">
            <ArrowRight size={14} strokeWidth={1.5} color="#3FB950" />
            <Text fontSize="14px" color="success">{it.right}</Text>
          </Flex>
          <Text fontSize="13px" color="textMuted">{renderMd(it.reason)}</Text>
        </Box>
      ))}
    </Flex>
  );
}

export function PresentationViewer({ slug }: { slug: string }) {
  const { data, isLoading } = usePresentations(slug);
  const [active, setActive] = useState(0);

  if (isLoading) return <Skeleton height="280px" />;
  if (!data || data.blocks.length === 0) {
    return (
      <Card title="Learn">
        <EmptyState
          icon={Lightbulb}
          title="No presentation yet"
          description="This topic doesn't have multi-mode explanations yet. Try Present Simple or Present Perfect vs Past Simple."
        />
      </Card>
    );
  }

  const block = data.blocks[Math.min(active, data.blocks.length - 1)];
  const meta = MODE_META[block.mode];

  return (
    <Box>
      {/* Mode tabs */}
      <Flex gap="6px" wrap="wrap" mb="16px">
        {data.blocks.map((b, i) => {
          const m = MODE_META[b.mode];
          const isActive = i === active;
          return (
            <Flex
              key={b.id}
              as="button"
              align="center"
              gap="6px"
              h="32px"
              px="12px"
              borderRadius="md"
              fontSize="13px"
              fontWeight={isActive ? "500" : "400"}
              color={isActive ? "text" : "textMuted"}
              bg={isActive ? "accentSubtle" : "surface"}
              border="1px solid"
              borderColor={isActive ? "accent" : "border"}
              transition="all 160ms ease"
              _hover={{ borderColor: "borderStrong" }}
              onClick={() => setActive(i)}
            >
              <m.icon size={14} strokeWidth={1.5} />
              {m.label}
            </Flex>
          );
        })}
      </Flex>

      {/* Active block */}
      <Card>
        <Flex align="center" gap="8px" mb="14px">
          <meta.icon size={16} strokeWidth={1.5} color="#6B91FF" />
          <Text fontSize="13px" fontWeight="600" color="textMuted" letterSpacing="0.03em" textTransform="uppercase">
            {meta.label}
          </Text>
        </Flex>

        {renderMd(block.contentMd)}

        {block.mode === "VISUAL" && block.payload?.type === "timeline" && (
          <Timeline block={block} />
        )}
        {block.mode === "CONTRAST" && <ContrastPairs block={block} />}
        {block.mode === "ERRORS" && <ErrorsList block={block} />}
      </Card>

      {/* Progress dots */}
      <Flex justify="center" gap="6px" mt="16px">
        {data.blocks.map((b, i) => (
          <Box
            key={b.id}
            w={i === active ? "20px" : "6px"}
            h="6px"
            borderRadius="full"
            bg={i === active ? "accent" : "border"}
            transition="all 200ms ease"
            cursor="pointer"
            onClick={() => setActive(i)}
          />
        ))}
      </Flex>
    </Box>
  );
}
