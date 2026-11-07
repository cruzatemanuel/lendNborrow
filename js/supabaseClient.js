import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.44.2/dist/esm/index.js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config.js";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

