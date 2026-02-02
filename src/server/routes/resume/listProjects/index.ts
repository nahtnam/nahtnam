import { os } from "@orpc/server";
import { db } from "@/db";

export const listProjects = os.handler(async () => {
  const projects = await db.query.resumeProjects.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return { projects };
});
