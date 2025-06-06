import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
  followUser: privateProcedure
    .input(z.object({ followeeId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const followerId = ctx.currentUser.id;

      if (followerId === input.followeeId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You can't follow yourself",
        });
      }

      await ctx.db.follow.create({
        data: {
          followerId,
          followeeId: input.followeeId,
        },
      });

      return { success: true };
    }),

  unfollowUser: privateProcedure
    .input(z.object({ followeeId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const followerId = ctx.currentUser.id;

      await ctx.db.follow.deleteMany({
        where: {
          followerId,
          followeeId: input.followeeId,
        },
      });

      return { success: true };
    }),

  getFollowStats: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const followers = await ctx.db.follow.count({
        where: { followeeId: input.userId },
      });
      const following = await ctx.db.follow.count({
        where: { followerId: input.userId },
      });
      return { followers, following };
    }),
});
