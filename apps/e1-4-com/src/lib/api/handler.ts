import { NextResponse } from "next/server";

import { MissingEnvError } from "@/lib/env";

type RouteHandler<Req extends Request, Ctx> = (
  request: Req,
  ctx: Ctx,
) => Promise<Response> | Response;

/**
 * Wraps a Route Handler so a blank required secret (Supabase, database, …)
 * becomes a clear 503 instead of a generic 500. Other errors are re-thrown.
 */
export function withRuntimeEnv<Req extends Request, Ctx = unknown>(
  handler: RouteHandler<Req, Ctx>,
): RouteHandler<Req, Ctx> {
  return async (request, ctx) => {
    try {
      return await handler(request, ctx);
    } catch (error) {
      if (error instanceof MissingEnvError) {
        console.error(
          `[api] ${request.method} ${new URL(request.url).pathname}: ${error.message}`,
        );
        return NextResponse.json(
          {
            error: `Service not configured: ${error.variable} is not set on the server.`,
          },
          { status: 503 },
        );
      }
      throw error;
    }
  };
}
