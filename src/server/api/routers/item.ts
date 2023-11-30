import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const itemRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(300),
        listId: z.string(),
        parentId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const list = await ctx.db.list.findUnique({
        where: {
          id: input.listId,
          OR: [
            {
              userId: ctx.session.user.id,
            },
            {
              shares: {
                some: {
                  userId: ctx.session.user.id,
                  type: "WRITE",
                },
              },
            },
          ],
        },
      });

      if (!list) {
        throw new Error("List not found");
      }

      return ctx.db.item.create({
        data: {
          name: input.name,
          userId: ctx.session.user.id,
          listId: list.id,
          parentId: input.parentId,
        },
      });
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).max(300),
        price: z.number().min(0).max(1000000).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const item = await ctx.db.item.findUnique({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });

      if (!item) {
        throw new Error("Item not found");
      }

      return ctx.db.item.update({
        where: {
          id: item.id,
        },
        data: {
          name: input.name,
          price: input.price,
        },
      });
    }),
  list: protectedProcedure
    .input(z.object({ listId: z.string(), showCompleted: z.boolean() }))
    .query(async ({ ctx, input }) => {
      switch (input.listId) {
        case "starred":
          return ctx.db.item.findMany({
            where: {
              AND: [
                {
                  OR: [
                    {
                      userStarred: {
                        some: {
                          userId: ctx.session.user.id,
                        },
                      },
                    },
                    {
                      children: {
                        some: {
                          userStarred: {
                            some: {
                              userId: ctx.session.user.id,
                            },
                          },
                        },
                      },
                    },
                  ],
                },
                {
                  OR: [
                    {
                      list: {
                        userId: ctx.session.user.id,
                      },
                    },
                    {
                      list: {
                        shares: {
                          some: {
                            userId: ctx.session.user.id,
                          },
                        },
                      },
                    },
                  ],
                },
              ],
              completed: input.showCompleted ? undefined : false,
              parentId: {
                isSet: false,
              },
            },
            include: {
              list: {
                include: {
                  shares: {
                    where: {
                      userId: ctx.session.user.id,
                    },
                  },
                },
              },
              userStarred: {
                where: {
                  userId: ctx.session.user.id,
                },
              },
              children: {
                where: {
                  completed: input.showCompleted ? undefined : false,
                  userStarred: {
                    some: {
                      userId: ctx.session.user.id,
                    },
                  },
                },
                include: {
                  list: {
                    include: {
                      shares: {
                        where: {
                          userId: ctx.session.user.id,
                        },
                      },
                    },
                  },
                  userStarred: {
                    where: {
                      userId: ctx.session.user.id,
                    },
                  },
                },
              },
            },
          });
        default:
          return ctx.db.item.findMany({
            where: {
              OR: [
                {
                  list: {
                    userId: ctx.session.user.id,
                  },
                },
                {
                  list: {
                    shares: {
                      some: {
                        userId: ctx.session.user.id,
                      },
                    },
                  },
                },
              ],
              listId: input.listId,
              completed: input.showCompleted ? undefined : false,
              parentId: {
                isSet: false,
              },
            },
            include: {
              list: {
                include: {
                  shares: {
                    where: {
                      userId: ctx.session.user.id,
                    },
                  },
                },
              },
              userStarred: {
                where: {
                  userId: ctx.session.user.id,
                },
              },
              children: {
                where: {
                  completed: input.showCompleted ? undefined : false,
                },
                include: {
                  list: {
                    include: {
                      shares: {
                        where: {
                          userId: ctx.session.user.id,
                        },
                      },
                    },
                  },
                  userStarred: {
                    where: {
                      userId: ctx.session.user.id,
                    },
                  },
                },
              },
            },
          });
      }
    }),
  toggleStarred: protectedProcedure
    .input(z.object({ itemId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const item = await ctx.db.item.findUnique({
        where: {
          id: input.itemId,
          OR: [
            {
              list: {
                userId: ctx.session.user.id,
              },
            },
            {
              list: {
                shares: {
                  some: {
                    userId: ctx.session.user.id,
                    type: "WRITE",
                  },
                },
              },
            },
            {
              userStarred: {
                some: {
                  userId: ctx.session.user.id,
                },
              },
            },
          ],
        },
      });

      if (!item) {
        throw new Error("Item not found");
      }

      const userStarred = await ctx.db.userStarredItem.findFirst({
        where: {
          userId: ctx.session.user.id,
          itemId: item.id,
        },
      });

      if (userStarred) {
        return ctx.db.userStarredItem.delete({
          where: {
            id: userStarred.id,
          },
        });
      } else {
        return ctx.db.userStarredItem.create({
          data: {
            itemId: item.id,
            userId: ctx.session.user.id,
          },
        });
      }
    }),
  toggleCompleted: protectedProcedure
    .input(z.object({ itemId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const item = await ctx.db.item.findUnique({
        where: {
          id: input.itemId,
          OR: [
            {
              list: {
                userId: ctx.session.user.id,
              },
            },
            {
              list: {
                shares: {
                  some: {
                    userId: ctx.session.user.id,
                    type: "WRITE",
                  },
                },
              },
            },
          ],
        },
      });

      if (!item) {
        throw new Error("Item not found");
      }

      return ctx.db.item.update({
        where: {
          id: item.id,
        },
        data: {
          completed: !item.completed,
        },
      });
    }),
  delete: protectedProcedure
    .input(z.object({ itemId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const item = await ctx.db.item.findUnique({
        where: {
          id: input.itemId,
          OR: [
            {
              list: {
                userId: ctx.session.user.id,
              },
            },
            {
              list: {
                shares: {
                  some: {
                    userId: ctx.session.user.id,
                    type: "WRITE",
                  },
                },
              },
            },
          ],
        },
      });

      if (!item) {
        throw new Error("Item not found");
      }

      return ctx.db.item.delete({
        where: {
          id: item.id,
        },
      });
    }),
});
