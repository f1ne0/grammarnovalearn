import { Box, Flex, Spinner, Text } from "@chakra-ui/react";
import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";

function fmt(s: number) {
  if (!isFinite(s) || isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
}

const SPEEDS = [0.75, 1, 1.25] as const;

/** Dark themed audio player: hairline surface, mono timecodes, accent progress. */
export function AudioPlayer({
  src,
  withSpeed = false,
  onPlay,
}: {
  src: string;
  withSpeed?: boolean;
  onPlay?: (playCount: number, speed: number) => void;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const playCountRef = useRef(0);

  // Smooth progress via rAF while playing (timeupdate is too coarse)
  useEffect(() => {
    if (!playing) return;
    let raf: number;
    const tick = () => {
      const el = audioRef.current;
      if (el) setCurrent(el.currentTime);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onTime = () => setCurrent(el.currentTime);
    const onMeta = () => setDuration(el.duration);
    const onEnd = () => setPlaying(false);
    const onCanPlay = () => setLoading(false);
    const onError = () => {
      setLoading(false);
      setPlaying(false);
      setError(true);
    };
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("loadedmetadata", onMeta);
    el.addEventListener("durationchange", onMeta);
    el.addEventListener("ended", onEnd);
    el.addEventListener("canplay", onCanPlay);
    el.addEventListener("error", onError);
    return () => {
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("loadedmetadata", onMeta);
      el.removeEventListener("durationchange", onMeta);
      el.removeEventListener("ended", onEnd);
      el.removeEventListener("canplay", onCanPlay);
      el.removeEventListener("error", onError);
    };
  }, [src]);

  const toggle = () => {
    const el = audioRef.current;
    if (!el) return;
    if (playing) {
      el.pause();
      setPlaying(false);
    } else {
      setError(false);
      if (el.readyState < 3) setLoading(true); // still buffering/generating
      el.playbackRate = speed;
      void el.play().catch(() => {
        setLoading(false);
        setError(true);
        setPlaying(false);
      });
      setPlaying(true);
      playCountRef.current += 1;
      onPlay?.(playCountRef.current, speed);
    }
  };

  const cycleSpeed = () => {
    const idx = SPEEDS.indexOf(speed as (typeof SPEEDS)[number]);
    const next = SPEEDS[(idx + 1) % SPEEDS.length];
    setSpeed(next);
    if (audioRef.current) audioRef.current.playbackRate = next;
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = audioRef.current;
    const bar = barRef.current;
    if (!el || !bar || !duration) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.min(
      1,
      Math.max(0, (e.clientX - rect.left) / rect.width),
    );
    el.currentTime = ratio * duration;
    setCurrent(el.currentTime);
  };

  const pct = duration > 0 ? (current / duration) * 100 : 0;

  return (
    <Flex
      align="center"
      gap="14px"
      bg="surface"
      border="1px solid"
      borderColor="border"
      borderRadius="md"
      px="14px"
      py="10px"
      w="full"
    >
      <audio ref={audioRef} src={src} preload="metadata" />
      <Flex
        as="button"
        align="center"
        justify="center"
        w="32px"
        h="32px"
        flexShrink={0}
        borderRadius="full"
        bg="accentSubtle"
        color="accentHover"
        transition="all 160ms ease"
        _hover={{ bg: "#222C49" }}
        onClick={toggle}
        aria-label={playing ? "Pause" : "Play"}
      >
        {loading ? (
          <Spinner size="xs" />
        ) : playing ? (
          <Pause size={15} strokeWidth={1.5} />
        ) : (
          <Play size={15} strokeWidth={1.5} style={{ marginLeft: "2px" }} />
        )}
      </Flex>

      <Text
        fontFamily="mono"
        fontSize="12px"
        color={error ? "error" : "textMuted"}
        flexShrink={0}
        minW="76px"
      >
        {error
          ? "load failed"
          : loading
            ? "loading..."
            : `${fmt(current)} / ${fmt(duration)}`}
      </Text>

      <Box
        ref={barRef}
        flex="1"
        h="20px"
        display="flex"
        alignItems="center"
        cursor="pointer"
        onClick={seek}
        role="slider"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pct)}
      >
        <Box
          w="full"
          h="5px"
          bg="surface2"
          borderRadius="999px"
          overflow="hidden"
        >
          <Box
            h="full"
            w={`${pct}%`}
            bg="accent"
            borderRadius="999px"
          />
        </Box>
      </Box>

      {withSpeed && (
        <Flex
          as="button"
          align="center"
          justify="center"
          flexShrink={0}
          h="24px"
          px="8px"
          borderRadius="md"
          border="1px solid"
          borderColor="border"
          color="textMuted"
          fontFamily="mono"
          fontSize="12px"
          transition="all 160ms ease"
          _hover={{ borderColor: "borderStrong", color: "text" }}
          onClick={cycleSpeed}
          aria-label="Playback speed"
        >
          {speed}×
        </Flex>
      )}
    </Flex>
  );
}
