import { Box, Flex, Input, Stack, Text } from "@chakra-ui/react";
import { X } from "lucide-react";
import { Button } from "../../../shared/ui";
import type { ExercisePayload } from "../../../entities/exercise";

// ===== MULTIPLE CHOICE =====
export function MultipleChoiceInput({
  payload,
  value,
  onChange,
  disabled,
}: {
  payload: ExercisePayload;
  value: string | null;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <Stack gap="8px">
      {(payload.options ?? []).map((opt) => {
        const selected = value === opt.id;
        return (
          <Flex
            key={opt.id}
            as="button"
            aria-disabled={disabled}
            onClick={() => !disabled && onChange(opt.id)}
            align="center"
            gap="12px"
            w="full"
            textAlign="left"
            bg={selected ? "accentSubtle" : "surface"}
            border="1px solid"
            borderColor={selected ? "accent" : "border"}
            borderRadius="md"
            p="13px 16px"
            cursor={disabled ? "default" : "pointer"}
            transition="all 160ms ease"
            _hover={disabled ? {} : { borderColor: "borderStrong" }}
          >
            <Flex
              w="18px"
              h="18px"
              borderRadius="full"
              border={selected ? "5px solid #4F7CFF" : "1.5px solid #2E2E33"}
              flexShrink={0}
              transition="all 160ms ease"
            />
            <Text fontSize="14px" color="text">
              <Text as="span" fontFamily="mono" fontSize="13px" mr="8px" color="textFaint">
                {opt.id.toUpperCase()}
              </Text>
              {opt.text}
            </Text>
          </Flex>
        );
      })}
    </Stack>
  );
}

// ===== FILL IN BLANK =====
export function FillInBlankInput({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <Input
      h="42px"
      bg="surface"
      color="text"
      fontSize="14px"
      border="1px solid"
      borderColor="border"
      borderRadius="md"
      placeholder="Type your answer..."
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      _placeholder={{ color: "textFaint" }}
      _hover={{ borderColor: "borderStrong" }}
      _focusVisible={{
        borderColor: "accent",
        boxShadow: "0 0 0 1px #4F7CFF",
        outline: "none",
      }}
    />
  );
}

// ===== TRUE / FALSE =====
export function TrueFalseInput({
  value,
  onChange,
  disabled,
}: {
  value: boolean | null;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <Flex gap="12px">
      {[true, false].map((v) => {
        const selected = value === v;
        return (
          <Button
            key={String(v)}
            flex="1"
            variant={selected ? "subtle" : "outline"}
            disabled={disabled}
            borderColor={selected ? "accent" : undefined}
            onClick={() => onChange(v)}
          >
            {v ? "True" : "False"}
          </Button>
        );
      })}
    </Flex>
  );
}

// ===== MATCHING =====
export function MatchingInput({
  payload,
  value,
  onChange,
  disabled,
}: {
  payload: ExercisePayload;
  value: Record<string, string>;
  onChange: (v: Record<string, string>) => void;
  disabled?: boolean;
}) {
  const left = payload.left ?? [];
  const right = payload.right ?? [];

  return (
    <Stack gap="16px">
      {left.map((l) => (
        <Box key={l.id}>
          <Text fontSize="14px" fontWeight="500" mb="8px" color="text">
            {l.text}
          </Text>
          <Flex gap="8px" wrap="wrap">
            {right.map((r) => {
              const selected = value[l.id] === r.id;
              return (
                <Button
                  key={r.id}
                  h="30px"
                  px="12px"
                  fontSize="13px"
                  variant={selected ? "subtle" : "outline"}
                  borderColor={selected ? "accent" : undefined}
                  disabled={disabled}
                  onClick={() => onChange({ ...value, [l.id]: r.id })}
                >
                  {r.text}
                </Button>
              );
            })}
          </Flex>
        </Box>
      ))}
    </Stack>
  );
}

