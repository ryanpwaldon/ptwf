import migrations from "@convex-dev/migrations/convex.config";
import { defineApp } from "convex/server";

const app: ReturnType<typeof defineApp> = defineApp();
app.use(migrations);

export default app;
