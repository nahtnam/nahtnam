"use server";
import { createFormAction } from "@orpc/react";
import { onSuccess } from "@orpc/server";
import { redirect } from "next/navigation";
import { routes } from "@/server/routes";

export const signOutAction = createFormAction(routes.auth.signOut, {
  interceptors: [
    // biome-ignore lint/suspicious/useAwait: server action
    onSuccess(async () => {
      redirect("/");
    }),
  ],
});
