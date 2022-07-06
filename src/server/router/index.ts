// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";

import { authRouter } from "./auth";
import { noteRouter } from "./notes";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("auth.", authRouter)
  .merge("note.", noteRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
