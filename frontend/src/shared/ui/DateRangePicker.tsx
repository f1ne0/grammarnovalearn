import { Flex } from "@chakra-ui/react";
import { Button } from "./Button";
import {
  PRESET_LABELS,
  useDateRange,
} from "../lib/dateRange";
import type { RangePreset } from "../lib/dateRange";

const PRESETS: RangePreset[] = ["7d", "30d", "semester"];

export function DateRangePicker() {
  const { preset, setPreset } = useDateRange();
  return (
    <Flex gap="6px" wrap="wrap">
      {PRESETS.map((p) => (
        <Button
          key={p}
          h="32px"
          px="12px"
          fontSize="13px"
          variant={preset === p ? "subtle" : "outline"}
          onClick={() => setPreset(p)}
        >
          {PRESET_LABELS[p]}
        </Button>
      ))}
    </Flex>
  );
}
