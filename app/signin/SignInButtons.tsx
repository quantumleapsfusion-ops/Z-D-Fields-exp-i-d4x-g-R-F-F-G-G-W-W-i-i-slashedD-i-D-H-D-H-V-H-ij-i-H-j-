import { signInWithOAuth } from '@/app/actions/auth';
import type { ProviderSummary } from '@/lib/auth';

export function SignInButtons({ providers, next }: { providers: ProviderSummary[]; next: string }) {
  return (
    <div className="mt-10 flex w-full flex-col gap-3">
      {providers.map((p) => (
        <form key={p.id} action={signInWithOAuth}>
          <input type="hidden" name="provider" value={p.id} />
          <input type="hidden" name="next" value={next} />
          <button
            type="submit"
            className="w-full rounded-full border border-chalk/20 px-5 py-3 font-sans text-chalk transition-colors hover:border-chalk hover:bg-chalk hover:text-blackboard"
          >
            Continue with {p.name}
          </button>
        </form>
      ))}
    </div>
  );
}
