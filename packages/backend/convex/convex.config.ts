import migrations from "@convex-dev/migrations/convex.config.js";
import workflow from "@convex-dev/workflow/convex.config.js";
import posthog from "@posthog/convex/convex.config.js";
import { convexEnv } from "@repo/config/env/convex";
import { defineApp } from "convex/server";

const app = defineApp({
  env: convexEnv,
});

app.use(migrations);
app.use(posthog);
app.use(workflow);

export default app;
