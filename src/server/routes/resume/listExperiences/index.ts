import { os } from "@orpc/server";
import { produce } from "immer";
import { db } from "@/db";

export const listExperiences = os.handler(async () => {
  let experiences = await db.query.resumeWorkExperiences.findMany({
    orderBy: {
      endDate: "desc",
    },
    with: {
      company: true,
    },
  });

  experiences = produce(experiences, (draft) => {
    if (!draft.at(-1)?.endDate) {
      const last = draft.pop();
      if (!last) {
        return;
      }
      draft.unshift(last);
    }
  });

  return { experiences };
});
