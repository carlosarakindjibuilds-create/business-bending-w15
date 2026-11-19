import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || "";
const missingConfiguration = !supabaseUrl || !supabaseAnonKey;
const validUrl = (() => {
  if (missingConfiguration) {
    return false;
  }
  try {
    const parsedUrl = new URL(supabaseUrl);
    return parsedUrl.protocol === "https:" || parsedUrl.hostname === "localhost";
  } catch {
    return false;
  }
})();

export const supabaseConfigurationError = missingConfiguration
  ? "Supabase aún no está configurado. Añade VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY para habilitar el acceso."
  : validUrl
    ? ""
    : "La URL de Supabase no es válida. Revisa VITE_SUPABASE_URL.";

export const supabase = supabaseConfigurationError
  ? null
  : createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true,
      },
    });
