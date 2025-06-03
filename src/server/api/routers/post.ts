import { User } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { Content } from "next/font/google";
import { userInfo } from "os";
import { z } from "zod";
import { zEmoji } from "zod-emoji";

import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";

const filterUserForClient = (user: User) => {
  return {id: user.id,
          username: user.username ?? user.firstName ?? "Unknown",
          profilePicture: user.imageUrl}
}

export const postRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.db.post.findMany({
      take: 100,
      orderBy: [{createdAt: "desc"}],
    });

    // retrieve 100 userid to connect to user
    const users = (await (await clerkClient()).users.getUserList({
      userId: posts.map((post) => post.authorId),
      limit: 100,
      })
    ).data.map(filterUserForClient);

    console.log("Users:", users);
    return posts.map((post) => {
      const author = users.find((user) => user.id == post.authorId);
      if (!author || !author.username) throw new TRPCError({code: "INTERNAL_SERVER_ERROR", 
                                        message:"Author for post not found",
                                      });
      return {
        post,
        author: {
          ...author,
          username: author.username,

        },
      };
    });
  }),

  getLatest: publicProcedure.query(async ({ ctx }) => {
    const post = await ctx.db.post.findFirst({
      orderBy: { createdAt: "desc" },
    });

    return post ?? null;
  }),

  // use zoc: validator
  create: privateProcedure
  .input(
    z.object({
      content: z.string().emoji().min(1).max(280), // character: 1->280
    })
  )
  .mutation(async ({ ctx, input }) => {
    // when use private, authorid can work without it exists
    const authorId = ctx.currentUser.id;
    const post = await ctx.db.post.create({
      data: {
        authorId,
        content: input.content,
      },
    });
    return post;
  }),
});
