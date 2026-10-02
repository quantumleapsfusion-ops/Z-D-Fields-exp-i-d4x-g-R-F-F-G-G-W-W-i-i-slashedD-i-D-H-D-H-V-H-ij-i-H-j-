"use client";

import { CompanionClient } from "@/lib/davinci/companion";
import { useVoiceIO } from "@/lib/davinci/voice-io";
import type { Turn } from "@/lib/davinci/types";
import { useCallback, useRef, useState } from "react";

export function DaVinciConversation() {
  const voice = useVoiceIO();
  const [history, setHistory] = useState<Turn[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [companion] = useState(() => new CompanionClient());
  const textInputRef = useRef<HTMLInputElement>(null);

  const handleSpeak = useCallback(async (text: string) => {
    setHistory((prev) => [...prev, { role: "davinci", text }]);
    await voice.speak(text);
  }, [voice]);

  const handleUserMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isProcessing) return;

      setHistory((prev) => [...prev, { role: "you", text }]);
      setIsProcessing(true);

      try {
        const response = await companion.reply(text, history);
        await handleSpeak(response.reply);
      } catch (error) {
        console.error("Failed to get reply:", error);
      } finally {
        setIsProcessing(false);
      }
    },
    [history, companion, handleSpeak, isProcessing],
  );

  const handleVoiceInput = useCallback(() => {
    if (voice.isListening) {
      voice.stopListening();
      if (voice.transcript) {
        handleUserMessage(voice.transcript);
        voice.resetTranscript();
      }
    } else {
      voice.startListening();
    }
  }, [voice, handleUserMessage]);

  const handleTypeSubmit = useCallback(() => {
    if (textInputRef.current) {
      const text = textInputRef.current.value;
      if (text.trim()) {
        handleUserMessage(text);
        textInputRef.current.value = "";
      }
    }
  }, [handleUserMessage]);

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="font-bold text-lg">Da Vinci</div>

      {!voice.isSupported && (
        <div className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
          Speech recognition not supported in your browser. Use text input below.
        </div>
      )}

      {voice.error && (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
          {voice.error}
          <button
            onClick={voice.clearError}
            className="ml-2 text-xs underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto max-h-96 border rounded p-4 bg-gray-50">
        {history.length === 0 && (
          <div className="text-gray-400 text-sm">
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
              className={`inline-block rounded-lg px-3 py-2 max-w-xs ${
                turn.role === "you"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-900"
              }`}
            >
              <span className="text-xs font-semibold block mb-1">
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
            className={`flex-1 px-4 py-2 rounded font-medium transition ${
              voice.isListening
                ? "bg-red-500 text-white"
                : "bg-blue-500 text-white hover:bg-blue-600"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
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
          className="flex-1 px-3 py-2 border rounded disabled:opacity-50"
        />
        <button
          onClick={handleTypeSubmit}
          disabled={isProcessing || voice.isSpeaking}
          className="px-4 py-2 bg-blue-500 text-white rounded font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </div>
    </div>
  );
}
