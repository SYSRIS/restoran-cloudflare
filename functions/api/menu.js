export async function onRequestGet({ env }) {
  try {
    const { results } = await env.DB.prepare("SELECT id,name,description,category,price,image_url,available FROM menu_items WHERE available=1 ORDER BY id DESC").all();
    return Response.json(results);
  } catch { return Response.json({ error: "Database belum terhubung." }, { status: 500 }); }
}
