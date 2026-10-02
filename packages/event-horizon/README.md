# @earth-one/event-horizon

e1-4 4D: the Event Horizon contract.

This package holds **types only**. Nothing in it runs. It names the contract that the working
code in `apps/e1-4-com` already satisfies, so that part of e1-4 can be lifted out of the app
later without changing what the app calls.

## What is here

`src/index.ts`: the interfaces and the few constants they need.

## What is not here, on purpose

No components, no storage, no network, no model calls. When the feature moves, its implementation
moves in next to these types and the app imports from here instead of from its own `src/lib`.

## How to use it today

```ts
import type { Horizon } from "@earth-one/event-horizon";
```

Lint and typecheck run with the rest of the monorepo (`npm run lint`, `npm run typecheck`).
