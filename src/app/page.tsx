import Link from "next/link";

const FEATURES = [
  { name: "Voice Stream", blurb: "Speak. It listens, keeps, and lets you share." },
  { name: "Da Vinci", blurb: "Your words, transcribed and thought about." },
  { name: "Infinity Chalkboard", blurb: "An endless board for endless ideas." },
  { name: "Gravity Board", blurb: "Where the important things fall into place." },
];

export default async function HomePage({ searchParams }: PageProps<"/">) {
  const { deleted } = await searchParams;

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-6 py-16">
      {deleted === "1" && (
        <p className="border-line text-dust mb-8 rounded-(--radius-board) border px-4 py-3 text-sm">
          Your account and all of its data have been deleted.
        </p>
      )}
      <h1 className="font-display text-chalk text-6xl leading-none tracking-tight sm:text-8xl">
        Greetings Earthling.
      </h1>
      <p className="font-display text-ochre mt-4 text-4xl italic sm:text-5xl">Think.</p>

      <div className="chalk-rule my-12" />

      <ul className="grid gap-4 sm:grid-cols-2">
        {FEATURES.map((f) => (
          <li
            key={f.name}
            className="bg-board-2 border-line rounded-(--radius-board) border p-5"
          >
            <h2 className="font-display text-chalk text-xl">{f.name}</h2>
            <p className="text-dust mt-1 text-sm">{f.blurb}</p>
            <p className="text-ochre mt-3 text-xs tracking-widest uppercase">
              Coming soon
            </p>
          </li>
        ))}
      </ul>

      <p className="text-dust mt-10 text-sm">
        <Link href="/login" className="hover:text-chalk underline">
          Sign in
        </Link>{" "}
        to set up your profile.
      </p>
    </section>
  );
}
