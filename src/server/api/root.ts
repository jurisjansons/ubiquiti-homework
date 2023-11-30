import { createTRPCRouter } from "~/server/api/trpc";

import { listRouter } from "./routers/list";
import { itemRouter } from "./routers/item";
import { shareRouter } from "./routers/share";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  list: listRouter,
  item: itemRouter,
  share: shareRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
