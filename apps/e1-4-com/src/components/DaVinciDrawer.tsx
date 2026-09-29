"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { DaVinciApp } from "@/features/davinci/DaVinciApp";
import { usePlayback } from "@/lib/audio/store";
import { interpret, type AssistantAction } from "@/lib/davinci/assistant";
import { dimensionOf, neighbour } from "@/lib/dimensions";
import { enabledFeatures } from "@/lib/features";

type Entry = { id: number; prompt: string; action: AssistantAction };

const ease = [0.2, 0.7, 0.2, 1] as const;

export function DaVinciDrawer({ llmReady }: { llmReady: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const playlist = usePlayback((state) => state.playlist);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"ask" | "sketch">("ask");
  const [input, setInput] = useState("");
  const [log, setLog] = useState<Entry[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const idRef = useRef(0);
  const current = dimensionOf(pathname);
  const lower = neighbour(pathname, -1);
  const higher = neighbour(pathname, 1);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      } else if (event.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open && tab === "ask") inputRef.current?.focus();
  }, [open, tab]);

  function navigate(href: string) {
    router.push(href);
    setOpen(false);
  }

  function submit(prompt: string) {
    const action = interpret(prompt, playlist, pathname);
    setLog((entries) =>
      [{ id: ++idRef.current, prompt, action }, ...entries].slice(0, 12),
    );
    setInput("");
    if (action.kind === "navigate") router.push(action.href);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open Da Vinci. Press Ctrl+K."
        title="Da Vinci. Ctrl+K."
        className="border-ochre/60 bg-blackboard text-ochre hover:bg-ochre hover:text-blackboard fixed right-4 bottom-20 z-40 rounded-full border px-4 py-2 font-mono text-xs md:bottom-6"
      >
        Da Vinci
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
              aria-label="Da Vinci"
              className={`border-chalk/10 bg-board-2 text-chalk fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l ${
                tab === "sketch" ? "max-w-5xl" : "max-w-md"
              }`}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.32, ease }}
            >
              <header className="border-chalk/10 flex items-center justify-between border-b px-5 py-4">
                <div>
                  <p className="font-mono text-sm">Da Vinci</p>
                  {current ? (
                    <p className="text-dust font-mono text-xs">
                      {current.dimension}D · {current.title}
                    </p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="label hover:text-chalk"
                >
                  Close
                </button>
              </header>

              <div className="border-chalk/10 flex gap-5 border-b px-5">
                {(["ask", "sketch"] as const).map((name) => (
                  <button
                    key={name}
                    type="button"
                    aria-pressed={tab === name}
                    onClick={() => setTab(name)}
                    className={`border-b py-3 font-mono text-xs uppercase ${
                      tab === name
                        ? "border-ochre text-chalk"
                        : "text-dust hover:text-chalk border-transparent"
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>

              {tab === "ask" ? (
                <>
                  <form
                    className="px-5 pt-4"
                    onSubmit={(event) => {
                      event.preventDefault();
                      if (input.trim()) submit(input);
                    }}
                  >
                    <input
                      ref={inputRef}
                      value={input}
                      onChange={(event) => setInput(event.target.value)}
                      placeholder="Open 3D, summarize, or enter a calculation"
                      aria-label="Ask Da Vinci"
                      className="border-chalk/15 bg-blackboard text-chalk placeholder:text-dust/60 w-full rounded-lg border px-3 py-2.5 font-sans text-sm focus:outline-none"
                    />
                  </form>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 pt-4 font-mono text-xs">
                    {lower ? (
                      <button
                        type="button"
                        onClick={() => navigate(lower.href)}
                        className="text-dust hover:text-chalk"
                      >
                        Collapse
                      </button>
                    ) : null}
                    {higher ? (
                      <button
                        type="button"
                        onClick={() => navigate(higher.href)}
                        className="text-dust hover:text-chalk"
                      >
                        Lift
                      </button>
                    ) : null}
                    {enabledFeatures().map((feature) => (
                      <button
                        key={feature.href}
                        type="button"
                        aria-label={`${feature.dimension}D ${feature.title}`}
                        aria-current={
                          pathname.startsWith(feature.href) ? "page" : undefined
                        }
                        onClick={() => navigate(feature.href)}
                        className="text-dust hover:text-chalk"
                      >
                        {feature.dimension}D
                      </button>
                    ))}
                    {playlist ? (
                      <button
                        type="button"
                        onClick={() => submit("summarize the loaded stream")}
                        className="text-ochre hover:text-chalk"
                      >
                        Summarize stream
                      </button>
                    ) : null}
                  </div>

                  <ol className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 py-4">
                    <AnimatePresence initial={false}>
                      {log.map((entry) => (
                        <motion.li
                          key={entry.id}
                          layout
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="border-chalk/10 border-b pb-3"
                        >
                          <p className="text-dust font-mono text-xs">{entry.prompt}</p>
                          <ActionView action={entry.action} />
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </ol>
                </>
              ) : (
                <div className="min-h-0 flex-1 overflow-y-auto p-5">
                  <DaVinciApp llmReady={llmReady} layout="drawer" />
                </div>
              )}
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
      return <p className="mt-1 font-sans text-sm">Opening {action.label}.</p>;
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
          {action.result ?? <span className="text-ochre">could not parse that</span>}
        </p>
      );
    case "answer":
      return <p className="mt-1 font-sans text-sm leading-relaxed">{action.text}</p>;
  }
}
