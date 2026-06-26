import { Box, Flex, Text } from "@chakra-ui/react";
import { Mic, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AudioPlayer, Button } from "../../../shared/ui";

interface SpeakingRecorderProps {
  onRecorded: (blob: Blob, mimeType: string) => void;
  disabled?: boolean;
}

const BAR_COUNT = 12;

/** Live voice visualizer: bars react to mic amplitude via Web Audio API. */
function VoiceBars({ analyser }: { analyser: AnalyserNode }) {
  const [levels, setLevels] = useState<number[]>(
    () => new Array(BAR_COUNT).fill(0.1) as number[],
  );

  useEffect(() => {
    const data = new Uint8Array(analyser.frequencyBinCount);
    let raf: number;

    const tick = () => {
      analyser.getByteFrequencyData(data);
      // Use the voice range (skip the lowest bins) split into BAR_COUNT bands
      const usable = Math.floor(data.length * 0.6);
      const bandSize = Math.floor(usable / BAR_COUNT);
      const next: number[] = [];
      for (let i = 0; i < BAR_COUNT; i++) {
        let sum = 0;
        for (let j = 0; j < bandSize; j++) {
          sum += data[i * bandSize + j];
        }
        const avg = sum / bandSize / 255; // 0..1
        next.push(Math.max(0.08, Math.min(1, avg * 1.6)));
      }
      setLevels(next);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [analyser]);

  return (
    <Flex align="center" gap="3px" h="28px">
      {levels.map((v, i) => (
        <Box
          key={i}
          w="3px"
          h={`${Math.round(4 + v * 24)}px`}
          borderRadius="999px"
          bg={v > 0.5 ? "error" : "rgba(248,81,73,.7)"}
          transition="height 80ms ease"
        />
      ))}
    </Flex>
  );
}

export function SpeakingRecorder({
  onRecorded,
  disabled,
}: SpeakingRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      void audioCtxRef.current?.close().catch(() => void 0);
    };
  }, [audioUrl]);

  const start = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      // Voice visualization: tap the stream with an analyser
      const ctx = new AudioContext();
      const source = ctx.createMediaStreamSource(stream);
      const node = ctx.createAnalyser();
      node.fftSize = 256;
      node.smoothingTimeConstant = 0.7;
      source.connect(node);
      audioCtxRef.current = ctx;
      setAnalyser(node);

      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "";
      const recorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined,
      );
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const type = recorder.mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type });
        setAudioUrl((old) => {
          if (old) URL.revokeObjectURL(old);
          return URL.createObjectURL(blob);
        });
        onRecorded(blob, type.split(";")[0]);
        stream.getTracks().forEach((t) => t.stop());
        void ctx.close().catch(() => void 0);
        setAnalyser(null);
      };
      recorder.start();
      recorderRef.current = recorder;
      setRecording(true);
      setSeconds(0);
      timerRef.current = window.setInterval(
        () => setSeconds((s) => s + 1),
        1000,
      );
    } catch {
      setError("Microphone access denied. Allow it in browser settings.");
    }
  };

  const stop = () => {
    recorderRef.current?.stop();
    setRecording(false);
    if (timerRef.current) window.clearInterval(timerRef.current);
  };

  const fmt = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <Box>
      <Flex align="center" gap="16px" mb="12px">
        {!recording ? (
          <Button disabled={disabled} onClick={start}>
            <Mic size={16} strokeWidth={1.5} />
            {audioUrl ? "Record again" : "Start recording"}
          </Button>
        ) : (
          <Button variant="danger" onClick={stop}>
            <Square size={14} strokeWidth={1.5} />
            Stop
            <Text as="span" fontFamily="mono" fontSize="13px">
              {fmt(seconds)}
            </Text>
          </Button>
        )}
        {recording && analyser && <VoiceBars analyser={analyser} />}
      </Flex>
      {audioUrl && !recording && <AudioPlayer src={audioUrl} />}
      {error && (
        <Text fontSize="13px" color="error" mt="8px">
          {error}
        </Text>
      )}
    </Box>
  );
}
