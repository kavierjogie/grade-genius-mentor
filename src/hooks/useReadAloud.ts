import { useCallback, useEffect, useRef, useState } from "react";

export type ReadAloudState = "idle" | "loading" | "playing" | "paused";

/**
 * Streams CareerBuddy replies as speech from /api/tts and plays them back
 * with play / pause / stop controls. One message may play at a time.
 */
export function useReadAloud(accessToken: string | undefined) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [state, setState] = useState<ReadAloudState>("idle");
  const ctxRef = useRef<AudioContext | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const sourcesRef = useRef<AudioBufferSourceNode[]>([]);

  const teardown = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    for (const source of sourcesRef.current) {
      try {
        source.stop();
      } catch {
        /* already stopped */
      }
    }
    sourcesRef.current = [];
    const ctx = ctxRef.current;
    ctxRef.current = null;
    if (ctx) void ctx.close().catch(() => {});
  }, []);

  useEffect(() => () => teardown(), [teardown]);

  const stop = useCallback(() => {
    teardown();
    setActiveId(null);
    setState("idle");
  }, [teardown]);

  const pause = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    void ctx.suspend().catch(() => {});
    setState("paused");
  }, []);

  const resume = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    void ctx.resume().catch(() => {});
    setState("playing");
  }, []);

  const play = useCallback(
    async (id: string, text: string, onError?: () => void) => {
      teardown();
      setActiveId(id);
      setState("loading");

      const ctx = new AudioContext({ sampleRate: 24000 });
      ctxRef.current = ctx;
      if (ctx.state === "suspended") await ctx.resume().catch(() => {});

      const controller = new AbortController();
      abortRef.current = controller;

      let playhead = 0;
      let pending = new Uint8Array(0);
      let started = false;

      const playChunk = (incoming: Uint8Array) => {
        if (ctxRef.current !== ctx) return;
        const bytes = new Uint8Array(pending.length + incoming.length);
        bytes.set(pending);
        bytes.set(incoming, pending.length);
        const usable = bytes.length - (bytes.length % 2);
        pending = bytes.slice(usable);
        if (usable === 0) return;
        const samples = new Int16Array(bytes.buffer, 0, usable / 2);
        const floats = Float32Array.from(samples, (s) => s / 32768);
        const buffer = ctx.createBuffer(1, floats.length, 24000);
        buffer.copyToChannel(floats, 0);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        if (playhead === 0) playhead = ctx.currentTime + 0.05;
        else playhead = Math.max(playhead, ctx.currentTime);
        source.start(playhead);
        playhead += buffer.duration;
        sourcesRef.current.push(source);
        if (!started) {
          started = true;
          setState("playing");
        }
        source.onended = () => {
          if (ctxRef.current !== ctx) return;
          const last = sourcesRef.current[sourcesRef.current.length - 1];
          if (last === source) {
            stop();
          }
        };
      };

      try {
        const res = await fetch("/api/tts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken ?? ""}`,
          },
          body: JSON.stringify({ text }),
          signal: controller.signal,
        });
        if (!res.ok || !res.body) throw new Error(`TTS failed: ${res.status}`);

        const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
        let buffered = "";
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffered += value;
          const lines = buffered.split("\n");
          buffered = lines.pop() ?? "";
          for (const line of lines) {
            if (!line.startsWith("data:")) continue;
            const data = line.slice(5).trim();
            if (!data || data === "[DONE]") continue;
            let payload: { type?: string; audio?: string };
            try {
              payload = JSON.parse(data);
            } catch {
              continue;
            }
            if (payload.type !== "speech.audio.delta" || !payload.audio) continue;
            const binary = atob(payload.audio);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
            playChunk(bytes);
          }
        }
        if (!started) stop();
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        onError?.();
        stop();
      }
    },
    [accessToken, stop, teardown],
  );

  return { activeId, state, play, pause, resume, stop };
}
