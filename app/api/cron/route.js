export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const table = process.env.NEXT_PUBLIC_SUPABASE_KEEPALIVE_TABLE || "keep_alive";

  if (!supabaseUrl || !anonKey) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: "Missing Supabase env vars",
      }),
      { status: 200 },
    );
  }

  try {
    await fetch(`${supabaseUrl}/rest/v1/${table}?select=id&limit=1`, {
      method: "GET",
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
      cache: "no-store",
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: "Keepalive query failed",
      }),
      { status: 200 },
    );
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200 });
}
