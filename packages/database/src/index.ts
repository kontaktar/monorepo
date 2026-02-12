import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Lazy-initialized Supabase client
let supabaseInstance: SupabaseClient | null = null;

/**
 * Get or create the Supabase client instance
 * This is lazy-initialized so environment variables can be loaded first
 */
function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_PROJECT_URL || "";
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE || "";

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        "Supabase environment variables are not set. Please check NEXT_PUBLIC_SUPABASE_PROJECT_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE",
      );
    }

    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }

  return supabaseInstance;
}

// Export the getter function
export const supabase = {
  get client() {
    return getSupabase();
  },
};

// User types
export type Role = "user" | "admin";

export type User = {
  id: string;
  phone_number: string | null;
  email: string | null;
  username: string | null;
  display_name: string | null;
  role: Role;
  created_at: string;
};

/**
 * Get a user by ID
 * @param userId The user's UUID
 * @returns The user object or null if not found
 */
export async function getUserById(userId: string): Promise<User | null> {
  const { data, error } = await getSupabase()
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error || !data) {
    return null;
  }

  return data as User;
}

/**
 * Get the current authenticated user
 * @returns The user object or null if not authenticated
 */
export async function getCurrentUser(): Promise<User | null> {
  const {
    data: { user },
  } = await getSupabase().auth.getUser();

  if (!user) {
    return null;
  }

  return await getUserById(user.id);
}

/**
 * Update a user's profile
 * @param userId The user's UUID
 * @param updates The fields to update
 * @returns The updated user or null if update failed
 */
export async function updateUser(
  userId: string,
  updates: Partial<Omit<User, "id" | "created_at">>,
): Promise<User | null> {
  const { data, error } = await getSupabase()
    .from("users")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();

  if (error || !data) {
    return null;
  }

  return data as User;
}

/**
 * Utility function to check if a user has admin role
 */
export function isAdmin(user: User | null): boolean {
  return user?.role === "admin";
}
