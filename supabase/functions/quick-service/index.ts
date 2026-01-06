import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "http://localhost:8080", // your frontend URL
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  // Handle preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return new Response(JSON.stringify({ error: "Email and password required" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const supabase = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));

    // 1️⃣ Update tbladmins
    const { data: adminData, error: tableError } = await supabase
      .from("tbladmins")
      .update({ password })
      .eq("email", email)
      .select("email")
      .single();

    if (tableError || !adminData) {
      return new Response(JSON.stringify({ error: tableError?.message || "Admin not found" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // 2️⃣ Sync Auth password
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) throw listError;

    const authUser = users.users.find((u) => u.email === email);
    if (!authUser) throw new Error("Auth user not found");

    const { error: authError } = await supabase.auth.admin.updateUserById(authUser.id, { password });
    if (authError) throw authError;

    return new Response(JSON.stringify({ success: true, message: "Password updated and synced" }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
