import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const UTTERANCE_RATE = 0.94;
const UTTERANCE_PITCH = 1;
const UTTERANCE_VOLUME = 1;

const isIndonesian = (voice: SpeechSynthesisVoice): boolean =>
  voice.lang.toLowerCase().startsWith("id");

export interface VoiceGuidance {
  readonly supported: boolean;
  readonly enabled: boolean;
  readonly lastSpoken: string | null;
  readonly toggle: () => void;
  readonly speak: (text: string) => void;
  readonly repeat: () => void;
}

export function useVoiceGuidance(): VoiceGuidance {
  const supported =
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    typeof window.SpeechSynthesisUtterance === "function";
  const [enabled, setEnabled] = useState(true);
  const [lastSpoken, setLastSpoken] = useState<string | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const lastRef = useRef<string | null>(null);

  useEffect(() => {
    if (!supported) return;
    const load = () => {
      const list = window.speechSynthesis.getVoices();
      if (list.length > 0) setVoices(list);
    };
    load();
    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", load);
      window.speechSynthesis.cancel();
    };
  }, [supported]);

  const indonesianVoice = useMemo(() => voices.find(isIndonesian) ?? null, [voices]);

  const speak = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!supported || !enabled || trimmed.length === 0) return;
      const synth = window.speechSynthesis;
      synth.cancel();
      const utterance = new SpeechSynthesisUtterance(trimmed);
      utterance.lang = indonesianVoice?.lang ?? "id-ID";
      if (indonesianVoice !== null) utterance.voice = indonesianVoice;
      utterance.rate = UTTERANCE_RATE;
      utterance.pitch = UTTERANCE_PITCH;
      utterance.volume = UTTERANCE_VOLUME;
      synth.speak(utterance);
      lastRef.current = trimmed;
      setLastSpoken(trimmed);
    },
    [enabled, indonesianVoice, supported]
  );

  const toggle = useCallback(() => {
    setEnabled((current) => {
      if (current && supported) window.speechSynthesis.cancel();
      return !current;
    });
  }, [supported]);

  const repeat = useCallback(() => {
    const text = lastRef.current;
    if (text !== null) speak(text);
  }, [speak]);

  return { supported, enabled, lastSpoken, toggle, speak, repeat };
}
