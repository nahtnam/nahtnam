import { os } from "@orpc/server";
import { Cache } from "within-ts";
import { db } from "@/db";

const cachedListExperiences = Cache.memoize(
  () =>
    db.query.resumeWorkExperiences.findMany({
      orderBy: {
        startDate: "desc",
      },
      with: {
        company: true,
      },
    }),
  { ttl: "1h" }
);

export const listExperiences = os.handler(async () => {
  const experiences = await cachedListExperiences();
  return { experiences };
});