// ===== TEXT ANSWER (open cloze / word formation / key-word / error correction) =====
export function TextAnswerInput({
  payload,
  type,
  value,
  onChange,
  disabled,
}: {
  payload: ExercisePayload;
  type: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  // Show the sentence/context above the input when present
  const context =
    type === "KEY_WORD_TRANSFORMATION"
      ? `${payload.original ?? ""}\n→ ${payload.prompt2 ?? ""}`
      : payload.text ?? "";
  const keyword =
    type === "KEY_WORD_TRANSFORMATION" ? payload.keyword : payload.root;

  return (
    <Stack gap="12px">
      {context && (
        <Box
          bg="surface2"
          border="1px solid"
          borderColor="border"
          borderRadius="md"
          p="12px 14px"
        >
          <Text fontSize="15px" color="text" lineHeight="1.6" whiteSpace="pre-wrap">
            {context}
          </Text>
        </Box>
      )}
      {keyword && (
        <Flex align="center" gap="8px">
          <Text fontSize="12px" color="textFaint">
            Key word:
          </Text>
          <Text
            fontFamily="mono"
            fontSize="13px"
            bg="accentSubtle"
            color="accentHover"
            px="8px"
            py="2px"
            borderRadius="4px"
          >
            {keyword}
          </Text>
        </Flex>
      )}
      <Input
        h="42px"
        bg="surface"
        color="text"
        fontSize="14px"
        border="1px solid"
        borderColor="border"
        borderRadius="md"
        placeholder="Type your answer..."
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        _placeholder={{ color: "textFaint" }}
        _hover={{ borderColor: "borderStrong" }}
        _focusVisible={{
          borderColor: "accent",
          boxShadow: "0 0 0 1px #4F7CFF",
          outline: "none",
        }}
      />
    </Stack>
  );
}

// ===== CATEGORIZE =====
export function CategorizeInput({
  payload,
  value,
  onChange,
  disabled,
}: {
  payload: ExercisePayload;
  value: Record<string, string>; // itemId -> categoryId
  onChange: (v: Record<string, string>) => void;
  disabled?: boolean;
}) {
  const items = payload.items ?? [];
  const categories = payload.categories ?? [];
  return (
    <Stack gap="14px">
      {items.map((item) => (
        <Box key={item.id}>
          <Text fontSize="15px" fontWeight="500" mb="6px" color="text" fontFamily="mono">
            {item.text}
          </Text>
          <Flex gap="8px" wrap="wrap">
            {categories.map((c) => {
              const selected = value[item.id] === c.id;
              return (
                <Button
                  key={c.id}
                  h="30px"
                  px="12px"
                  fontSize="13px"
                  variant={selected ? "subtle" : "outline"}
                  borderColor={selected ? "accent" : undefined}
                  disabled={disabled}
                  onClick={() => onChange({ ...value, [item.id]: c.id })}
                >
                  {c.label}
                </Button>
              );
            })}
          </Flex>
        </Box>
      ))}
    </Stack>
  );
}

// ===== REORDER =====
export function ReorderInput({
  payload,
  value,
  onChange,
  disabled,
}: {
  payload: ExercisePayload;
  value: string[];
  onChange: (v: string[]) => void;
  disabled?: boolean;
}) {
  const words = payload.words ?? payload.correctOrder ?? [];
  const remaining = [...words];
  for (const w of value) {
    const idx = remaining.indexOf(w);
    if (idx >= 0) remaining.splice(idx, 1);
  }

  return (
    <Box>
      <Box
        minH="56px"
        bg="surface"
        border="1px dashed"
        borderColor="borderStrong"
        borderRadius="md"
        p="12px"
        mb="12px"
      >
        {value.length === 0 && (
          <Text fontSize="13px" color="textFaint">
            Tap the words below in the correct order
          </Text>
        )}
        <Flex gap="8px" wrap="wrap">
          {value.map((w, i) => (
            <Button
              key={`${w}-${i}`}
              h="30px"
              px="12px"
              fontSize="13px"
              variant="subtle"
              disabled={disabled}
              onClick={() => onChange(value.filter((_, j) => j !== i))}
            >
              {w}
              <X size={13} strokeWidth={1.5} />
            </Button>
          ))}
        </Flex>
      </Box>
      <Flex gap="8px" wrap="wrap">
        {remaining.map((w, i) => (
          <Button
            key={`${w}-${i}`}
            h="30px"
            px="12px"
            fontSize="13px"
            variant="outline"
            disabled={disabled}
            onClick={() => onChange([...value, w])}
          >
            {w}
          </Button>
        ))}
      </Flex>
    </Box>
  );
}
