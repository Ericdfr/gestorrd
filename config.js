// config.js — configuración pública del sitio. Esta clave es pública por diseño:
// la seguridad real la dan las políticas RLS de Supabase (ver supabase/schema.sql).
window.CONFIG = {
  SUPABASE_URL: 'https://vksnxkdigymlkzjynuso.supabase.co',        // p. ej. 'https://xxxxx.supabase.co'
    SUPABASE_ANON_KEY: 'sb_publishable_yFI1VXzsI0MibnPqxAMJGw_s7PT1E2z', // clave publicable (web); nunca pongas aqui la clave secret
  ADMIN_EMAIL: ''          // correo del administrador (el panel de admin lo lee; la autorización real está en RLS)
};
