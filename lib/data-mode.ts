export const dataMode = process.env.NEXT_PUBLIC_DATA_MODE ?? "supabase";

export const isLocalStorageMode = dataMode === "localstorage";
