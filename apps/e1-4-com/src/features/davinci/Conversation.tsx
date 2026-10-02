"use client";

import { CompanionClient } from "@/lib/davinci/companion";
import { useVoiceIO } from "@/lib/davinci/voice-io";
import type { Turn } from "@/lib/davinci/types";
import { haptic } from "@/lib/device/haptics";
import { useCallback, useRef, useState } from "react";

export function DaVinciConversation() {
  const voice = useVoiceIO();
  const [history, setHistory] = useState<Turn[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [companion] = useState(() => new CompanionClient());
  const textInputRef = useRef<HTMLInputElement>(null);

  const handleSpeak = useCallback(
    async (text: string) => {
      setHistory((prev) => [...prev, { role: "davinci", text }]);
      haptic("voice");
      await voice.speak(text);
    },
    [voice],
  );

  const handleUserMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isProcessing) return;

      setHistory((prev) => [...prev, { role: "you", text }]);
      setIsProcessing(true);
      haptic("start");

      try {
        const response = await companion.reply(text, history);
        await handleSpeak(response.reply);
      } catch (error) {
        console.error("Failed to get reply:", error);
        haptic("rejected");
      } finally {
        setIsProcessing(false);
      }
    },
    [history, companion, handleSpeak, isProcessing],
  );

  const handleVoiceInput = useCallback(() => {
    if (voice.isListening) {
      voice.stopListening();
      haptic("stop");
      if (voice.transcript) {
        handleUserMessage(voice.transcript);
        voice.resetTranscript();
      }
    } else {
      voice.startListening();
      haptic("start");
    }
  }, [voice, handleUserMessage]);

  const handleTypeSubmit = useCallback(() => {
    if (textInputRef.current) {
      const text = textInputRef.current.value;
      if (text.trim()) {
        haptic("accepted");
        handleUserMessage(text);
        textInputRef.current.value = "";
      }
    }
  }, [handleUserMessage]);

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="text-lg font-bold">Da Vinci</div>

      {!voice.isSupported && (
        <div className="rounded bg-yellow-50 p-2 text-sm text-yellow-600">
          Speech recognition not supported in your browser. Use text input below.
        </div>
      )}

      {voice.error && (
        <div className="rounded bg-red-50 p-2 text-sm text-red-600">
          {voice.error}
          <button onClick={voice.clearError} className="ml-2 text-xs underline">
            Dismiss
          </button>
        </div>
      )}

      <div className="max-h-96 flex-1 overflow-y-auto rounded border bg-gray-50 p-4">
        {history.length === 0 && (
          <div className="text-sm text-gray-400">
            {voice.isSupported
              ? "Click the microphone or type to start talking with Da Vinci..."
              : "Type below to start talking with Da Vinci..."}
          </div>
        )}
        {history.map((turn, idx) => (
          <div
            key={idx}
            className={`mb-3 ${turn.role === "you" ? "text-right" : "text-left"}`}
          >
            <div
              className={`inline-block max-w-xs rounded-lg px-3 py-2 ${
                turn.role === "you"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-900"
              }`}
            >
              <span className="mb-1 block text-xs font-semibold">
                {turn.role === "you" ? "You" : "Da Vinci"}
              </span>
              {turn.text}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        {voice.isSupported && (
          <button
            onClick={handleVoiceInput}
            disabled={isProcessing || voice.isSpeaking}
            className={`flex-1 rounded px-4 py-2 font-medium transition ${
              voice.isListening
                ? "bg-red-500 text-white"
                : "bg-blue-500 text-white hover:bg-blue-600"
            } disabled:cursor-not-allowed disabled:opacity-50`}
          >
            {voice.isListening
              ? `🎤 Listening... ${voice.transcript ? `"${voice.transcript}"` : ""}`
              : voice.isSpeaking
                ? "🔊 Speaking..."
                : "🎤 Speak"}
          </button>
        )}
      </div>

      <div className="flex gap-2">
        <input
          ref={textInputRef}
          type="text"
          placeholder="Or type your message..."
          disabled={isProcessing || voice.isSpeaking}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleTypeSubmit();
          }}
          className="flex-1 rounded border px-3 py-2 disabled:opacity-50"
        />
        <button
          onClick={handleTypeSubmit}
          disabled={isProcessing || voice.isSpeaking}
          className="rounded bg-blue-500 px-4 py-2 font-medium text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}
