import { os } from "@orpc/server";
import { db } from "@/db";

export const listExperiences = os.handler(async () => {
  const experiences = await db.query.resumeWorkExperiences.findMany({
    orderBy: {
      startDate: "desc",
    },
    with: {
      company: true,
    },
  });

  return { experiences };
});
