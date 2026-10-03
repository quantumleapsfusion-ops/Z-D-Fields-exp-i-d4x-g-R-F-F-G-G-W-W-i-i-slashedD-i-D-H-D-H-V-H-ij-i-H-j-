import { describe, expect, it } from "vitest";

import { buildQuiz, type Topic } from "./quiz";

const topics: Topic[] = [
  "symbols",
  "elements",
  "planets",
  "black-holes",
  "equations",
  "people",
];

describe("knowledge quiz generation", () => {
  it("is deterministic for an identical seed and option set", () => {
    const options = { topics, count: 30, seed: 92341 };
    expect(buildQuiz(options)).toEqual(buildQuiz(options));
  });

  it("creates four unique choices with a correct in-range answer and no repeated ids", () => {
    for (let seed = 0; seed < 24; seed += 1) {
      for (const topic of topics) {
        const quiz = buildQuiz({ topics: [topic], count: 30, seed });
        expect(quiz.length).toBeGreaterThan(0);
        expect(new Set(quiz.map((question) => question.id)).size).toBe(quiz.length);
        for (const question of quiz) {
          expect(question.choices).toHaveLength(4);
          expect(new Set(question.choices).size).toBe(4);
          expect(question.answer).toBeGreaterThanOrEqual(0);
          expect(question.answer).toBeLessThan(4);
          expect(question.choices[question.answer]).toBeTruthy();
          expect(question.explain.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it("respects topic availability and caps a request above the available count", () => {
    for (const topic of topics) {
      const available = buildQuiz({ topics: [topic], count: 10000, seed: 1 });
      expect(available.length).toBeGreaterThan(0);
      expect(buildQuiz({ topics: [topic], count: 10000, seed: 2 })).toHaveLength(
        available.length,
      );
      expect(buildQuiz({ topics: [topic], count: 0, seed: 3 })).toEqual([]);
    }
  });

  it("keeps topic coverage independent when topics are mixed", () => {
    const quiz = buildQuiz({ topics, count: 60, seed: 70 });
    expect(quiz.every((question) => topics.includes(question.topic))).toBe(true);
    expect(new Set(quiz.map((question) => question.id)).size).toBe(quiz.length);
  });
});
