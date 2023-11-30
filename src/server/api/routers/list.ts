import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const listRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ name: z.string().min(1).max(300) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.list.create({
        data: {
          name: input.name,
          userId: ctx.session.user.id,
        },
      });
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).max(300),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.list.update({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
        data: {
          name: input.name,
        },
      });
    }),
  list: protectedProcedure.query(({ ctx }) => {
    return ctx.db.list.findMany({
      where: {
        OR: [
          {
            userId: ctx.session.user.id,
          },
          {
            shares: {
              some: {
                userId: ctx.session.user.id,
              },
            },
          },
        ],
      },
      include: {
        shares: {
          where: {
            userId: ctx.session.user.id,
          },
        },
      },
    });
  }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.list.delete({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });
    }),
});
