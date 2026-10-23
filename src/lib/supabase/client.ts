"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/database";
import { getSupabasePublicKey, getSupabaseUrl } from "@/lib/supabase/env";

export function createBrowserSupabaseClient() {
  const url = getSupabaseUrl();
  const key = getSupabasePublicKey();
  if (!url || !key) throw new Error("Supabase is not configured.");
  return createBrowserClient<Database>(url, key);
}
