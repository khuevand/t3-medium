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

  getFollowing: publicProcedure
  .input(z.object({ userId: z.string() }))
  .query(async ({ input, ctx }) => {
    const following = await ctx.db.follow.findMany({
      where: { followerId: input.userId },
      include: {
        followee: true, // <- make sure this is included
      },
    });

    return {
      following: following.map((f) => f.followee), // return only user data
    };
  }),

  toggleFollow: privateProcedure
  .input(z.object({ userId: z.string() })) // target user to follow/unfollow
  .mutation(async ({ ctx, input }) => {
    const currentUserId = ctx.currentUser.id;
    const targetUserId = input.userId;

    if (currentUserId === targetUserId) {
      throw new Error("You cannot follow yourself.");
    }

    // Check if the follow record exists
    const existing = await ctx.db.follow.findUnique({
      where: {
        followerId_followeeId: {
          followerId: currentUserId,
          followeeId: targetUserId,
        },
      },
    });

    if (existing) {
      // Unfollow
      await ctx.db.follow.delete({
        where: {
          followerId_followeeId: {
            followerId: currentUserId,
            followeeId: targetUserId,
          },
        },
      });
      return { followed: false };
    } else {
      // Follow
      await ctx.db.follow.create({
        data: {
          followerId: currentUserId,
          followeeId: targetUserId,
        },
      });
      return { followed: true };
    }
  }),
});
