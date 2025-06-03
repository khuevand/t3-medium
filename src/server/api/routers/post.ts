import { User } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { userInfo } from "os";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const filterUserForClient = (user: User) => {
  return {id: user.id,
          username: user.username ?? user.firstName ?? "Unknown",
          profilePicture: user.imageUrl}
}

export const postRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.db.post.findMany({
      take: 100,
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
});
