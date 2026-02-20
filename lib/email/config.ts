import Constants from "expo-constants";
import pb from "@/lib/pocketbase/pb";

function getExtra(): Record<string, string> | undefined {
  return Constants.expoConfig?.extra as Record<string, string> | undefined;
}

/**
 * Base URL for the email API (e.g. https://api.linkmylogistics.com/api/email/send lives under this base).
 * Defaults to PocketBase URL. Override via EXPO_PUBLIC_EMAIL_API_BASE or app.config.js extra.emailApiBase.
 */
function getEmailApiBase(): string {
  if (typeof process !== "undefined" && process.env?.EXPO_PUBLIC_EMAIL_API_BASE) {
    return String(process.env.EXPO_PUBLIC_EMAIL_API_BASE).replace(/\/$/, "");
  }
  const extra = getExtra();
  if (extra?.emailApiBase) {
    return String(extra.emailApiBase).replace(/\/$/, "");
  }
  return (pb as any).baseUrl ?? "https://api.linkmylogistics.com";
}

/**
 * Optional x-internal-secret header. Required only if your webapp sets INTERNAL_API_SECRET.
 * Set via app.config.js extra.internalApiSecret (recommended) or EXPO_PUBLIC_INTERNAL_API_SECRET.
 */
function getInternalApiSecret(): string | undefined {
  const extra = getExtra();
  if (extra?.internalApiSecret) {
    return String(extra.internalApiSecret);
  }
  if (typeof process !== "undefined" && process.env?.EXPO_PUBLIC_INTERNAL_API_SECRET) {
    return process.env.EXPO_PUBLIC_INTERNAL_API_SECRET;
  }
  return undefined;
}

export function getEmailApiConfig() {
  return {
    baseUrl: getEmailApiBase(),
    internalSecret: getInternalApiSecret(),
  };
}
