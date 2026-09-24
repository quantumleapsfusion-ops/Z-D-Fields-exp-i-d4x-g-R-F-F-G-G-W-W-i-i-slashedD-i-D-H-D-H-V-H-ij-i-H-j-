export default function Footer() {
  return (
    <footer className="border-t border-black/5 px-6 py-10 dark:border-white/10">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between dark:text-zinc-400">
        <p>© {new Date().getFullYear()} e1-4.com. All rights reserved.</p>
        <nav className="flex gap-6">
          <a
            href="#about"
            className="hover:text-zinc-900 dark:hover:text-zinc-50"
          >
            About
          </a>
          <a
            href="#features"
            className="hover:text-zinc-900 dark:hover:text-zinc-50"
          >
            Services
          </a>
          <a
            href="#contact"
            className="hover:text-zinc-900 dark:hover:text-zinc-50"
          >
            Contact
          </a>
        </nav>
      </div>
    </footer>
  );
}
