"use client";

import { useState } from "react";

import {
  CICERO,
  CICERO_HEADING,
  LOREM_NOTE,
  LOREM_PHRASE,
  RACKHAM_SOURCE,
} from "@/lib/cicero";

type Language = "la" | "en";

const NOTE_ID = "lorem-ipsum-origin";

function Latin({ text }: { text: string }) {
  const at = text.indexOf(LOREM_PHRASE);
  if (at < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, at)}
      <mark aria-describedby={NOTE_ID} className="lorem-origin">
        {LOREM_PHRASE}
      </mark>
      {text.slice(at + LOREM_PHRASE.length)}
    </>
  );
}

function Section({ number, children }: { number: string; children: React.ReactNode }) {
  return (
    <div className="fade-in relative pl-10 sm:pl-14">
      <span className="section-label absolute top-2 left-0">{number}</span>
      {children}
    </div>
  );
}

export function CiceroPassage() {
  const [language, setLanguage] = useState<Language>("la");

  return (
    <section
      aria-labelledby="cicero-heading"
      className="mx-auto max-w-[92rem] px-5 sm:px-10"
    >
      <h2
        id="cicero-heading"
        className="fade-in mx-auto max-w-[40ch] text-center text-2xl leading-snug sm:text-3xl"
      >
        {CICERO_HEADING}
      </h2>

      <div
        role="group"
        aria-label="Language"
        className="mt-10 flex justify-center gap-1 lg:hidden"
      >
        {(
          [
            ["la", "Latin"],
            ["en", "English"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            aria-pressed={language === value}
            onClick={() => setLanguage(value)}
            className="toggle"
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-12 grid gap-16 lg:mt-20 lg:grid-cols-2 lg:gap-20">
        <div
          lang="la"
          className={`${language === "la" ? "block" : "hidden"} passage space-y-12 lg:block`}
        >
          {CICERO.map((section) => (
            <Section key={section.number} number={section.number}>
              <p>
                <Latin text={section.latin} />
              </p>
              {section.latin.includes(LOREM_PHRASE) ? (
                <p id={NOTE_ID} lang="en" className="lorem-note">
                  {LOREM_NOTE}
                </p>
              ) : null}
            </Section>
          ))}
        </div>

        <div
          lang="en"
          className={`${language === "en" ? "block" : "hidden"} passage space-y-12 lg:block`}
        >
          {CICERO.map((section) => (
            <Section key={section.number} number={section.number}>
              <p>{section.english}</p>
            </Section>
          ))}
          <p className="source fade-in pl-10 sm:pl-14">
            Translation: H. Rackham, 1914 (public domain). {RACKHAM_SOURCE.citation}{" "}
            <a
              href={RACKHAM_SOURCE.url}
              rel="noreferrer"
              className="underline underline-offset-4"
            >
              Scan on the {RACKHAM_SOURCE.host}
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
