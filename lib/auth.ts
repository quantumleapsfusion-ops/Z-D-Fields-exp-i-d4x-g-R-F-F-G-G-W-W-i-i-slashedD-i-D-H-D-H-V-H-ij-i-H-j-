import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { getServerSession, type NextAuthOptions } from 'next-auth';
import type { Provider } from 'next-auth/providers/index';
import AzureADProvider from 'next-auth/providers/azure-ad';
import CredentialsProvider from 'next-auth/providers/credentials';
import FacebookProvider from 'next-auth/providers/facebook';
import GoogleProvider from 'next-auth/providers/google';

import { prisma } from '@/lib/db';
import { env } from '@/lib/env';

/** OAuth providers are enabled only when both their client id and secret are configured. */
function buildProviders(): Provider[] {
  const providers: Provider[] = [];

  if (env.google.id && env.google.secret) {
    providers.push(GoogleProvider({ clientId: env.google.id, clientSecret: env.google.secret }));
  }
  if (env.facebook.id && env.facebook.secret) {
    providers.push(
      FacebookProvider({ clientId: env.facebook.id, clientSecret: env.facebook.secret }),
    );
  }
  if (env.microsoft.id && env.microsoft.secret) {
    providers.push(
      AzureADProvider({
        clientId: env.microsoft.id,
        clientSecret: env.microsoft.secret,
        tenantId: env.microsoft.tenantId,
      }),
    );
  }

  // Local-development sign-in (email only, no password). Never enabled in production builds.
  if (env.devLogin) {
    providers.push(
      CredentialsProvider({
        id: 'dev',
        name: 'Dev login',
        credentials: { email: { label: 'Email', type: 'email' } },
        async authorize(credentials) {
          const email = credentials?.email?.trim().toLowerCase();
          if (!email) return null;
          const user = await prisma.user.upsert({
            where: { email },
            update: {},
            create: { email, name: email.split('@')[0] },
          });
          return { id: user.id, email: user.email, name: user.name, image: user.image };
        },
      }),
    );
  }

  return providers;
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  // JWT sessions so the dev Credentials provider and OAuth providers share one code path.
  session: { strategy: 'jwt' },
  secret: env.nextAuthSecret,
  providers: buildProviders(),
  pages: { signIn: '/signin' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.sub = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) session.user.id = token.sub;
      return session;
    },
  },
};

export type ProviderSummary = { id: string; name: string };

export function enabledProviders(): ProviderSummary[] {
  return authOptions.providers.map((p) => ({ id: p.id, name: p.name }));
}

export async function getSessionUser() {
  const session = await getServerSession(authOptions);
  return session?.user?.id ? session.user : null;
}

/** Returns the signed-in user's id or `null`. */
export async function getUserId(): Promise<string | null> {
  const user = await getSessionUser();
  return user?.id ?? null;
}
