import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { withUserOs } from "@/server";

export const signOut = withUserOs.handler(async ({ context }) => {
  const { headers } = context;
  await auth.api.signOut({
    headers,
  });
  revalidatePath("/", "layout");
});
