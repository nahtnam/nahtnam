import { defineRelations } from "drizzle-orm";
// biome-ignore lint/performance/noNamespaceImport: drizzle
import * as schema from "@/db/schema";

export const relations = defineRelations(schema, (r) => ({
  users: {
    accounts: r.many.accounts({
      from: r.users.id,
      to: r.accounts.userId,
    }),
    sessions: r.many.sessions({
      from: r.users.id,
      to: r.sessions.userId,
    }),
  },
}));
