import { z } from "zod";
import { createTRPCRouter, privateProcedure, publicProcedure } from "../trpc";

export const commentRouter = createTRPCRouter({
  create: privateProcedure
    .input(z.object({
      postId: z.string(),
      content: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.comment.create({
        data: {
          postId: input.postId,
          content: input.content,
          authorId: ctx.currentUser?.id ?? "unknown",
          authorName: ctx.currentUser?.username ?? "Anonymous",
        },
      });
    }),

   getByPostId: publicProcedure
    .input(z.object({ postId: z.string() }))
    .query(({ ctx, input }) => {
        return ctx.db.comment.findMany({
        where: { postId: input.postId },
        orderBy: { createdAt: "desc" },
        });
    }),
});
