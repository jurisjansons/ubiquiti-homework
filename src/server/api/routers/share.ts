import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const shareRouter = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({ listId: z.string() }))
    .query(async ({ ctx, input }) => {
      const list = await ctx.db.list.findUnique({
        where: {
          id: input.listId,
          userId: ctx.session.user.id,
        },
      });

      if (!list) {
        throw new Error("List not found");
      }

      return ctx.db.share.findMany({
        where: {
          listId: list.id,
        },
        include: {
          user: true,
        },
      });
    }),
  usersList: protectedProcedure
    .input(z.object({ listId: z.string() }))
    .query(async ({ ctx, input }) => {
      const list = await ctx.db.list.findUnique({
        where: {
          id: input.listId,
          userId: ctx.session.user.id,
        },
      });

      if (!list) {
        throw new Error("List not found");
      }

      return ctx.db.user.findMany({
        where: {
          AND: [
            {
              id: {
                not: ctx.session.user.id,
              },
            },
            {
              NOT: {
                shares: {
                  some: {
                    listId: list.id,
                  },
                },
              },
            },
          ],
        },
      });
    }),
  create: protectedProcedure
    .input(
      z.object({
        listId: z.string(),
        userId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const list = await ctx.db.list.findUnique({
        where: {
          id: input.listId,
          userId: ctx.session.user.id,
        },
      });

      if (!list) {
        throw new Error("List not found");
      }

      return ctx.db.share.create({
        data: {
          listId: list.id,
          userId: input.userId,
        },
      });
    }),
  delete: protectedProcedure
    .input(
      z.object({
        shareId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const share = await ctx.db.share.findUnique({
        where: {
          id: input.shareId,
        },
      });

      if (!share) {
        throw new Error("Share not found");
      }

      const list = await ctx.db.list.findUnique({
        where: {
          id: share.listId,
          userId: ctx.session.user.id,
        },
      });

      if (!list) {
        throw new Error("List not found");
      }

      return ctx.db.share.delete({
        where: {
          id: share.id,
        },
      });
    }),
  update: protectedProcedure
    .input(
      z.object({
        shareId: z.string(),
        type: z.enum(["READ", "WRITE"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const share = await ctx.db.share.findUnique({
        where: {
          id: input.shareId,
        },
      });

      if (!share) {
        throw new Error("Share not found");
      }

      const list = await ctx.db.list.findUnique({
        where: {
          id: share.listId,
          userId: ctx.session.user.id,
        },
      });

      if (!list) {
        throw new Error("List not found");
      }

      return ctx.db.share.update({
        where: {
          id: share.id,
        },
        data: {
          type: input.type,
        },
      });
    }),
});
