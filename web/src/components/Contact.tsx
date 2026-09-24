export default function Contact() {
  return (
    <section id="contact" className="px-6 py-20 sm:py-28">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Contact
          </h2>
          <p className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Tell us what you are building and we will get back to you within two
            business days.
          </p>
          <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-400">
            hello@e1-4.com
          </p>
        </div>
        <form
          className="rounded-2xl border border-black/5 bg-zinc-50 p-6 dark:border-white/10 dark:bg-zinc-900"
          action="#"
          method="post"
        >
          <div className="grid gap-4">
            <label className="grid gap-2 text-sm">
              Name
              <input
                type="text"
                name="name"
                required
                className="h-11 rounded-lg border border-black/10 bg-white px-3 outline-none focus:border-sky-500 dark:border-white/15 dark:bg-black"
              />
            </label>
            <label className="grid gap-2 text-sm">
              Email
              <input
                type="email"
                name="email"
                required
                className="h-11 rounded-lg border border-black/10 bg-white px-3 outline-none focus:border-sky-500 dark:border-white/15 dark:bg-black"
              />
            </label>
            <label className="grid gap-2 text-sm">
              Message
              <textarea
                name="message"
                rows={4}
                required
                className="rounded-lg border border-black/10 bg-white p-3 outline-none focus:border-sky-500 dark:border-white/15 dark:bg-black"
              />
            </label>
            <button
              type="submit"
              className="h-11 rounded-full bg-zinc-900 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              Send message
            </button>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Placeholder form — not wired to a backend yet.
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}
