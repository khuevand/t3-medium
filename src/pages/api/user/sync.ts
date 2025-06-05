import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";
import { syncClerkUserToDatabase } from "~/server/helpers/syncClerkUserToDatabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end("Method not allowed");

  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const user = await syncClerkUserToDatabase(userId);
    return res.status(200).json({ message: "User synced", user });
  } catch (error) {
    console.error("User sync failed:", error);
    return res.status(500).json({ error: "User sync failed" });
  }
}
