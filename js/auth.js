import { supabase } from "./supabaseClient.js";
import { showError, showMessage, clearAlerts, showLoading, hideLoading } from "./ui.js";

export async function signUp(email, password, fullName, department) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName, department } },
  });
  return { user: data?.user, error };
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { session: data?.session, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export function getUser() {
  return supabase.auth.getUser();
}

