export async function POST(req) {
  try {
    const data = await req.json();

    console.log("New application:", data);

    // TODO: save to DB (Supabase / MongoDB / Airtable)

    return Response.json({ success: true });

  } catch (err) {
    return Response.json({ success: false }, { status: 500 });
  }
}