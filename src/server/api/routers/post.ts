import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";
import { filterUserForClient } from "~/server/helpers/filterUserForClient";
import { G } from "node_modules/@upstash/redis/zmscore-DzNHSWxc.mjs";
import type { Post } from "@prisma/client";


const addUserDataToPosts = async (post: Post[]) => {
// retrieve 100 userid to connect to user
  const users = (await (await clerkClient()).users.getUserList({
    userId: post.map((post) => post.authorId),
    limit: 100,
    })
  ).data.map(filterUserForClient);

  console.log("Users:", users);
  return post.map((post) => {
    const author = users.find((user) => user.id == post.authorId);
    if (!author?.username) throw new TRPCError({code: "INTERNAL_SERVER_ERROR", 
                                      message:"Author for post not found",
                                    });
    return {
      post,
      author: {
        ...author,
        id: post.authorId,
        username: author.username,

      },
    };
  });
};

// Create a new ratelimiter, that allows 3 requests per 1 minute -> stop user from spamming
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 m"),
  analytics: true,
  prefix: "@upstash/ratelimit",
});

export const postRouter = createTRPCRouter({

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const post = await ctx.db.post.findUnique({
        where: { id: input.id }
      });

      if (!post) throw new TRPCError({code: "NOT_FOUND"});
      return (await addUserDataToPosts([post]))[0];
    }),

  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.db.post.findMany({
      take: 100, // currently did not set unlimited due to small database
      orderBy: [{createdAt: "desc"}],
    });
    return addUserDataToPosts(posts);
  }),

  getLatest: publicProcedure.query(async ({ ctx }) => {
    const post = await ctx.db.post.findFirst({
      orderBy: { createdAt: "desc" },
    });

    return post ?? null;
  }),

  getPostedByUserId: publicProcedure.input(z.object({
    userId: z.string(),
    })).query(({ctx, input}) => ctx.db.post.findMany({
      where: {
        authorId: input.userId,
      },
      take: 100, // currently did not set unlimited due to small database
      orderBy: [{ createdAt: "desc" }],
    })
    .then(addUserDataToPosts)
  ),

  // use zoc: validator
  create: privateProcedure
  .input(
    z.object({
      title: z.string().min(1).max(100),
      subtitle: z.string().max(200).optional(),
      content: z.string().emoji("Only emojis are allowed").min(1).max(280),
      thumbnailUrl: z.string().url().optional(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const authorId = ctx.currentUser.id;
    const authorName = ctx.currentUser.username ?? "unknown"; // Adjust this based on your auth provider

    const { success } = await ratelimit.limit(authorId);
    if (!success) throw new TRPCError({ code: "TOO_MANY_REQUESTS" });

    const post = await ctx.db.post.create({
      data: {
        title: input.title,
        subtitle: input.subtitle ?? null,
        content: input.content,
        thumbnailUrl: input.thumbnailUrl ?? null,
        authorId,
        authorName,
        publishedAt: new Date(),
        readTimeMin: 1, // optionally calculate based on content
        claps: 0,
      },
    });

    return post;
  }),
});
