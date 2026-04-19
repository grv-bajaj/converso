import "server-only";

import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const assertSupabaseConfig = () => {
  if (!supabaseUrl) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL. Add it to your .env.local file.",
    );
  }

  if (!supabaseAnonKey && !supabaseServiceRoleKey) {
    throw new Error(
      "Missing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_ANON_KEY for Clerk-based access or SUPABASE_SERVICE_ROLE_KEY for server-only access.",
    );
  }
};

export const createSupabaseClient = () => {
  assertSupabaseConfig();

  if (supabaseServiceRoleKey) {
    return createClient(supabaseUrl!, supabaseServiceRoleKey);
  }

  return createClient(supabaseUrl!, supabaseAnonKey!, {
    async accessToken() {
      return (await auth()).getToken({ template: "supabase" });
    },
  });
};
