import { Logo } from '@/components/Logo';

export const metadata = { title: 'Offline' };

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-5 text-center">
      <Logo size={96} />
      <p className="font-display text-2xl tracking-display">You&apos;re offline.</p>
      <p className="max-w-sm font-sans text-dust">
        Recordings you make are kept on this device and upload when you&apos;re back online.
      </p>
    </main>
  );
}
