import { env } from "../_generated/server";

type FeatureEnv = {
  readonly BNB_PASSWORD: string;
  readonly PRINT_SECRET?: string;
  readonly TELEGRAM_BOT_TOKEN: string;
  readonly TELEGRAM_CHAT_ID: string;
  readonly TURNSTILE_SECRET_KEY: string;
};

export const featureEnv = env as unknown as FeatureEnv;
