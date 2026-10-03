import type { Metadata } from "next";

import { KnowledgeTest } from "@/components/explore/KnowledgeTest";
import { Heading, Page, Prose } from "@/components/library/parts";
import { site } from "@/lib/site";

const description =
  "Test what you know about mathematical symbols, elements, planets, black holes, equations, and the people behind them.";

export const metadata: Metadata = {
  title: "Knowledge Test",
  description,
  alternates: { canonical: "/knowledge-test" },
  openGraph: {
    title: `Knowledge Test — ${site.name}`,
    description,
    url: "/knowledge-test",
  },
};

export default function KnowledgeTestPage() {
  return (
    <Page>
      <Heading
        eyebrow="Recall is a way of learning"
        title="Knowledge Test"
        line="A short quiz drawn from the science and maths in this library."
      />
      <Prose>
        <p>
          Choose one or more topics. Every answer includes an explanation, whether you get
          it right or not. Best scores are stored in this browser.
        </p>
      </Prose>
      <KnowledgeTest />
    </Page>
  );
}
