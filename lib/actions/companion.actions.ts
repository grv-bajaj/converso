"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createSupabaseClient } from "@/lib/supabase";
import {
  addLocalBookmark,
  addLocalSessionHistory,
  createLocalCompanion,
  getLocalAllCompanions,
  getLocalBookmarkedCompanions,
  getLocalCompanion,
  getLocalRecentSessions,
  getLocalUserCompanions,
  getLocalUserSessions,
  isLocalDbEnabled,
  removeLocalBookmark,
} from "@/lib/local-db";

export const createCompanion = async (formData: CreateCompanion) => {
  const { userId: author } = await auth();

  if (isLocalDbEnabled) {
    return createLocalCompanion(
      { ...formData, author: author ?? "local-user" },
      author ?? undefined,
    );
  }

  const supabase = createSupabaseClient();

  console.log("Creating companion with data:", { ...formData, author });

  const { data, error } = await supabase
    .from("companions")
    .insert({ ...formData, author })
    .select();

  if (error) {
    console.error("Supabase error creating companion:", error);
    throw new Error(error.message);
  }

  if (!data || data.length === 0) {
    console.error("No data returned from Supabase after insert");
    throw new Error("Failed to create a companion - no data returned");
  }

  console.log("Companion created successfully:", data[0].id);
  return data[0];
};

export const getAllCompanions = async ({
  limit = 10,
  page = 1,
  subject,
  topic,
}: GetAllCompanions) => {
  const { userId } = await auth();

  if (isLocalDbEnabled) {
    return getLocalAllCompanions(
      { limit, page, subject, topic },
      userId ?? undefined,
    );
  }

  const supabase = createSupabaseClient();

  let query = supabase.from("companions").select();

  if (subject && topic) {
    query = query
      .ilike("subject", `%${subject}%`)
      .or(`topic.ilike.%${topic}%,name.ilike.%${topic}%`);
  } else if (subject) {
    query = query.ilike("subject", `%${subject}%`);
  } else if (topic) {
    query = query.or(`topic.ilike.%${topic}%,name.ilike.%${topic}%`);
  }

  query = query.range((page - 1) * limit, page * limit - 1);

  const { data: companions, error } = await query;

  if (error) throw new Error(error.message);

  return companions;
};

export const getCompanion = async (id: string) => {
  const { userId } = await auth();

  if (isLocalDbEnabled) {
    return getLocalCompanion(id, userId ?? undefined);
  }

  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("companions")
    .select()
    .eq("id", id);

  if (error) return console.log(error);

  return data[0];
};

export const addToSessionHistory = async (companionId: string) => {
  const { userId } = await auth();

  if (isLocalDbEnabled) {
    if (!userId) return;
    return addLocalSessionHistory(companionId, userId);
  }

  const supabase = createSupabaseClient();
  const { data, error } = await supabase.from("session_history").insert({
    companion_id: companionId,
    user_id: userId,
  });

  if (error) throw new Error(error.message);

  return data;
};

export const getRecentSessions = async (limit = 10) => {
  const { userId } = await auth();

  if (isLocalDbEnabled) {
    return getLocalRecentSessions(limit, userId ?? undefined);
  }

  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("session_history")
    .select(`companions:companion_id (*)`)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);

  return data.map(({ companions }) => companions);
};

export const getUserSessions = async (userId: string, limit = 10) => {
  if (isLocalDbEnabled) {
    return getLocalUserSessions(userId, limit);
  }

  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("session_history")
    .select(`companions:companion_id (*)`)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);

  return data.map(({ companions }) => companions);
};

export const getUserCompanions = async (userId: string) => {
  if (isLocalDbEnabled) {
    return getLocalUserCompanions(userId);
  }

  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("companions")
    .select()
    .eq("author", userId);

  if (error) throw new Error(error.message);

  return data;
};

export const newCompanionPermissions = async () => {
  // TODO: Re-enable billing/limits once Clerk billing is configured
  return true;
};

// Bookmarks
export const addBookmark = async (companionId: string, path: string) => {
  const { userId } = await auth();
  if (!userId) return;

  if (isLocalDbEnabled) {
    const data = await addLocalBookmark(companionId, userId);
    revalidatePath(path);
    return data;
  }

  const supabase = createSupabaseClient();
  const { data, error } = await supabase.from("bookmarks").insert({
    companion_id: companionId,
    user_id: userId,
  });
  if (error) {
    throw new Error(error.message);
  }
  // Revalidate the path to force a re-render of the page

  revalidatePath(path);
  return data;
};

export const removeBookmark = async (companionId: string, path: string) => {
  const { userId } = await auth();
  if (!userId) return;

  if (isLocalDbEnabled) {
    const data = await removeLocalBookmark(companionId, userId);
    revalidatePath(path);
    return data;
  }

  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("bookmarks")
    .delete()
    .eq("companion_id", companionId)
    .eq("user_id", userId);
  if (error) {
    throw new Error(error.message);
  }
  revalidatePath(path);
  return data;
};

// It's almost the same as getUserCompanions, but it's for the bookmarked companions
export const getBookmarkedCompanions = async (userId: string) => {
  if (isLocalDbEnabled) {
    return getLocalBookmarkedCompanions(userId);
  }

  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("bookmarks")
    .select(`companions:companion_id (*)`) // Notice the (*) to get all the companion data
    .eq("user_id", userId);
  if (error) {
    throw new Error(error.message);
  }
  // We don't need the bookmarks data, so we return only the companions
  return data.map(({ companions }) => companions);
};
