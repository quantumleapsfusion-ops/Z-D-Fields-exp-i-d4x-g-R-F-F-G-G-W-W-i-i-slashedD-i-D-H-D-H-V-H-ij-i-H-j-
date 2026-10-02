"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Browser-based speech recognition and synthesis for Da Vinci.
 * Falls back to typed input when speech is unavailable.
 */

interface VoiceIOState {
  isListening: boolean;
  isSpeaking: boolean;
  isSupported: boolean;
  transcript: string;
  error: string | null;
}

interface VoiceIOActions {
  startListening: () => void;
  stopListening: () => void;
  speak: (text: string) => Promise<void>;
  resetTranscript: () => void;
  clearError: () => void;
}

export type UseVoiceIO = VoiceIOState & VoiceIOActions;

export function useVoiceIO(): UseVoiceIO {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const isSupported: boolean =
    typeof window !== "undefined" &&
    Boolean(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).SpeechRecognition ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).webkitSpeechRecognition,
    ) &&
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Boolean((window as any).speechSynthesis);

  // Initialize speech recognition
  useEffect(() => {
    if (!isSupported) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognitionClass: any =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).SpeechRecognition ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionClass) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognition: any = new SpeechRecognitionClass();

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      setTranscript("");
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptSegment = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          setTranscript((prev) => prev + transcriptSegment);
        } else {
          interim += transcriptSegment;
        }
      }
      if (interim) setTranscript((prev) => prev + interim);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      setError(`Speech recognition error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
    };
  }, [isSupported]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    setTranscript("");
    setError(null);
    recognitionRef.current.start();
  }, []);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
  }, []);

  const speak = useCallback(
    async (text: string): Promise<void> => {
      if (!isSupported) return;

      return new Promise((resolve) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const synth = (window as any).speechSynthesis;
        synth.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1;
        utterance.pitch = 1;
        utterance.volume = 1;

        utterance.onstart = () => {
          setIsSpeaking(true);
        };

        utterance.onend = () => {
          setIsSpeaking(false);
          resolve();
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        utterance.onerror = (event: any) => {
          setError(`Speech synthesis error: ${event.error}`);
          setIsSpeaking(false);
          resolve();
        };

        utteranceRef.current = utterance;
        synth.speak(utterance);
      });
    },
    [isSupported],
  );

  const resetTranscript = useCallback(() => {
    setTranscript("");
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isListening,
    isSpeaking,
    isSupported,
    transcript,
    error,
    startListening,
    stopListening,
    speak,
    resetTranscript,
    clearError,
  };
}
