"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

import { buildQuiz, type Question, type Topic } from "@/lib/explore/quiz";

const topics: { id: Topic; label: string }[] = [
  { id: "symbols", label: "Symbols" },
  { id: "elements", label: "Elements" },
  { id: "planets", label: "Planets" },
  { id: "black-holes", label: "Black holes" },
  { id: "equations", label: "Equations" },
  { id: "people", label: "People" },
];
type Phase = "setup" | "quiz" | "results";

function readBest(length: number): number {
  if (typeof window === "undefined") return 0;
  try {
    return Number(window.localStorage.getItem(`earth1-quiz-best-${length}`)) || 0;
  } catch {
    return 0;
  }
}

function subscribeBestScore(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("earth1-quiz-best-score", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("earth1-quiz-best-score", callback);
  };
}

const getServerBestScore = () => 0;

export function KnowledgeTest() {
  const [selectedTopics, setSelectedTopics] = useState<Set<Topic>>(
    () => new Set(topics.map((topic) => topic.id)),
  );
  const [length, setLength] = useState(10);
  const [phase, setPhase] = useState<Phase>("setup");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const seedRef = useRef<number | null>(null);
  const bestScore = useSyncExternalStore(
    subscribeBestScore,
    () => readBest(length),
    getServerBestScore,
  );

  const current = questions[questionIndex];
  const score = questions.reduce(
    (total, question, index) => total + (answers[index] === question.answer ? 1 : 0),
    0,
  );
  const misses = questions
    .map((question, index) => ({ question, selected: answers[index] }))
    .filter(
      (entry) => entry.selected !== undefined && entry.selected !== entry.question.answer,
    );
  const percentage = questions.length ? Math.round((score / questions.length) * 100) : 0;

  function toggleTopic(topic: Topic) {
    setSelectedTopics((currentTopics) => {
      const next = new Set(currentTopics);
      if (next.has(topic)) next.delete(topic);
      else next.add(topic);
      return next;
    });
  }

  function startQuiz(newSeed = false) {
    let seed = seedRef.current ?? Date.now();
    if (newSeed) seed += 1;
    seedRef.current = seed;
    setQuestions(buildQuiz({ topics: [...selectedTopics], count: length, seed }));
    setQuestionIndex(0);
    setAnswers([]);
    setSelectedAnswer(null);
    setPhase("quiz");
  }

  const selectAnswer = useCallback(
    (answerIndex: number) => {
      if (!current || selectedAnswer !== null) return;
      setSelectedAnswer(answerIndex);
      setAnswers((currentAnswers) => {
        const next = [...currentAnswers];
        next[questionIndex] = answerIndex;
        return next;
      });
    },
    [current, questionIndex, selectedAnswer],
  );

  function nextQuestion() {
    if (questionIndex + 1 < questions.length) {
      setQuestionIndex((index) => index + 1);
      setSelectedAnswer(null);
      return;
    }
    const finalScore = questions.reduce(
      (total, question, index) => total + (answers[index] === question.answer ? 1 : 0),
      0,
    );
    const previousBest = readBest(length);
    const nextBest = Math.max(previousBest, finalScore);
    try {
      window.localStorage.setItem(`earth1-quiz-best-${length}`, String(nextBest));
      window.dispatchEvent(new Event("earth1-quiz-best-score"));
    } catch {
      // Storage may be disabled; the quiz remains usable without saved scores.
    }
    setPhase("results");
  }

  useEffect(() => {
    if (phase !== "quiz") return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key >= "1" && event.key <= "4") selectAnswer(Number(event.key) - 1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [phase, selectAnswer]);

  return (
    <div className="mt-8">
      {phase === "setup" ? (
        <section aria-labelledby="quiz-setup-heading">
          <h2 id="quiz-setup-heading" className="text-xl">
            Choose your quiz
          </h2>
          <fieldset className="mt-5">
            <legend className="label mb-3">Topics</legend>
            <div className="flex flex-wrap gap-2">
              {topics.map((topic) => (
                <button
                  key={topic.id}
                  type="button"
                  aria-pressed={selectedTopics.has(topic.id)}
                  onClick={() => toggleTopic(topic.id)}
                  className="toggle"
                >
                  {topic.label}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset className="mt-6">
            <legend className="label mb-3">Question count</legend>
            <div className="flex gap-2">
              {[10, 20, 30].map((count) => (
                <button
                  key={count}
                  type="button"
                  aria-pressed={length === count}
                  onClick={() => setLength(count)}
                  className="toggle"
                >
                  {count}
                </button>
              ))}
            </div>
          </fieldset>
          <p className="source mt-5">Best score at this length: {bestScore}</p>
          <button
            type="button"
            disabled={selectedTopics.size === 0}
            onClick={() => startQuiz()}
            className="toggle mt-4 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Start quiz
          </button>
        </section>
      ) : phase === "quiz" && current ? (
        <section aria-labelledby="question-heading">
          <div className="flex items-center justify-between gap-4">
            <p className="label">
              Question {questionIndex + 1} of {questions.length}
            </p>
            <p className="source">Score: {score}</p>
          </div>
          <div
            role="progressbar"
            aria-label="Quiz progress"
            aria-valuemin={0}
            aria-valuemax={questions.length}
            aria-valuenow={questionIndex + 1}
            className="mt-3 h-1.5 bg-white/15"
          >
            <div
              className="h-full bg-white"
              style={{ width: `${((questionIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
          <p className="label mt-8">
            {topics.find((topic) => topic.id === current.topic)?.label}
          </p>
          <h2 id="question-heading" className="mt-2 text-2xl leading-snug">
            {current.prompt}
          </h2>
          <ol className="mt-6 grid gap-3">
            {current.choices.map((choice, index) => {
              const isCorrect = index === current.answer;
              const isSelected = index === selectedAnswer;
              return (
                <li key={`${current.id}-${choice}`}>
                  <button
                    type="button"
                    disabled={selectedAnswer !== null}
                    onClick={() => selectAnswer(index)}
                    className={`w-full border px-4 py-3 text-left font-sans text-base focus-visible:outline-2 focus-visible:outline-white ${
                      selectedAnswer === null
                        ? "border-white/25 bg-white/[0.03] hover:border-white/70"
                        : isCorrect
                          ? "border-emerald-300 bg-emerald-950/50"
                          : isSelected
                            ? "border-rose-300 bg-rose-950/50"
                            : "border-white/15 opacity-60"
                    }`}
                  >
                    <span className="mr-3 text-white/50">{index + 1}.</span>
                    {choice}
                  </button>
                </li>
              );
            })}
          </ol>
          {selectedAnswer !== null ? (
            <div aria-live="polite" className="mt-5 border-l border-white/40 pl-4">
              <p className="text-lg">
                {selectedAnswer === current.answer
                  ? "Correct."
                  : `Not quite. The answer is ${current.choices[current.answer]}.`}
              </p>
              <p className="source mt-2">{current.explain}</p>
              <button type="button" onClick={nextQuestion} className="toggle mt-4">
                {questionIndex + 1 === questions.length
                  ? "See results"
                  : "Next question →"}
              </button>
            </div>
          ) : (
            <p className="source mt-4">Choose an answer, or press 1–4.</p>
          )}
        </section>
      ) : (
        <section aria-labelledby="quiz-results-heading">
          <p className="label">Quiz complete</p>
          <h2 id="quiz-results-heading" className="mt-2 text-3xl">
            {score} / {questions.length}
          </h2>
          <p className="mt-2 text-xl">{percentage}%</p>
          <p className="source mt-2">Best score for this length: {bestScore}</p>
          {misses.length ? (
            <div className="mt-8">
              <h3 className="text-xl">Review your misses</h3>
              <ul className="mt-4 space-y-4">
                {misses.map(({ question, selected }) => (
                  <li key={question.id} className="border-l border-white/30 pl-4">
                    <p>{question.prompt}</p>
                    <p className="source mt-1">
                      Your answer: {question.choices[selected!]}
                    </p>
                    <p className="source">Correct: {question.choices[question.answer]}</p>
                    <p className="source mt-1">{question.explain}</p>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="mt-5 text-white/75">Perfect score — nothing to review.</p>
          )}
          <button type="button" onClick={() => startQuiz(true)} className="toggle mt-7">
            Try again with a new seed
          </button>
          <button
            type="button"
            onClick={() => setPhase("setup")}
            className="toggle mt-7 ml-2"
          >
            Change topics
          </button>
        </section>
      )}
    </div>
  );
}
