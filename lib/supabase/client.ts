import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.WXT_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.WXT_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
	console.warn(
		"Supabase env vars missing. Set WXT_SUPABASE_URL and WXT_SUPABASE_PUBLISHABLE_KEY in .env",
	);
}

export const supabase = createClient(
	supabaseUrl ?? "",
	supabasePublishableKey ?? "",
	{
		auth: {
			persistSession: false,
			autoRefreshToken: false,
			detectSessionInUrl: false,
		},
	},
);
