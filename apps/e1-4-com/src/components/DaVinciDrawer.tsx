"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { usePlayback } from "@/lib/audio/store";
import { interpret, type AssistantAction } from "@/lib/davinci/assistant";
import { enabledFeatures } from "@/lib/features";

type Entry = { id: number; prompt: string; action: AssistantAction };

const ease = [0.2, 0.7, 0.2, 1] as const;

/**
 * Global Da Vinci slide-over. Opens with Cmd/Ctrl+K or the floating chalk button; runs the
 * mocked assistant against the current audio dock state and can route the app.
 */
export function DaVinciDrawer() {
  const router = useRouter();
  const playlist = usePlayback((s) => s.playlist);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [log, setLog] = useState<Entry[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const idRef = useRef(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  function submit(prompt: string) {
    const action = interpret(prompt, playlist);
    setLog((l) => [{ id: ++idRef.current, prompt, action }, ...l].slice(0, 12));
    setInput("");
    if (action.kind === "navigate") {
      router.push(action.href);
      setOpen(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open Da Vinci (Ctrl+K)"
        title="Da Vinci — Ctrl+K"
        className="border-ochre/60 bg-blackboard/90 text-ochre hover:bg-ochre hover:text-blackboard fixed right-4 bottom-20 z-40 flex h-12 w-12 items-center justify-center rounded-full border shadow-lg backdrop-blur transition-colors md:bottom-6"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <g strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 20l4-1 10-10-3-3L5 16z" />
            <path d="M13 8l3 3" />
          </g>
        </svg>
      </button>

      <AnimatePresence>
        {open ? (
          <>
            <motion.div
              key="scrim"
              className="fixed inset-0 z-40 bg-black/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.aside
              key="drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Da Vinci assistant"
              className="border-chalk/10 bg-board-2 text-chalk fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l shadow-2xl"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.32, ease }}
            >
              <header className="border-chalk/10 flex items-center justify-between border-b px-5 py-4">
                <div>
                  <p className="label">Da Vinci</p>
                  <p className="text-dust font-sans text-xs">
                    Mocked brain · navigation, synthesis, arithmetic
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="label hover:text-chalk"
                >
                  Esc
                </button>
              </header>

              <form
                className="px-5 pt-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (input.trim()) submit(input);
                }}
              >
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="open the board · summarise · 2^10 / 4"
                  aria-label="Ask Da Vinci"
                  className="border-chalk/15 bg-blackboard text-chalk placeholder:text-dust/60 focus-visible:ring-glow/60 w-full rounded-lg border px-3 py-2.5 font-sans text-sm focus:outline-none focus-visible:ring-2"
                />
              </form>

              <div className="flex flex-wrap gap-2 px-5 pt-3">
                {enabledFeatures().map((f) => (
                  <button
                    key={f.href}
                    type="button"
                    onClick={() => submit(`open ${f.title}`)}
                    className="border-chalk/15 text-dust hover:text-chalk rounded-full border px-3 py-1 font-mono text-[0.65rem] tracking-wide uppercase"
                  >
                    {f.title}
                  </button>
                ))}
                {playlist ? (
                  <button
                    type="button"
                    onClick={() => submit("summarise the loaded stream")}
                    className="border-ochre/50 text-ochre hover:bg-ochre hover:text-blackboard rounded-full border px-3 py-1 font-mono text-[0.65rem] tracking-wide uppercase"
                  >
                    Synthesise dock
                  </button>
                ) : null}
              </div>

              <ol className="flex flex-1 flex-col gap-3 overflow-y-auto px-5 py-4">
                <AnimatePresence initial={false}>
                  {log.map((entry) => (
                    <motion.li
                      key={entry.id}
                      layout
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="border-chalk/10 rounded-lg border p-3"
                    >
                      <p className="text-dust font-mono text-[0.65rem] uppercase">
                        {entry.prompt}
                      </p>
                      <ActionView action={entry.action} />
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ol>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}

function ActionView({ action }: { action: AssistantAction }) {
  switch (action.kind) {
    case "navigate":
      return <p className="mt-1 font-sans text-sm">Taking you to {action.label}.</p>;
    case "synthesis":
      return (
        <div className="mt-1 font-sans text-sm">
          <p className="text-ochre">{action.title}</p>
          <p className="mt-1 leading-relaxed">{action.summary}</p>
        </div>
      );
    case "math":
      return (
        <p className="mt-1 font-mono text-sm">
          {action.expression} ={" "}
          {action.result ?? <span className="text-ochre">couldn&apos;t parse that</span>}
        </p>
      );
    case "answer":
      return <p className="mt-1 font-sans text-sm leading-relaxed">{action.text}</p>;
  }
}
