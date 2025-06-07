import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure} from "~/server/api/trpc";
import { filterUserForClient } from "~/server/helpers/filterUserForClient";

export const profileRouter = createTRPCRouter({
    getUserByUserName: publicProcedure
    .input(z.object({username: z.string()}))
    .query(async ({ input}) => {

        const result = await (await clerkClient()).users.getUserList({
            username: [input.username],
            });

        const [user] = result.data;


        if(!user){
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "User not found",
            });
        }
        return filterUserForClient(user);
    }),

    getUsersByUsernames: publicProcedure
    .input(z.object({ usernames: z.array(z.string()) }))
    .query(async ({ input }) => {
      const result = await (await clerkClient()).users.getUserList({
        username: input.usernames,
      });

      return result.data.map(filterUserForClient);
    }),


    getAllUsers: publicProcedure.query(async () => {
    try {
      const users = await (await clerkClient()).users.getUserList({ limit: 100 });

      return users;
    } catch (err) {
      console.error("Error fetching users:", err);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch users",
      });
    }
  }),
});
