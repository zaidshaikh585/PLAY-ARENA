PLAY ARENA — enhanced project

RUN
1. Install Node.js LTS.
2. Extract the ZIP.
3. Copy .env.example to .env.local.
4. Create a Supabase project at https://supabase.com/
5. In Supabase Dashboard > SQL Editor, run supabase/schema.sql.
6. Copy Project URL and publishable/anon key to .env.local:
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-publishable-or-anon-key
7. Run START_PLAY_ARENA.bat on Windows, or npm install then npm run dev.
8. Open http://localhost:3000

ADMIN SETUP
1. Sign up on your website using your real email and confirm it if email confirmation is enabled.
2. In Supabase SQL Editor run: update public.profiles set role='admin' where email='your-real-email@example.com';
3. Sign in using Admin Login. Admin dashboard: http://localhost:3000/admin

SECURITY
- The site cannot access passwords; Supabase stores/validates them. Admin report lists account profile metadata, not passwords or private authentication tokens.
- Never add a service_role/secret key to .env.local for Vite/browser use. Only the publishable/anon key goes in frontend config.
- Real games like Free Fire, BGMI, Valorant cannot be run inside this site just by a Play button. The website can open official game/download pages; actual gameplay needs the game installed or the publisher's own platform.
